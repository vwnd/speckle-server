<template>
  <div class="d-flex flex-column">
    <smart-text-editor-toolbar v-model="toolbarModel" />
    <editor-content :editor="editor" />
  </div>
</template>
<script>
import { Editor, EditorContent } from '@tiptap/vue-2'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'

import SmartTextEditorToolbar from '@/main/components/common/text-editor/SmartTextEditorToolbar.vue'
import { FormattingMarks } from '@/main/lib/common/text-editor/formattingHelpers'

/**
 * TODO:
 * - One line support (not multiple paragraphs)
 * - Actual user tagging
 */

export default {
  name: 'SmartTextEditor',
  components: {
    SmartTextEditorToolbar,
    EditorContent
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
  mounted() {
    this.editor = new Editor({
      content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris ultrices porttitor quam nec auctor. Sed et libero dui. Quisque pellentesque ipsum ex, at vehicula neque vestibulum nec. Donec scelerisque odio metus, eu egestas ligula vestibulum id. Curabitur fringilla est a enim suscipit interdum. Nullam eget tempor urna, sed auctor diam. Aenean ultrices dolor vel porttitor auctor. Donec ullamcorper gravida massa dictum lobortis. Aliquam varius gravida urna non rutrum. Donec pharetra viverra odio, id sodales massa viverra ac.',
      extensions: [
        StarterKit.configure({
          // TODO: Switch to specific extensions we need for decreased bundle size
          // Only enabled: bold, italic, strike
          blockquote: false,
          bulletList: false,
          code: false,
          codeBlock: false,
          heading: false,
          history: false,
          horizontalRule: false,
          listItem: false,
          orderedList: false
        }),
        Underline
      ],
      onUpdate: () => {
        const json = this.getData()

        console.log(new Date().toISOString(), json)
        this.$emit('input', json)
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
</style>
