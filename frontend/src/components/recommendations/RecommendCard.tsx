'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb } from 'lucide-react';
import type { Satellite } from '@/types';

interface RecommendCardProps {
    satellite?: Satellite;
}

export const RecommendCard = ({ satellite }: RecommendCardProps) => {
    const recommendation = {
        text: satellite
            ? `Monitor ${satellite.name} closely and continue routine operations`
            : 'Monitor closely and continue routine operations',
        priority: 'MEDIUM',
        actions: ['Check telemetry', 'Verify position', 'Update logs']
    };

    const getPriorityColor = (priority: string) => {
        if (priority === 'CRITICAL') return 'bg-red-100 text-red-800';
        if (priority === 'HIGH') return 'bg-orange-100 text-orange-800';
        if (priority === 'MEDIUM') return 'bg-yellow-100 text-yellow-800';
        return 'bg-green-100 text-green-800';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    AI Recommendation
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <p className="text-sm">{recommendation.text}</p>
                    <div className="flex gap-2">
                        <Badge className={getPriorityColor(recommendation.priority)}>
                            {recommendation.priority}
                        </Badge>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-semibold text-gray-600">Suggested Actions:</p>
                        <ul className="text-xs space-y-1">
                            {recommendation.actions.map((action, idx) => (
                                <li key={idx}>• {action}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
