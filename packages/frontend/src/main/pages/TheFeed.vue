<template>
  <div>
    <portal v-if="canRenderToolbarPortal" to="toolbar">
      <div class="font-weight-bold">Feed</div>
    </portal>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <smart-text-editor :multi-line="false" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" lg="12">
        <feed-timeline />
      </v-col>
    </v-row>
    <latest-blogposts />
  </div>
</template>
<script>
import {
  STANDARD_PORTAL_KEYS,
  buildPortalStateMixin
} from '@/main/utils/portalStateManager'
import SmartTextEditor from '@/main/components/common/text-editor/SmartTextEditor.vue'

export default {
  name: 'TheFeed',
  components: {
    FeedTimeline: () => import('@/main/components/feed/FeedTimeline.vue'),
    LatestBlogposts: () => import('@/main/components/feed/LatestBlogposts'),
    SmartTextEditor
  },
  mixins: [buildPortalStateMixin([STANDARD_PORTAL_KEYS.Toolbar], 'feed', 0)]
}
</script>
