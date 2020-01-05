<template lang="pug">
div(
  :class='c.layout'
)
  router-view
</template>

<style lang="postcss" module="c">
.layout {
  display: flex;
  width: 100%;
}
</style>
