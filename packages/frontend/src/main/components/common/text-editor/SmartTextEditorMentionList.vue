<template>
  <v-theme-provider :dark="isDarkTheme" :light="!isDarkTheme">
    <v-card class="mention-list">
      <v-card-text class="pa-0 px-2">
        <v-list dense>
          <template v-if="items.length">
            <v-list-item-group v-model="selectedIndex">
              <v-list-item
                v-for="(item, index) in items"
                :key="index"
                class="mention-list__item"
                @click="selectItem(index)"
              >
                <v-list-item-content>
                  <v-list-item-title>
                    {{ item }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </template>
          <v-list-item v-else class="mention-list__empty">No result</v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-theme-provider>
</template>

<script>
import { isDarkTheme } from '@/main/utils/themeStateManager'

// TODO: Contrast with BG is terrible, needs a new BG color

export default {
  name: 'SmartTextEditorMentionList',
  props: {
    items: {
      type: Array,
      required: true
    },
    command: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      selectedIndex: 0
    }
  },
  computed: {
    isDarkTheme() {
      return isDarkTheme()
    }
  },
  watch: {
    items() {
      this.selectedIndex = 0
    }
  },
  methods: {
    onKeyDown({ event }) {
      if (event.key === 'ArrowUp') {
        this.upHandler()
        return true
      }
      if (event.key === 'ArrowDown') {
        this.downHandler()
        return true
      }
      if (event.key === 'Enter') {
        this.enterHandler()
        return true
      }
      return false
    },
    upHandler() {
      this.selectedIndex =
        (this.selectedIndex + this.items.length - 1) % this.items.length
    },
    downHandler() {
      this.selectedIndex = (this.selectedIndex + 1) % this.items.length
    },
    enterHandler() {
      this.selectItem(this.selectedIndex)
    },
    selectItem(index) {
      const item = this.items[index]
      if (item) {
        this.command({ id: item })
      }
    }
  }
}
</script>

<style scoped lang="scss">
.mention-list {
  z-index: 10000; // same as tooltips
}
</style>
