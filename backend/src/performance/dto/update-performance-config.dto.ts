export class UpdatePerformanceConfigDto {
  salesAssignmentRule?: 'LAST_INTERACTION' | 'FIRST_INTERACTION' | 'LINEAR' | 'MANUAL';
  autoAssignLeads?: boolean;
  firstResponseSlaMinutes?: number;
  idleConversationAlertMinutes?: number;
  targetConversionRate?: number;
  targetCsat?: number;
  targetMonthlyVolume?: number;
  defaultViewPeriod?: 'TODAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'THIS_MONTH';
  showRevenueToAgents?: boolean;
}
