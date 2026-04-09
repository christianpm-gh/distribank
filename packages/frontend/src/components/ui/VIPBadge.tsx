import { useEffect, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { Star } from 'lucide-react'

export default function VIPBadge({ weekTransactions }: { weekTransactions: number }) {
  const isVIP = weekTransactions >= 3
  const controls = useAnimation()
  const [hasPlayed, setHasPlayed] = useState(false)

  useEffect(() => {
    if (!isVIP) return

    const shake = async () => {
      await controls.start({
        x: [0, -2, 2, -2, 1, 0],
        rotate: [0, -1, 1, -0.5, 0.5, 0],
        transition: { duration: 0.4, ease: 'easeInOut', repeat: 2 },
      })
    }

    if (!hasPlayed) {
      shake()
      setHasPlayed(true)
    }

    const interval = setInterval(shake, 8000)
    return () => clearInterval(interval)
  }, [isVIP, controls, hasPlayed])

  if (!isVIP) {
    return (
      <span className="text-xs text-text-secondary">
        {weekTransactions} mov. esta semana
      </span>
    )
  }

  return (
    <motion.span
      animate={controls}
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5"
      style={{
        backgroundColor: 'var(--color-vip-glow)',
        borderColor: 'rgba(247, 164, 64, 0.4)',
      }}
    >
      <Star size={12} fill="currentColor" className="text-current" style={{ color: 'var(--color-vip-gold)' }} />
      <span className="text-xs font-bold" style={{ color: 'var(--color-vip-gold)' }}>
        VIP
      </span>
      <span className="text-xs text-text-muted">·</span>
      <span className="text-xs font-medium text-text-secondary">
        {weekTransactions} mov. esta semana
      </span>
    </motion.span>
  )
}
