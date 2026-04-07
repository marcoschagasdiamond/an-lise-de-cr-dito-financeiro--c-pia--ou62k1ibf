import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function TopProgressBar() {
  const location = useLocation()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
    setProgress(30)

    const timer1 = setTimeout(() => setProgress(70), 150)
    const timer2 = setTimeout(() => {
      setProgress(100)
      setTimeout(() => {
        setVisible(false)
        setTimeout(() => setProgress(0), 200)
      }, 300)
    }, 400)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [location.pathname])

  if (!visible && progress === 0) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 w-full overflow-hidden pointer-events-none">
      <div
        className={cn(
          'h-full bg-[#C5A059] shadow-[0_0_10px_#C5A059] transition-all duration-300 ease-out',
          progress === 100 && 'duration-200',
        )}
        style={{ width: `${progress}%`, opacity: visible ? 1 : 0 }}
      />
    </div>
  )
}
