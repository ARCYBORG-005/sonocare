/**
 * SLA Engine for Service Operations
 * Business Hours: Monday – Saturday, 9:00 AM – 6:00 PM (9 hours / day).
 * Pauses on 'Waiting for Customer/Parts' and 'On Hold'.
 */

export const PRIORITY_SLA_TARGETS = {
  Critical: { responseHours: 2, resolutionBusinessHours: 8 },   // 2h response / 8h resolution
  High:     { responseHours: 4, resolutionBusinessHours: 24 },  // 4h response / 24h resolution
  Medium:   { responseHours: 8, resolutionBusinessHours: 48 },  // 8h response / 48h resolution
  Low:      { responseHours: 24, resolutionBusinessHours: 120 } // 24h response / 120h resolution
};

/**
 * Checks if a given Date object falls within business hours (Mon-Sat, 9AM - 6PM).
 */
export const isBusinessTime = (dt) => {
  const day = dt.getDay(); // 0 = Sunday
  if (day === 0) return false;

  const hours = dt.getHours();
  return hours >= 9 && hours < 18;
};

/**
 * Adds business hours to a given start date, taking into account Mon-Sat 9AM-6PM.
 */
export const addBusinessHours = (startDateStr, hoursToAdd) => {
  let current = new Date(startDateStr);
  if (isNaN(current.getTime())) current = new Date();

  let minutesRemaining = hoursToAdd * 60;

  while (minutesRemaining > 0) {
    const day = current.getDay();
    const hours = current.getHours();

    if (day === 0) {
      current.setDate(current.getDate() + 1);
      current.setHours(9, 0, 0, 0);
      continue;
    }

    if (hours < 9) {
      current.setHours(9, 0, 0, 0);
      continue;
    }

    if (hours >= 18) {
      current.setDate(current.getDate() + 1);
      current.setHours(9, 0, 0, 0);
      continue;
    }

    const endOfDay = new Date(current);
    endOfDay.setHours(18, 0, 0, 0);

    const availableMinutesToday = Math.floor((endOfDay - current) / (1000 * 60));

    if (minutesRemaining <= availableMinutesToday) {
      current = new Date(current.getTime() + minutesRemaining * 60 * 1000);
      minutesRemaining = 0;
    } else {
      minutesRemaining -= availableMinutesToday;
      current.setDate(current.getDate() + 1);
      current.setHours(9, 0, 0, 0);
    }
  }

  return current.toISOString().slice(0, 16);
};

/**
 * Calculates net elapsed business minutes between start date and now (or end date),
 * subtracting paused duration.
 */
export const calculateElapsedBusinessMinutes = (startDateStr, endDateStr = null, pausedMinutes = 0) => {
  let start = new Date(startDateStr);
  if (isNaN(start.getTime())) return 0;

  let end = endDateStr ? new Date(endDateStr) : new Date();
  if (isNaN(end.getTime())) end = new Date();

  if (end <= start) return 0;

  let current = new Date(start);
  let totalBusinessMinutes = 0;

  const stepMs = 30 * 60 * 1000;

  while (current < end) {
    const next = new Date(Math.min(current.getTime() + stepMs, end.getTime()));
    
    if (isBusinessTime(current)) {
      const diffMins = Math.floor((next - current) / (1000 * 60));
      totalBusinessMinutes += diffMins;
    }

    current = next;
  }

  const netBusinessMinutes = Math.max(0, totalBusinessMinutes - (pausedMinutes || 0));
  return netBusinessMinutes;
};

/**
 * Calculates live Response SLA Countdown & Resolution SLA Countdown.
 */
export const getSlaCountdownDetails = (ticket) => {
  const priority = ticket.priority || 'Medium';
  const targetConfig = PRIORITY_SLA_TARGETS[priority] || PRIORITY_SLA_TARGETS.Medium;

  const dateCreated = ticket.dateCreated || new Date().toISOString().slice(0, 16);
  const pausedMinutes = ticket.totalPausedMinutes || 0;
  const status = ticket.status || 'Open';

  const isPaused = status.includes('Waiting') || status === 'On Hold' || status === 'Pending Quotation Approval';
  const isResolvedOrClosed = status === 'Resolved' || status === 'Closed';

  const effectiveEndTime = isResolvedOrClosed ? (ticket.enteredWorkEndDateTime || new Date().toISOString().slice(0, 16)) : null;
  const netElapsedMinutes = calculateElapsedBusinessMinutes(dateCreated, effectiveEndTime, pausedMinutes);

  // Response SLA
  const responseTargetMinutes = targetConfig.responseHours * 60;
  const isResponded = status !== 'Open';
  const responseElapsedMins = isResponded ? Math.min(responseTargetMinutes, calculateElapsedBusinessMinutes(dateCreated, ticket.workStartDateTime || dateCreated, 0)) : netElapsedMinutes;
  const responseRemainingMins = responseTargetMinutes - responseElapsedMins;
  const isResponseBreached = !isResponded && responseRemainingMins < 0;

  // Resolution SLA
  const resolutionTargetMinutes = targetConfig.resolutionBusinessHours * 60;
  const resolutionRemainingMins = resolutionTargetMinutes - netElapsedMinutes;
  const isResolutionBreached = resolutionRemainingMins < 0;

  const formatCountdown = (remMins, isBreached, isCompleted, isPausedState) => {
    if (isCompleted) {
      return { label: 'Completed', cls: 'badge bg-success bg-opacity-10 text-success border border-success' };
    }
    if (isPausedState) {
      return { label: 'Clock Paused', cls: 'badge bg-warning bg-opacity-20 text-dark border border-warning' };
    }
    if (isBreached) {
      const overMins = Math.abs(remMins);
      const hrs = Math.floor(overMins / 60);
      const mins = overMins % 60;
      return { label: `Breached -${hrs}h ${mins}m`, cls: 'badge bg-danger text-white font-monospace fw-bold' };
    } else {
      const hrs = Math.floor(remMins / 60);
      const mins = remMins % 60;
      return { label: `${hrs}h ${mins}m left`, cls: 'badge bg-success bg-opacity-10 text-success border border-success font-monospace fw-bold' };
    }
  };

  return {
    response: formatCountdown(responseRemainingMins, isResponseBreached, isResponded, isPaused),
    resolution: formatCountdown(resolutionRemainingMins, isResolutionBreached, isResolvedOrClosed, isPaused),
    isResponseBreached,
    isResolutionBreached
  };
};

/**
 * Calculates SLA progress status and details for a ticket.
 */
export const getSlaStatus = (ticket) => {
  const priority = ticket.priority || 'Medium';
  const targetConfig = PRIORITY_SLA_TARGETS[priority] || PRIORITY_SLA_TARGETS.Medium;
  const targetMinutes = targetConfig.resolutionBusinessHours * 60;

  const dateCreated = ticket.dateCreated || new Date().toISOString().slice(0, 16);
  const pausedMinutes = ticket.totalPausedMinutes || 0;
  const currentStatus = ticket.status || 'Open';

  const isPaused = currentStatus.includes('Waiting') || currentStatus === 'On Hold' || currentStatus === 'Pending Quotation Approval';
  const isResolvedOrClosed = currentStatus === 'Resolved' || currentStatus === 'Closed';

  let effectiveEndDate = isResolvedOrClosed ? (ticket.enteredWorkEndDateTime || new Date().toISOString().slice(0, 16)) : null;

  const elapsedMinutes = calculateElapsedBusinessMinutes(dateCreated, effectiveEndDate, pausedMinutes);
  const percentElapsed = Math.min(100, Math.round((elapsedMinutes / targetMinutes) * 100));

  let label = 'On Schedule';
  let badgeClass = 'badge bg-success bg-opacity-10 text-success border border-success';
  let isViolated = false;

  if (isPaused) {
    label = 'Paused (Clock Suspended)';
    badgeClass = 'badge bg-warning bg-opacity-20 text-dark border border-warning';
  } else if (elapsedMinutes > targetMinutes) {
    label = 'SLA Violation (Breached)';
    badgeClass = 'badge bg-danger text-white shadow-xs';
    isViolated = true;
  } else if (percentElapsed >= 75) {
    label = 'At Risk (>75% SLA)';
    badgeClass = 'badge bg-warning text-dark border border-warning';
  }

  return {
    priority,
    targetHours: targetConfig.resolutionBusinessHours,
    targetMinutes,
    targetEndDate: ticket.calculatedWorkEndDateTime || addBusinessHours(dateCreated, targetConfig.resolutionBusinessHours),
    elapsedMinutes,
    elapsedHours: (elapsedMinutes / 60).toFixed(1),
    percentElapsed,
    isPaused,
    isViolated,
    label,
    badgeClass
  };
};
