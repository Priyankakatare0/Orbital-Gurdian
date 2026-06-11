'use client'

import { useSatelliteStore } from '@/store/satelliteStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Battery, Thermometer, Signal } from 'lucide-react'
import type { Satellite } from '@/types'

interface HealthPanelProps {
  satellite?: Satellite
}

export const HealthPanel = ({ satellite }: HealthPanelProps) => {
  const { selectedSatellite, latestTelemetry } = useSatelliteStore()
  const currentSatellite = satellite ?? selectedSatellite
  const telemetry = currentSatellite
    ? latestTelemetry[currentSatellite.id]
    : null

  const battery = telemetry?.battery ?? telemetry?.battery_percentage ?? currentSatellite?.telemetry?.battery ?? null
  const temperature = telemetry?.temperature ?? telemetry?.temperature_celsius ?? currentSatellite?.telemetry?.temperature ?? null
  const signal = telemetry?.signal ?? telemetry?.signal_strength ?? currentSatellite?.telemetry?.signal ?? null

  return (
    <Card className='border-slate-700 bg-slate-800/50'>
      <CardHeader>
        <CardTitle className='text-white'>Live Telemetry</CardTitle>
      </CardHeader>
      <CardContent>
        {!currentSatellite ? (
          <div className='flex h-24 items-center justify-center'>
            <p className='text-slate-400'>No satellite selected</p>
          </div>
        ) : (
          <div className='grid grid-cols-3 gap-4 text-center'>
            <div className='flex flex-col items-center gap-2'>
              <Battery className='h-8 w-8 text-green-400' />
              <p className='text-2xl font-bold text-white'>
                {battery !== null ? `${battery.toFixed(0)}%` : 'N/A'}
              </p>
              <p className='text-xs text-slate-400 '>Battery</p>
            </div>
            <div className='flex flex-col items-center gap-2'>
              <Thermometer className='h-8 w-8 text-blue-400' />
              <p className='text-2xl font-bold text-white'>
                {temperature !== null ? `${temperature.toFixed(1)}°C` : 'N/A'}
              </p>
              <p className='text-xs text-slate-400'>Temp</p>
            </div>
            <div className='flex flex-col items-center gap-2'>
              <Signal className='h-8 w-8 text-purple-400' />
              <p className='text-2xl font-bold text-white'>
                {signal !== null ? `${signal.toFixed(0)}%` : 'N/A'}
              </p>
              <p className='text-xs text-slate-400'>Signal</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
