// The "Custom HC" sheet in Sow Calcs 8.26.26.xlsx is explicitly marked as placeholder
// data by its own author — its rate card isn't calibrated yet. We surface it in the
// UI as a visible, not-yet-configured module rather than hiding it or guessing numbers.

export const CUSTOM_HC_STATUS_NOTE =
  "Custom HC's rate card is marked as placeholder data in the source workbook and hasn't been calibrated yet. This module isn't available for estimating until real numbers are provided.";
