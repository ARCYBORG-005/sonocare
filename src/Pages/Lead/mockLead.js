export const initialMockLeads = [
  {
    id: 1,
    leadId: 'LEAD-001',
    enquiryId: 'ENQ-2026-001',
    customerName: 'Apollo Hospitals Chennai',
    contactPerson: 'Dr. Ramesh Kumar',
    mobile: '9840123456',
    email: 'ramesh@apollo.com',
    hospitalInstitution: 'Apollo Hospitals, Greams Road',
    address: '21 Greams Lane, Thousand Lights, Chennai, Tamil Nadu - 600006',
    district: 'Chennai',
    city: 'Chennai',
    territory: 'Tamil Nadu',
    department: 'Cardiology',
    assignedEmployeeId: 'EMP-001',
    assignedEmployeeName: 'Rajesh Kumar',
    assignedRole: 'Sales Manager',
    leadStatus: 'Open',
    priority: 'High',
    source: 'Website Enquiry',
    productCategory: 'Medical & Diagnostic Scanners',
    product: 'Sonocare Premium 4D Ultrasound Workstation',
    budget: '4500000',
    notes: 'Interested in upgrading cardiology department ultrasound workstation.',
    createdDate: '2026-08-20',
    lastActivityDate: '2026-08-20',
    nextFollowUpDate: '2026-08-28',
    nextFollowUpTime: '10:00'
  },
  {
    id: 2,
    leadId: 'LEAD-002',
    enquiryId: 'ENQ-2026-002',
    customerName: 'Fortis Malar Hospital',
    contactPerson: 'Dr. Anita Sharma',
    mobile: '9841098765',
    email: 'anita.sharma@fortis.com',
    hospitalInstitution: 'Fortis Malar Hospital Adyar',
    address: '52 First Main Road, Gandhi Nagar, Adyar, Chennai, Tamil Nadu - 600020',
    district: 'Chennai',
    city: 'Chennai',
    territory: 'Tamil Nadu',
    department: 'Radiology',
    assignedEmployeeId: 'EMP-002',
    assignedEmployeeName: 'Priya Sundaram',
    assignedRole: 'Application Specialist',
    leadStatus: 'In Progress',
    priority: 'Medium',
    source: 'Medical Expo 2026',
    productCategory: 'Medical & Diagnostic Scanners',
    product: 'Color Doppler Ultrasound Scanner',
    budget: '3200000',
    notes: 'Requested clinical demonstration for radiology unit.',
    createdDate: '2026-08-22',
    lastActivityDate: '2026-08-24',
    nextFollowUpDate: '2026-08-29',
    nextFollowUpTime: '14:30'
  },
  {
    id: 3,
    leadId: 'LEAD-003',
    enquiryId: 'ENQ-2026-003',
    customerName: 'KMCH Specialty Hospital',
    contactPerson: 'Dr. Senthil Nathan',
    mobile: '9842155667',
    email: 'senthil@kmch.org',
    hospitalInstitution: 'KMCH Specialty Hospital',
    address: 'Avinashi Road, Civil Aerodrome Post, Coimbatore, Tamil Nadu - 641014',
    district: 'Coimbatore',
    city: 'Coimbatore',
    territory: 'Tamil Nadu',
    department: 'Obstetrics & Gynecology',
    assignedEmployeeId: 'EMP-001',
    assignedEmployeeName: 'Rajesh Kumar',
    assignedRole: 'Sales Manager',
    leadStatus: 'High Confirm',
    priority: 'High',
    source: 'Doctor Referral',
    productCategory: 'Medical & Diagnostic Scanners',
    product: 'Sonocare Premium 4D Ultrasound Workstation',
    budget: '10000000',
    notes: 'Demo completed successfully. Customer issued High Buying Intent.',
    createdDate: '2026-08-15',
    lastActivityDate: '2026-08-25',
    nextFollowUpDate: '2026-08-30',
    nextFollowUpTime: '11:00'
  },
  {
    id: 4,
    leadId: 'LEAD-004',
    enquiryId: 'ENQ-2026-004',
    customerName: 'MIOT International',
    contactPerson: 'Dr. Vikram Reddy',
    mobile: '9843011223',
    email: 'vikram@miot.com',
    hospitalInstitution: 'MIOT International Hospital',
    address: '4/112 Mount Poonamallee Road, Manapakkam, Chennai, Tamil Nadu - 600089',
    district: 'Chennai',
    city: 'Chennai',
    territory: 'Tamil Nadu',
    department: 'Orthopedics',
    assignedEmployeeId: 'EMP-003',
    assignedEmployeeName: 'Karthik Subramanian',
    assignedRole: 'Territory Manager',
    leadStatus: 'Drop',
    priority: 'Low',
    source: 'Cold Calling',
    productCategory: 'General Healthcare Supplies',
    product: 'Portable Ultrasound System',
    budget: '1800000',
    notes: 'Customer postponed procurement to next fiscal year.',
    createdDate: '2026-08-10',
    lastActivityDate: '2026-08-18',
    nextFollowUpDate: '',
    nextFollowUpTime: ''
  }
];

export const initialMockFollowUps = [
  {
    id: 101,
    leadId: 'LEAD-002',
    outreachType: 'In-Person Meeting',
    followUpStatus: 'Completed',
    outcome: 'Demo Scheduled',
    followUpDate: '2026-08-24',
    followUpTime: '11:00',
    nextFollowUpDate: '2026-08-29',
    nextFollowUpTime: '14:30',
    title: 'Initial Product Presentation',
    description: 'Met HOD of Radiology at Fortis Malar. Demonstrated scanner features.',
    remarks: 'Customer requested live probe test.',
    assignedEmployeeName: 'Priya Sundaram'
  },
  {
    id: 102,
    leadId: 'LEAD-003',
    outreachType: 'Phone Call',
    followUpStatus: 'Completed',
    outcome: 'High Intent Confirmed',
    followUpDate: '2026-08-25',
    followUpTime: '14:00',
    nextFollowUpDate: '2026-08-30',
    nextFollowUpTime: '11:00',
    title: 'Commercial Discussion',
    description: 'Discussed 4D workstation configuration and warranty terms with Dr. Senthil.',
    remarks: 'Ready for Proforma Invoice issuance.',
    assignedEmployeeName: 'Rajesh Kumar'
  }
];

export const initialMockDemos = [
  {
    id: 201,
    leadId: 'LEAD-003',
    demoNumber: 'DEMO-2026-003',
    demoDate: '2026-08-25',
    demoTime: '10:30',
    demoStatus: 'Completed',
    location: 'On-site Customer Location',
    assignedEmployeeName: 'Rajesh Kumar',
    highConfirm: 'Yes',
    feedbackNotes: 'Clinical staff thoroughly satisfied with 4D imaging clarity.',
    demoProducts: [
      {
        id: 1,
        category: 'Medical & Diagnostic Scanners',
        productName: 'Sonocare Premium 4D Ultrasound Workstation'
      }
    ]
  }
];

export const initialMockPIs = [
  {
    id: 301,
    leadId: 'LEAD-003',
    enquiryId: 'ENQ-2026-003',
    piNumber: 'PI-2026-003',
    piDate: '2026-08-25',
    versionNumber: 1,
    customerName: 'KMCH Specialty Hospital',
    contactPerson: 'Dr. Senthil Nathan',
    mobile: '9842155667',
    email: 'senthil@kmch.org',
    territory: 'Tamil Nadu',
    billingAddress: 'Avinashi Road, Civil Aerodrome Post, Coimbatore',
    deliveryAddress: 'Avinashi Road, Civil Aerodrome Post, Coimbatore',
    serviceType: 'One Time + AMC',
    subscriptionType: 'Monthly',
    pricing_model: 'one_time',
    lineItems: [
      {
        id: 1,
        category: 'Medical & Diagnostic Scanners',
        productName: 'Sonocare Premium 4D Ultrasound Workstation',
        quantity: 1,
        unitPrice: 10000000,
        gstPercent: 18,
        discount: 0,
        lineTotal: 10000000
      }
    ],
    subtotal: 10000000,
    discountTotal: 0,
    taxCGST: 900000,
    taxSGST: 900000,
    totalTax: 1800000,
    totalOrderValue: 11800000,
    approvalLevel: 'Level 2',
    approvalStatus: 'Approved',
    approvedByRole: 'Business Head',
    approvedPersonName: 'Rajesh Kumar',
    approvedAt: '2026-08-25 14:30',
    paymentTerms: '50% Advance with Purchase Order, 50% before Dispatch',
    deliveryTerms: '2 to 3 Weeks from receipt of confirmed Purchase Order',
    termsConditions: '1. Prices are inclusive of standard 1-year warranty.\n2. Installation & clinical training included.\n3. Taxes as applicable at time of dispatch.',
    isSent: true,
    isSentToCustomer: true,
    piStatus: 'Accepted',
    orderConfirmationStatus: 'Pending Confirmation'
  }
];

export const getNextLeadId = (leads = []) => {
  if (!leads || leads.length === 0) return 'LEAD-001';
  const nums = leads
    .map((l) => parseInt((l.leadId || '').replace('LEAD-', ''), 10))
    .filter(Boolean);
  const maxNum = nums.length > 0 ? Math.max(...nums) : 0;
  return `LEAD-${String(maxNum + 1).padStart(3, '0')}`;
};

export const getPIApprovalRequirement = (budgetValue) => {
  const val = Number(budgetValue) || 0;
  if (val < 5000000) {
    return {
      level: 'None',
      description: 'Below ₹50 Lakhs — No Approval Required',
      requiredRole: 'Sales Manager'
    };
  } else if (val >= 5000000 && val <= 10000000) {
    return {
      level: 'Level 1',
      description: '₹50 Lakhs – ₹1 Crore — Level 1 Approval Required (Sales Manager / Territory Head)',
      requiredRole: 'Sales Manager / Territory Head'
    };
  } else {
    return {
      level: 'Level 2',
      description: 'Above ₹1 Crore — Level 2 Approval Required (Business Head)',
      requiredRole: 'Business Head'
    };
  }
};
