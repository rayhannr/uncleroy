export const formatLongDate = (date: Date | string) =>
  new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full',
    timeStyle: 'long',
    timeZone: 'Europe/London'
  }).format(new Date(date))

export const formatShortDate = (date: Date | string) =>
  new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full'
  }).format(new Date(date))
