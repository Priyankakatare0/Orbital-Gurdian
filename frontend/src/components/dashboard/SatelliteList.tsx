'use client'

import { useState } from 'react'
import { useSatelliteStore } from '@/store/satelliteStore'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const SatelliteList = () => {
  const { satellites, selectedId, setSelectedId, loading } = useSatelliteStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [riskFilter, setRiskFilter] = useState<string | null>(null)

  const getRiskCategory = (score: number | null | undefined) => {
    if (score === null || score === undefined) return 'LOW'
    if (score >= 75) return 'CRITICAL'
    if (score >= 40) return 'HIGH'
    return 'LOW'
  }

  const filteredSatellites = satellites
    .filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((s) => {
      if (!riskFilter) return true
      return getRiskCategory(s.risk_score) === riskFilter
    })

  if (loading && satellites.length === 0) {
    return (
      <div className='flex h-full items-center justify-center'>
        <p className='text-slate-400'>Loading satellites...</p>
      </div>
    )
  }

  return (
    <div className='flex h-full flex-col rounded-lg border border-slate-700 bg-slate-800/50'>
      <div className='p-4'>
        <Input
          placeholder='Search satellites...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='bg-slate-900/80'
        />
        <div className='mt-3 flex items-center gap-2'>
          <Button
            onClick={() => setRiskFilter(null)}
            variant={!riskFilter ? 'secondary' : 'ghost'}
            size='sm'
          >
            All
          </Button>
          <Button
            onClick={() => setRiskFilter('LOW')}
            variant={riskFilter === 'LOW' ? 'secondary' : 'ghost'}
            size='sm'
            className='text-green-400 hover:text-green-300'
          >
            Low
          </Button>
          <Button
            onClick={() => setRiskFilter('HIGH')}
            variant={riskFilter === 'HIGH' ? 'secondary' : 'ghost'}
            size='sm'
            className='text-yellow-400 hover:text-yellow-300'
          >
            High
          </Button>
          <Button
            onClick={() => setRiskFilter('CRITICAL')}
            variant={riskFilter === 'CRITICAL' ? 'secondary' : 'ghost'}
            size='sm'
            className='text-red-400 hover:text-red-300'
          >
            Critical
          </Button>
        </div>
      </div>
      <div className='flex-1 overflow-y-auto'>
        <ul className='divide-y divide-slate-700'>
          {filteredSatellites.map((sat) => (
            <li
              key={sat.id}
              onClick={() => setSelectedId(sat.id)}
              className={cn(
                'cursor-pointer p-4 transition-colors hover:bg-slate-700/50',
                selectedId === sat.id && 'bg-blue-900/50'
              )}
            >
              <div className='flex items-center justify-between'>
                <span className='font-medium'>{sat.name}</span>
                <span
                  className={cn(
                    'text-xs font-semibold',
                    getRiskCategory(sat.risk_score) === 'CRITICAL' && 'text-red-400',
                    getRiskCategory(sat.risk_score) === 'HIGH' && 'text-yellow-400',
                    getRiskCategory(sat.risk_score) === 'LOW' && 'text-green-400'
                  )}
                >
                  Risk: {sat.risk_score?.toFixed(1) ?? 'N/A'}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}