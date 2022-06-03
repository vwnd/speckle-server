/**
 * @typedef {Object} SmartTextEditorSchemaOptions
 * @property {boolean} [multiLine] Whether the document supports multi-line input
 */

/**
 * @typedef {Object} SmartTextEditorOptions
 * @property {string} [placeholder] Placeholder to show, if any
 */

/**
 * Create a TipTap document from basic text
 * @param {string} text
 * @param {SmartTextEditorSchemaOptions} [schemaOptions]
 * @returns {import("@tiptap/core").JSONContent}
 */
export function basicStringToDocument(text, { multiLine } = {}) {
  const textNode = { type: 'text', text }
  return {
    type: multiLine ? 'doc' : 'inline-doc',
    content: [multiLine ? { type: 'paragraph', content: [textNode] } : textNode]
  }
}

/**
 * Check whether a doc is empty
 * @param {import("@tiptap/core").JSONContent} doc
 * @returns
 */
export function isDocEmpty(doc) {
  if (!doc?.content?.length) return true

  for (const content of doc.content) {
    if (content.text || content.content?.length) return false
  }

  return true
}

/**
 * Create an empty TipTap document
 * @param {SmartTextEditorSchemaOptions} [schemaOptions]
 * @returns {import("@tiptap/core").JSONContent}
 */
export function buildEmptyDocument({ multiLine }) {
  return {
    type: multiLine ? 'doc' : 'inline-doc',
    content: multiLine ? [{ type: 'paragraph', content: [] }] : []
  }
}
