import { Node, Extension } from '@tiptap/core'

/**
 * Document node that only supports inline content (no paragraphs or line breaks)
 */
export const InlineDoc = Node.create({
  name: 'inline-doc',
  topNode: true,
  content: 'inline*'
})

/**
 * Various useful utility commands
 */
export const UtilitiesExtension = Extension.create({
  name: 'speckleUtilities',

  addCommands() {
    return {
      /**
       * Get currently selected text or null if no selection
       */
      getSelectedText:
        () =>
        ({ editor }) => {
          const { from, to, empty } = editor.state.selection

          if (empty) {
            return null
          }

          return editor.state.doc.textBetween(from, to, ' ')
        },

      /**
       * Get full text of the selected link node
       */
      getLinkText:
        () =>
        ({ editor }) => {
          const { $from: pos } = editor.state.selection
          if (!pos) return null

          // Resolve full text node
          // Since link is inclusive, if textOffset is 0 (the cursor is at the end of the link) we need
          // to decrease index by 1 to get the actual link, not the next node
          // Except if the cursor is at the very beginning (which is why we clamp it)
          const parentChildIdx = Math.max(
            0,
            pos.textOffset ? pos.index() : pos.index() - 1
          )
          const parent = pos.parent
          const textNode = parent.child(parentChildIdx)

          // Check if actually a link
          if (!textNode.marks.find((m) => m.type.name === 'link')) return null

          return textNode.textContent
        }
    }
  }
})
