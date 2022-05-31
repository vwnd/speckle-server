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
        <v-icon small>mdi-format-strikethrough</v-icon>
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
  2: EditorMarks.Strikethrough
})

export default {
  name: 'SmartTextEditorToolbar',
  props: {
    value: {
      type: Object,
      required: true,
      default: () => ({ format: {} })
    }
  },
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
        const values = this.value['format'] || {}
        const activatedValues = []
        for (const [mark, isEnabled] of Object.entries(values)) {
          if (isEnabled) activatedValues.push(mark)
        }

        return this.convertStringValuesToIntValues(activatedValues, formatValueMap)
      },
      set(newVal) {
        // Convert integers to more meaningful values and set into realValue
        const newValues = {}
        for (const [intVal, stringVal] of Object.entries(formatValueMap)) {
          newValues[stringVal] = newVal.includes(toNumber(intVal))
        }

        this.realValue = {
          ...this.realValue,
          format: newValues
        }
      }
    }
  },
  methods: {
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
