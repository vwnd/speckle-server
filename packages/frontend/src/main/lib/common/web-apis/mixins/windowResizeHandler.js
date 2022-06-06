import { throttle, debounce } from 'lodash'

/**
 * Window resize handler mixin with debounce/throttle built in
 */

export function buildResizeHandlerMixin({ shouldThrottle, wait } = {}) {
  const waitTime = wait || 100

  return {
    mounted() {
      this.resizeHandler = shouldThrottle
        ? throttle(this.onWindowResize, waitTime)
        : debounce(this.onWindowResize, waitTime)
      window.addEventListener('resize', this.resizeHandler)
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.resizeHandler)
    },
    methods: {
      onWindowResize(e) {
        console.warn('Resize handler mixin onWindowResize method not overridden!', e)
      }
    }
  }
}
