<template lang="pug">
div(
  :class='c.container'
)
  div(
    v-for='(weekDayName, i) in weekDayNames'
    :class='c.weekDayName'
    :style='`grid-column: ${i + 1}`'
    aria-hidden='true'
  )
    div {{ weekDayName.name }}
  div(
    v-for='day in monthDays'
    :class='[c.day, day.otherMonth && c.day_otherMonth]'
  )
    div(
      :class='[c.number, day.today && c.number_today]'
      aria-hidden='true'
    ) {{ day.number }}
    | {{ day.dayOfTheWeek }}
    button(
      :class='c.dayButton'
      @click='$emit("setDate", day.date)'
    )
      span.visuallyHidden {{ day.srText }}
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
  flex-grow: 1;
}

.weekDaysShadow {
  grid-row: 1;
  grid-column: 1 / span 7;
  box-shadow: 0 0 20px #aaa;
  pointer-events: none;
  z-index: 1;
}

.weekDayName {
  grid-row: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  line-height: 1;
  font-size: 12px;
  color: dimgrey;
  border-right: 1px solid #eee;
  text-transform: capitalize;
}

.day {
  background: white;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #eee;
  border-bottom: 1px solid #eee;
  position: relative;

  &_otherMonth {
    color: #aaa;
  }
}

.dayButton {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.number {
  font-size: 18px;
  border-radius: 50%;
  display: inline-block;
  width: 30px;
  height: 30px;
  margin-top: 10px;
  margin-left: 10px;
  text-align: center;
  line-height: 30px;

  &_today {
    background-color: #413bb8;
    color: white;
  }
}
</style>

<script>
import { computed } from '@vue/composition-api'
import useDaysOfWeek from '../use-days-of-week'
import {
  startOfMonth,
  getDay,
  subDays,
  addDays,
  format,
  isSameMonth,
  getDaysInMonth,
  isSameDay,
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
    const weekDayNames = useDaysOfWeek(props)
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

    if (daysInMonth === 28 && extraDaysOfPreviousMonth === 0) {
      numberOfDaysToGenerate = 28
    }

    const firstDay = subDays(monthStart, extraDaysOfPreviousMonth)

    return new Array(numberOfDaysToGenerate)
      .fill(null)
      .map((_, i) => {
        const date = addDays(firstDay, i)
        return {
          date,
          number: format(date, 'd'),
          srText: `${format(date, 'do MMMM yyyy', { locale: props.locale })}`,
          otherMonth: !isSameMonth(date, props.selectedDate),
          today: isSameDay(date, props.now),
        }
      })
  })
}
</script>
