import { VueRenderer } from '@tiptap/vue-2'
import SmartTextEditorMentionList from '@/main/components/common/text-editor/SmartTextEditorMentionList.vue'
import Popper from 'popper.js'

/**
 * @type {import('@tiptap/suggestion').SuggestionOptions}
 */
export const suggestion = {
  items: ({ query }) => {
    return [
      'Lea Thompson',
      'Cyndi Lauper',
      'Tom Cruise',
      'Madonna',
      'Jerry Hall',
      'Joan Collins',
      'Winona Ryder',
      'Christina Applegate',
      'Alyssa Milano',
      'Molly Ringwald',
      'Ally Sheedy',
      'Debbie Harry',
      'Olivia Newton-John',
      'Elton John',
      'Michael J. Fox',
      'Axl Rose',
      'Emilio Estevez',
      'Ralph Macchio',
      'Rob Lowe',
      'Jennifer Grey',
      'Mickey Rourke',
      'John Cusack',
      'Matthew Broderick',
      'Justine Bateman',
      'Lisa Bonet'
    ]
      .filter((item) => item.toLowerCase().startsWith(query.toLowerCase()))
      .slice(0, 5)
  },

  render: () => {
    /** @type {import('@tiptap/vue-2').VueRenderer} */
    let component
    /** @type {import('popper.js').default} */
    let popup
    /** @type {Function} */
    let clickHandler

    const hidePopup = () => {
      if (!popup) return

      popup.popper.style.display = 'none'
      popup.update()
    }

    return {
      onStart: (props) => {
        console.log('on-start')

        // Render mention list with popper.js (which we have because of v-tooltip)
        component = new VueRenderer(SmartTextEditorMentionList, {
          parent: this,
          propsData: props
        })
        document.getElementsByTagName('body')[0].append(component.element)

        if (!props.clientRect) {
          return
        }

        popup = new Popper(
          { getBoundingClientRect: props.clientRect },
          component.element
        )

        // Init click handler for hiding when clicking outside of the popper
        /** @param {MouseEvent} e */
        clickHandler = (e) => {
          /** @type {Element} */
          const el = e.target
          const popperEl = popup.popper

          if (el !== popperEl && !popperEl.contains(el)) {
            hidePopup()
          }
        }
        document.addEventListener('click', clickHandler)
        document.addEventListener('touchend', clickHandler)
      },

      onUpdate(props) {
        console.log('on-update')

        component.updateProps(props)

        if (!props.clientRect) {
          return
        }

        popup.reference.getBoundingClientRect = props.clientRect
        popup.update()
      },

      onKeyDown(props) {
        if (props.event.key === 'Escape') {
          hidePopup()
          return true
        }

        return component.ref?.onKeyDown(props)
      },

      onExit() {
        console.log('on-exit')

        popup.destroy()
        component.destroy()
        component.element.remove()

        document.removeEventListener('click', clickHandler)
        document.removeEventListener('touchend', clickHandler)
      }
    }
  }
}
