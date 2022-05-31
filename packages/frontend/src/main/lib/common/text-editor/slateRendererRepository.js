/**
 * @typedef {{
 *  children: any,
 *  element: Element,
 *  attributes: Object<string, unknown>
 * }} SlateVueElementRendererProps
 */

import { EditorMarks } from '@/main/lib/common/text-editor/slateHelpers'

/**
 * @typedef {{
 *  children: any,
 *  attributes: Object<string, unknown>,
 *  leaf: Text,
 *  text: Text
 * }} SlateVueLeafRendererProps
 */

/**
 * @callback SlateVueElementRenderer
 * @param {SlateVueElementRendererProps} props
 * @returns {string | import('vue').Component | () => import('vue').Component}
 */

/**
 * @callback SlateVueLeafRenderer
 * @param {SlateVueLeafRendererProps} props
 * @returns {string | import('vue').Component | () => import('vue').Component}
 */

/**
 * The one slate-vue defaults to (slate-vue doesn't export it, so we re-implement it)
 * @type {SlateVueElementRenderer}
 */
export const DefaultElementRenderer = (props) => ({
  render(h) {
    const { attributes, children, element } = props
    const editor = this.$editor
    const Tag = editor.isInline(element) ? 'span' : 'div'
    return h(Tag, { attrs: attributes, style: { position: 'relative' } }, [children])
  }
})

/**
 * @type {SlateVueElementRenderer}
 */
export const CodeRenderer = ({ attributes, children }) => ({
  render(h) {
    return h('pre', { attrs: attributes }, [h('code', {}, [children])])
  }
})

/**
 * The one slate-vue defaults to (slate-vue doesn't export it, so we re-implement it)
 * @type {SlateVueLeafRenderer}
 */
export const DefaultLeafRenderer = (props) => ({
  render(h) {
    const { attributes, children } = props
    return h('span', { attrs: attributes }, [children])
  }
})

/**
 * @type {SlateVueLeafRenderer}
 */
export const RichTextLeafRenderer = (props) => ({
  render(h) {
    const { attributes, children, leaf } = props
    const style = {
      fontWeight: leaf[EditorMarks.Bold] ? 'bold' : 'normal',
      fontStyle: leaf[EditorMarks.Italic] ? 'italic' : 'normal',
      textDecoration: leaf[EditorMarks.Strikethrough] ? 'underline' : 'none'
    }

    return h('span', { attrs: attributes, style }, [children])
  }
})
