import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { InputField, Dropdown } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import {
  ArrowLeft,
  HelpCircle,
  Building2,
  MapPin,
  Share2,
  ShieldAlert,
  Package,
  Clock,
  AlertTriangle
} from 'lucide-react';
import {
  allocateEnquiryEmployee,
  checkDuplicateEnquiry
} from './mockEnquiry';
import {
  mockStateData,
  mockDepartmentData,
  initialMockEmployees
} from './mockEmployees';
import { mockDistrictMasterData, mockCityMasterData } from './mockCustomers';
import { initialMockProducts } from './mockProducts';
import '../../styles/Enquiry.css';

const mockCustomerTypes = ['Hospital', 'Diagnostic Center', 'Clinic', 'Other'];
const mockSources = ['Referral', 'Campaign', 'Conference/Event', 'Website', 'Walk-in', 'Phone', 'Other'];
const mockPriorities = ['Normal', 'Premium'];
const mockProductCategories = [
  'Medical & Diagnostic Scanners',
  'Machinery & Equipment',
  'Tooling & Accessories',
  'Electrical & Automation'
];
const mockTimeframes = [
  'Immediate',
  'Within 1 Month',
  '1–3 Months',
  '3–6 Months',
  '6–12 Months',
  'More than 12 Months'
];
const mockCampaignsList = [
  { id: 'CMP-001', name: 'National Radiology Expo 2026' },
  { id: 'CMP-002', name: 'Cardiology Seminar - South Zone' },
  { id: 'CMP-003', name: 'Diagnostic Equipment Roadshow' }
];

const AddEnquiry = ({ enquiries, setEnquiries, employees = initialMockEmployees }) => {
  const navigate = useNavigate();

  // Auto-generate next Enquiry ID
  const nextEnquiryId = useMemo(() => {
    if (!enquiries || enquiries.length === 0) return 'ENQ-001';
    const nums = enquiries
      .map((e) => parseInt((e.enquiryId || '').replace('ENQ-', ''), 10))
      .filter(Boolean);
    const maxNum = nums.length > 0 ? Math.max(...nums) : 0;
    return `ENQ-${String(maxNum + 1).padStart(3, '0')}`;
  }, [enquiries]);

  // Form State
  const [formData, setFormData] = useState({
    enquiryId: nextEnquiryId,
    customerName: '',
    contactPerson: '',
    customerType: 'Hospital',
    otherCustomerType: '',
    hospitalInstitution: '',
    mobile: '',
    email: '',
    state: 'Tamil Nadu',
    district: 'Chennai',
    city: 'Chennai',
    pincode: '',
    address: '',
    source: 'Website',
    sourceDetails: '',
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
    productCategory: 'Medical & Diagnostic Scanners',
    product: 'Sonocare HD Cardiac Probe Transducer',
    serviceInterested: 'One-Time Purchase',
    subscriptionFrequency: 'Monthly',
    expectedTimeframe: '1–3 Months',
    budget: '',
    remarks: '',
    status: 'Pending',
    assignedEmployeeId: 'UNASSIGNED',
    assignedEmployeeName: 'Unassigned'
  });

  const [formErrors, setFormErrors] = useState({});
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [duplicateMatch, setDuplicateMatch] = useState(null);

  // Cascading District & City
  const availableDistricts = useMemo(() => {
    if (!formData.state) return [];
    return mockDistrictMasterData[formData.state] || [formData.state];
  }, [formData.state]);

  const availableCities = useMemo(() => {
    if (!formData.district) return [];
    return mockCityMasterData[formData.district] || [formData.district];
  }, [formData.district]);

  // Cascading Products
  const availableProducts = useMemo(() => {
    if (!formData.productCategory) return [];
    const filtered = initialMockProducts.filter((p) => p.category === formData.productCategory);
    return filtered.length > 0 ? filtered.map((p) => p.productName) : ['General Equipment'];
  }, [formData.productCategory]);

  // Automatic Employee Assignment Evaluation
  useEffect(() => {
    const currentTerritory = formData.territory || formData.state;
    const allocation = allocateEnquiryEmployee(
      currentTerritory,
      formData.department,
      formData.priority,
      formData.source,
      employees,
      enquiries,
      formData.district,
      formData.city
    );

    setFormData((prev) => ({
      ...prev,
      assignedEmployeeId: allocation.assignedEmployeeId,
      assignedEmployeeName: allocation.assignedEmployeeName
    }));
  }, [formData.territory, formData.state, formData.district, formData.city, formData.department, formData.priority, formData.source, employees, enquiries]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };

      if (field === 'state' || field === 'territory') {
        next.state = value;
        next.territory = value;
        const dists = mockDistrictMasterData[value] || [value];
        next.district = dists[0] || '';
        const cities = mockCityMasterData[next.district] || [next.district];
        next.city = cities[0] || '';
      } else if (field === 'district') {
        const cities = mockCityMasterData[value] || [value];
        next.city = cities[0] || '';
      }

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

  const validateForm = () => {
    const errors = {};
    if (!formData.customerName.trim()) errors.customerName = 'Customer Name is required';
    if (!formData.contactPerson.trim()) errors.contactPerson = 'Contact Person is required';

    // Mobile validation: required, 10 digits
    const trimmedMobile = formData.mobile.trim();
    if (!trimmedMobile) {
      errors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(trimmedMobile)) {
      errors.mobile = 'Mobile number must be exactly 10 digits (e.g. 9840112233)';
    }

    // Email validation: required, valid email format
    const trimmedEmail = formData.email.trim();
    if (!trimmedEmail) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Invalid email address format (e.g. contact@apollo.com)';
    }

    if (!formData.customerType) errors.customerType = 'Customer Type is required';
    if (formData.customerType === 'Other' && !formData.otherCustomerType.trim()) {
      errors.otherCustomerType = 'Description is required when Customer Type is Other';
    }
    if (!formData.state) errors.state = 'Territory/State is required';
    if (!formData.productCategory) errors.productCategory = 'Product Category is required';
    if (!formData.source) errors.source = 'Enquiry Source is required';
    if (!formData.priority) errors.priority = 'Priority is required';

    if (formData.source === 'Referral' && !formData.referralName.trim()) {
      errors.referralName = 'Referral Name is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix validation errors before submitting.');
      return;
    }

    // SRS Duplicate Check (Email + Mobile within 6 months)
    const duplicate = checkDuplicateEnquiry(formData.email, formData.mobile, enquiries);
    if (duplicate) {
      setDuplicateMatch(duplicate);
      setIsDuplicateModalOpen(true);
      return;
    }

    executeCreate();
  };

  const executeCreate = () => {
    const newEnq = {
      id: Date.now(),
      ...formData,
      mobile: formData.mobile.trim(),
      email: formData.email.trim().toLowerCase(),
      enquiryId: nextEnquiryId,
      territory: formData.state,
      enquiryDate: new Date().toISOString().split('T')[0],
      lastActivityDate: new Date().toISOString().split('T')[0],
      daysSinceLastActivity: 0,
      isConvertedToLead: false,
      leadConvertedDate: null
    };

    setEnquiries((prev) => [newEnq, ...(prev || [])]);
    setIsDuplicateModalOpen(false);
    toast.success(`Enquiry ${newEnq.enquiryId} created and auto-assigned successfully.`);
    navigate('/masters/enquiries');
  };

  return (
    <div className="enquiry-master-page container-fluid px-0 px-md-1">
      <Helmet>
        <title>Add Enquiry | Sonocare CRM</title>
        <meta name="description" content="Add a new customer business enquiry in Sonocare CRM." />
      </Helmet>
      <ToastContainer />

      {/* HEADER SECTION */}
      <div className="category-page-header mb-4">
        <div className="category-page-title-group">
          <button
            type="button"
            className="btn btn-sm btn-light border me-2"
            onClick={() => navigate('/masters/enquiries')}
            title="Back to Enquiry Master"
          >
            <ArrowLeft size={18} />
          </button>
          <HelpCircle size={28} style={{ color: '#2E3192' }} />
          <h1 className="category-page-title">Add Enquiry</h1>
        </div>
      </div>

      {/* FORM CARD */}
      <form onSubmit={handleSubmit} noValidate>
        {/* SECTION 1 — CONTACT / CUSTOMER */}
        <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
          <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
            <Building2 size={20} color="#2E3192" />
            <h5 className="mb-0 fw-bold text-dark fs-6">SECTION 1 — CONTACT / CUSTOMER</h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <InputField
                  label="Enquiry ID (Auto-generated)"
                  value={nextEnquiryId}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Customer Name "
                  placeholder="e.g. Apollo Hospitals"
                  required={true}
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  error={formErrors.customerName}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Contact Person "
                  placeholder="e.g. Dr. Ramesh Sundaram"
                  required={true}
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                  error={formErrors.contactPerson}
                />
              </div>
              <div className="col-12 col-md-6">
                <Dropdown
                  label="Customer Type "
                  options={mockCustomerTypes}
                  value={formData.customerType}
                  onChange={(e) => handleInputChange('customerType', e.target.value)}
                />
              </div>
              {formData.customerType === 'Other' && (
                <div className="col-12 col-md-6">
                  <InputField
                    label="Other Customer Type *"
                    placeholder="Specify customer type..."
                    required={true}
                    value={formData.otherCustomerType}
                    onChange={(e) => handleInputChange('otherCustomerType', e.target.value)}
                    error={formErrors.otherCustomerType}
                  />
                </div>
              )}
              <div className="col-12 col-md-6">
                <InputField
                  label="Hospital / Institution"
                  placeholder="Hospital / Diagnostic center name..."
                  value={formData.hospitalInstitution}
                  onChange={(e) => handleInputChange('hospitalInstitution', e.target.value)}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Mobile "
                  placeholder="e.g. 9840112233"
                  required={true}
                  value={formData.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  error={formErrors.mobile}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Email "
                  type="email"
                  placeholder="e.g. contact@apollo.com"
                  required={true}
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={formErrors.email}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2 — LOCATION */}
        <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
          <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
            <MapPin size={20} color="#2E3192" />
            <h5 className="mb-0 fw-bold text-dark fs-6">SECTION 2 — LOCATION</h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <Dropdown
                  label="Territory (State) "
                  options={mockStateData}
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                />
              </div>
              <div className="col-12 col-md-4">
                <Dropdown
                  label="District "
                  options={availableDistricts}
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                />
              </div>
              <div className="col-12 col-md-4">
                <Dropdown
                  label="City "
                  options={availableCities}
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>
              <div className="col-12 col-md-4">
                <InputField
                  label="Pincode"
                  placeholder="e.g. 600006"
                  value={formData.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                />
              </div>
              <div className="col-12 col-md-8">
                <InputField
                  label="Address"
                  type="textarea"
                  rows={2}
                  placeholder="Complete street address..."
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3 — ENQUIRY SOURCE */}
        <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
          <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
            <Share2 size={20} color="#2E3192" />
            <h5 className="mb-0 fw-bold text-dark fs-6">SECTION 3 — ENQUIRY SOURCE</h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <Dropdown
                  label="Source "
                  options={mockSources}
                  value={formData.source}
                  onChange={(e) => handleInputChange('source', e.target.value)}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Source Details"
                  type="textarea"
                  rows={2}
                  placeholder="Additional source details (e.g. Referred by Dr. Kumar, Healthcare Expo 2026)..."
                  value={formData.sourceDetails}
                  onChange={(e) => handleInputChange('sourceDetails', e.target.value)}
                />
              </div>

              {formData.source === 'Referral' && (
                <>
                  <div className="col-12 col-md-6">
                    <InputField
                      label="Referral Name "
                      placeholder="e.g. Dr. Swaminathan"
                      required={true}
                      value={formData.referralName}
                      onChange={(e) => handleInputChange('referralName', e.target.value)}
                      error={formErrors.referralName}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <InputField
                      label="Referral Organization"
                      placeholder="e.g. Kovai Medical Center"
                      value={formData.referralOrg}
                      onChange={(e) => handleInputChange('referralOrg', e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <InputField
                      label="Referral Mobile"
                      placeholder="e.g. 9790123456"
                      value={formData.referralMobile}
                      onChange={(e) => handleInputChange('referralMobile', e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <InputField
                      label="Referral Territory"
                      placeholder="e.g. Coimbatore"
                      value={formData.referralTerritory}
                      onChange={(e) => handleInputChange('referralTerritory', e.target.value)}
                    />
                  </div>
                </>
              )}

              {formData.source === 'Campaign' && (
                <div className="col-12 col-md-6">
                  <Dropdown
                    label="Select Campaign *"
                    options={mockCampaignsList.map((c) => `${c.id} — ${c.name}`)}
                    value={formData.campaignId ? `${formData.campaignId} — ${mockCampaignsList.find(c => c.id === formData.campaignId)?.name || ''}` : `${mockCampaignsList[0].id} — ${mockCampaignsList[0].name}`}
                    onChange={(e) => {
                      const cid = e.target.value.split(' — ')[0];
                      handleInputChange('campaignId', cid);
                    }}
                  />
                </div>
              )}

              {formData.source === 'Conference/Event' && (
                <div className="col-12 col-md-6">
                  <InputField
                    label="Conference / Event Name *"
                    placeholder="e.g. South India Healthcare Expo 2026"
                    value={formData.conferenceName}
                    onChange={(e) => handleInputChange('conferenceName', e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 4 — PRIORITY & AUTO-ASSIGNMENT */}
        <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
          <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
            <ShieldAlert size={20} color="#2E3192" />
            <h5 className="mb-0 fw-bold text-dark fs-6">SECTION 4 — PRIORITY & AUTO-ASSIGNMENT ENGINE</h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <Dropdown
                  label="Priority "
                  options={mockPriorities}
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                />
              </div>
              <div className="col-12 col-md-4">
                <Dropdown
                  label="Target Department "
                  options={mockDepartmentData}
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                />
              </div>
              <div className="col-12 col-md-4">
                <InputField
                  label="Assigned Employee (Auto-Determined)"
                  value={formData.assignedEmployeeName}
                  disabled={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5 — PRODUCT INTEREST */}
        <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
          <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
            <Package size={20} color="#2E3192" />
            <h5 className="mb-0 fw-bold text-dark fs-6">SECTION 5 — PRODUCT INTEREST</h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <Dropdown
                  label="Product Category "
                  options={mockProductCategories}
                  value={formData.productCategory}
                  onChange={(e) => handleInputChange('productCategory', e.target.value)}
                />
              </div>
              <div className="col-12 col-md-6">
                <Dropdown
                  label="Product"
                  options={availableProducts}
                  value={formData.product}
                  onChange={(e) => handleInputChange('product', e.target.value)}
                />
              </div>
              <div className="col-12 col-md-6">
                <Dropdown
                  label="Service Interested"
                  options={['One-Time Purchase', 'Subscription']}
                  value={formData.serviceInterested}
                  onChange={(e) => handleInputChange('serviceInterested', e.target.value)}
                />
              </div>
              {formData.serviceInterested === 'Subscription' && (
                <div className="col-12 col-md-6">
                  <Dropdown
                    label="Subscription Frequency"
                    options={['Monthly', 'Half-Yearly', 'Yearly']}
                    value={formData.subscriptionFrequency}
                    onChange={(e) => handleInputChange('subscriptionFrequency', e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 6 — PURCHASE INFORMATION */}
        <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
          <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
            <Clock size={20} color="#2E3192" />
            <h5 className="mb-0 fw-bold text-dark fs-6">SECTION 6 — PURCHASE INFORMATION</h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <Dropdown
                  label="Expected Purchase Timeframe"
                  options={mockTimeframes}
                  value={formData.expectedTimeframe}
                  onChange={(e) => handleInputChange('expectedTimeframe', e.target.value)}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Budget (₹)"
                  type="number"
                  placeholder="e.g. 1250000"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                />
              </div>
              <div className="col-12">
                <InputField
                  label="Remarks / Notes"
                  type="textarea"
                  rows={2}
                  placeholder="Enter customer specific requirements or notes..."
                  value={formData.remarks}
                  onChange={(e) => handleInputChange('remarks', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* FORM BUTTONS */}
        <div className="d-flex justify-content-end gap-2 pb-5">
          <Button
            type="button"
            variant="outline-secondary"
            onClick={() => navigate('/masters/enquiries')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
          >
            Save Enquiry
          </Button>
        </div>
      </form>

      {/* DUPLICATE WARNING MODAL */}
      <Modal
        show={isDuplicateModalOpen}
        onHide={() => setIsDuplicateModalOpen(false)}
        title="Possible Duplicate Enquiry"
        size="md"
        centered={true}
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            <Button
              variant="outline-secondary"
              onClick={() => setIsDuplicateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="info"
              onClick={() => {
                setIsDuplicateModalOpen(false);
                if (duplicateMatch) navigate(`/masters/enquiries/${duplicateMatch.enquiryId}/view`);
              }}
            >
              Open Existing Enquiry
            </Button>
            <Button
              variant="warning"
              onClick={executeCreate}
            >
              Continue Anyway
            </Button>
          </div>
        }
      >
        {duplicateMatch && (
          <div className="py-2">
            <div className="d-flex align-items-center gap-2 text-warning mb-3">
              <AlertTriangle size={24} />
              <h6 className="mb-0 fw-bold text-dark">Matching Contact Record Found</h6>
            </div>
            <p className="small text-muted mb-3">
              An existing enquiry (<strong>{duplicateMatch.enquiryId}</strong>) with matching Mobile (
              <strong>{duplicateMatch.mobile}</strong>) or Email (<strong>{duplicateMatch.email}</strong>) was created within the last 6 months (
              {duplicateMatch.enquiryDate}).
            </p>
            <div className="p-3 bg-light rounded border small text-dark mb-3">
              <div><strong>Enquiry ID:</strong> {duplicateMatch.enquiryId}</div>
              <div><strong>Customer Name:</strong> {duplicateMatch.customerName}</div>
              <div><strong>Contact Person:</strong> {duplicateMatch.contactPerson}</div>
              <div><strong>Mobile:</strong> {duplicateMatch.mobile}</div>
              <div><strong>Email:</strong> {duplicateMatch.email}</div>
              <div><strong>Enquiry Date:</strong> {duplicateMatch.enquiryDate}</div>
              <div><strong>Assigned Employee:</strong> {duplicateMatch.assignedEmployeeName}</div>
              <div><strong>Status:</strong> {duplicateMatch.status}</div>
            </div>
            <p className="small text-dark mb-0 fw-semibold">
              Please choose whether to cancel, view the existing enquiry, or continue saving a new record anyway.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AddEnquiry;
