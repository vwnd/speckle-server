<template>
  <div class="d-flex flex-column">
    <smart-text-editor-toolbar v-model="toolbarModel" />
    <editor-content :editor="editor" />
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
import HardBreak from '@tiptap/extension-hard-break'

import SmartTextEditorToolbar from '@/main/components/common/text-editor/SmartTextEditorToolbar.vue'
import { FormattingMarks } from '@/main/lib/common/text-editor/formattingHelpers'
import { OneLineDoc } from '@/main/lib/common/text-editor/tipTapExtensions'

/**
 * TODO:
 * - Actual user tagging
 */

export default {
  name: 'SmartTextEditor',
  components: {
    SmartTextEditorToolbar,
    EditorContent
  },
  props: {
    /**
     * TipTap JSON content representation
     */
    value: {
      type: Object,
      default: undefined
    },
    multiLine: {
      type: Boolean,
      default: true
    }
  },
  data: () => ({
    editor: null
  }),
  computed: {
    toolbarModel: {
      get() {
        if (!this.editor) return {}

        // Read enabled formatting marks from editor
        const format = {}
        for (const mark of Object.values(FormattingMarks)) {
          format[mark] = this.editor.isActive(mark)
        }

        return { format }
      },
      set({ format }) {
        // Apply formatting marks
        const command = this.editor.chain().focus()
        for (const [mark, isEnabled] of Object.entries(format)) {
          if (isEnabled) {
            command.setMark(mark)
          } else {
            command.unsetMark(mark)
          }
        }
        command.run()
      }
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
      content: this.value || 'Hello world!',
      extensions: [
        ...(this.multiLine ? [Document, HardBreak] : [OneLineDoc]),
        Text,
        Paragraph,
        Bold,
        Underline,
        Italic,
        Strike
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
