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
    <div class="editor-mount-point" />
  </div>
</template>
<script>
import { Editor, EditorContent } from '@tiptap/vue-2'
import SmartTextEditorToolbar from '@/main/components/common/text-editor/SmartTextEditorToolbar.vue'
import {
  FormattingMarks,
  LinkOptions
} from '@/main/lib/common/text-editor/formattingHelpers'
import { getEditorExtensions } from '@/main/lib/common/text-editor/tipTapExtensions'
import SmartTextEditorLinkDialog from '@/main/components/common/text-editor/SmartTextEditorLinkDialog.vue'

/**
 * TODO:
 * - Actual user tagging
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
      extensions: getEditorExtensions({ multiLine: this.multiLine }),
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
        ? this.editor.storage.speckleUtilities.getLinkText(this.editor) || ''
        : this.editor.storage.speckleUtilities.getSelectedText(this.editor) || ''

      this.linkDialogData = {
        url: href,
        title: selectedText
      }
    },
    /**
     * Add/update link with new title & URL
     */
    onLinkDialogSubmit({ title, url }) {
      this.editor.commands.addOrUpdateLink(url, title)
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
