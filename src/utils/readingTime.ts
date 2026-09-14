import readingTime from 'reading-time'

export const getReadingTime = (content: string) => {
  const { minutes, text } = readingTime(content)
  return Math.round(minutes) < 1 ? 'Less than 1 min read' : text
}
