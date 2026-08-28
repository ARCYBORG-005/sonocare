// Mock Dataset and Auto-Assignment Engine for Enquiry Master

import { initialMockEmployees } from './mockEmployees';

// Round-Robin Pointer Store per Territory + Department key
const roundRobinPointers = {};

/**
 * Calculates active enquiry count for an employee derived from enquiry records.
 * Active workload statuses: Pending, Approved, In Progress, Active.
 * Excludes: Converted to Lead, Closed, Rejected, Drop, Stale.
 */
export const calculateActiveEnquiryCountForEmployee = (employeeId, enquiries = []) => {
  if (!employeeId || employeeId === 'UNASSIGNED') return 0;
  const inactiveStatuses = ['Converted to Lead', 'Closed', 'Rejected', 'Drop', 'Stale', 'Auto Closed'];
  return (enquiries || []).filter(
    (enq) => enq.assignedEmployeeId === employeeId && !inactiveStatuses.includes(enq.status) && !enq.isConvertedToLead
  ).length;
};

/**
 * Evaluates enquiry for Stale (>= 30 days) and Auto-Drop (>= 90 days) statuses based on Last Activity Date.
 */
export const evaluateEnquiryStaleAndDropStatus = (enquiry) => {
  if (!enquiry || !enquiry.lastActivityDate) return enquiry;
  const terminalStatuses = ['Converted to Lead', 'Closed', 'Rejected', 'Drop'];
  if (terminalStatuses.includes(enquiry.status) || enquiry.isConvertedToLead) {
    return enquiry;
  }

  let lastActDate = new Date(enquiry.lastActivityDate);
  if (isNaN(lastActDate.getTime())) lastActDate = new Date();

  const now = new Date();
  const diffTime = Math.max(0, now.getTime() - lastActDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays >= 90) {
    return { ...enquiry, status: 'Drop', daysSinceLastActivity: diffDays };
  } else if (diffDays >= 30) {
    return { ...enquiry, status: 'Stale', daysSinceLastActivity: diffDays };
  }

  return { ...enquiry, daysSinceLastActivity: diffDays };
};

/**
 * Auto-Assignment Engine for Enquiries:
 * Pool Requirements:
 * 1. Employee Status = Active
 * 2. Department is enquiry-eligible
 * 3. Territory matches Enquiry Territory
 * 4. Availability = Available
 * 5. Enquiry Assignable = Yes
 * 6. Active Enquiries < 50
 *
 * Priority Rules:
 * - Normal: Round-Robin across eligible pool
 * - Premium / Referral: Round-Robin across eligible Senior Employees (Senior Employee = Yes).
 *   If no eligible senior employees remain (or all hit 50 limit), fall back to Round-Robin across non-senior eligible pool.
 */
export const allocateEnquiryEmployee = (
  territory,
  department,
  priority = 'Normal',
  source = 'Website',
  employeesList = initialMockEmployees,
  enquiriesList = [],
  district = '',
  city = ''
) => {
  if (!territory || !department) {
    return { assignedEmployeeId: 'UNASSIGNED', assignedEmployeeName: 'Unassigned (Select Territory & Dept)' };
  }

  // Filter eligible employee pool
  const eligiblePool = (employeesList || []).filter((emp) => {
    const isActive = emp.status === 'Active';
    const isAvailable = emp.availability === 'Available';
    const isAssignable = emp.enquiryAssignable === 'Yes';

    const empLocations = [emp.territory, emp.state, emp.district, emp.city].filter(Boolean);
    const enqLocations = [territory, district, city].filter(Boolean);

    const matchesTerritory = empLocations.some((empLoc) => enqLocations.includes(empLoc));
    const matchesDepartment = emp.department === department;
    const activeCount = calculateActiveEnquiryCountForEmployee(emp.employeeId, enquiriesList);
    const underLimit = activeCount < 50;

    return isActive && isAvailable && isAssignable && matchesTerritory && matchesDepartment && underLimit;
  });

  if (eligiblePool.length === 0) {
    return { assignedEmployeeId: 'UNASSIGNED', assignedEmployeeName: 'Unassigned (No Eligible Employee)' };
  }

  const isPremiumOrReferral = priority === 'Premium' && source === 'Referral';
  const key = `${territory}_${department}`;

  if (isPremiumOrReferral) {
    // 1. Try eligible Senior Employees first
    const seniorPool = eligiblePool.filter((emp) => emp.seniorEmployee === 'Yes');
    if (seniorPool.length > 0) {
      const seniorKey = `${key}_Senior`;
      const currentPointer = roundRobinPointers[seniorKey] || 0;
      const selected = seniorPool[currentPointer % seniorPool.length];
      roundRobinPointers[seniorKey] = (currentPointer + 1) % seniorPool.length;

      return {
        assignedEmployeeId: selected.employeeId,
        assignedEmployeeName: `${selected.employeeName} (${selected.employeeId})`
      };
    }
  }

  // Normal Priority OR Fallback for Premium/Referral if no eligible senior employees available
  const currentPointer = roundRobinPointers[key] || 0;
  const selected = eligiblePool[currentPointer % eligiblePool.length];
  roundRobinPointers[key] = (currentPointer + 1) % eligiblePool.length;

  return {
    assignedEmployeeId: selected.employeeId,
    assignedEmployeeName: `${selected.employeeName} (${selected.employeeId})`
  };
};

/**
 * Checks duplicate contact:
 * Either Email IS SAME OR Mobile IS SAME OR BOTH ARE SAME within previous 6 months (180 days).
 */
export const checkDuplicateEnquiry = (email, mobile, existingEnquiries = []) => {
  const trimmedEmail = (email || '').trim().toLowerCase();
  const trimmedMobile = (mobile || '').trim();

  if (!trimmedMobile && !trimmedEmail) return null;

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);

  return (existingEnquiries || []).find((enq) => {
    const matchMobile = Boolean(trimmedMobile && (enq.mobile || '').trim() === trimmedMobile);
    const matchEmail = Boolean(trimmedEmail && (enq.email || '').trim().toLowerCase() === trimmedEmail);

    let enqDate = new Date(enq.enquiryDate || Date.now());
    if (isNaN(enqDate.getTime())) enqDate = new Date();

    const isWithin6Months = enqDate >= sixMonthsAgo;

    return (matchMobile || matchEmail) && isWithin6Months;
  });
};

// Initial Mock Enquiry Dataset
export const initialMockEnquiries = [
  {
    id: 1,
    enquiryId: 'ENQ-001',
    customerName: 'Apollo Speciality Hospitals',
    contactPerson: 'Dr. Ramesh Sundaram',
    customerType: 'Hospital',
    otherCustomerType: '',
    hospitalInstitution: 'Apollo Speciality Hospitals',
    mobile: '9840112233',
    email: 'ramesh.s@apollo.com',
    state: 'Tamil Nadu',
    territory: 'Chennai',
    district: 'Chennai',
    city: 'Chennai',
    pincode: '600006',
    address: '21 Greams Road, Thousand Lights, Chennai',
    source: 'Campaign',
    campaignId: 'CMP-001',
    campaignContactId: 'CC-001',
    conferenceName: '',
    referralName: '',
    referralOrg: '',
    referralEmail: '',
    referralMobile: '',
    referralTerritory: '',
    priority: 'Normal',
    department: 'Telecaller Team',
    productCategory: 'Medical & Diagnostic Scanners',
    product: 'Sonocare HD Cardiac Probe Transducer',
    serviceInterested: 'Subscription',
    subscriptionFrequency: 'Yearly',
    expectedTimeframe: '1–3 Months',
    budget: '1250000',
    remarks: 'Customer interested in 3-year subscription for cardiology diagnostic wing.',
    enquiryDate: '2026-02-10',
    assignedEmployeeId: 'EMP001',
    assignedEmployeeName: 'John Smith (EMP001)',
    status: 'Approved',
    lastActivityDate: '2026-02-20',
    daysSinceLastActivity: 5,
    isConvertedToLead: false,
    leadConvertedDate: null
  },
  {
    id: 2,
    enquiryId: 'ENQ-002',
    customerName: 'Metropolis Diagnostic Center',
    contactPerson: 'Karthik Subramanian',
    customerType: 'Diagnostic Center',
    otherCustomerType: '',
    hospitalInstitution: 'Metropolis Diagnostics',
    mobile: '9876543210',
    email: 'karthik@metropolis.in',
    state: 'Tamil Nadu',
    territory: 'Coimbatore',
    district: 'Coimbatore',
    city: 'Coimbatore',
    pincode: '641018',
    address: '100 Feet Road, Gandhipuram, Coimbatore',
    source: 'Referral',
    campaignId: '',
    campaignContactId: '',
    conferenceName: '',
    referralName: 'Dr. V. Swaminathan',
    referralOrg: 'Kovai Medical Center',
    referralEmail: 'swaminathan@kmch.ac.in',
    referralMobile: '9790123456',
    referralTerritory: 'Coimbatore',
    priority: 'Premium',
    department: 'Business Head/C-level',
    productCategory: 'Electrical & Automation',
    product: 'Industrial PLC Servo Controller Unit',
    serviceInterested: 'One-Time Purchase',
    subscriptionFrequency: '',
    expectedTimeframe: 'Immediate',
    budget: '320000',
    remarks: 'Referred by Dr. Swaminathan for automated laboratory control unit.',
    enquiryDate: '2026-02-15',
    assignedEmployeeId: 'EMP005',
    assignedEmployeeName: 'Karthik Raja (EMP005)',
    status: 'Pending',
    lastActivityDate: '2026-02-15',
    daysSinceLastActivity: 10,
    isConvertedToLead: false,
    leadConvertedDate: null
  },
  {
    id: 3,
    enquiryId: 'ENQ-003',
    customerName: 'Care Diagnostic Clinic',
    contactPerson: 'Dr. Anjali Nair',
    customerType: 'Clinic',
    otherCustomerType: '',
    hospitalInstitution: 'Care Diagnostic Clinic',
    mobile: '9840998877',
    email: 'anjali@careclinic.org',
    state: 'Kerala',
    territory: 'Kochi',
    district: 'Ernakulam',
    city: 'Kochi',
    pincode: '682016',
    address: 'MG Road, Ernakulam, Kochi',
    source: 'Conference/Event',
    campaignId: '',
    campaignContactId: '',
    conferenceName: 'South India Healthcare Expo 2026',
    referralName: '',
    referralOrg: '',
    referralEmail: '',
    referralMobile: '',
    referralTerritory: '',
    priority: 'Normal',
    department: 'Marketing Manager/Executive',
    productCategory: 'Tooling & Accessories',
    product: 'Precision CNC Collet Assembly Kit',
    serviceInterested: 'One-Time Purchase',
    subscriptionFrequency: '',
    expectedTimeframe: '3–6 Months',
    budget: '85000',
    remarks: 'Met at South India Healthcare Expo. Demanded technical specification sheet.',
    enquiryDate: '2026-02-01',
    assignedEmployeeId: 'EMP003',
    assignedEmployeeName: 'Rajesh Kumar (EMP003)',
    status: 'Approved',
    lastActivityDate: '2026-02-05',
    daysSinceLastActivity: 20,
    isConvertedToLead: false,
    leadConvertedDate: null
  },
  {
    id: 4,
    enquiryId: 'ENQ-004',
    customerName: 'Manipal Healthcare Trust',
    contactPerson: 'Srinivas Murthy',
    customerType: 'Hospital',
    otherCustomerType: '',
    hospitalInstitution: 'Manipal Hospital',
    mobile: '9880198765',
    email: 'srinivas.m@manipal.edu',
    state: 'Karnataka',
    territory: 'Bengaluru',
    district: 'Bengaluru Urban',
    city: 'Bengaluru',
    pincode: '560017',
    address: '98 HAL Airport Road, Bengaluru',
    source: 'Website',
    campaignId: '',
    campaignContactId: '',
    conferenceName: '',
    referralName: '',
    referralOrg: '',
    referralEmail: '',
    referralMobile: '',
    referralTerritory: '',
    priority: 'Normal',
    department: 'Telecaller Team',
    productCategory: 'Machinery & Equipment',
    product: 'Heavy CNC Milling Center 5000',
    serviceInterested: 'Subscription',
    subscriptionFrequency: 'Monthly',
    expectedTimeframe: 'Within 1 Month',
    budget: '4500000',
    remarks: 'Website webform enquiry for ultrasound machine tooling & milling unit.',
    enquiryDate: '2026-01-20',
    assignedEmployeeId: 'UNASSIGNED',
    assignedEmployeeName: 'Unassigned (No Eligible Employee)',
    status: 'Stale',
    lastActivityDate: '2026-01-20',
    daysSinceLastActivity: 36,
    isConvertedToLead: false,
    leadConvertedDate: null
  }
];
