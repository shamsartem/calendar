<template lang="pug">
div(
  :class='c.container'
)
  div(
    v-for='(day, i) in daysOfWeek'
    :class='c.day'
    :style='`grid-column: ${timetablesForWeek[0].doctors.length * i + 2} / span ${timetablesForWeek[0].doctors.length}`'
  ) {{ day }}
  template(
    v-for='(hour, i) in hours'
  )
    div(
      :class='c.hourText'
      :style='`grid-row: ${i + 3}`'
    ) {{ hour }}
    div(
      :class='c.hourLine'
      :style='`grid-row: ${i + 3}`'
    )
  div(
    :class='c.weekDaysShadow'
  )
  template(
    v-for='(timetablesForDay, i) in timetablesForWeek'
  )
    template(
      v-for='(doctor, j) in timetablesForDay.doctors'
    )
      div(
        :class='c.person'
        :style='`grid-column: ${2 + i * timetablesForDay.doctors.length + j}`'
      ) {{ doctor.name }}
      div(
        :class='c.timetable'
        :style='`grid-column: ${2 + i * timetablesForDay.doctors.length + j}`'
      )
</template>

<style lang="postcss" module="c">
.container {
  position: relative;
  overflow: auto;
  display: grid;
  grid-template-columns: auto repeat(14, 1fr);
  grid-template-rows: 36px auto repeat(25, 1fr);
  flex-grow: 1;
}

.day {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  line-height: 1;
  font-size: 12px;
  color: #8b8b9a;
  border-right: 1px solid #eee;
  grid-column: span 2;
  grid-row: 1;
}

.person {
  grid-row: 2;
  border-right: 1px solid #eee;
  border-bottom: 1px solid #eee;
  padding: 20px;
  white-space: nowrap;
}

.timetable {
  border-right: 1px solid #eee;
  grid-row: 3 / span 25;
}

.hourText {
  align-self: center;
  grid-column: 1;
  padding: 0 5px;
  color: #999;
  font-size: 12px;
  white-space: nowrap;
}

.hourLine {
  align-self: center;
  grid-column: 2 / span 14;
  height: 1px;
  background-color: #eee;
  flex-grow: 1;
}

.weekDaysShadow {
  grid-column: 1 / span 15;
  grid-row: 1;
  box-shadow: 0 0 20px #aaa;
  pointer-events: none;
  z-index: 1;
}
</style>

<style lang="postcss">
:root {
  --calendar-week-n: 2;
}
</style>

<script>
import { computed } from '@vue/composition-api'
import useDaysOfWeek from '../use-days-of-week'
import { ru } from 'date-fns/locale'
import {
  startOfDay,
  format,
  addHours,
  startOfWeek,
  addDays,
  addMinutes,
} from 'date-fns'

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
    const hours = useHours(props)
    const daysOfWeek = useDaysOfWeek(props, true)
    const timetablesForWeek = useTimetable(props)

    return {
      hours,
      daysOfWeek,
      timetablesForWeek,
    }
  },
}

function useHours (props) {
  const dayStart = startOfDay(new Date())
  const timeFormat = computed(() => {
    if (props.locale.code === 'en-US') {
      return 'h:mm a'
    }

    return 'H:mm'
  })

  return computed(() => new Array(25)
    .fill(null)
    .map((_, i) => format(addHours(dayStart, i), timeFormat.value)))
}

function useTimetable (props) {
  const start = startOfWeek(new Date(), { locale: props.locale })
  return new Array(7)
    .fill(null)
    .map((_, i) => ({
      date: addDays(start, i),
      doctors: new Array(2)
        .fill(null)
        .map((_, i) => ({
          name: `Person ${i + 1}`,
          timeslots: new Array(5)
            .fill(null)
            .map((_, j) => ({
              start: addHours(addDays(start, j), i + 8),
              end: addMinutes(addHours(addDays(start, j), i + 8), 15),
            })),
        })),
    }))
}
</script>
