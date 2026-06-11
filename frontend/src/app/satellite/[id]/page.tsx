'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HealthPanel } from '@/components/dashboard/HealthPanel';
import { RiskCard } from '@/components/dashboard/RiskCard';
import { RecommendCard } from '@/components/recommendations/RecommendCard';
import type { Satellite } from '@/types';
import { getSatelliteHealth } from '@/lib/api';
import { useSatelliteStore } from '@/store/satelliteStore';
export default function SatelliteDetailPage() {
    const params = useParams();
    const satelliteId = params.id as string;
    const [satellite, setSatellite] = useState<Satellite | null>(null);
    const [loading, setLoading] = useState(true);
    const { updateTelemetry } = useSatelliteStore();

    useEffect(() => {
        const fetchSatellite = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/satellites/${satelliteId}`
                );
                const data = await response.json();
                setSatellite(data);
            } catch (error) {
                console.error('Error fetching satellite:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSatellite();
    }, [satelliteId]);

    // Fetch and periodically update health data
    useEffect(() => {
        if (!satellite) return;

        // Capture current satellite to avoid stale closures
        const currentSatellite = satellite;
        
        const fetchHealthData = async () => {
            try {
                const noradId = String(currentSatellite.norad_id);
                const healthData = await getSatelliteHealth(noradId, currentSatellite.name);
                
                // Update store with health data
                updateTelemetry({
                    satellite_id: currentSatellite.id,
                    battery: healthData.battery,
                    temperature: healthData.temperature,
                    signal: healthData.signal,
                    battery_percentage: healthData.battery,
                    temperature_celsius: healthData.temperature,
                    signal_strength: healthData.signal
                });
            } catch (error) {
                console.error('Failed to fetch health data:', error);
            }
        };

        // Fetch immediately
        fetchHealthData();

        // Refresh every 10 seconds
        const intervalId = setInterval(fetchHealthData, 10000);

        return () => clearInterval(intervalId);
    }, [satellite?.id, updateTelemetry]); // Only re-run if satellite ID changes or updateTelemetry changes

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    if (!satellite) {
        return <div className="flex items-center justify-center h-screen">Satellite not found</div>;
    }

    return (
        <main className="container mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">{satellite.name}</h1>
                <div className="flex gap-2 mb-4">
                    <Badge variant="outline">NORAD ID: {satellite.norad_id}</Badge>
                    <Badge variant="secondary">{satellite.satellite_type ?? 'Unknown type'}</Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <HealthPanel satellite={satellite} />
                <RiskCard satellite={satellite} />
                <RecommendCard satellite={satellite} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Orbital Parameters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Latitude</p>
                            <p className="font-semibold">{satellite.latitude.toFixed(2)}°</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Longitude</p>
                            <p className="font-semibold">{satellite.longitude.toFixed(2)}°</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Altitude</p>
                            <p className="font-semibold">{satellite.altitude.toFixed(0)} km</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Inclination</p>
                            <p className="font-semibold">{satellite.inclination?.toFixed(2) ?? 'N/A'}°</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Period</p>
                            <p className="font-semibold">{satellite.period?.toFixed(2) ?? 'N/A'} min</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Velocity</p>
                            <p className="font-semibold">{satellite.velocity?.toFixed(2) ?? 'N/A'} km/s</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="mt-6 flex gap-4">
                <Button onClick={() => window.history.back()} variant="outline">
                    Back
                </Button>
            </div>
        </main>
    );
}