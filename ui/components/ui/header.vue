<template>
  <header>
    <div class="background"/>
    <div class="container">
      <slot/>
    </div>
    <slot name="sub"/>
  </header>
</template>

<style lang="scss" scoped>
@import '~src/styles/partials/importer';

header {
  position: relative;
  overflow: hidden;
  @include gradient-background-dg($color-bg-light, $color-bg-lighter);
  @include shade-1;

  .container {
    z-index: 1;
    padding-top: 130px;
    padding-bottom: 130px;
    // padding-left will be affected by open sidebar, so don't use shortcut
  }
  h1 {
    font-weight: 300;
  }
  p {
    color: white;
    font-weight: 400;
  }
  .background {
    position: absolute;
    overflow: hidden;
    background: url('/img/ui/header-blobs.svg');
    background-size: cover;
    width: 100%;
    height: 100%;
    animation-name: pulse;
    animation-timing-function: ease-in-out;
    animation-duration: 35s;
    animation-iteration-count: infinite;
  }
}

@keyframes pulse {
  0% {
    transform: scaleX(1);
  }
  50% {
    transform: scale3d(1.15,1.15,1.15);
  }
  100% {
    transform: scaleX(1);
  }
}
</style>
