<template>
  <v-card class="smart-text-editor">
    <v-card-text class="d-flex flex-column">
      <smart-text-editor-toolbar
        :formats.sync="formatsValue"
        :link="linkValue"
        @link="onLinkClick"
        @unlink="onUnlinkClick"
      />
      <editor-content
        class="simple-scrollbar"
        :editor="editor"
        :style="maxHeight ? `max-height: ${maxHeight}; overflow-y: auto;` : ''"
      />
      <smart-text-editor-link-dialog
        v-model="linkDialogData"
        @submit="onLinkDialogSubmit"
      />
      <div class="editor-mount-point" />
    </v-card-text>
  </v-card>
</template>
<script>
import { Editor, EditorContent } from '@tiptap/vue-2'
import SmartTextEditorToolbar from '@/main/components/common/text-editor/SmartTextEditorToolbar.vue'
import {
  FormattingMarks,
  LinkOptions
} from '@/main/lib/common/text-editor/formattingHelpers'
import { getEditorExtensions } from '@/main/lib/common/text-editor/tipTapExtensions'
import SmartTextEditorLinkDialog from '@/main/components/common/text-editor/SmartTextEditorLinkDialog.vue'

// TODO: Style mentions in editor

export default {
  name: 'SmartTextEditor',
  components: {
    SmartTextEditorToolbar,
    EditorContent,
    SmartTextEditorLinkDialog
  },
  props: {
    /**
     * TipTap/ProseMirror JSON content representation
     */
    value: {
      type: Object,
      default: undefined
    },
    /**
     * Control the document schema
     * @type {import('@/main/lib/common/text-editor/documentHelper').SmartTextEditorSchemaOptions}
     */
    schemaOptions: {
      type: Object,
      required: false,
      default: () => ({})
    },
    /**
     * If set, will limit height and show a scrollbar
     */
    maxHeight: {
      type: String,
      default: null
    },
    autofocus: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: undefined
    }
  },
  data: () => ({
    editor: null,
    linkDialogData: null
  }),
  computed: {
    formatsValue: {
      get() {
        if (!this.editor) return {}

        // Read enabled formatting marks from editor
        const format = {}
        for (const mark of Object.values(FormattingMarks)) {
          format[mark] = this.editor.isActive(mark)
        }

        return format
      },
      set(newVal) {
        // Apply formatting marks
        const command = this.editor.chain().focus()
        for (const [mark, isEnabled] of Object.entries(newVal)) {
          if (isEnabled) {
            command.setMark(mark)
          } else {
            command.unsetMark(mark)
          }
        }
        command.run()
      }
    },
    linkValue() {
      if (!this.editor) return {}

      // Read link button states from editor
      const isLinkActive = this.editor.isActive('link')
      const link = {
        [LinkOptions.Link]: isLinkActive,
        [LinkOptions.Unlink]: isLinkActive
      }

      return link
    }
  },
  watch: {
    value(newVal) {
      const isSame = JSON.stringify(this.getData()) === JSON.stringify(newVal)
      if (isSame) return

      this.editor.commands.setContent(newVal, false)
    },
    disabled(newVal) {
      this.editor.setEditable(newVal)
    }
  },
  mounted() {
    this.editor = new Editor({
      content: this.value || undefined,
      autofocus: this.autofocus,
      editable: !this.disabled,
      extensions: getEditorExtensions(this.schemaOptions || {}, {
        placeholder: this.placeholder
      }),
      onUpdate: () => {
        // TODO: Remove console.log
        console.log(this.getData())
        this.$emit('input', this.getData())
      }
    })
  },
  beforeDestroy() {
    this.editor.destroy()
  },
  methods: {
    getData() {
      return this.editor.getJSON()
    },
    onUnlinkClick() {
      this.editor.chain().focus().unsetLink().run()
    },
    onLinkClick(e) {
      // https://vuetifyjs.com/en/components/dialogs/#without-activator
      e.stopPropagation()

      // Get currently selected link data, if any
      const { href } = this.editor.getAttributes('link') || {}

      // If cursor is on a link, use its full title, otherwise just get selected text
      const selectedText = this.editor.isActive('link')
        ? this.editor.storage.speckleUtilities.getLinkText(this.editor) || ''
        : this.editor.storage.speckleUtilities.getSelectedText(this.editor) || ''

      this.linkDialogData = {
        url: href,
        title: selectedText
      }
    },
    /**
     * Add/update link with new title & URL
     */
    onLinkDialogSubmit({ title, url }) {
      this.editor.commands.addOrUpdateLink(url, title)
    }
  }
}
</script>
<style lang="scss">
.ProseMirror-focused {
  outline: none;
}

.ProseMirror p:last-of-type {
  margin-bottom: 0px;
}

.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  pointer-events: none;
  height: 0;
}

.theme--dark .ProseMirror p.is-editor-empty:first-child::before {
  color: #757575; // gray darken-1
}
.theme--light .ProseMirror p.is-editor-empty:first-child::before {
  color: #9e9e9e; // gray
}
</style>
