<template lang="pug">
div {{ selectedDate }}
</template>

<script>
import { ru } from 'date-fns/locale'

export default {
  props: {
    now: {
      type: Date,
      required: true,
    },
    selectedDate: {
      type: Date,
      required: true,
    },
    locale: {
      type: Object,
      default: () => ru,
    },
  },
}
</script>
