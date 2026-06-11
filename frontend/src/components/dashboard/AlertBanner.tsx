'use client'

import { useState, useEffect } from 'react'
import { useSatelliteStore } from '@/store/satelliteStore'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export const AlertBanner = () => {
  const { satellites } = useSatelliteStore()
  const [visible, setVisible] = useState(true)

  const criticalSatellites = satellites.filter(
    (s) => (s.risk_score ?? 0) >= 75
  )
  const hasAlerts = criticalSatellites.length > 0

  useEffect(() => {
    setVisible(true)
    const timer = setTimeout(() => setVisible(false), 3000)
    return () => clearTimeout(timer)
  }, [hasAlerts, satellites.length])

  return (
    <div
      className={cn(
        'absolute top-4 left-4 z-50 rounded-lg border p-4 shadow-lg transition-all duration-500',
        hasAlerts
          ? 'border-red-500/50 bg-red-900/80 text-red-100'
          : 'border-green-500/50 bg-green-900/80 text-green-100',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'
      )}
    >
      <div className='flex items-center gap-3'>
        {hasAlerts ? (
          <AlertTriangle className='h-6 w-6 text-red-400' />
        ) : (
          <CheckCircle2 className='h-6 w-6 text-green-400' />
        )}
        <div>
          <p className='font-semibold'>
            {hasAlerts
              ? `${criticalSatellites.length} Satellite(s) at Critical Risk`
              : 'All Systems Nominal'}
          </p>
          <p className='text-sm opacity-80'>
            {hasAlerts
              ? `Example: ${criticalSatellites[0].name}`
              : 'No immediate threats detected.'}
          </p>
        </div>
      </div>
    </div>
  )
}