'use client'

import { Suspense, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { useSatelliteStore } from '@/store/satelliteStore'
import EarthMesh from './EarthMesh'
import { SatelliteMarker } from './SatelliteMarker'
import { OrbitPath } from './OrbitPath'

export default function EarthScene() {
  const { satellites, selectedId, setSelectedId } = useSatelliteStore()
  const selectedSatellite = satellites.find((sat) => sat.id === selectedId)
  
  useEffect(() => {
    console.log('SATELLITES:', satellites)
  }, [satellites])
  return (
    <Canvas camera={{ position: [0, 0, 2.5], fov: 50 }}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.2} />
        <pointLight position={[5, 5, 5]} intensity={300} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />

        <EarthMesh />

        {satellites.map((satellite) => (
          <SatelliteMarker
            key={satellite.id}
            satellite={satellite}
            isSelected={satellite.id === selectedId}
            onClick={() => setSelectedId(satellite.id)}
          />
        ))}

        {selectedSatellite && <OrbitPath satellite={selectedSatellite} />}

        <OrbitControls
          enablePan={false}
          minDistance={1.2}
          maxDistance={5}
          enableDamping
          dampingFactor={0.05}
        />
      </Suspense>
    </Canvas>
  )
}