'use client';

import { useEffect, useState } from 'react';

export const useRiskScore = (satelliteId: string) => {
    const [riskScore, setRiskScore] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRiskScore = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const response = await fetch(`${apiUrl}/api/risk/${satelliteId}?name=${satelliteId}`);
                const data = await response.json();
                setRiskScore(data.mission_risk || 0);
            } catch (error) {
                console.error('Error fetching risk score:', error);
                setRiskScore(0);
            } finally {
                setLoading(false);
            }
        };

        fetchRiskScore();

        // Update every 60 seconds
        const interval = setInterval(fetchRiskScore, 60000);
        return () => clearInterval(interval);
    }, [satelliteId]);

    return { riskScore, loading };
};
