<template>
  <div :style="{ transform: [transform], 'transition-duration': deltaX ? '0s' : '0.45s' }" class="panel-container">
    <div :style="{ opacity, 'transition-duration': deltaX ? '0s' : '0.35s' }" class="panel">
      <slot/>
    </div>
  </div>
</template>


<script>
export default {
  data () {
    return {
      id: this.$store.state.sidebar.id
    }
  },
  computed: {
    deltaX () {
      return this.$store.state.sidebar.deltaX
    },
    activeId () {
      return this.$store.state.sidebar.activeId
    },
    transform () {
      const open = this.$store.state.sidebar.active
      const deltaX = this.deltaX
      const id = this.id
      const aid = this.activeId
      return `translate(${open || deltaX ? `${deltaX}px` : `calc(${deltaX - 320}px - 5vw)`}, ${aid === id ? -56 * (id - 1) : 0}px)`
    },
    opacity () {
      const open = this.$store.state.sidebar.active
      const deltaX = this.deltaX
      return open || deltaX ? (deltaX + 300) / 3 / 100 : 0
    }
  }
}
</script>


<style lang="scss" scoped>
@import '~src/styles/partials/importer';

.panel-container {
  position: absolute;
  top: 0;
  left: 56px;
  width: calc(206px + 5vw);
  will-change: transform;
  @include ease-out(0.45s);

  @media (max-width: $breakpoint-s) {
    width: calc(250px + 5vw);
  }
}

.panel {
  opacity: 0;
  will-change: opacity;
  @include ease(0.35s);

  .panel-head {
    padding: 17px 35px;
    cursor: pointer;
    border-top: 1px solid $color-subtle-dark;
    @include ease(0.3s);

    &:hover {
      background: $color-bg-darker;
    }

    span {
      display: inline-block;
      vertical-align: middle;
      color: white;

      // Shortcut
      & ~ span {
        display: inline-block;
        vertical-align: middle;
        float: right;
        margin-top: -0.2em;
        @include ease(0.15s);
      }

      & ~ .shortcut {
        font-size: 0.65em;
        padding: 5px;
        border-radius: 2px;
        border: 1px solid $color-subtle;
        color: $color-font-subtle;

        @media (max-width: $breakpoint-s) {
          display: none;
        }
      }
    }

    @media (max-width: $breakpoint-m) {
      padding: 17px 25px;
    }

    @media (max-width: $breakpoint-s) {
      &:hover {
        background: $color-bg-dark;
      }
    }
  }

  .panel-body {
    padding: 10px 35px;
    pointer-events: none;
    max-height: calc(100vh - 116px);
    overflow-y: scroll;
    opacity: 0;
    @include ease(0.25s);

    @media (max-width: $breakpoint-m) {
      padding: 10px 25px;
    }
  }
}
</style>
