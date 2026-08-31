/**
 * Auto-Assignment Engine for Service Tickets
 * Hierarchy:
 * 1. Territory Match
 * 2. Expertise & Seniority Match (Experience years & isSenior status for Critical/High priority)
 * 3. Availability Filter (Active ticket workload < max threshold)
 * 4. Round-Robin / Workload Tiebreaker
 */

export const MASTER_ENGINEERS_LIST = [
  {
    name: 'Rajesh Sharma',
    mobile: '9840112233',
    email: 'rajesh.sharma@sonocare.com',
    territory: 'Chennai, Tamil Nadu',
    experience: 8,
    isSenior: true,
    modalityExpertise: ['Ultrasound Diagnostic Scanner', 'Color Doppler', 'Probe Repair']
  },
  {
    name: 'Amit Patel',
    mobile: '9811223344',
    email: 'amit.patel@sonocare.com',
    territory: 'Bengaluru, Karnataka',
    experience: 6,
    isSenior: true,
    modalityExpertise: ['Ultrasound Diagnostic Scanner', 'High Voltage Board', 'Portable Ultrasound']
  },
  {
    name: 'Vikram Singh',
    mobile: '9733114422',
    email: 'vikram.singh@sonocare.com',
    territory: 'Hyderabad, Telangana',
    experience: 4,
    isSenior: false,
    modalityExpertise: ['Color Doppler', 'PACS Integration', 'Ultrasound Diagnostic Scanner']
  },
  {
    name: 'Suresh Reddy',
    mobile: '9740556677',
    email: 'suresh.reddy@sonocare.com',
    territory: 'Chennai, Tamil Nadu',
    experience: 10,
    isSenior: true,
    modalityExpertise: ['Ultrasound Diagnostic Scanner', 'Probe Repair', 'High Voltage Board']
  },
  {
    name: 'Anil Kapoor',
    mobile: '9899112233',
    email: 'anil.kapoor@sonocare.com',
    territory: 'Delhi NCR, New Delhi',
    experience: 7,
    isSenior: true,
    modalityExpertise: ['Ultrasound Diagnostic Scanner', 'Color Doppler']
  }
];

/**
 * Calculates current active open tickets for each engineer.
 */
export const calculateEngineerWorkloads = (activeTickets = []) => {
  const workloadMap = {};
  MASTER_ENGINEERS_LIST.forEach((eng) => {
    workloadMap[eng.name] = 0;
  });

  activeTickets.forEach((t) => {
    if (t.status !== 'Resolved' && t.status !== 'Closed') {
      const assigned = t.assignedEngineer || '';
      MASTER_ENGINEERS_LIST.forEach((eng) => {
        if (assigned.includes(eng.name)) {
          workloadMap[eng.name] = (workloadMap[eng.name] || 0) + 1;
        }
      });
    }
  });

  return workloadMap;
};

/**
 * Auto-assigns optimal engineer to a ticket based on 4-step logic.
 */
export const findBestMatchingEngineer = (ticket, activeTickets = []) => {
  const rationaleSteps = [];
  const workloads = calculateEngineerWorkloads(activeTickets);

  const ticketTerritory = (ticket.territory || '').toLowerCase();
  const ticketCategory = (ticket.category || ticket.productName || '').toLowerCase();
  const priority = ticket.priority || 'Medium';
  const isHighPriority = priority === 'Critical' || priority === 'High';

  // STEP 1: Territory Filter
  let candidatePool = MASTER_ENGINEERS_LIST.filter((eng) => {
    const engTerr = eng.territory.toLowerCase();
    const city = ticketTerritory.split(',')[0].trim().toLowerCase();
    return engTerr.includes(city) || city.includes(engTerr.split(',')[0].trim().toLowerCase());
  });

  if (candidatePool.length > 0) {
    rationaleSteps.push(`Step 1 (Territory Match): ${candidatePool.length} engineer(s) found in ${ticket.territory}`);
  } else {
    candidatePool = [...MASTER_ENGINEERS_LIST];
    rationaleSteps.push(`Step 1 (Territory Fallback): No exact location match, evaluating national engineering team`);
  }

  // STEP 2: Expertise & Seniority Filter
  let expertisePool = candidatePool.filter((eng) =>
    eng.modalityExpertise.some((m) => ticketCategory.includes(m.toLowerCase()) || m.toLowerCase().includes(ticketCategory))
  );

  if (expertisePool.length > 0) {
    candidatePool = expertisePool;
    rationaleSteps.push(`Step 2 (Modality Match): Filtered to ${candidatePool.length} expert engineer(s) for equipment category`);
  }

  // Seniority scoring if Critical/High priority
  if (isHighPriority) {
    const seniorCandidates = candidatePool.filter((eng) => eng.isSenior || eng.experience >= 6);
    if (seniorCandidates.length > 0) {
      candidatePool = seniorCandidates;
      rationaleSteps.push(`Step 2 (Seniority Prioritization): Prioritized Senior Engineers (${candidatePool.map(e => `${e.name} - ${e.experience} yrs`).join(', ')}) for ${priority} priority`);
    }
  }

  // STEP 3: Availability Check (Workload < 3 open tickets)
  const availableCandidates = candidatePool.filter((eng) => (workloads[eng.name] || 0) < 3);
  if (availableCandidates.length > 0) {
    candidatePool = availableCandidates;
    rationaleSteps.push(`Step 3 (Availability Check): ${candidatePool.length} engineer(s) currently available (< 3 active tickets)`);
  } else {
    rationaleSteps.push(`Step 3 (Availability Note): Engineers near capacity, selecting minimum workload candidate`);
  }

  // STEP 4: Round-Robin / Workload Tiebreaker (sort by open tickets ASC, then experience DESC)
  candidatePool.sort((a, b) => {
    const loadA = workloads[a.name] || 0;
    const loadB = workloads[b.name] || 0;
    if (loadA !== loadB) return loadA - loadB;
    return b.experience - a.experience;
  });

  const selectedEngineer = candidatePool[0];
  const finalLoad = workloads[selectedEngineer.name] || 0;

  rationaleSteps.push(
    `Step 4 (Round-Robin Winner): Selected ${selectedEngineer.name} (${selectedEngineer.experience} yrs exp, Senior: ${selectedEngineer.isSenior ? 'Yes' : 'No'}, Active Workload: ${finalLoad} ticket${finalLoad === 1 ? '' : 's'})`
  );

  return {
    selectedEngineer,
    workloads,
    rationaleSteps,
    summaryRationale: `${selectedEngineer.name} matched on Territory (${selectedEngineer.territory}), ${selectedEngineer.experience} yrs experience (${selectedEngineer.isSenior ? 'Senior' : 'Engineer'}), Active Workload: ${finalLoad}`
  };
};
