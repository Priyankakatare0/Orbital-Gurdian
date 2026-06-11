'use client'

import { useSatelliteStore } from '@/store/satelliteStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
} from 'recharts'
import type { Satellite } from '@/types'

interface RiskCardProps {
  satellite?: Satellite
}

export const RiskCard = ({ satellite }: RiskCardProps) => {
  const { selectedSatellite } = useSatelliteStore()
  const currentSatellite = satellite ?? selectedSatellite
  const riskScore = currentSatellite?.risk_score ?? 0
  const riskLevel =
    riskScore >= 75 ? 'CRITICAL' : riskScore >= 40 ? 'HIGH' : 'LOW'

  const color =
    riskLevel === 'CRITICAL'
      ? '#ef4444'
      : riskLevel === 'HIGH'
      ? '#f59e0b'
      : '#22c55e'

  const data = [{ name: 'Risk', value: riskScore, fill: color }]

  return (
    <Card className='border-slate-700 bg-slate-800/50'>
      <CardHeader>
        <CardTitle className='text-white'>Mission Risk Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        {!currentSatellite ? (
          <div className='flex h-48 items-center justify-center'>
            <p className='text-slate-400'>Select a satellite to view risk</p>
          </div>
        ) : (
          <div className='flex items-center justify-between'>
            <div className='w-1/2'>
              <ResponsiveContainer width='100%' height={180}>
                <RadialBarChart
                  innerRadius='70%'
                  outerRadius='100%'
                  data={data}
                  startAngle={90}
                  endAngle={-270}
                >
                  <PolarAngleAxis
                    type='number'
                    domain={[0, 100]}
                    angleAxisId={0}
                    tick={false}
                  />
                  <RadialBar
                    background
                    dataKey='value'
                    cornerRadius={10}
                    angleAxisId={0}
                  />
                  <text
                    x='50%'
                    y='50%'
                    textAnchor='middle'
                    dominantBaseline='middle'
                    className='fill-white text-4xl font-bold'
                  >
                    {riskScore.toFixed(0)}
                  </text>
                  <text
                    x='50%'
                    y='65%'
                    textAnchor='middle'
                    dominantBaseline='middle'
                    className='fill-slate-400 text-sm'
                  >
                    / 100
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className='w-1/2 space-y-2 text-right'>
              <p className='text-lg font-semibold' style={{ color }}>
                {riskLevel}
              </p>
              <p className='text-sm text-slate-300'>
                Health: {currentSatellite.health_status ?? 'N/A'}
              </p>
              <p className='text-xs text-slate-400'>
                Based on current telemetry and threat analysis.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
