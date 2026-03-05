import { useMemo } from 'react'

const PARTICLE_COUNT = 55
const COLORS = [
  'rgba(255, 255, 255, 0.85)',      // bright white
  'rgba(224, 231, 255, 0.8)',       // indigo-100
  'rgba(199, 210, 254, 0.75)',     // indigo-200
  'rgba(165, 180, 252, 0.7)',      // indigo-300
  'rgba(129, 140, 248, 0.65)',     // indigo-400
]

function useParticles() {
  return useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 8 + Math.random() * 14,
      duration: 10 + Math.random() * 14,
      delay: Math.random() * -12,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }))
  }, [])
}

export function FloatingParticles() {
  const particles = useParticles()

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none z-[1]"
      aria-hidden
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-float particle-dot"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            minWidth: p.size,
            minHeight: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size}px ${p.color}, 0 0 ${p.size * 2.5}px rgba(129, 140, 248, 0.25)`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
