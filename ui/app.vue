<template>
  <div id="app">
    <navigation/>
    <div class="app-view">
      <router-view/>
      <bottom/>
    </div>
    <status/>
    <notification/>
  </div>
</template>



<script>
import Vue from 'vue'
import VueAnalytics from 'vue-analytics'
import VueTouch from 'vue-touch-hotfix'
import notification from 'src/components/ui/notification.vue'
import navigation from 'src/components/ui/nav.vue'
import status from 'src/components/ui/status.vue'
import bottom from 'src/components/ui/footer.vue'

/**
 * Vue Component
 */
export default {
  components: {
    notification,
    navigation,
    status,
    bottom
  },
  head: {
    title: 'Nexus-Stats',
    link: [
      { rel: 'preload', href: 'https://fonts.googleapis.com/css?family=Roboto:300,400', as: 'font' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto:300,400' }
    ]
  },
  beforeCreate () {
    Vue.use(VueTouch)
  },
  mounted () {
    Vue.use(VueAnalytics, {
      id: 'UA-81233976-2',
      checkDuplicatedScript: true,
      router: this.$router
    })
  }
}
</script>



<style lang='scss'>
@import '~src/styles/partials/importer';
@import '~src/styles/modules/importer';
@import '~src/styles/reset';
@import '~src/styles/grid';

#app {
  background: $color-bg-dark;
  color: $color-font-body;

  input::placeholder {
    color: $color-font-body;
  }
  a {
    color: white;
    @include ease(0.2s);
  }
  h1,
  h2,
  h3,
  h4,
  h5 {
    color: white;
  }
}

.a-ie {
  @include ie();
}

// Sticky Footer
.app-view {
  display: flex;
  position: relative;
  flex-direction: column;
  min-height: calc(100vh - 56px);
  top: 56px; // nav bar
}
</style>
