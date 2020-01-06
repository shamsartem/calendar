<template lang="pug">
div(
  :class='c.container'
)
  div(
    v-for='(day, i) in daysOfWeek'
    :class='c.day'
    :style='`grid-column: ${numberOfPeople * i + 2} / span ${numberOfPeople}`'
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
        div(
          v-for='timeslot in doctor.timeslots'
          :class='c.event'
          :style='`top: ${timeslot.start}px; height: ${timeslot.end - timeslot.start}px`'
        )
        div(
          v-if='isSameDay(now, doctor.timeslots[0].startTime)'
          :class='c.now'
          :style='nowStyle'
        )
</template>

<style lang="postcss" module="c">
.container {
  overflow: auto;
  display: grid;
  grid-template-rows: 36px auto repeat(25, minmax(25px, 1fr));
  flex-grow: 1;
}

.day {
  display: flex;
  justify-content: center;
  align-items: center;
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
  align-self: center;
  grid-column: 1;
  padding: 0 5px;
  color: #999;
  font-size: 12px;
  white-space: nowrap;
}

.hourLine {
  align-self: center;
  height: 1px;
  background-color: #eee;
  flex-grow: 1;
}

.weekDaysShadow {
  grid-row: 1;
  box-shadow: 0 0 20px #aaa;
  pointer-events: none;
  z-index: 1;
}

.event {
  position: absolute;
  width: 100%;
  background-color: #dcdefe;
}

.now {
  position: absolute;
  width: calc(100% + 1px);
  height: 1px;
  background-color: red;
}
</style>

<script>
import { computed, ref, onMounted, onBeforeUnmount } from '@vue/composition-api'
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
    const h = timetableEls.value[0].offsetHeight
    pixelsDividedBySecondsInADay.value = (h - h / 25) / 86400
  }

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
  const start = startOfWeek(new Date(), { locale: props.locale })
  const numberOfPeople = 3

  return {
    timetablesForWeek: computed(() => new Array(7)
      .fill(null)
      .map((_, i) => ({
        date: addDays(start, i),
        doctors: new Array(numberOfPeople)
          .fill(null)
          .map((_, j) => ({
            name: `Person ${i + 1}`,
            timeslots: new Array(12)
              .fill(null)
              .map((_, k) => {
                const s = addHours(addHours(addDays(start, i), k), j + 8)
                const e = addMinutes(s, 30)
                return {
                  start: timeToPixelsFromTop({
                    time: s,
                    pixelsDividedBySecondsInADay,
                    timetableEls,
                  }).value,
                  startTime: s,
                  end: timeToPixelsFromTop({
                    time: e,
                    pixelsDividedBySecondsInADay,
                    timetableEls,
                  }).value,
                  endTime: e,
                }
              }),
          })),
      }))),
    numberOfPeople,
  }
}
</script>
