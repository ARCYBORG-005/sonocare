// Mock Dataset & Helper Functions for Campaign Contact Log Outreach Activity
import { initialMockEmployees } from './mockEmployees';

// Round-Robin Pointers for Campaign Outreach Assignment
const outreachRoundRobinPointers = {};

/**
 * Calculates how many active campaign contacts are currently assigned to an employee.
 * Active statuses: Assigned, In Progress, Interested, New.
 * Inactive/terminal statuses: Converted to Enquiry, Not Interested, Completed.
 */
export const calculateActiveContactCountForEmployee = (employeeId, outreachLogs = []) => {
  if (!employeeId || employeeId === 'UNASSIGNED') return 0;
  
  const inactiveStatuses = ['Converted to Enquiry', 'Not Interested', 'Completed'];
  
  // Unique contacts assigned to this employee that are active
  const assignedContactIds = new Set();
  (outreachLogs || []).forEach((log) => {
    if (log.assignedEmployeeId === employeeId) {
      if (!inactiveStatuses.includes(log.outreachStatus) && !inactiveStatuses.includes(log.contactStatus) && !log.isConvertedToEnquiry) {
        assignedContactIds.add(log.contactId || log.id);
      }
    }
  });

  return assignedContactIds.size;
};

/**
 * Allocates an eligible employee for Campaign Contact Outreach using Round-Robin.
 * Rules:
 * - Employee Status = Active
 * - Availability = Available
 * - Enquiry Assignable = Yes
 * - Employee Department = targetDepartment
 * - Employee Territory = Contact Territory (or district/city match)
 * - Active Contact Count < 50
 */
export const allocateOutreachEmployee = (
  territory = '',
  department = '',
  employeesList = initialMockEmployees,
  outreachLogsList = [],
  district = '',
  city = ''
) => {
  if (!territory) {
    return {
      assignedEmployeeId: 'UNASSIGNED',
      assignedEmployeeName: 'Unassigned (Select Territory)',
      department: department || 'Telecaller Team'
    };
  }

  const eligibleDeptList = ['Telecaller Team', 'Marketing Manager/Executive', 'Business Head/C-level'];
  const targetDept = department && eligibleDeptList.includes(department) ? department : 'Telecaller Team';

  // Filter eligible employee pool
  const eligiblePool = (employeesList || []).filter((emp) => {
    const isActive = emp.status === 'Active';
    const isAvailable = emp.availability === 'Available';
    const isAssignable = emp.enquiryAssignable === 'Yes';
    const matchesDept = emp.department === targetDept;

    const empLocations = [emp.territory, emp.state, emp.district, emp.city].filter(Boolean);
    const enqLocations = [territory, district, city].filter(Boolean);
    const matchesTerritory = empLocations.some((empLoc) => enqLocations.includes(empLoc));

    const activeCount = calculateActiveContactCountForEmployee(emp.employeeId, outreachLogsList);
    const underLimit = activeCount < 50;

    return isActive && isAvailable && isAssignable && matchesDept && matchesTerritory && underLimit;
  });

  if (eligiblePool.length === 0) {
    return {
      assignedEmployeeId: 'UNASSIGNED',
      assignedEmployeeName: 'Unassigned (No Eligible Employee)',
      department: targetDept
    };
  }

  const key = `OUTREACH_${territory}_${targetDept}`;
  const currentPointer = outreachRoundRobinPointers[key] || 0;
  const selected = eligiblePool[currentPointer % eligiblePool.length];
  outreachRoundRobinPointers[key] = (currentPointer + 1) % eligiblePool.length;

  return {
    assignedEmployeeId: selected.employeeId,
    assignedEmployeeName: `${selected.employeeName} (${selected.employeeId})`,
    department: selected.department
  };
};

// Initial Mock Dataset for Log Outreach Activity
export const initialMockOutreachLogs = [
  {
    id: 1,
    outreachId: 'LOG-001',
    campaignId: 'CMP-001',
    campaignName: 'National Radiology Expo 2026',
    contactId: 'CC-001',
    contactName: 'Dr. Arunkumar V',
    customerType: 'Hospital',
    otherCustomerType: '',
    email: 'arunkumar.v@apollohospitals.com',
    mobile: '9840112233',
    institution: 'Apollo Speciality Hospital',
    speciality: 'Radiology',
    territory: 'Tamil Nadu',
    district: 'Chennai',
    city: 'Chennai',
    pincode: '600006',
    address: 'Greams Road, Thousand Lights, Chennai',
    department: 'Telecaller Team',
    assignedEmployeeId: 'EMP001',
    assignedEmployeeName: 'John Smith (EMP001)',
    outreachType: 'Call',
    outreachStatus: 'Interested',
    outcome: 'Success',
    outreachDate: '2026-02-20',
    outreachTime: '10:30 AM',
    nextOutreachDate: '2026-03-01',
    nextOutreachTime: '11:00 AM',
    remarks: 'Customer showed genuine interest in HD Cardiac Probe Transducer. Requested product brochure.',
    productCategory: 'Medical & Diagnostic Scanners',
    product: 'Sonocare HD Cardiac Probe Transducer',
    serviceInterested: 'One-Time Purchase',
    expectedTimeframe: '1–3 Months',
    budget: '450000',
    isConvertedToEnquiry: false,
    convertedEnquiryId: null,
    attemptNumber: 1,
    createdDate: '2026-02-20 10:30 AM'
  },
  {
    id: 2,
    outreachId: 'LOG-002',
    campaignId: 'CMP-001',
    campaignName: 'National Radiology Expo 2026',
    contactId: 'CC-002',
    contactName: 'Dr. Meenakshi Sundaram',
    customerType: 'Diagnostic Lab',
    otherCustomerType: '',
    email: 'meenakshi.s@medall.in',
    mobile: '9840223344',
    institution: 'Medall Healthcare & Diagnostics',
    speciality: 'Sonology',
    territory: 'Tamil Nadu',
    district: 'Chennai',
    city: 'Chennai',
    pincode: '600018',
    address: 'Mylapore High Road, Chennai',
    department: 'Telecaller Team',
    assignedEmployeeId: 'EMP001',
    assignedEmployeeName: 'John Smith (EMP001)',
    outreachType: 'WhatsApp',
    outreachStatus: 'Interested',
    outcome: 'In Progress',
    outreachDate: '2026-02-22',
    outreachTime: '02:15 PM',
    nextOutreachDate: '2026-03-05',
    nextOutreachTime: '03:00 PM',
    remarks: 'Sent product comparison catalog on WhatsApp. Awaiting review.',
    productCategory: 'Medical & Diagnostic Scanners',
    product: 'Sonocare HD Cardiac Probe Transducer',
    serviceInterested: 'One-Time Purchase',
    expectedTimeframe: '1–3 Months',
    budget: '500000',
    isConvertedToEnquiry: false,
    convertedEnquiryId: null,
    attemptNumber: 1,
    createdDate: '2026-02-22 02:15 PM'
  },
  {
    id: 3,
    outreachId: 'LOG-003',
    campaignId: 'CMP-002',
    campaignName: 'Q1 Diagnostic Scanner Promo',
    contactId: 'CC-003',
    contactName: 'Dr. Senthil Nathan',
    customerType: 'Hospital',
    otherCustomerType: '',
    email: 'senthil.n@kmch.ac.in',
    mobile: '9842155667',
    institution: 'Kovai Medical Center and Hospital (KMCH)',
    speciality: 'Cardiology',
    territory: 'Tamil Nadu',
    district: 'Coimbatore',
    city: 'Coimbatore',
    pincode: '641014',
    address: 'Avinashi Road, Civil Aerodrome Post, Coimbatore',
    department: 'Marketing Manager/Executive',
    assignedEmployeeId: 'EMP002',
    assignedEmployeeName: 'Priya Sharma (EMP002)',
    outreachType: 'Call',
    outreachStatus: 'Not Interested',
    outcome: 'Completed',
    outreachDate: '2026-02-18',
    outreachTime: '11:45 AM',
    nextOutreachDate: '',
    nextOutreachTime: '',
    remarks: 'Not currently looking to upgrade ultrasound equipment.',
    productCategory: '',
    product: '',
    serviceInterested: '',
    expectedTimeframe: '',
    budget: '',
    isConvertedToEnquiry: false,
    convertedEnquiryId: null,
    attemptNumber: 1,
    createdDate: '2026-02-18 11:45 AM'
  }
];
