export class UpdatePerformanceConfigDto {
    saleAttribution?: 'LAST_AGENT' | 'FIRST_AGENT' | 'EQUAL_SPLIT' | 'MANUAL';
    manualAttribution?: boolean;
    timeCalculation?: 'TOTAL' | 'ACTIVE_ONLY';
    inactivityThreshold?: number;
    resetTimerOnTransfer?: boolean;
    transferCountsConversion?: boolean;
    firstResponseGoal?: number;
    resolutionGoal?: number;
    conversionRateGoal?: number;
    reportVisibility?: 'ADMIN_ONLY' | 'ALL_AGENTS';
    defaultReportPeriod?: 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
}
