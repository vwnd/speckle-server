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
 * - Support for basic links
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
          openOnClick: false
        })
      ],
      onUpdate: () => {
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
    onLinkDialogSubmit({ title, url }) {
      // Add/update link
      this.editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: url })
        .insertContent(title)
        .run()
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
