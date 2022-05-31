<template>
  <div class="d-flex mb-1">
    <v-btn-toggle v-model="formatValues" dense multiple>
      <v-btn x-small>
        <v-icon small>mdi-format-bold</v-icon>
      </v-btn>
      <v-btn x-small>
        <v-icon small>mdi-format-italic</v-icon>
      </v-btn>
      <v-btn x-small>
        <v-icon small>mdi-format-underline</v-icon>
      </v-btn>
    </v-btn-toggle>
  </div>
</template>
<script>
import { EditorMarks } from '@/main/lib/common/text-editor/slateHelpers'
import { invert, toNumber, isNumber } from 'lodash'

/**
 * IMPORTANT NOTE: If you change the order of buttons inside <v-btn-toggle>, make sure you update
 * the value conversion functions as well, because the value of each button is also its position
 * in the button group (starting from 0).
 */

const formatValueMap = Object.freeze({
  0: EditorMarks.Bold,
  1: EditorMarks.Italic,
  2: EditorMarks.Underline
})

export default {
  name: 'SmartTextEditorToolbar',
  props: {
    value: {
      type: Object,
      required: true,
      default: () => ({ format: [] })
    }
  },
  data: () => ({ test: [] }),
  computed: {
    realValue: {
      get() {
        return this.value
      },
      set(newVal) {
        this.$emit('input', newVal)
      }
    },
    formatValues: {
      get() {
        // Convert values back to int values that vuetify expects
        const values = this.value['format'] || []
        return this.convertStringValuesToIntValues(values, formatValueMap)
      },
      set(newVal) {
        // Convert integers to more meaningful values and set into realValue
        this.realValue = {
          ...this.realValue,
          format: this.convertIntValuesToStringValues(newVal, formatValueMap)
        }
      }
    }
  },
  methods: {
    convertIntValuesToStringValues(intValues, valueMap) {
      return intValues.map((o) => valueMap[o])
    },
    convertStringValuesToIntValues(stringValues, valueMap) {
      return stringValues
        .map((o) => {
          const val = invert(valueMap)[o]
          return val?.length ? toNumber(val) : undefined
        })
        .filter((v) => isNumber(v))
    }
  }
}
</script>
