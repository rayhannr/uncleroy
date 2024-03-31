export const formatLongDate = (date: Date) =>
  new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full',
    timeStyle: 'long'
  }).format(date)

export const formatShortDate = (date: Date) =>
  new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full'
  }).format(date)
