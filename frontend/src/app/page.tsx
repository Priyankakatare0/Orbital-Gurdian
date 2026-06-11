'use client'

import EarthScene from '@/components/earth/EarthScene'
import { SatelliteList } from '@/components/dashboard/SatelliteList'
import { RiskCard } from '@/components/dashboard/RiskCard'
import { HealthPanel } from '@/components/dashboard/HealthPanel'
import { AlertBanner } from '@/components/dashboard/AlertBanner'
import { RecommendCard } from '@/components/recommendations/RecommendCard'
import { useSatellites } from '@/hooks/useSatellites'
import { useRealtime } from '@/hooks/useRealtime'

export default function Dashboard() {
  useSatellites()
  useRealtime()

  return (
    <div className='flex h-screen bg-slate-950 text-white overflow-hidden'>
      {/* Left Panel (60%) - Earth Visualization */}
      <div className='w-3/5 relative'>
        <AlertBanner />
        <EarthScene />
      </div>

      {/* Right Panel (40%) - Monitoring Panels */}
      <div className='w-2/5 flex flex-col bg-slate-900 border-l border-slate-700'>
        <div className='flex-shrink-0 p-4 border-b border-slate-700'>
          <h2 className='text-xl font-bold tracking-tight'>Orbital Guardian</h2>
        </div>
        <div className='flex-1 overflow-y-auto p-4 flex flex-col gap-4'>
          <div className='flex-grow-[2] flex flex-col'>
            <SatelliteList />
          </div>
          <div className='flex-grow-[3] flex flex-col gap-4'>
            <RiskCard />
            <HealthPanel />
            <RecommendCard />
          </div>
        </div>
      </div>
    </div>
  )
}