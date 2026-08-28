// Mock Lookup Datasets for Customer Master

export const mockTerritoryMasterData = [
  { territoryId: 'TER-001', name: 'Tamil Nadu' },
  { territoryId: 'TER-002', name: 'Kerala' },
  { territoryId: 'TER-003', name: 'Karnataka' },
  { territoryId: 'TER-004', name: 'Andhra Pradesh' }
];

export const mockDistrictMasterData = {
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli'],
  'Kerala': ['Ernakulam', 'Thiruvananthapuram', 'Kozhikode'],
  'Karnataka': ['Bengaluru Urban', 'Mysuru', 'Mangaluru'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur']
};

export const mockCityMasterData = {
  'Chennai': ['Chennai', 'Tambaram', 'Avadi'],
  'Coimbatore': ['Coimbatore', 'Pollachi'],
  'Madurai': ['Madurai', 'Melur'],
  'Salem': ['Salem', 'Attur'],
  'Tiruchirappalli': ['Trichy', 'Srirangam'],
  'Ernakulam': ['Kochi', 'Aluva'],
  'Thiruvananthapuram': ['Trivandrum', 'Neyyattinkara'],
  'Kozhikode': ['Calicut', 'Vatakara'],
  'Bengaluru Urban': ['Bengaluru', 'Yelahanka'],
  'Mysuru': ['Mysore', 'Nanjangud'],
  'Mangaluru': ['Mangalore', 'Ullal'],
  'Visakhapatnam': ['Visakhapatnam', 'Anakapalle'],
  'Vijayawada': ['Vijayawada', 'Gudivada'],
  'Guntur': ['Guntur', 'Tenali']
};

export const mockSourceMasterData = [
  { sourceId: 'SRC-001', name: 'Website' },
  { sourceId: 'SRC-002', name: 'Referral' },
  { sourceId: 'SRC-003', name: 'Doctor Reference' },
  { sourceId: 'SRC-004', name: 'Direct' },
  { sourceId: 'SRC-005', name: 'Phone' },
  { sourceId: 'SRC-006', name: 'Walk-in' },
  { sourceId: 'SRC-007', name: 'Email' },
  { sourceId: 'SRC-008', name: 'WhatsApp' },
  { sourceId: 'SRC-009', name: 'Conference' },
  { sourceId: 'SRC-010', name: 'IndiaMART' },
  { sourceId: 'SRC-011', name: 'Other' }
];

export const mockCampaignMasterData = [
  { campaignId: 'CAMP-001', name: 'AIIMS Medical Conference 2026' },
  { campaignId: 'CAMP-002', name: 'Healthcare Diagnostic Summit 2026' },
  { campaignId: 'CAMP-003', name: 'South India Cardiologists Conclave' },
  { campaignId: 'CAMP-004', name: 'Digital Equipment Promotion Q1' }
];

export const mockEmployeeData = {
  employeeId: 'EMP-001',
  name: 'Admin User'
};

// Initial Mock Dataset for Customer Master
export const initialMockCustomers = [
  {
    id: 1,
    customerId: 'CUST-0001',
    customerType: 'Hospital',
    customerName: 'Apollo Hospitals Main Branch',
    country: 'India',
    territoryId: 'TER-001',
    territoryName: 'Tamil Nadu',
    district: 'Chennai',
    city: 'Chennai',
    pincode: '600006',
    address: '21 Greams Lane, Thousand Lights, Chennai',
    gstNo: '33AAAAC1234F1Z5',
    panNo: 'AAAAC1234F',
    sourceId: 'SRC-001',
    sourceName: 'Website',
    websiteName: 'Sonocare Official Portal',
    websiteLink: 'https://sonocare.in',
    campaignId: 'CAMP-001',
    campaignName: 'AIIMS Medical Conference 2026',
    status: 'Active',
    createdBy: 'EMP-001 (Admin User)',
    createdDate: '2026-01-15 10:30 AM',
    updatedBy: 'EMP-001 (Admin User)',
    updatedDate: '2026-02-20 02:15 PM',
    contacts: [
      {
        contactId: 'CONT-0001',
        contactType: 'Primary',
        contactPerson: 'Dr. K. S. Kumar',
        role: 'Chief Radiologist',
        phone1: '9876543210',
        phone2: '04428290000',
        email: 'drkumar@apollohospitals.com'
      },
      {
        contactId: 'CONT-0002',
        contactType: 'Secondary',
        contactPerson: 'Mr. R. Sundaram',
        role: 'Procurement Manager',
        phone1: '9876501234',
        phone2: '',
        email: 'sundaram.r@apollohospitals.com'
      }
    ]
  },
  {
    id: 2,
    customerId: 'CUST-0002',
    customerType: 'Diagnostic Center',
    customerName: 'AARTHI Scans & Labs',
    country: 'India',
    territoryId: 'TER-001',
    territoryName: 'Tamil Nadu',
    district: 'Coimbatore',
    city: 'Coimbatore',
    pincode: '641018',
    address: '100 Feet Road, Gandhipuram, Coimbatore',
    gstNo: '33AABCA5678G2Z9',
    panNo: 'AABCA5678G',
    sourceId: 'SRC-003',
    sourceName: 'Doctor Reference',
    referralPersonName: 'Dr. M. S. Swaminathan',
    organizationName: 'City Scanning Center',
    referralPhone: '9840123456',
    referralEmail: 'swaminathan@cityscan.com',
    referralTerritory: 'Tamil Nadu',
    campaignId: 'CAMP-002',
    campaignName: 'Healthcare Diagnostic Summit 2026',
    status: 'Active',
    createdBy: 'EMP-001 (Admin User)',
    createdDate: '2026-01-20 11:45 AM',
    updatedBy: 'EMP-001 (Admin User)',
    updatedDate: '2026-02-18 04:00 PM',
    contacts: [
      {
        contactId: 'CONT-0003',
        contactType: 'Primary',
        contactPerson: 'Dr. Arunkumar',
        role: 'Managing Director',
        phone1: '9443312345',
        phone2: '0422252525',
        email: 'arun@aarthiscans.com'
      }
    ]
  },
  {
    id: 3,
    customerId: 'CUST-0003',
    customerType: 'Clinic',
    customerName: 'KIMS Medical Clinic',
    country: 'India',
    territoryId: 'TER-002',
    territoryName: 'Kerala',
    district: 'Ernakulam',
    city: 'Kochi',
    pincode: '682016',
    address: 'MG Road, Ernakulam, Kochi',
    gstNo: '32AADCK9876H1Z2',
    panNo: 'AADCK9876H',
    sourceId: 'SRC-005',
    sourceName: 'Phone',
    handledEmployee: 'Admin User',
    handledEmployeeId: 'EMP-001',
    campaignId: '',
    campaignName: '',
    status: 'Active',
    createdBy: 'EMP-001 (Admin User)',
    createdDate: '2026-02-01 09:15 AM',
    updatedBy: 'EMP-001 (Admin User)',
    updatedDate: '2026-02-01 09:15 AM',
    contacts: [
      {
        contactId: 'CONT-0004',
        contactType: 'Primary',
        contactPerson: 'Dr. Susan George',
        role: 'Senior Physician',
        phone1: '9847054321',
        phone2: '',
        email: 'drsusan@kimsclinic.in'
      }
    ]
  },
  {
    id: 4,
    customerId: 'CUST-0004',
    customerType: 'Hospital',
    customerName: 'Manipal Heart Institute',
    country: 'India',
    territoryId: 'TER-003',
    territoryName: 'Karnataka',
    district: 'Bengaluru Urban',
    city: 'Bengaluru',
    pincode: '560017',
    address: '98 HAL Airport Road, Bengaluru',
    gstNo: '29AAACM4321J1Z8',
    panNo: 'AAACM4321J',
    sourceId: 'SRC-007',
    sourceName: 'Email',
    handledBy: 'Admin User (EMP-001)',
    campaignId: 'CAMP-003',
    campaignName: 'South India Cardiologists Conclave',
    status: 'Inactive',
    createdBy: 'EMP-001 (Admin User)',
    createdDate: '2026-02-10 03:20 PM',
    updatedBy: 'EMP-001 (Admin User)',
    updatedDate: '2026-02-22 10:00 AM',
    contacts: [
      {
        contactId: 'CONT-0005',
        contactType: 'Primary',
        contactPerson: 'Dr. Suresh V.',
        role: 'Director Cardiology',
        phone1: '9880198765',
        phone2: '08025023000',
        email: 'suresh.v@manipalhospitals.com'
      }
    ]
  }
];
