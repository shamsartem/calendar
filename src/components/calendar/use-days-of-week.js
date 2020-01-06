import { computed, ref, onBeforeUnmount } from '@vue/composition-api'
import {
  addDays,
  format,
  startOfWeek,
} from 'date-fns'

export default function useWeekDayNames (props, showDate = false) {
  const mediaQuery = window.matchMedia('(min-width: 567px)')
  const longFormat = showDate ? 'EEEE, d' : 'EEEE'
  const shortFormat = showDate ? 'EEEE, d' : 'EEEEEE'
  const monthFormat = ref(longFormat)

  const onWindowResize = () => {
    if (mediaQuery.matches) {
      monthFormat.value = longFormat
      return
    }

    monthFormat.value = shortFormat
  }

  onWindowResize()

  window.addEventListener('resize', onWindowResize)

  onBeforeUnmount(() => {
    window.removeEventListener('resize', onWindowResize)
  })

  return computed(() => {
    const weekStart = startOfWeek(props.selectedDate, { locale: props.locale })
    return new Array(7)
      .fill(null)
      .map((_, i) => format(addDays(weekStart, i), monthFormat.value, { locale: props.locale }))
  })
}
