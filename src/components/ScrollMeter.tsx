import React from 'react'

export const ScrollMeter = () => {
  const [progress, setProgress] = React.useState(0)

  React.useLayoutEffect(() => {
    const getScrollProgress = () => {
      const currentProgress = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      setProgress(currentProgress)
    }

    getScrollProgress()
    window.addEventListener('scroll', getScrollProgress)

    return () => {
      window.removeEventListener('scroll', getScrollProgress)
    }
  }, [])

  return (
    <div className="w-full sm:w-3/4 lg:w-1/2 mt-1">
      <div className="h-1 bg-blue-600 dark:bg-sky-500" style={{ width: `${progress}%` }} />
    </div>
  )
}
