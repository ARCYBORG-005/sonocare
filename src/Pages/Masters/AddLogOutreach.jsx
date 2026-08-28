import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Button from '../../components/Button';
import { InputField, Dropdown } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import {
  ArrowLeft,
  PhoneCall,
  Building2,
  UserCheck,
  Package,
  Clock,
  HelpCircle
} from 'lucide-react';
import '../../styles/LogOutreach.css';
import {
  initialMockOutreachLogs,
  allocateOutreachEmployee,
  calculateActiveContactCountForEmployee
} from './mockOutreachLogs';
import { initialMockCampaignContacts } from './mockCampaignContacts';
import { initialMockEmployees } from './mockEmployees';
import { initialMockProducts } from './mockProducts';

// Mock Campaign List Lookup
const mockCampaignList = [
  { campaignId: 'CMP-001', campaignName: 'National Radiology Expo 2026' },
  { campaignId: 'CMP-002', campaignName: 'Q1 Diagnostic Scanner Promo' },
  { campaignId: 'CMP-003', campaignName: 'Cardiology Scanner Launch' },
  { campaignId: 'CMP-004', campaignName: 'Hospital AMC Renewal Drive' },
  { campaignId: 'CMP-005', campaignName: 'Medica South Asia Summit' }
];

const mockOutreachTypes = ['Call', 'Email', 'WhatsApp', 'SMS'];
const mockOutreachStatuses = ['Interested', 'Not Interested'];
const mockOutcomes = ['Success', 'Failed', 'In Progress', 'Paused', 'Completed'];
const mockProductCategories = [
  'Medical & Diagnostic Scanners',
  'Machinery & Equipment',
  'Tooling & Accessories',
  'Electrical & Automation'
];
const mockTimeframes = ['Immediate', 'Within 1 Month', '1–3 Months', '3–6 Months', '> 6 Months'];

const AddLogOutreach = ({
  outreachLogs = initialMockOutreachLogs,
  setOutreachLogs,
  campaignContacts = initialMockCampaignContacts,
  employees = initialMockEmployees
}) => {
  const navigate = useNavigate();

  // Auto-generate next Outreach Log ID (LOG-004...)
  const nextOutreachId = useMemo(() => {
    if (!outreachLogs || outreachLogs.length === 0) return 'LOG-001';
    const nums = outreachLogs
      .map((l) => parseInt((l.outreachId || '').replace('LOG-', ''), 10))
      .filter(Boolean);
    const maxNum = nums.length > 0 ? Math.max(...nums) : 0;
    return `LOG-${String(maxNum + 1).padStart(3, '0')}`;
  }, [outreachLogs]);

  // Initial Form State
  const defaultCampId = 'CMP-001';
  const defaultCampObj = mockCampaignList.find((c) => c.campaignId === defaultCampId);
  const defaultContacts = campaignContacts.filter((c) => c.campaignId === defaultCampId);
  const defaultContact = defaultContacts.length > 0 ? defaultContacts[0] : null;

  // Check initial assignment persistence
  let initialAssignedId = 'UNASSIGNED';
  let initialAssignedName = 'Unassigned';
  let initialDept = 'Telecaller Team';

  if (defaultContact) {
    const existingLog = outreachLogs.find(
      (l) => l.contactId === defaultContact.contactId && l.assignedEmployeeId !== 'UNASSIGNED'
    );
    if (existingLog) {
      initialAssignedId = existingLog.assignedEmployeeId;
      initialAssignedName = existingLog.assignedEmployeeName;
      initialDept = existingLog.department;
    } else {
      const allocation = allocateOutreachEmployee(
        defaultContact.territory,
        'Telecaller Team',
        employees,
        outreachLogs,
        defaultContact.district,
        defaultContact.city
      );
      initialAssignedId = allocation.assignedEmployeeId;
      initialAssignedName = allocation.assignedEmployeeName;
      initialDept = allocation.department;
    }
  }

  const [formData, setFormData] = useState({
    outreachId: nextOutreachId,
    campaignId: defaultCampId,
    campaignName: defaultCampObj ? defaultCampObj.campaignName : '',
    contactId: defaultContact ? defaultContact.contactId : '',
    contactName: defaultContact ? defaultContact.contactName : '',
    customerType: defaultContact ? defaultContact.customerType : '',
    otherCustomerType: defaultContact ? defaultContact.otherCustomerType || '' : '',
    email: defaultContact ? defaultContact.email || '' : '',
    mobile: defaultContact ? defaultContact.mobile || '' : '',
    institution: defaultContact ? defaultContact.institution || '' : '',
    territory: defaultContact ? defaultContact.territory || '' : '',
    district: defaultContact ? defaultContact.district || '' : '',
    city: defaultContact ? defaultContact.city || '' : '',
    pincode: defaultContact ? defaultContact.pincode || '' : '',
    department: initialDept,
    assignedEmployeeId: initialAssignedId,
    assignedEmployeeName: initialAssignedName,
    outreachType: 'Call',
    outreachStatus: 'Interested',
    outcome: 'Success',
    outreachDate: new Date().toISOString().split('T')[0],
    outreachTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    nextOutreachDate: '',
    nextOutreachTime: '',
    remarks: '',
    productCategory: 'Medical & Diagnostic Scanners',
    product: 'Sonocare HD Cardiac Probe Transducer',
    serviceInterested: 'One-Time Purchase',
    expectedTimeframe: '1–3 Months',
    budget: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // Filtered Contacts for selected Campaign ID
  const availableCampaignContacts = useMemo(() => {
    if (!formData.campaignId) return [];
    return campaignContacts.filter((c) => c.campaignId === formData.campaignId);
  }, [formData.campaignId, campaignContacts]);

  // Cascading Products Options
  const availableProducts = useMemo(() => {
    if (!formData.productCategory) return [];
    const filtered = initialMockProducts.filter((p) => p.category === formData.productCategory);
    return filtered.length > 0 ? filtered.map((p) => p.productName) : ['General Equipment'];
  }, [formData.productCategory]);

  // Employee Active Contact Count system calculation
  const employeeActiveContactCount = useMemo(() => {
    if (!formData.assignedEmployeeId || formData.assignedEmployeeId === 'UNASSIGNED') return 0;
    return calculateActiveContactCountForEmployee(formData.assignedEmployeeId, outreachLogs);
  }, [formData.assignedEmployeeId, outreachLogs]);

  // Handle Campaign ID Selection
  const handleCampaignChange = (selectedCampId) => {
    const matchedCamp = mockCampaignList.find((c) => c.campaignId === selectedCampId);
    const campName = matchedCamp ? matchedCamp.campaignName : '';
    const campContacts = campaignContacts.filter((c) => c.campaignId === selectedCampId);
    const firstContact = campContacts.length > 0 ? campContacts[0] : null;

    setFormData((prev) => ({
      ...prev,
      campaignId: selectedCampId,
      campaignName: campName,
      contactId: firstContact ? firstContact.contactId : '',
      contactName: firstContact ? firstContact.contactName : '',
      customerType: firstContact ? firstContact.customerType : '',
      otherCustomerType: firstContact ? firstContact.otherCustomerType || '' : '',
      email: firstContact ? firstContact.email || '' : '',
      mobile: firstContact ? firstContact.mobile || '' : '',
      institution: firstContact ? firstContact.institution || '' : '',
      territory: firstContact ? firstContact.territory || '' : '',
      district: firstContact ? firstContact.district || '' : '',
      city: firstContact ? firstContact.city || '' : '',
      pincode: firstContact ? firstContact.pincode || '' : ''
    }));
  };

  // Handle Campaign Contact Selection
  const handleContactChange = (selectedContactId) => {
    const contact = campaignContacts.find((c) => c.contactId === selectedContactId);
    if (!contact) return;

    // Check if this contact has previous assignment persistence
    const existingLog = outreachLogs.find(
      (l) => l.contactId === selectedContactId && l.assignedEmployeeId !== 'UNASSIGNED'
    );

    let assignedId = 'UNASSIGNED';
    let assignedName = 'Unassigned';
    let assignedDept = 'Telecaller Team';

    if (existingLog) {
      assignedId = existingLog.assignedEmployeeId;
      assignedName = existingLog.assignedEmployeeName;
      assignedDept = existingLog.department;
    } else {
      const allocation = allocateOutreachEmployee(
        contact.territory,
        'Telecaller Team',
        employees,
        outreachLogs,
        contact.district,
        contact.city
      );
      assignedId = allocation.assignedEmployeeId;
      assignedName = allocation.assignedEmployeeName;
      assignedDept = allocation.department;
    }

    setFormData((prev) => ({
      ...prev,
      contactId: contact.contactId,
      contactName: contact.contactName,
      customerType: contact.customerType,
      otherCustomerType: contact.otherCustomerType || '',
      email: contact.email || '',
      mobile: contact.mobile || '',
      institution: contact.institution || '',
      territory: contact.territory || '',
      district: contact.district || '',
      city: contact.city || '',
      pincode: contact.pincode || '',
      department: assignedDept,
      assignedEmployeeId: assignedId,
      assignedEmployeeName: assignedName
    }));
  };

  // Generic Input Handler
  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'productCategory') {
        const prods = initialMockProducts.filter((p) => p.category === value);
        next.product = prods.length > 0 ? prods[0].productName : 'General Equipment';
      }
      return next;
    });

    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Save Add Log Outreach
  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    const errors = {};
    if (!formData.campaignId) errors.campaignId = 'Campaign ID is required';
    if (!formData.contactId) errors.contactId = 'Campaign Contact ID is required';
    if (!formData.outreachType) errors.outreachType = 'Outreach Type is required';
    if (!formData.outreachStatus) errors.outreachStatus = 'Outreach Status is required';
    if (!formData.outcome) errors.outcome = 'Outcome is required';
    if (!formData.outreachDate) errors.outreachDate = 'Outreach Date is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Please fix form validation errors before submitting.');
      return;
    }

    const previousAttempts = outreachLogs.filter((l) => l.contactId === formData.contactId);
    const attemptNum = previousAttempts.length + 1;

    const newLog = {
      id: Date.now(),
      outreachId: formData.outreachId || nextOutreachId,
      campaignId: formData.campaignId,
      campaignName: formData.campaignName,
      contactId: formData.contactId,
      contactName: formData.contactName,
      customerType: formData.customerType,
      otherCustomerType: formData.otherCustomerType,
      email: formData.email,
      mobile: formData.mobile,
      institution: formData.institution,
      territory: formData.territory,
      district: formData.district,
      city: formData.city,
      pincode: formData.pincode,
      department: formData.department,
      assignedEmployeeId: formData.assignedEmployeeId,
      assignedEmployeeName: formData.assignedEmployeeName,
      outreachType: formData.outreachType,
      outreachStatus: formData.outreachStatus,
      outcome: formData.outcome,
      outreachDate: formData.outreachDate,
      outreachTime: formData.outreachTime,
      nextOutreachDate: formData.nextOutreachDate,
      nextOutreachTime: formData.nextOutreachTime,
      remarks: formData.remarks,
      productCategory: formData.productCategory,
      product: formData.product,
      serviceInterested: formData.serviceInterested,
      expectedTimeframe: formData.expectedTimeframe,
      budget: formData.budget,
      isConvertedToEnquiry: false,
      convertedEnquiryId: null,
      attemptNumber: attemptNum,
      createdDate: `${formData.outreachDate} ${formData.outreachTime}`
    };

    if (setOutreachLogs) {
      setOutreachLogs((prev) => [newLog, ...prev]);
    }

    toast.success(`Log Outreach ${newLog.outreachId} saved successfully.`);
    navigate('/campaign/log-outreach');
  };

  return (
    <div className="log-outreach-page container-fluid px-0 px-md-1">
      <Helmet>
        <title>Add Log Outreach Activity | Sonocare CRM</title>
        <meta name="description" content="Add a new campaign contact log outreach activity in Sonocare CRM." />
      </Helmet>
      <ToastContainer />

      {/* HEADER SECTION */}
      <div className="category-page-header mb-4">
        <div className="category-page-title-group">
          <button
            type="button"
            className="btn btn-sm btn-light border me-2"
            onClick={() => navigate('/campaign/log-outreach')}
            title="Back to Outreach Logs"
          >
            <ArrowLeft size={18} />
          </button>
          <PhoneCall size={28} style={{ color: '#2E3192' }} />
          <h1 className="category-page-title">Add Log Outreach Activity</h1>
        </div>
      </div>

      {/* FORM CARD */}
      <form onSubmit={handleSubmit}>
        {/* SECTION 1 — CAMPAIGN CONTACT */}
        <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
          <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
            <Building2 size={20} color="#2E3192" />
            <h5 className="mb-0 fw-bold text-dark fs-6">SECTION 1 — CAMPAIGN CONTACT</h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <Dropdown
                  label="Campaign ID *"
                  options={mockCampaignList.map((c) => c.campaignId)}
                  value={formData.campaignId}
                  onChange={(e) => handleCampaignChange(e.target.value)}
                  error={formErrors.campaignId}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField label="Campaign Name" value={formData.campaignName} disabled={true} />
              </div>
              <div className="col-12 col-md-6">
                <Dropdown
                  label="Campaign Contact ID *"
                  options={availableCampaignContacts.map((c) => c.contactId)}
                  value={formData.contactId}
                  onChange={(e) => handleContactChange(e.target.value)}
                  error={formErrors.contactId}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField label="Contact Name" value={formData.contactName} disabled={true} />
              </div>
              <div className="col-12 col-md-6">
                <InputField label="Email" value={formData.email} disabled={true} />
              </div>
              <div className="col-12 col-md-6">
                <InputField label="Mobile Number" value={formData.mobile} disabled={true} />
              </div>
              <div className="col-12 col-md-4">
                <InputField label="Customer Type" value={formData.customerType} disabled={true} />
              </div>
              <div className="col-12 col-md-8">
                <InputField label="Hospital / Institution" value={formData.institution} disabled={true} />
              </div>
              <div className="col-12 col-md-4">
                <InputField label="Territory" value={formData.territory} disabled={true} />
              </div>
              <div className="col-12 col-md-4">
                <InputField label="District" value={formData.district} disabled={true} />
              </div>
              <div className="col-12 col-md-4">
                <InputField label="City" value={formData.city} disabled={true} />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2 — DEPARTMENT & EMPLOYEE ASSIGNMENT */}
        <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
          <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
            <UserCheck size={20} color="#2E3192" />
            <h5 className="mb-0 fw-bold text-dark fs-6">SECTION 2 — DEPARTMENT & EMPLOYEE ASSIGNMENT</h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <InputField
                  label="Target Department (Auto-Determined)"
                  value={formData.department}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-4">
                <InputField
                  label="Assigned Employee (Auto-Determined)"
                  value={formData.assignedEmployeeName}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-4">
                <InputField
                  label="Employee Active Contact Count"
                  value={`${employeeActiveContactCount} / 50`}
                  disabled={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3 — OUTREACH ACTIVITY */}
        <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
          <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
            <PhoneCall size={20} color="#2E3192" />
            <h5 className="mb-0 fw-bold text-dark fs-6">SECTION 3 — OUTREACH ACTIVITY</h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <Dropdown
                  label="Outreach Type *"
                  options={mockOutreachTypes}
                  value={formData.outreachType}
                  onChange={(e) => handleInputChange('outreachType', e.target.value)}
                  error={formErrors.outreachType}
                />
              </div>
              <div className="col-12 col-md-4">
                <Dropdown
                  label="Outreach Status *"
                  options={mockOutreachStatuses}
                  value={formData.outreachStatus}
                  onChange={(e) => handleInputChange('outreachStatus', e.target.value)}
                  error={formErrors.outreachStatus}
                />
              </div>
              <div className="col-12 col-md-4">
                <Dropdown
                  label="Outcome *"
                  options={mockOutcomes}
                  value={formData.outcome}
                  onChange={(e) => handleInputChange('outcome', e.target.value)}
                  error={formErrors.outcome}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Outreach Date *"
                  type="date"
                  value={formData.outreachDate}
                  onChange={(e) => handleInputChange('outreachDate', e.target.value)}
                  error={formErrors.outreachDate}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Outreach Time *"
                  type="text"
                  placeholder="e.g. 10:30 AM"
                  value={formData.outreachTime}
                  onChange={(e) => handleInputChange('outreachTime', e.target.value)}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Next Outreach Date (Optional)"
                  type="date"
                  value={formData.nextOutreachDate}
                  onChange={(e) => handleInputChange('nextOutreachDate', e.target.value)}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Next Outreach Time (Optional)"
                  type="text"
                  placeholder="e.g. 11:00 AM"
                  value={formData.nextOutreachTime}
                  onChange={(e) => handleInputChange('nextOutreachTime', e.target.value)}
                />
              </div>
              <div className="col-12">
                <InputField
                  label="Remarks"
                  type="textarea"
                  rows={3}
                  placeholder="Outreach notes & details..."
                  value={formData.remarks}
                  onChange={(e) => handleInputChange('remarks', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4 — PRODUCT INTEREST (Shown if Interested or Success) */}
        {(formData.outreachStatus === 'Interested' || formData.outcome === 'Success') && (
          <>
            <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
              <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
                <Package size={20} color="#2E3192" />
                <h5 className="mb-0 fw-bold text-dark fs-6">SECTION 4 — PRODUCT INTEREST</h5>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  <div className="col-12 col-md-4">
                    <Dropdown
                      label="Product Category"
                      options={mockProductCategories}
                      value={formData.productCategory}
                      onChange={(e) => handleInputChange('productCategory', e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-md-4">
                    <Dropdown
                      label="Product"
                      options={availableProducts}
                      value={formData.product}
                      onChange={(e) => handleInputChange('product', e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-md-4">
                    <Dropdown
                      label="Service Interested"
                      options={['One-Time Purchase', 'Subscription']}
                      value={formData.serviceInterested}
                      onChange={(e) => handleInputChange('serviceInterested', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 5 — PURCHASE INFORMATION */}
            <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
              <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
                <Clock size={20} color="#2E3192" />
                <h5 className="mb-0 fw-bold text-dark fs-6">SECTION 5 — PURCHASE INFORMATION</h5>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <Dropdown
                      label="Expected Timeframe"
                      options={mockTimeframes}
                      value={formData.expectedTimeframe}
                      onChange={(e) => handleInputChange('expectedTimeframe', e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <InputField
                      label="Budget (₹)"
                      type="number"
                      placeholder="e.g. 500000"
                      value={formData.budget}
                      onChange={(e) => handleInputChange('budget', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* FORM BUTTONS */}
        <div className="d-flex justify-content-end gap-2 pb-5">
          <Button
            type="button"
            variant="outline-secondary"
            onClick={() => navigate('/campaign/log-outreach')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
          >
            Save Log Outreach
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddLogOutreach;
