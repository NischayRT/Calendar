import { 
  getDaysInMonth as getFnDaysInMonth,
  startOfMonth, 
  getDay,
  addMonths as addFnMonths,
  isSameDay as isFnSameDay,
  format as formatFn
} from 'date-fns';

export const dateHelpers = {
  getDaysInMonth: (date) => getFnDaysInMonth(date),
  getFirstDayOfMonth: (date) => getDay(startOfMonth(date)),
  addMonths: (date, amount) => addFnMonths(date, amount),
  isSameDay: (date1, date2) => isFnSameDay(date1, date2),
  format: (date, formatStr) => formatFn(date, formatStr)
};