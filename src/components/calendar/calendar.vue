<template lang="pug">
div(
  :class='c.container'
)
  div(
    :class='c.controls'
  )
    button(
      :class='c.button'
      @click=`selectDate({
        value: calendarType,
        back: true
      })`
    ) <
    | {{ selectedDayText }}
    button(
      :class='c.button'
      @click=`selectDate({
        value: calendarType,
      })`
    ) >
    label
      span.visuallyHidden Select locale:
      select(
        v-model='locale'
      )
        option(
          v-for='l in locales'
          :value='l'
        ) {{ l.code }}
    label
      span.visuallyHidden Select calendar type:
      select(
        v-model='calendarType'
      )
        option(
          v-for='type in calendarTypes'
          :value='type.value'
        ) {{ type.name }}
  keep-alive
    component(
      :is='currentCalendarComponent'
      :now='now'
      :selectedDate='selectedDate'
      :locale='locale'
    )
</template>

<style lang="postcss" module="c">
.container {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
}

.controls {
  display: flex;
  background-color: #413bb8;
  color: white;
  align-items: center;
  justify-content: space-around;
  height: 60px;
}

.button {
  height: 100%;
  width: 50px;
  text-align: center;
}
</style>

<script>
import { ref, computed, onUnmounted } from '@vue/composition-api'
import Month from './month/month.vue'
import Week from './week/week.vue'
import Day from './day/day.vue'
import {
  addMonths,
  subMonths,
  startOfMonth,

  addWeeks,
  subWeeks,
  startOfWeek,

  addDays,
  subDays,
  startOfDay,

  format,
} from 'date-fns'
import { ru, enUS } from 'date-fns/locale'

export default {
  setup () {
    const { locale, locales } = useSelectLocale()

    const {
      calendarType,
      calendarTypes,
      currentCalendarComponent,
    } = useSelectCalendarType()

    const {
      now,
    } = useNow()

    const {
      selectedDate,
      selectDate,
    } = useSelectDate()

    const selectedDayText = useSelectedDateText(selectedDate, calendarType, locale)

    return {
      calendarType,
      calendarTypes,
      currentCalendarComponent,

      now,

      selectedDate,
      selectDate,

      selectedDayText,

      locale,
      locales,
    }
  },
}

function useSelectDate () {
  const selectedDate = ref(new Date())

  const selectDate = ({
    value,
    back,
    date,
  }) => {
    selectedDate.value = (() => {
      switch (value) {
        case 'month':
          if (back) return startOfMonth(subMonths(selectedDate.value, 1))
          return startOfMonth(addMonths(selectedDate.value, 1))

        case 'week':
          if (back) return startOfWeek(subWeeks(selectedDate.value, 1))
          return startOfWeek(addWeeks(selectedDate.value, 1))

        case 'day':
          if (back) return startOfDay(subDays(selectedDate.value, 1))
          return startOfDay(addDays(selectedDate.value, 1))

        default:
          if (date) return date
          return selectedDate.value
      }
    })()
  }

  return {
    selectedDate,
    selectDate,
  }
}

function useSelectedDateText (selectedDate, calendarType, locale) {
  return computed(() => {
    switch (calendarType.value) {
      case 'month':
        return format(selectedDate.value, 'MMMM, yyyy', { locale: locale.value })

      case 'week':
        return format(selectedDate.value, 'MMMM, yyyy', { locale: locale.value })

      case 'day':
        return format(selectedDate.value, 'MMMM, yyyy', { locale: locale.value })
    }
  })
}

function useNow (updatePeriod = 60000) {
  const now = ref(new Date())
  const interval = setInterval(() => {
    now.value = new Date()
  }, updatePeriod)

  onUnmounted(() => {
    clearInterval(interval)
  })

  return {
    now,
  }
}

function useSelectCalendarType (params) {
  const calendarType = ref('week')
  const calendarTypes = [
    {
      name: 'month',
      value: 'month',
    },
    {
      name: 'week',
      value: 'week',
    },
    {
      name: 'day',
      value: 'day',
    },
  ]

  const components = [
    {
      component: Month,
      value: 'month',
    },
    {
      component: Week,
      value: 'week',
    },
    {
      component: Day,
      value: 'day',
    },
  ]

  const currentCalendarComponent = computed(() => components
    .find(c => c.value === calendarType.value).component)

  return {
    calendarType,
    calendarTypes,
    currentCalendarComponent,
  }
}

function useSelectLocale (params) {
  const locale = ref(ru)
  const locales = [
    ru,
    enUS,
  ]

  return {
    locale,
    locales,
  }
}
</script>
