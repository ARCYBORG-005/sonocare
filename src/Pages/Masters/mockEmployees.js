// Mock Lookup Datasets for Employee Master

export const mockTerritoryData = [
  'Chennai',
  'Coimbatore',
  'Madurai',
  'Salem',
  'Tiruchirappalli',
  'Kochi',
  'Bengaluru'
];

export const mockDepartmentData = [
  'Administration',
  'Production',
  'Sales',
  'Support',
  'Quality Control',
  'Research & Development',
  'Telecaller Team',
  'Marketing Manager/Executive',
  'Business Head/C-level'
];

export const mockRoleData = [
  'Administrator',
  'Production Manager',
  'Sales Executive',
  'Support Executive',
  'Quality Inspector',
  'R&D Firmware Lead',
  'Telecaller Executive',
  'Marketing Manager',
  'Business Head'
];

export const mockReportingManagerData = [
  'Admin User',
  'Production Manager',
  'Sales Manager',
  'Support Manager',
  'R&D Director'
];

export const mockEmployeeTypeData = ['Permanent', 'Contract'];

export const mockStateData = ['Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh'];

export const mockDistrictData = ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Ernakulam', 'Bengaluru Urban'];

export const mockCityData = ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Kochi', 'Bengaluru'];

export const mockEmployeeAuditData = {
  employeeId: 'EMP001',
  name: 'Admin User'
};

// Temporary Mock Enquiry Dataset to derive Active Enquiry Counts
export const mockEnquiriesDataset = [
  { enquiryId: 'ENQ-001', assignedEmployeeId: 'EMP001', status: 'Pending' },
  { enquiryId: 'ENQ-002', assignedEmployeeId: 'EMP001', status: 'Approved' },
  { enquiryId: 'ENQ-003', assignedEmployeeId: 'EMP001', status: 'In Progress' },
  { enquiryId: 'ENQ-004', assignedEmployeeId: 'EMP001', status: 'Pending' },
  { enquiryId: 'ENQ-005', assignedEmployeeId: 'EMP001', status: 'Approved' },
  { enquiryId: 'ENQ-006', assignedEmployeeId: 'EMP001', status: 'In Progress' },
  { enquiryId: 'ENQ-007', assignedEmployeeId: 'EMP001', status: 'Pending' },
  { enquiryId: 'ENQ-008', assignedEmployeeId: 'EMP001', status: 'Approved' },
  { enquiryId: 'ENQ-009', assignedEmployeeId: 'EMP001', status: 'In Progress' },
  { enquiryId: 'ENQ-010', assignedEmployeeId: 'EMP001', status: 'Pending' },
  { enquiryId: 'ENQ-011', assignedEmployeeId: 'EMP001', status: 'Approved' },
  { enquiryId: 'ENQ-012', assignedEmployeeId: 'EMP001', status: 'In Progress' },

  { enquiryId: 'ENQ-013', assignedEmployeeId: 'EMP002', status: 'Pending' },
  { enquiryId: 'ENQ-014', assignedEmployeeId: 'EMP002', status: 'Approved' },
  { enquiryId: 'ENQ-015', assignedEmployeeId: 'EMP002', status: 'In Progress' },
  { enquiryId: 'ENQ-016', assignedEmployeeId: 'EMP002', status: 'Pending' },
  { enquiryId: 'ENQ-017', assignedEmployeeId: 'EMP002', status: 'Approved' },

  { enquiryId: 'ENQ-018', assignedEmployeeId: 'EMP003', status: 'Pending' },
  { enquiryId: 'ENQ-019', assignedEmployeeId: 'EMP003', status: 'Approved' },
  { enquiryId: 'ENQ-020', assignedEmployeeId: 'EMP003', status: 'In Progress' },
  { enquiryId: 'ENQ-021', assignedEmployeeId: 'EMP003', status: 'Pending' },
  { enquiryId: 'ENQ-022', assignedEmployeeId: 'EMP003', status: 'Approved' },

  { enquiryId: 'ENQ-023', assignedEmployeeId: 'EMP005', status: 'Pending' },
  { enquiryId: 'ENQ-024', assignedEmployeeId: 'EMP005', status: 'Approved' },
  { enquiryId: 'ENQ-025', assignedEmployeeId: 'EMP005', status: 'In Progress' }
];

/**
 * Calculates the active enquiry count for a given employee derived from Enquiry records.
 */
export const calculateActiveEnquiryCount = (employee, enquiryDataset = mockEnquiriesDataset) => {
  if (!employee || !employee.employeeId) return 0;
  const activeStatuses = ['Pending', 'Approved', 'In Progress', 'Active'];
  return (enquiryDataset || []).filter(
    (enq) => enq.assignedEmployeeId === employee.employeeId && activeStatuses.includes(enq.status)
  ).length;
};

/**
 * Eligible Enquiry Departments for auto-assignment
 */
/**
 * Eligible Enquiry Departments for auto-assignment
 */
export const ENQUIRY_ASSIGNABLE_DEPARTMENTS = [
  'Telecaller Team',
  'Marketing Manager/Executive',
  'Business Head/C-level'
];

/**
 * Checks if a department is eligible for enquiry assignment and enquiry workload tracking
 */
export const isDepartmentEnquiryEligible = (department) => {
  return ENQUIRY_ASSIGNABLE_DEPARTMENTS.includes(department);
};

/**
 * Shared helper to evaluate if an employee is eligible for a new Enquiry assignment.
 * Checks:
 * 1. Employee Status === 'Active'
 * 2. Enquiry Assignable === 'Yes'
 * 3. Availability === 'Available'
 * 4. Employee Territory === Enquiry Territory
 * 5. Employee Department is an enquiry-eligible department (and matches enquiryDepartment if specified)
 * 6. Active Enquiries < 50
 */
export const isEmployeeEligibleForEnquiry = (employee, enquiryTerritory, enquiryDepartment = null) => {
  if (!employee) return false;

  const isActive = employee.status === 'Active';
  const isAssignable = employee.enquiryAssignable === 'Yes';
  const isAvailable = employee.availability === 'Available';
  const matchesTerritory = !enquiryTerritory || employee.territory === enquiryTerritory;
  const isDepartmentEligible = ENQUIRY_ASSIGNABLE_DEPARTMENTS.includes(employee.department);
  const matchesDepartment = !enquiryDepartment || employee.department === enquiryDepartment;
  const activeCount = calculateActiveEnquiryCount(employee);
  const isWorkloadUnderLimit = activeCount < 50;

  return (
    isActive &&
    isAssignable &&
    isAvailable &&
    matchesTerritory &&
    isDepartmentEligible &&
    matchesDepartment &&
    isWorkloadUnderLimit
  );
};

// Initial Mock Dataset for Employee Master
export const initialMockEmployees = [
  {
    id: 1,
    employeeId: 'EMP001',
    employeeName: 'John Smith',
    phone: '9876543210',
    email: 'john.smith@sonocare.com',
    joinDate: '2026-01-15',
    state: 'Tamil Nadu',
    district: 'Chennai',
    city: 'Chennai',
    pincode: '600006',
    address: '21 Greams Lane, Thousand Lights, Chennai',
    status: 'Active',
    territory: 'Chennai',
    department: 'Telecaller Team',
    role: 'Telecaller Executive',
    reportingManager: 'Sales Manager',
    employeeType: 'Permanent',
    experience: 5,
    seniorEmployee: 'Yes',
    availability: 'Available',
    enquiryAssignable: 'Yes',
    createdBy: 'EMP001 (Admin User)',
    createdDate: '2026-01-15 10:00 AM',
    updatedBy: 'EMP001 (Admin User)',
    updatedDate: '2026-02-20 02:15 PM'
  },
  {
    id: 2,
    employeeId: 'EMP002',
    employeeName: 'Priya Sharma',
    phone: '9876501234',
    email: 'priya.sharma@sonocare.com',
    joinDate: '2026-01-20',
    state: 'Tamil Nadu',
    district: 'Coimbatore',
    city: 'Coimbatore',
    pincode: '641018',
    address: '100 Feet Road, Gandhipuram, Coimbatore',
    status: 'Active',
    territory: 'Coimbatore',
    department: 'Production',
    role: 'Production Manager',
    reportingManager: 'Production Manager',
    employeeType: 'Permanent',
    experience: 8,
    seniorEmployee: 'No',
    availability: 'Available',
    enquiryAssignable: 'No',
    createdBy: 'EMP001 (Admin User)',
    createdDate: '2026-01-20 11:30 AM',
    updatedBy: 'EMP001 (Admin User)',
    updatedDate: '2026-02-18 04:00 PM'
  },
  {
    id: 3,
    employeeId: 'EMP003',
    employeeName: 'Rajesh Kumar',
    phone: '9840123456',
    email: 'rajesh.kumar@sonocare.com',
    joinDate: '2026-02-01',
    state: 'Kerala',
    district: 'Ernakulam',
    city: 'Kochi',
    pincode: '682016',
    address: 'MG Road, Ernakulam, Kochi',
    status: 'Active',
    territory: 'Kochi',
    department: 'Marketing Manager/Executive',
    role: 'Marketing Manager',
    reportingManager: 'Support Manager',
    employeeType: 'Contract',
    experience: 3,
    seniorEmployee: 'Yes',
    availability: 'Available',
    enquiryAssignable: 'Yes',
    createdBy: 'EMP001 (Admin User)',
    createdDate: '2026-02-01 09:15 AM',
    updatedBy: 'EMP001 (Admin User)',
    updatedDate: '2026-02-01 09:15 AM'
  },
  {
    id: 4,
    employeeId: 'EMP004',
    employeeName: 'Anitha Ramesh',
    phone: '9880198765',
    email: 'anitha.ramesh@sonocare.com',
    joinDate: '2026-02-10',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    city: 'Bengaluru',
    pincode: '560017',
    address: '98 HAL Airport Road, Bengaluru',
    status: 'Inactive',
    territory: 'Bengaluru',
    department: 'Administration',
    role: 'Administrator',
    reportingManager: 'Admin User',
    employeeType: 'Permanent',
    experience: 10,
    seniorEmployee: 'No',
    availability: 'On Leave',
    enquiryAssignable: 'No',
    createdBy: 'EMP001 (Admin User)',
    createdDate: '2026-02-10 02:45 PM',
    updatedBy: 'EMP001 (Admin User)',
    updatedDate: '2026-02-22 10:00 AM'
  },
  {
    id: 5,
    employeeId: 'EMP005',
    employeeName: 'Karthik Raja',
    phone: '9790112233',
    email: 'karthik.raja@sonocare.com',
    joinDate: '2026-02-15',
    state: 'Tamil Nadu',
    district: 'Madurai',
    city: 'Madurai',
    pincode: '625001',
    address: 'KK Nagar Main Road, Madurai',
    status: 'Active',
    territory: 'Madurai',
    department: 'Business Head/C-level',
    role: 'Business Head',
    reportingManager: 'Sales Manager',
    employeeType: 'Contract',
    experience: 2,
    seniorEmployee: 'No',
    availability: 'Available',
    enquiryAssignable: 'Yes',
    createdBy: 'EMP001 (Admin User)',
    createdDate: '2026-02-15 04:20 PM',
    updatedBy: 'EMP001 (Admin User)',
    updatedDate: '2026-02-15 04:20 PM'
  }
];
