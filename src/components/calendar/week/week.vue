<template lang="pug">
div(
  :class='c.container'
  :style='`grid-template-columns: fit-content(0) repeat(${7 * numberOfPeople}, auto);`'
)
  div(
    :class='c.emptyDay'
  )
  div(
    v-for='(day, i) in daysOfWeek'
    :class='[c.day, isSameDay(now, day.date) && c.day_today]'
    :style='`grid-column: ${numberOfPeople * i + 2} / span ${numberOfPeople}`'
  )
    span(
      aria-hidden='true'
    ) {{ day.name }}
    button(
      :class='c.dayButton'
      @click='$emit("setDate", day.date)'
    )
      span.visuallyHidden {{ day.name }}
  div(
    :class='c.emptyPerson'
  )
  template(
    v-for='(hour, i) in hours'
  )
    div(
      :class='c.hourText'
      :style='`grid-row: ${i + 3}`'
      aria-hidden='true'
    )
      span {{ hour }}
    div(
      :class='c.hourLine'
      :style='`grid-row: ${i + 3}; grid-column: 2 / span ${numberOfPeople * 7}`'
    )
  div(
    :class='c.weekDaysShadow'
    :style='`grid-column: 1 / span ${7 * numberOfPeople + 1}`'
  )
  template(
    v-for='(timetablesForDay, i) in timetablesForWeek'
  )
    template(
      v-for='(doctor, j) in timetablesForDay.doctors'
    )
      div(
        :class='c.person'
        :style='`grid-column: ${2 + i * numberOfPeople + j}`'
      ) {{ doctor.name }}
      div(
        :class='[c.timetable, !j && c.timetable_first]'
        :style='`grid-column: ${2 + i * numberOfPeople + j}`'
        ref='timetableEls'
      )
        template(
          v-if='isSameDay(startOfWeek(selectedDate, { locale }), startOfWeek(doctor.timeslots[0].startTime, { locale }))'
        )
          button(
            v-for='timeslot in doctor.timeslots'
            :class='c.event'
            :style='`top: ${timeslot.start}px; min-height: ${timeslot.end - timeslot.start}px`'
          )
            span {{ timeslot.text }}
        div(
          v-if='isSameDay(now, timetablesForDay.date)'
          :class='c.now'
          :style='nowStyle'
        )
</template>

<style lang="postcss" module="c">
.container {
  display: grid;
  grid-template-rows: 36px auto repeat(25, minmax(50px, 1fr));
  min-width: max-content;
  flex-grow: 1;
}

.day {
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: 1;
  font-size: 12px;
  color: dimgrey;
  border-right: 1px solid #eee;
  border-bottom: 1px solid #eee;
  grid-column: span 2;
  grid-row: 1;
  position: sticky;
  top: 60px;
  background-color: #fff;
  z-index: 4;
  text-transform: capitalize;

  &_today {
    color: #413bb8;
    font-weight: 700;
  }
}

.dayButton {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.emptyDay {
  position: sticky;
  top: 60px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  z-index: 4;
  grid-column: 1;
  grid-row: 1;
}

.person {
  grid-row: 2;
  border-right: 1px solid #eee;
  padding: 20px;
  white-space: nowrap;
  position: sticky;
  top: 96px;
  background-color: #fff;
  z-index: 2;
}

.emptyPerson {
  position: sticky;
  top: 96px;
  background-color: #fff;
  z-index: 2;
  grid-column: 1;
  grid-row: 2;
}

.timetable {
  position: relative;
  border-right: 1px solid #eee;
  grid-row: 3 / span 25;

  &_first {
    .now::before {
      content: '';
      width: 10px;
      height: 10px;
      left: -5.6px;
      position: absolute;
      background-color: red;
      border-radius: 50%;
      top: -4.5px;
    }
  }
}

.hourText {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  grid-column: 1;
  padding: 0 5px 0 15px;
  color: dimgrey;
  font-size: 12px;
  white-space: nowrap;
  position: sticky;
  left: 0;
  background-color: #fff;
  z-index: 1;
}

.hourLine {
  align-self: center;
  height: 1px;
  background-color: #eee;
  flex-grow: 1;
}

.weekDaysShadow {
  grid-row: 1 / span 2;
  box-shadow: 0 0 20px #aaa;
  pointer-events: none;
  z-index: 3;
  position: sticky;
  top: 60px;
}

.event {
  position: absolute;
  width: 95%;
  border-radius: 3px;
  background-color: #dcdefe;
  font-size: 12px;
  padding: 3px;
  display: flex;
  flex-direction: column;
}

.now {
  position: absolute;
  width: calc(100% + 1px);
  height: 2px;
  background-color: red;
}
</style>

<script>
import { computed, ref, onMounted, onBeforeUnmount, watch } from '@vue/composition-api'
import useDaysOfWeek from '../use-days-of-week'
import { ru } from 'date-fns/locale'
import {
  startOfDay,
  format,
  addHours,
  startOfWeek,
  addDays,
  addMinutes,
  getUnixTime,
  isSameDay,
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
    const {
      timetableEls,
      pixelsDividedBySecondsInADay,
    } = useTimeToPixels()

    const { timetablesForWeek, numberOfPeople } = useTimetable(props, {
      pixelsDividedBySecondsInADay,
      timetableEls,
    })

    const nowStyle = computed(() => `top: ${timeToPixelsFromTop({
      timetableEls,
      pixelsDividedBySecondsInADay,
      time: props.now,
    }).value - 1}px;`)

    return {
      hours,
      daysOfWeek,
      timetablesForWeek,
      numberOfPeople,
      timetableEls,
      nowStyle,
      isSameDay,
      startOfWeek,
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

function useTimeToPixels () {
  const timetableEls = ref(null)

  const pixelsDividedBySecondsInADay = ref(0.09)

  const setPixelsDividedBySecondsInADay = () => {
    const h = timetableEls.value ? timetableEls.value[0].offsetHeight : 0
    pixelsDividedBySecondsInADay.value = (h - h / 25) / 86400
  }

  watch(() => {
    setPixelsDividedBySecondsInADay(timetableEls.value)
  })

  onMounted(setPixelsDividedBySecondsInADay)
  window.addEventListener('resize', setPixelsDividedBySecondsInADay)
  onBeforeUnmount(() => {
    window.removeEventListener('resize', setPixelsDividedBySecondsInADay)
  })

  return {
    timetableEls,
    pixelsDividedBySecondsInADay,
  }
}

function timeToPixelsFromTop ({ time, pixelsDividedBySecondsInADay, timetableEls }) {
  return computed(() => {
    let offset
    if (!timetableEls.value) {
      offset = 10
    } else {
      offset = timetableEls.value[0].offsetHeight / 50
    }
    return Math.round(offset + pixelsDividedBySecondsInADay.value * (getUnixTime(time) - getUnixTime(startOfDay(time))))
  })
}

function useTimetable (props, {
  pixelsDividedBySecondsInADay,
  timetableEls,
}) {
  const numberOfPeople = 2

  return {
    timetablesForWeek: computed(() => {
      const start = startOfWeek(props.selectedDate, { locale: props.locale })
      return new Array(7)
        .fill(null)
        .map((_, i) => ({
          date: addDays(start, i),
          doctors: new Array(numberOfPeople)
            .fill(null)
            .map((_, j) => ({
              name: `Person ${j + 1}`,
              timeslots: new Array(12)
                .fill(null)
                .map((_, k) => {
                  const s = addHours(addHours(addDays(start, i), k), j + 8)
                  const e = addMinutes(s, 45)
                  return {
                    start: timeToPixelsFromTop({
                      time: s,
                      pixelsDividedBySecondsInADay,
                      timetableEls,
                    }).value,
                    startTime: s,
                    text: `${format(s, 'hh:mm', { locale: props.locale })} - ${format(e, 'hh:mm', { locale: props.locale })}`,
                    end: timeToPixelsFromTop({
                      time: e,
                      pixelsDividedBySecondsInADay,
                      timetableEls,
                    }).value,
                    endTime: e,
                  }
                })
                .filter(_ => Math.random() > 0.5),
            })),
        }))
    }),
    numberOfPeople,
  }
}
</script>
