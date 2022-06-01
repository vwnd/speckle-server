<template>
  <div class="d-flex flex-column">
    <smart-text-editor-toolbar
      :formats.sync="formatsValue"
      :link="linkValue"
      @link="onLinkClick"
      @unlink="onUnlinkClick"
    />
    <editor-content :editor="editor" />
    <smart-text-editor-link-dialog
      v-model="linkDialogData"
      @submit="onLinkDialogSubmit"
    />
  </div>
</template>
<script>
import { Editor, EditorContent } from '@tiptap/vue-2'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

import Underline from '@tiptap/extension-underline'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Strike from '@tiptap/extension-strike'
import Link from '@tiptap/extension-link'
import HardBreak from '@tiptap/extension-hard-break'
import { TextSelection } from 'prosemirror-state'

import SmartTextEditorToolbar from '@/main/components/common/text-editor/SmartTextEditorToolbar.vue'
import {
  FormattingMarks,
  LinkOptions
} from '@/main/lib/common/text-editor/formattingHelpers'
import {
  InlineDoc,
  UtilitiesExtension
} from '@/main/lib/common/text-editor/tipTapExtensions'
import SmartTextEditorLinkDialog from '@/main/components/common/text-editor/SmartTextEditorLinkDialog.vue'
import { VALID_HTTP_URL } from '@/main/lib/common/vuetify/validators'

/**
 * TODO:
 * - Actual user tagging
 * - Links continuing on after space
 */

export default {
  name: 'SmartTextEditor',
  components: {
    SmartTextEditorToolbar,
    EditorContent,
    SmartTextEditorLinkDialog
  },
  props: {
    /**
     * TipTap/ProseMirror JSON content representation
     */
    value: {
      type: Object,
      default: undefined
    },
    /**
     * Whether to allow multi-line & multi-paragraph text
     */
    multiLine: {
      type: Boolean,
      default: true
    }
  },
  data: () => ({
    editor: null,
    linkDialogData: null
  }),
  computed: {
    formatsValue: {
      get() {
        if (!this.editor) return {}

        // Read enabled formatting marks from editor
        const format = {}
        for (const mark of Object.values(FormattingMarks)) {
          format[mark] = this.editor.isActive(mark)
        }

        return format
      },
      set(newVal) {
        // Apply formatting marks
        const command = this.editor.chain().focus()
        for (const [mark, isEnabled] of Object.entries(newVal)) {
          if (isEnabled) {
            command.setMark(mark)
          } else {
            command.unsetMark(mark)
          }
        }
        command.run()
      }
    },
    linkValue() {
      if (!this.editor) return {}

      // Read link button states from editor
      const isLinkActive = this.editor.isActive('link')
      const link = {
        [LinkOptions.Link]: isLinkActive,
        [LinkOptions.Unlink]: isLinkActive
      }

      return link
    }
  },
  watch: {
    value(newVal) {
      const isSame = JSON.stringify(this.getData()) === JSON.stringify(newVal)
      if (isSame) return

      this.editor.commands.setContent(newVal, false)
    }
  },
  mounted() {
    this.editor = new Editor({
      content: this.value || '',
      extensions: [
        ...(this.multiLine ? [Document, HardBreak] : [InlineDoc]),
        UtilitiesExtension,
        Text,
        Paragraph,
        Bold,
        Underline,
        Italic,
        Strike,
        Link.configure({
          // Only allow http protocol links (no JS)
          validate: (href) => VALID_HTTP_URL.test(href),
          // Open on click would be too annoying during editing
          openOnClick: false,
          // Autolink off cause otherwise it's impossible to end the link
          autolink: false
        })
      ],
      onUpdate: () => {
        console.log(this.getData())
        this.$emit('input', this.getData())
      }
    })
  },
  beforeDestroy() {
    this.editor.destroy()
  },
  methods: {
    getData() {
      return this.editor.getJSON()
    },
    onUnlinkClick() {
      this.editor.chain().focus().unsetLink().run()
    },
    onLinkClick(e) {
      // https://vuetifyjs.com/en/components/dialogs/#without-activator
      e.stopPropagation()

      // Get currently selected link data, if any
      const { href } = this.editor.getAttributes('link') || {}

      // If cursor is on a link, use its full title, otherwise just get selected text
      const selectedText = this.editor.isActive('link')
        ? this.editor.commands.getLinkText() || ''
        : this.editor.commands.getSelectedText() || ''

      this.linkDialogData = {
        url: href,
        title: selectedText
      }
    },
    /**
     * Add/update link with new title & URL
     */
    onLinkDialogSubmit({ title, url }) {
      const chain = this.editor.chain().focus()

      // Change selection to entire link, if part of it is selected
      const linkActive = this.editor.isActive('link')
      if (linkActive) {
        chain.extendMarkRange('link')
      }

      // Insert (& replace old, if selection isnt empty) new title
      chain.insertContent(title)

      // Select newly created text
      chain.command((cmdProps) => {
        const { tr } = cmdProps

        // Select the newly added text
        const selection = tr.selection
        const $anchor = tr.selection.$anchor // insertContent() moves selection to the end of the new text
        const $head = tr.doc.resolve(selection.anchor - title.length)

        const newSelection = new TextSelection($anchor, $head)
        tr.setSelection(newSelection)
      })

      // Set it to be a link
      chain.setLink({ href: url })

      // Collapse selection to point to the end of the link
      chain.command((cmdProps) => {
        const { tr } = cmdProps

        const newSelection = new TextSelection(tr.selection.$to)
        tr.setSelection(newSelection)
      })

      // Run chain
      chain.run()
    }
  }
}
</script>
<style>
.ProseMirror-focused {
  outline: none;
}

.ProseMirror p:last-of-type {
  margin-bottom: 0px;
}
</style>
