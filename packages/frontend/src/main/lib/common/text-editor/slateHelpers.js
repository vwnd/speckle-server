import { Editor } from 'slate'
import { difference } from 'lodash'

export const EditorMarks = Object.freeze({
  Bold: 'bold',
  Italic: 'italic',
  Strikethrough: 'strike'
})

/**
 * Read more about Slate core concepts:
 * - Marks: https://docs.slatejs.org/concepts/02-nodes#text
 */

/**
 * Check if mark is active at the user selection
 * @param {import('slate').Editor} editor
 * @param {string} format
 */
export function isMarkActive(editor, format) {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
}

/**
 * Toggle Slate Mark at the user selection
 * @param {import('slate').Editor} editor
 * @param {string} format
 */
export function toggleMark(editor, format) {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

/**
 * Ensure the specified formats are enabled at the user selection
 * @param {import('slate').Editor} editor
 * @param {string[]} formats
 * @param {boolean} [only] If true, will unset all other marks
 */
export function ensureMarks(editor, formats, only = true) {
  for (const format of formats) {
    const isActive = isMarkActive(editor, format)
    if (isActive) continue

    Editor.addMark(editor, format, true)
  }

  if (!only) return

  const currentMarks = getMarks(editor)
  const unnecessaryMarks = difference(currentMarks, formats)
  for (const unnecessaryMark of unnecessaryMarks) {
    Editor.removeMark(editor, unnecessaryMark)
  }
}

/**
 * Get marks at current selection
 * @param {import('slate'.Editor)} editor
 * @returns
 */
export function getMarks(editor) {
  const marks = Editor.marks(editor) || {}
  const results = new Set()
  for (const [mark, isSet] of Object.entries(marks)) {
    if (!isSet) continue
    results.add(mark)
  }

  return [...results.values()]
}
