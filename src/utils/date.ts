export const formatLongDate = (date: Date) =>
  new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full',
    timeStyle: 'short'
  }).format(date)

export const formatShortDate = (date: Date) =>
  new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full'
  }).format(date)
