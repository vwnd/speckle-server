<template>
  <Slate :value="initialValue" @onChange="onChange">
    <Editable
      placeholder="Enter some plain text..."
      :on-key-down="onKeyDown"
      :render-element="renderElement"
      :render-leaf="renderLeaf"
    ></Editable>
  </Slate>
</template>
<script>
import { Editor, Text } from 'slate'
import { Slate, Editable, Transforms } from 'slate-vue'
import {
  DefaultElementRenderer,
  CodeRenderer,
  RichTextLeafRenderer
} from '@/main/lib/common/text-editor/rendererRepository'

export default {
  name: 'SmartTextEditor',
  components: {
    Slate,
    Editable
  },
  data: () => ({
    initialValue: JSON.stringify([
      {
        children: [{ text: 'This is editable plain text, just like a <textarea>!' }]
      }
    ])
  }),
  methods: {
    onKeyDown(e) {
      console.log(e)

      if (e.key === '&') {
        // Prevent the ampersand character from being inserted.
        e.preventDefault()
        // Execute the `insertText` method when the event occurs.
        this.$editor.insertText('and')
      } else if (e.ctrlKey) {
        if (e.key === '`') {
          // Prevent the "`" from being inserted by default.
          e.preventDefault()

          // Determine whether any of the currently selected blocks are code blocks.
          const [match] = Editor.nodes(this.$editor, {
            match: (n) => n.type === 'code'
          })
          // Toggle the block type depending on whether there's already a match.
          Transforms.setNodes(
            this.$editor,
            { type: match ? 'paragraph' : 'code' },
            { match: (n) => Editor.isBlock(this.$editor, n) }
          )
        } else if (e.key === 'b') {
          e.preventDefault()

          // Determine whether any of the the currently selected text is bold
          const [match] = Editor.nodes(this.$editor, {
            match: (n) => !!n.bold
          })

          Transforms.setNodes(
            this.$editor,
            { bold: match ? false : true },
            // Apply it to text nodes, and split the text node up if the
            // selection is overlapping only part of it.
            { match: (n) => Text.isText(n), split: true }
          )
        }
      }
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
    /**
     * @param {SlateVueLeafRendererProps} props
     */
    renderLeaf(props) {
      return RichTextLeafRenderer(props)
    },
    onChange() {
      console.log(this.$editor.children)
    }
  }
}
</script>
