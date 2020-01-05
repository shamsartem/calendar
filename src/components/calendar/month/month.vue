<template lang="pug">
div(
  :class='c.container'
)
  div(
    v-for='weekDayName in weekDayNames'
    :class='c.weekDayName'
  )
    div {{ weekDayName }}
  div(
    v-for='day in monthDays'
    :class='[c.day, day.otherMonth && c.day_otherMonth]'
  )
    div(
      :class='c.number'
    ) {{ day.number }}
    | {{ day.dayOfTheWeek }}
  div(
    :class='c.weekDaysShadow'
    )
</template>

<style lang="postcss" module="c">
.container {
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: 36px repeat(auto-fit, minmax(0, 1fr));
  gap: 1px;
  background-color: #eee;
  flex-grow: 1;
}

.weekDaysShadow {
  position: absolute;
  top: 0;
  width: 100%;
  height: 36px;
  box-shadow: 0 0 20px #aaa;
}

.weekDayName {
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
  line-height: 1;
  font-size: 12px;
  color: #8b8b9a;
}

.day {
  background: white;
  display: flex;
  flex-direction: column;

  &_otherMonth {
    color: #aaa;
  }
}

.number {
  padding-top: 10px;
  padding-left: 10px;
}
</style>

<script>
import { computed, ref, onBeforeUnmount } from '@vue/composition-api'
import {
  startOfMonth,
  getDay,
  subDays,
  addDays,
  format,
  isSameMonth,
  startOfWeek,
  getDaysInMonth,
} from 'date-fns'
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
  setup (props) {
    const monthDays = useMonthDays(props)
    const weekDayNames = useWeekDayNames(props)
    return {
      monthDays,
      weekDayNames,
    }
  },
}

function useMonthDays (props) {
  return computed(() => {
    const monthStart = startOfMonth(props.selectedDate)
    let monthStartDayOfWeek = getDay(monthStart)
    let { options: { weekStartsOn } } = props.locale
    let extraDaysOfPreviousMonth = 0
    while (weekStartsOn !== monthStartDayOfWeek) {
      if (weekStartsOn === 6) {
        weekStartsOn = 0
      } else {
        weekStartsOn += 1
      }

      extraDaysOfPreviousMonth += 1
    }

    const daysInMonth = getDaysInMonth(props.selectedDate)
    let numberOfDaysToGenerate = 35
    if (daysInMonth + extraDaysOfPreviousMonth > numberOfDaysToGenerate) {
      numberOfDaysToGenerate = 42
    }

    const firstDay = subDays(monthStart, extraDaysOfPreviousMonth)

    return new Array(numberOfDaysToGenerate)
      .fill(null)
      .map((_, i) => {
        const date = addDays(firstDay, i)
        return {
          date,
          number: format(date, 'd'),
          otherMonth: !isSameMonth(date, props.selectedDate),
        }
      })
  })
}

function useWeekDayNames (props) {
  const mediaQuery = window.matchMedia('(min-width: 567px)')
  const monthFormat = ref('EEEE')

  const onWindowResize = () => {
    if (mediaQuery.matches) {
      monthFormat.value = 'EEEE'
      return
    }

    monthFormat.value = 'EEEEEE'
  }

  onWindowResize()

  window.addEventListener('resize', onWindowResize)

  onBeforeUnmount(() => {
    window.removeEventListener(onWindowResize)
  })

  return computed(() => {
    const weekStart = startOfWeek(props.selectedDate, { locale: props.locale })

    return new Array(7)
      .fill(null)
      .map((_, i) => format(addDays(weekStart, i), monthFormat.value, props.locale))
  })
}
</script>
