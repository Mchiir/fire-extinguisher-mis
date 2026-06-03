export const MAINTENANCE_ACTIONS = {
  REFILLED: 'Refilled',
  PRESSURE_ADJUSTED: 'PressureAdjusted',
  VALVE_REPLACED: 'ValveReplaced',
  SAFETY_PIN_REPLACED: 'SafetyPinReplaced',
  HOSE_REPLACED: 'HoseReplaced',
  GAUGE_REPLACED: 'GaugeReplaced',
  BODY_CLEANED: 'BodyCleaned',
  RETIRED: 'Retired',
  OTHER: 'Other',
};

export const MAINTENANCE_ACTION_VALUES = Object.values(MAINTENANCE_ACTIONS);

export const INSPECTION_STATUS = {
  PENDING: 'PENDING',
  SCHEDULED: 'SCHEDULED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};
