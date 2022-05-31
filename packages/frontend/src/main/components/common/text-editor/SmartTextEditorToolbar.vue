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
      <v-btn x-small>
        <v-icon small>mdi-format-strikethrough</v-icon>
      </v-btn>
    </v-btn-toggle>
  </div>
</template>
<script>
import { FormattingMarks } from '@/main/lib/common/text-editor/formattingHelpers'
import { invert, toNumber, isNumber } from 'lodash'

/**
 * IMPORTANT NOTE: If you change the order of buttons inside <v-btn-toggle>, make sure you update
 * the value conversion functions as well, because the value of each button is also its position
 * in the button group (starting from 0).
 */

const formatValueMap = Object.freeze({
  0: FormattingMarks.Bold,
  1: FormattingMarks.Italic,
  2: FormattingMarks.Underline,
  3: FormattingMarks.Strikethrough
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
        return this.convertStringValuesToIntValues(
          this.value['format'] || {},
          formatValueMap
        )
      },
      set(newVal) {
        // Convert vuetify integers to string values
        this.realValue = {
          ...this.realValue,
          format: this.convertIntValuesToStringValues(newVal, formatValueMap)
        }
      }
    }
  },
  methods: {
    /**
     * Example map: {0: 'foo', 1: 'bar'}
     * {'foo': true, 'bar': false } -> [0]
     */
    convertStringValuesToIntValues(stringValues, valueMap) {
      const activatedValues = []
      for (const [mark, isEnabled] of Object.entries(stringValues)) {
        if (isEnabled) activatedValues.push(mark)
      }

      return activatedValues
        .map((o) => {
          const val = invert(valueMap)[o]
          return val?.length ? toNumber(val) : undefined
        })
        .filter((v) => isNumber(v))
    },
    /**
     * Example map: {0: 'foo', 1: 'bar'}
     * [1] -> {'foo': false, 'bar': true}
     */
    convertIntValuesToStringValues(intValues, valueMap) {
      const newValues = {}
      for (const [intVal, stringVal] of Object.entries(valueMap)) {
        newValues[stringVal] = intValues.includes(toNumber(intVal))
      }

      return newValues
    }
  }
}
</script>
