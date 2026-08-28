import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { initialMockEmployees } from '../Masters/mockEmployees';

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

const EditLead = ({ leads = [], setLeads, employees = initialMockEmployees }) => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Find target lead by Lead ID or numeric ID
  const targetLead = useMemo(() => {
    return (leads || []).find((l) => l.leadId === id || String(l.id) === String(id));
  }, [leads, id]);

  const [formData, setFormData] = useState({
    leadId: '',
    enquiryId: '',
    customerName: '',
    contactPerson: '',
    customerType: 'Hospital',
    otherCustomerType: '',
    hospitalInstitution: '',
    mobile: '',
    email: '',
    territory: 'Tamil Nadu',
    district: '',
    city: '',
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
    leadStatus: 'Open'
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (targetLead) {
      setFormData({
        leadId: targetLead.leadId || '',
        enquiryId: targetLead.enquiryId || '',
        customerName: targetLead.customerName || '',
        contactPerson: targetLead.contactPerson || '',
        customerType: targetLead.customerType || 'Hospital',
        otherCustomerType: targetLead.otherCustomerType || '',
        hospitalInstitution: targetLead.hospitalInstitution || '',
        mobile: targetLead.mobile || '',
        email: targetLead.email || '',
        territory: targetLead.territory || 'Tamil Nadu',
        district: targetLead.district || '',
        city: targetLead.city || '',
        pincode: targetLead.pincode || '',
        address: targetLead.address || '',
        productCategory: targetLead.productCategory || 'Medical & Diagnostic Scanners',
        product: targetLead.product || 'Sonocare HD Cardiac Probe Transducer',
        serviceInterested: targetLead.serviceInterested || 'One-Time Purchase',
        expectedPurchaseTimeframe: targetLead.expectedPurchaseTimeframe || '1–3 Months',
        budget: targetLead.budget || '',
        department: targetLead.department || 'Sales Team',
        assignedEmployeeId: targetLead.assignedEmployeeId || '',
        assignedEmployeeName: targetLead.assignedEmployeeName || '',
        leadStatus: targetLead.leadStatus || 'Open'
      });
    }
  }, [targetLead]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix validation errors before updating.');
      return;
    }

    if (setLeads) {
      setLeads((prev) =>
        prev.map((l) =>
          l.leadId === formData.leadId || String(l.id) === String(id)
            ? {
                ...l,
                ...formData,
                lastActivityDate: new Date().toISOString().split('T')[0]
              }
            : l
        )
      );
    }

    toast.success(`Lead ${formData.leadId} updated successfully.`);
    navigate('/leads');
  };

  if (!targetLead) {
    return (
      <div className="container-fluid py-5 text-center">
        <h4 className="text-muted">Lead Record Not Found</h4>
        <Button variant="primary" onClick={() => navigate('/leads')} className="mt-3">
          Back to Leads
        </Button>
      </div>
    );
  }

  return (
    <div className="category-master-page lead-management-page container-fluid px-0 px-md-1">
      <Helmet>
        <title>{`Edit Lead ${formData.leadId}`} | Sonocare CRM</title>
        <meta name="description" content="Edit sales lead in Sonocare CRM." />
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
          <h1 className="category-page-title">Edit Lead ({formData.leadId})</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* SECTION 1 — CUSTOMER & CONTACT DETAILS */}
        <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
          <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <Building2 size={20} color="#2E3192" />
              <h5 className="mb-0 fw-bold text-dark fs-6">SECTION 1 — CUSTOMER & CONTACT DETAILS</h5>
            </div>
            <span className={`lead-status-badge ${formData.leadStatus.toLowerCase().replace(' ', '-')}`}>
              Status: {formData.leadStatus}
            </span>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <InputField label="Lead ID" value={formData.leadId} disabled={true} />
              </div>

              <div className="col-12 col-md-4">
                <InputField label="Enquiry ID" value={formData.enquiryId || '—'} disabled={true} />
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
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  error={formErrors.customerName}
                  required={true}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Contact Person Name *"
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                  error={formErrors.contactPerson}
                  required={true}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Mobile Number *"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  error={formErrors.mobile}
                  required={true}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Email Address *"
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
                />
              </div>

              <div className="col-12 col-md-4">
                <InputField
                  label="District"
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                />
              </div>

              <div className="col-12 col-md-4">
                <InputField
                  label="City"
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
                />
              </div>

              <div className="col-12 col-md-6">
                <Dropdown
                  label="Product Name *"
                  options={productOptions}
                  value={formData.product}
                  onChange={(e) => handleInputChange('product', e.target.value)}
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
                  <option value="">Select Employee</option>
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
            Update Lead
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditLead;
