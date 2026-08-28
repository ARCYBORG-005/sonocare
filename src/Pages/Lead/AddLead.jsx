import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Button from '../../components/Button';
import { InputField, Dropdown } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import {
  ArrowLeft,
  UserCheck,
  Building2,
  Package,
  UserCog
} from 'lucide-react';
import '../../styles/Category.css';
import '../../styles/Lead.css';
import { getNextLeadId } from './mockLead';
import { initialMockEmployees } from '../Masters/mockEmployees';
import { allocateEnquiryEmployee } from '../Masters/mockEnquiry';

const customerTypeOptions = [
  'Hospital',
  'Diagnostic Lab',
  'Clinic',
  'Individual Practitioner',
  'Government Hospital',
  'Medical College',
  'Other'
];

const territoryOptions = [
  'Tamil Nadu',
  'Kerala',
  'Karnataka',
  'Andhra Pradesh',
  'Telangana',
  'Maharashtra',
  'Delhi NCR'
];

const departmentOptions = [
  'Telecaller Team',
  'Sales Team',
  'Radiology Division',
  'Ultrasound Division',
  'Service Team'
];

const productCategoryOptions = [
  'Medical & Diagnostic Scanners',
  'Machinery & Equipment',
  'Tooling & Accessories',
  'Electrical & Automation',
  'Software & Integration'
];

const productOptions = [
  'Sonocare HD Cardiac Probe Transducer',
  'Sonocare Color Doppler Ultrasound System',
  'Sonocare Premium 4D Ultrasound Workstation',
  'Sonocare Transducer Workstation Cart',
  'General Equipment'
];

const serviceOptions = [
  'One-Time Purchase',
  'Annual Contract',
  'Lease / Rental',
  'Trial / Demo Unit'
];

const timeframeOptions = [
  'Immediate (< 1 Month)',
  '1–3 Months',
  '3–6 Months',
  '> 6 Months'
];

const AddLead = ({ leads = [], setLeads, employees = initialMockEmployees }) => {
  const navigate = useNavigate();

  // Auto Next Lead ID
  const nextLeadId = useMemo(() => getNextLeadId(leads), [leads]);

  const [formData, setFormData] = useState({
    leadId: nextLeadId,
    enquiryId: '',
    customerName: '',
    contactPerson: '',
    customerType: 'Hospital',
    otherCustomerType: '',
    hospitalInstitution: '',
    mobile: '',
    email: '',
    territory: 'Tamil Nadu',
    district: 'Chennai',
    city: 'Chennai',
    pincode: '',
    address: '',
    productCategory: 'Medical & Diagnostic Scanners',
    product: 'Sonocare HD Cardiac Probe Transducer',
    serviceInterested: 'One-Time Purchase',
    expectedPurchaseTimeframe: '1–3 Months',
    budget: '',
    department: 'Sales Team',
    assignedEmployeeId: '',
    assignedEmployeeName: '',
    source: 'Direct Lead',
    sourceDetails: 'Manual Entry'
  });

  const [formErrors, setFormErrors] = useState({});

  // Auto-allocate employee on territory / department change if unassigned
  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };

      if (field === 'territory' || field === 'department') {
        const alloc = allocateEnquiryEmployee(
          next.territory,
          next.department,
          'Normal',
          'Direct',
          employees,
          []
        );
        next.assignedEmployeeId = alloc.assignedEmployeeId;
        next.assignedEmployeeName = alloc.assignedEmployeeName;
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
    if (!formData.mobile.trim()) errors.mobile = 'Mobile Number is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.territory) errors.territory = 'Territory is required';
    if (!formData.productCategory) errors.productCategory = 'Product Category is required';
    if (!formData.product) errors.product = 'Product is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix validation errors before saving.');
      return;
    }

    // Determine employee assignment if unassigned
    let finalEmpId = formData.assignedEmployeeId;
    let finalEmpName = formData.assignedEmployeeName;

    if (!finalEmpId || finalEmpId === 'UNASSIGNED') {
      const alloc = allocateEnquiryEmployee(
        formData.territory,
        formData.department,
        'Normal',
        'Direct',
        employees,
        []
      );
      finalEmpId = alloc.assignedEmployeeId;
      finalEmpName = alloc.assignedEmployeeName;
    }

    const newLead = {
      id: Date.now(),
      leadId: formData.leadId || nextLeadId,
      enquiryId: formData.enquiryId || '—',
      customerName: formData.customerName.trim(),
      contactPerson: formData.contactPerson.trim(),
      customerType: formData.customerType,
      otherCustomerType: formData.otherCustomerType,
      hospitalInstitution: formData.hospitalInstitution.trim() || formData.customerName.trim(),
      mobile: formData.mobile.trim(),
      email: formData.email.trim(),
      territory: formData.territory,
      district: formData.district,
      city: formData.city,
      pincode: formData.pincode,
      address: formData.address,
      productCategory: formData.productCategory,
      product: formData.product,
      serviceInterested: formData.serviceInterested,
      expectedPurchaseTimeframe: formData.expectedPurchaseTimeframe,
      budget: formData.budget,
      source: formData.source,
      sourceDetails: formData.sourceDetails,
      department: formData.department,
      assignedEmployeeId: finalEmpId,
      assignedEmployeeName: finalEmpName,
      leadStatus: 'Open',
      leadCreatedDate: new Date().toISOString().split('T')[0],
      lastActivityDate: new Date().toISOString().split('T')[0],
      nextFollowUpDate: '',
      nextFollowUpTime: '',
      closureReason: '',
      closureRemarks: '',
      originalLeadId: null
    };

    if (setLeads) {
      setLeads((prev) => [newLead, ...prev]);
    }

    toast.success(`Lead ${newLead.leadId} created successfully.`);
    navigate('/leads');
  };

  return (
    <div className="category-master-page lead-management-page container-fluid px-0 px-md-1">
      <Helmet>
        <title>Add New Lead | Sonocare CRM</title>
        <meta name="description" content="Add new sales lead in Sonocare CRM." />
      </Helmet>
      <ToastContainer />

      {/* HEADER SECTION */}
      <div className="category-page-header mb-4">
        <div className="category-page-title-group">
          <button
            type="button"
            className="btn btn-sm btn-light border me-2"
            onClick={() => navigate('/leads')}
            title="Back to Leads"
          >
            <ArrowLeft size={18} />
          </button>
          <UserCheck size={28} style={{ color: '#2E3192' }} />
          <h1 className="category-page-title">Add New Lead</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* SECTION 1 — CUSTOMER & CONTACT INFORMATION */}
        <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
          <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
            <Building2 size={20} color="#2E3192" />
            <h5 className="mb-0 fw-bold text-dark fs-6">SECTION 1 — CUSTOMER & CONTACT DETAILS</h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <InputField label="Lead ID *" value={formData.leadId} disabled={true} />
              </div>

              <div className="col-12 col-md-4">
                <InputField
                  label="Enquiry ID (Optional)"
                  placeholder="e.g. ENQ-001"
                  value={formData.enquiryId}
                  onChange={(e) => handleInputChange('enquiryId', e.target.value)}
                />
              </div>

              <div className="col-12 col-md-4">
                <Dropdown
                  label="Customer Type *"
                  options={customerTypeOptions}
                  value={formData.customerType}
                  onChange={(e) => handleInputChange('customerType', e.target.value)}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Customer Name *"
                  placeholder="e.g. Apollo Speciality Hospital"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  error={formErrors.customerName}
                  required={true}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Contact Person Name *"
                  placeholder="e.g. Dr. Arunkumar V"
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                  error={formErrors.contactPerson}
                  required={true}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Mobile Number *"
                  placeholder="e.g. 9840112233"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  error={formErrors.mobile}
                  required={true}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Email Address *"
                  placeholder="e.g. arun@apollohospitals.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={formErrors.email}
                  required={true}
                />
              </div>

              <div className="col-12 col-md-4">
                <Dropdown
                  label="Territory / State *"
                  options={territoryOptions}
                  value={formData.territory}
                  onChange={(e) => handleInputChange('territory', e.target.value)}
                  error={formErrors.territory}
                />
              </div>

              <div className="col-12 col-md-4">
                <InputField
                  label="District"
                  placeholder="e.g. Chennai"
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                />
              </div>

              <div className="col-12 col-md-4">
                <InputField
                  label="City"
                  placeholder="e.g. Chennai"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2 — PRODUCT & COMMERCIAL REQUIREMENTS */}
        <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
          <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
            <Package size={20} color="#2E3192" />
            <h5 className="mb-0 fw-bold text-dark fs-6">SECTION 2 — PRODUCT & COMMERCIAL INTEREST</h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <Dropdown
                  label="Product Category *"
                  options={productCategoryOptions}
                  value={formData.productCategory}
                  onChange={(e) => handleInputChange('productCategory', e.target.value)}
                  error={formErrors.productCategory}
                />
              </div>

              <div className="col-12 col-md-6">
                <Dropdown
                  label="Product Name *"
                  options={productOptions}
                  value={formData.product}
                  onChange={(e) => handleInputChange('product', e.target.value)}
                  error={formErrors.product}
                />
              </div>

              <div className="col-12 col-md-4">
                <Dropdown
                  label="Service Interested"
                  options={serviceOptions}
                  value={formData.serviceInterested}
                  onChange={(e) => handleInputChange('serviceInterested', e.target.value)}
                />
              </div>

              <div className="col-12 col-md-4">
                <Dropdown
                  label="Expected Timeframe"
                  options={timeframeOptions}
                  value={formData.expectedPurchaseTimeframe}
                  onChange={(e) => handleInputChange('expectedPurchaseTimeframe', e.target.value)}
                />
              </div>

              <div className="col-12 col-md-4">
                <InputField
                  label="Budget (₹)"
                  placeholder="e.g. 4500000"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3 — DEPARTMENT & ASSIGNMENT */}
        <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
          <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
            <UserCog size={20} color="#2E3192" />
            <h5 className="mb-0 fw-bold text-dark fs-6">SECTION 3 — DEPARTMENT & EMPLOYEE ASSIGNMENT</h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <Dropdown
                  label="Department"
                  options={departmentOptions}
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label small fw-bold text-dark mb-1">
                  Assigned Employee
                </label>
                <select
                  className="form-select form-select-sm"
                  value={formData.assignedEmployeeId}
                  onChange={(e) => {
                    const emp = employees.find((emp) => emp.employeeId === e.target.value);
                    setFormData((prev) => ({
                      ...prev,
                      assignedEmployeeId: e.target.value,
                      assignedEmployeeName: emp ? emp.employeeName : 'Unassigned'
                    }));
                  }}
                >
                  <option value="">Auto Round-Robin Allocation</option>
                  {employees.map((emp) => (
                    <option key={emp.employeeId} value={emp.employeeId}>
                      {emp.employeeId} — {emp.employeeName} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="d-flex justify-content-end gap-2 mb-5">
          <Button
            type="button"
            variant="outline-secondary"
            onClick={() => navigate('/leads')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
          >
            Save Lead
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddLead;
