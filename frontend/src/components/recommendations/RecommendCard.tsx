'use client';

import { useSatelliteStore } from '@/store/satelliteStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Satellite, ArrowRight } from 'lucide-react';
import type { Satellite as SatelliteType } from '@/types';

interface RecommendCardProps {
    satellite?: SatelliteType;
}

interface MissionIntelligence {
    observation: string;
    reasoning: string;
    likely_cause: string;
    impact_if_ignored: string;
    action: string;
    risk_reduction: number;
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

const PRIORITY_BADGE: Record<string, string> = {
    CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
    HIGH:     'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
    MEDIUM:   'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300',
    LOW:      'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
};

const RISK_BAR_COLOR: Record<string, string> = {
    CRITICAL: 'bg-red-600',
    HIGH:     'bg-orange-500',
    MEDIUM:   'bg-yellow-500',
    LOW:      'bg-green-600',
};

export const RecommendCard = ({ satellite }: RecommendCardProps) => {
    const { latestTelemetry, selectedSatellite } = useSatelliteStore();
    const sat  = satellite ?? selectedSatellite;
    const telem = sat ? latestTelemetry[sat.id] : null;

    const battery     = telem?.battery ?? telem?.battery_percentage ?? sat?.telemetry?.battery ?? null;
    const temperature = telem?.temperature ?? telem?.temperature_celsius ?? sat?.telemetry?.temperature ?? null;
    const signal      = telem?.signal ?? telem?.signal_strength ?? sat?.telemetry?.signal ?? null;
    const health      = sat?.health_status ?? 100;
    const riskScore   = sat?.risk_score ?? 0;
    const canManeuver = battery !== null && battery >= 20;

    const generateIntelligence = (): MissionIntelligence => {
        const name = sat?.name ?? 'Unknown';

        if (!sat) {
            return {
                priority:        'LOW',
                observation:     'No satellite selected.',
                reasoning:       'Select a satellite to begin mission intelligence analysis.',
                likely_cause:    '–',
                impact_if_ignored: '–',
                action:          'Select a satellite from the constellation view.',
                risk_reduction:  0,
            };
        }

        // ── CRITICAL ─────────────────────────────────────────────────────────
        if (battery !== null && battery < 20) {
            return {
                priority: 'CRITICAL',
                observation: `${name} battery at ${battery.toFixed(1)}%, health score ${health}/100, mission risk ${riskScore}/100.`,
                reasoning: `At ${battery.toFixed(1)}% battery the available delta-v is below the minimum maneuver threshold. ` +
                    `Health at ${health}/100 signals concurrent subsystem stress — likely thermal cycling or reaction-wheel degradation — ` +
                    `increasing power draw and accelerating depletion. If collision risk is active, the avoidance window is narrowing.`,
                likely_cause:
                    'Extended eclipse exposure after an attitude anomaly likely rotated solar panels off sun-pointing, ' +
                    'cutting charge accumulation by an estimated 35–50% over the last two orbit cycles.',
                impact_if_ignored:
                    `At current drain rate, the battery reaches safe-mode cutoff within hours, eliminating any maneuver capability. ` +
                    `Collision probability rises unchecked and mission recovery becomes ground-command-only.`,
                action: canManeuver
                    ? `Shed all non-essential loads immediately (science payload, secondary comms) to arrest drain, ` +
                      `then schedule a minimum-delta-v avoidance burn at the next perigee pass.`
                    : `Maneuver is not possible at ${battery.toFixed(1)}%. Initiate load-shedding now to recover charge margin; ` +
                      `reassess burn feasibility within 2 hours and alert ground control.`,
                risk_reduction: 65,
            };
        }

        if (temperature !== null && temperature > 55) {
            return {
                priority: 'CRITICAL',
                observation: `${name} temperature at ${temperature}°C (limit 55°C), health score ${health}/100, battery ${battery?.toFixed(1) ?? '–'}%.`,
                reasoning: `Temperature ${temperature}°C exceeds the thermal design limit. At this level, solder joint fatigue and ` +
                    `component drift become likely within hours, compounding the health degradation already showing at ${health}/100. ` +
                    `High temperatures also reduce battery charge efficiency, further constraining available delta-v.`,
                likely_cause:
                    'Probable failure of the primary heat-pipe loop or attitude drift that has increased solar flux on a high-dissipation panel face. ' +
                    'May be coupled to a pointing anomaly.',
                impact_if_ignored:
                    'Sustained operation above 55°C risks irreversible damage to onboard electronics within 4–8 hours, ' +
                    'potentially causing permanent loss of attitude control or payload.',
                action:
                    `Rotate the satellite to present the +Z (coldest) face to the sun and activate the redundant thermal louvers; ` +
                    `cut power to the primary science payload to reduce internal dissipation by ~18 W.`,
                risk_reduction: 60,
            };
        }

        if (signal !== null && signal < 30) {
            return {
                priority: 'CRITICAL',
                observation: `${name} signal strength at ${signal}%, primary link degraded, health score ${health}/100.`,
                reasoning: `Signal below 30% indicates the primary RF link is near dropout — commands may not be acknowledged ` +
                    `and telemetry will become intermittent. With health at ${health}/100, an onboard fault compounding the ` +
                    `link issue cannot be ruled out. Loss of command authority is the primary risk.`,
                likely_cause:
                    'Likely antenna pointing error from an attitude control anomaly, or atmospheric scintillation at low elevation during this pass. ' +
                    'Onboard receiver gain-table corruption is a secondary possibility.',
                impact_if_ignored:
                    'If the link drops entirely, the satellite autonomously enters safe mode and all scheduled operations are suspended. ' +
                    'Recovery requires a dedicated ranging pass and may take 12–48 hours.',
                action:
                    `Switch immediately to the backup omni-directional antenna on the S-band uplink; ` +
                    `issue a repoint command via the redundant ground station at ${signal < 20 ? 'high elevation angle' : 'next available pass'}.`,
                risk_reduction: 55,
            };
        }

        if (riskScore > 80) {
            return {
                priority: 'CRITICAL',
                observation: `${name} collision risk score ${riskScore}/100, battery ${battery?.toFixed(1) ?? '–'}%, health ${health}/100.`,
                reasoning: `A risk score above 80 reflects a conjunction probability above the operational action threshold. ` +
                    `Battery at ${battery?.toFixed(1) ?? 'unknown'}% ${canManeuver ? 'provides enough margin for a corrective burn' : 'is below the maneuver floor — burn feasibility is constrained'}. ` +
                    `Health at ${health}/100 must be verified before committing propellant.`,
                likely_cause:
                    'Target object is undergoing along-track drift that is closing the miss distance. ' +
                    'Refined TLE epoch from the last radar pass has tightened the TCA uncertainty ellipse.',
                impact_if_ignored:
                    `Without maneuver, miss distance will decrease to below the safety threshold at TCA. ` +
                    `At risk score ${riskScore}/100, the probability of a damaging collision exceeds mission risk tolerance.`,
                action: canManeuver
                    ? `Execute a prograde avoidance burn of ~1.5 m/s at the next descending node; ` +
                      `target a minimum 5 km miss distance and confirm updated conjunction geometry with 18 SCS post-burn.`
                    : `Battery too low for a safe burn; shed non-essential loads to recover margin, ` +
                      `then execute minimum-delta-v burn when battery exceeds 25%.`,
                risk_reduction: 70,
            };
        }

        // ── HIGH ─────────────────────────────────────────────────────────────
        if (battery !== null && battery < 40) {
            return {
                priority: 'HIGH',
                observation: `${name} battery at ${battery.toFixed(1)}%, health score ${health}/100.`,
                reasoning: `Battery at ${battery.toFixed(1)}% is approaching the maneuver floor. Health at ${health}/100 suggests ` +
                    `elevated subsystem draw — a degraded reaction wheel or heater cycling above budget — which is accelerating depletion. ` +
                    `The next eclipse period will worsen the charge deficit without corrective action.`,
                likely_cause:
                    'Reaction wheel thermal anomaly or heater thermostat failure is the probable cause of excess current draw, ' +
                    'exacerbated by a recent increase in eclipse fraction at the current orbital altitude.',
                impact_if_ignored:
                    `Within the next 2–3 orbit cycles, battery will fall below 20% and maneuver capability will be lost, ` +
                    `eliminating the ability to respond to any emerging conjunction.`,
                action:
                    `Power-cycle the reaction wheel assembly to reset thermal state; disable all non-essential heaters ` +
                    `and reschedule the next orbit to maximize time in sunlight.`,
                risk_reduction: 45,
            };
        }

        if (temperature !== null && temperature > 45) {
            return {
                priority: 'HIGH',
                observation: `${name} temperature at ${temperature}°C, health score ${health}/100, battery ${battery?.toFixed(1) ?? '–'}%.`,
                reasoning: `Temperature trending above 45°C means the spacecraft is operating in the upper thermal design margin. ` +
                    `Combined with health at ${health}/100, some degradation of thermally-sensitive components is likely already occurring. ` +
                    `Battery charge efficiency drops ~0.5% per degree above 40°C.`,
                likely_cause:
                    'A gradual reduction in thermal radiator efficiency — consistent with atomic oxygen erosion after this mission phase — ' +
                    'is the most probable long-term driver.',
                impact_if_ignored:
                    'Continued operation above 45°C will accelerate battery capacity fade and may trigger component derating within 1–2 weeks.',
                action:
                    `Increase thermal louver aperture by 15° and rotate the spacecraft 8° in roll to redistribute solar flux; ` +
                    `set a temperature alert at 50°C with automatic payload power-off.`,
                risk_reduction: 38,
            };
        }

        if (signal !== null && signal < 60) {
            return {
                priority: 'HIGH',
                observation: `${name} signal strength at ${signal}%, health score ${health}/100.`,
                reasoning: `Signal at ${signal}% is below the reliable command threshold of 65%. At this level, uplink commanding ` +
                    `has an elevated re-try rate and critical commands may be delayed. Health at ${health}/100 warrants ` +
                    `verifying whether the degradation is link-geometry or onboard RF hardware.`,
                likely_cause:
                    'Antenna pointing offset of ~3–5° from nominal, likely caused by a small attitude knowledge error accumulating since the last star-tracker update.',
                impact_if_ignored:
                    'If signal continues to degrade below 40%, command authority will be intermittent and anomaly response times will double.',
                action:
                    `Upload a corrected antenna-pointing table using the high-elevation ground station pass at T+1.5h; ` +
                    `perform a star-tracker reset to refresh attitude knowledge.`,
                risk_reduction: 42,
            };
        }

        if (riskScore > 60) {
            return {
                priority: 'HIGH',
                observation: `${name} collision risk score ${riskScore}/100, battery ${battery?.toFixed(1) ?? '–'}%, health ${health}/100.`,
                reasoning: `Risk score at ${riskScore}/100 indicates an evolving conjunction with a probability above the tracking-action threshold. ` +
                    `Battery at ${battery?.toFixed(1) ?? 'unknown'}% provides ${canManeuver ? 'adequate' : 'marginal'} margin for a corrective burn ` +
                    `if the next CDM update worsens the geometry.`,
                likely_cause:
                    'Target object is drifting within the conjunction corridor. Uncertainty in the debris TLE epoch is narrowing — ' +
                    'the next radar pass will likely refine the probability significantly.',
                impact_if_ignored:
                    'If probability crosses the maneuver threshold after the next CDM and no plan is pre-loaded, ' +
                    'planning time compresses below the safe execution window.',
                action:
                    `Pre-load a contingency burn of 0.8 m/s prograde into the flight system and request a refreshed CDM from 18 SCS ` +
                    `after the next radar pass. Authorize execution if probability crosses 1-in-1,000.`,
                risk_reduction: 40,
            };
        }

        // ── MEDIUM ────────────────────────────────────────────────────────────
        if (battery !== null && battery < 70) {
            return {
                priority: 'MEDIUM',
                observation: `${name} battery at ${battery.toFixed(1)}%, health score ${health}/100.`,
                reasoning: `Battery at ${battery.toFixed(1)}% is within safe operating range but below the 70% threshold that provides ` +
                    `full eclipse-period margin. If an upcoming eclipse is longer than nominal — due to orbit plane precession — ` +
                    `the battery could reach a constrained state without warning.`,
                likely_cause:
                    'Normal eclipse-cycle charging pattern with a slight efficiency reduction, consistent with gradual battery capacity fade over mission lifetime.',
                impact_if_ignored:
                    'No immediate risk, but if unmonitored during the next two eclipse periods, the satellite may enter a low-battery safe hold unplanned.',
                action:
                    `Pull the eclipse prediction for the next 72 hours and verify that the charge recovery curve between each eclipse ` +
                    `returns to at least 78% — if not, offload the highest-power science mode to extend charge time.`,
                risk_reduction: 18,
            };
        }

        if (temperature !== null && temperature > 35) {
            return {
                priority: 'MEDIUM',
                observation: `${name} temperature at ${temperature}°C, health score ${health}/100.`,
                reasoning: `Temperature at ${temperature}°C is within design limits but trending upward, which is typical for this ` +
                    `mission phase as the solar beta angle increases. Health at ${health}/100 shows no linked subsystem fault yet.`,
                likely_cause:
                    'Seasonal increase in solar beta angle is raising the equilibrium temperature of the bus panel — a predictable environmental effect.',
                impact_if_ignored:
                    'Temperature is likely to peak within the next 8–12 orbit cycles as the beta angle continues to rise; plan for thermal load management before then.',
                action:
                    `Schedule a 5° yaw bias maneuver for the next sunlit pass to pre-emptively reduce solar flux on the +Y panel ` +
                    `before temperature exceeds 42°C.`,
                risk_reduction: 15,
            };
        }

        if (signal !== null && signal < 80) {
            return {
                priority: 'MEDIUM',
                observation: `${name} signal strength at ${signal}%, health score ${health}/100.`,
                reasoning: `Signal at ${signal}% is below the 80% baseline — a minor degradation that does not yet affect commanding ` +
                    `reliability but suggests a small pointing drift or ionospheric disturbance in the current ground station geometry.`,
                likely_cause:
                    'Ionospheric scintillation index is elevated today; the degradation is most likely transient and pass-geometry-dependent rather than a hardware issue.',
                impact_if_ignored:
                    'If this is pointing drift rather than ionospheric, it will worsen pass-over-pass until commanding is affected.',
                action:
                    `Compare signal strength across all three ground stations at the next pass to isolate whether this is geometry-dependent (transient) ` +
                    `or consistent across elevations (pointing or hardware fault).`,
                risk_reduction: 12,
            };
        }

        if (riskScore > 40) {
            return {
                priority: 'MEDIUM',
                observation: `${name} collision risk score ${riskScore}/100, battery ${battery?.toFixed(1) ?? '–'}%, health ${health}/100.`,
                reasoning: `Risk score at ${riskScore}/100 is above the background statistical baseline, driven by a tracked object ` +
                    `in the conjunction corridor. Battery and health margins are adequate. No immediate maneuver is warranted, ` +
                    `but the geometry should be confirmed before the next CDM update window.`,
                likely_cause:
                    'A catalogued debris object with a degraded TLE epoch is contributing elevated uncertainty to the conjunction probability.',
                impact_if_ignored:
                    'If the probability is not re-evaluated after the next radar pass, a genuine risk increase may be missed until the planning window is too short.',
                action:
                    `Request a CDM refresh from 18 SCS at the next radar collection opportunity and update the conjunction assessment ` +
                    `within the next 8 hours. No propellant expenditure warranted at this time.`,
                risk_reduction: 10,
            };
        }

        // ── LOW / NOMINAL ────────────────────────────────────────────────────
        return {
            priority: 'LOW',
            observation: `${name} operating nominally — mission risk ${riskScore}/100, battery ${battery?.toFixed(1) ?? '–'}%, health ${health}/100.`,
            reasoning: `All telemetry parameters are within design margins. Battery at ${battery?.toFixed(1) ?? 'nominal'}% reflects ` +
                `favorable solar angle and healthy charge recovery. Health at ${health}/100 indicates no subsystem anomaly trend. ` +
                `Residual risk score of ${riskScore}/100 reflects background statistical conjunction probability only.`,
            likely_cause:
                'No anomalous cause identified. Standard orbital mechanics and background debris environment account for the residual risk score.',
            impact_if_ignored:
                'No significant consequence within the next 72 hours. Standard watchkeeping cadence is appropriate.',
            action:
                `Log the current telemetry snapshot at the next ground contact and verify orbital elements against the latest TLE epoch ` +
                `to confirm no unexpected semi-major axis drift from residual atmospheric torque.`,
            risk_reduction: 5,
        };
    };

    const intel = generateIntelligence();
    const badgeClass  = PRIORITY_BADGE[intel.priority]  ?? PRIORITY_BADGE.LOW;
    const barClass    = RISK_BAR_COLOR[intel.priority]  ?? RISK_BAR_COLOR.LOW;

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                        <Satellite className="w-4 h-4 text-muted-foreground" />
                        Mission intelligence
                    </CardTitle>
                    <Badge className={`text-[10px] font-medium px-2 py-0.5 ${badgeClass}`}>
                        {intel.priority}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Observation — the "what" */}
                <p className="text-sm font-medium leading-snug">{intel.observation}</p>

                <hr className="border-border/50" />

                {/* Reasoning */}
                <div className="space-y-1">
                    <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                        Reasoning
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{intel.reasoning}</p>
                </div>

                {/* Likely cause */}
                <div className="space-y-1">
                    <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                        Likely cause
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{intel.likely_cause}</p>
                </div>

                {/* Impact if ignored */}
                <div className="space-y-1">
                    <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                        Impact if ignored
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{intel.impact_if_ignored}</p>
                </div>

                <hr className="border-border/50" />

                {/* Action — the "do this" */}
                <div className="flex gap-2.5 items-start rounded-md bg-muted/50 px-3 py-2.5">
                    <ArrowRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-500" />
                    <p className="text-xs font-medium leading-relaxed">{intel.action}</p>
                </div>

                {/* Risk reduction bar */}
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">Risk reduction</span>
                    <div className="flex-1 h-1 rounded-full bg-border/60 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${barClass}`}
                            style={{ width: `${intel.risk_reduction}%` }}
                        />
                    </div>
                    <span className="text-[10px] font-medium tabular-nums">{intel.risk_reduction}%</span>
                </div>
            </CardContent>
        </Card>
    );
};