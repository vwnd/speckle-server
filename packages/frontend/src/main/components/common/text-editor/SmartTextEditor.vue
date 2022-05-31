<template>
  <div class="d-flex flex-column">
    <div>
      {{ JSON.stringify($editor, null, 2) + ' ' + new Date().toISOString() }}
    </div>
    <slate :value="initialValue" @onChange="onChange">
      <smart-text-editor-toolbar :value="getToolbarInput()" @input="onToolbarInput" />
      <editable
        class="editor-editable"
        :on-key-down="onKeyDown"
        :render-element="renderElement"
        :render-leaf="RichTextLeafRenderer"
      />
    </slate>
  </div>
</template>
<script>
import { Editor, Text } from 'slate'
import { Slate, Editable, Transforms, SlateMixin } from 'slate-vue'
import {
  DefaultElementRenderer,
  CodeRenderer,
  RichTextLeafRenderer
} from '@/main/lib/common/text-editor/rendererRepository'
import SmartTextEditorToolbar from '@/main/components/common/text-editor/SmartTextEditorToolbar.vue'
import { ensureMarks, getMarks } from '@/main/lib/common/text-editor/slateHelpers'

// TODO: Figure out the undo mark issue (formatting doesn't appear, state is out of sync somehow)
// Or revert to old slate version?

export default {
  name: 'SmartTextEditor',
  components: {
    Slate,
    Editable,
    SmartTextEditorToolbar
  },
  mixins: [SlateMixin],
  data: () => ({
    // TODO: Remove
    initialValue: JSON.stringify([
      {
        children: [{ text: 'This is editable plain text, just like a <textarea>!' }]
      }
    ]),
    RichTextLeafRenderer
  }),
  computed: {
    toolbarValues: {
      get() {
        return {
          format: getMarks(this.$editor) || []
        }
      },
      set(newVal) {
        const formatValues = newVal['format'] || []
        ensureMarks(this.$editor, formatValues)
      }
    }
  },
  watch: {
    $editor(newVal) {
      console.log('new editor', newVal)
    }
  },
  mounted() {
    // Override $editor as needed
    const { isInline: originalIsInline, isVoid: originalIsVoid } = this.$editor

    this.$editor.isInline = (element) => {
      return element.type === 'link' ? true : originalIsInline(element)
    }

    this.$editor.isVoid = (el) => originalIsVoid(el)
  },
  methods: {
    onToolbarInput(newVal) {
      const formatValues = newVal['format'] || []
      ensureMarks(this.$editor, formatValues)
    },

    getToolbarInput() {
      return {
        format: getMarks(this.$editor) || []
      }
    },

    getData() {
      return this.$editor.children || []
    },

    onKeyDown(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        this.$emit('submit', { event: e, data: this.getData() })
        return
      }

      // console.log(e)
      // if (e.key === '&') {
      //   // Prevent the ampersand character from being inserted.
      //   e.preventDefault()
      //   // Execute the `insertText` method when the event occurs.
      //   this.$editor.insertText('and')
      // } else if (e.ctrlKey) {
      //   if (e.key === '`') {
      //     // Prevent the "`" from being inserted by default.
      //     e.preventDefault()

      //     // Determine whether any of the currently selected blocks are code blocks.
      //     const [match] = Editor.nodes(this.$editor, {
      //       match: (n) => n.type === 'code'
      //     })
      //     // Toggle the block type depending on whether there's already a match.
      //     Transforms.setNodes(
      //       this.$editor,
      //       { type: match ? 'paragraph' : 'code' },
      //       { match: (n) => Editor.isBlock(this.$editor, n) }
      //     )
      //   } else if (e.key === 'b') {
      //     e.preventDefault()

      //     // Determine whether any of the the currently selected text is bold
      //     const [match] = Editor.nodes(this.$editor, {
      //       match: (n) => !!n.bold
      //     })

      //     Transforms.setNodes(
      //       this.$editor,
      //       { bold: match ? false : true },
      //       // Apply it to text nodes, and split the text node up if the
      //       // selection is overlapping only part of it.
      //       { match: (n) => Text.isText(n), split: true }
      //     )
      //   }
      // }
    },
    /**
     * @param {SlateVueElementRendererProps} props
     */
    renderElement(props) {
      switch (props.element.type) {
        case 'code':
          return CodeRenderer(props)
      }

      return DefaultElementRenderer(props)
    },
    onChange() {
      console.log(new Date().toISOString(), this.$editor)
      this.$emit('change', { data: this.getData() })
    }
  }
}
</script>
