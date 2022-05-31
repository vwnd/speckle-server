import { Node } from '@tiptap/core'

/**
 * Document node that only supports inline content (no paragraphs or line breaks)
 */
export const OneLineDoc = Node.create({
  name: 'one-line-doc',
  topNode: true,
  content: 'inline*'
})
