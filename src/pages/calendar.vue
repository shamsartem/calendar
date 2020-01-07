<template lang="pug">
div(
  :class='c.page'
)
  Calendar
</template>

<script>
import Calendar from '@/components/calendar/calendar.vue'

export default {
  components: {
    Calendar,
  },
}
</script>

<style lang="postcss" module="c">
.page {
  display: flex;
  max-height: 100vh;
  flex-grow: 1;
  width: 100%;
}
</style>
