import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Button from '../../components/Button';
import { InputField, Dropdown } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import { ArrowLeft, UserCog, Building2, ShieldCheck, Clock } from 'lucide-react';
import {
  mockTerritoryData,
  mockDepartmentData,
  mockRoleData,
  mockEmployeeTypeData,
  mockStateData,
  mockDistrictData,
  mockCityData,
  mockEmployeeAuditData,
  calculateActiveEnquiryCount,
  isDepartmentEnquiryEligible
} from './mockEmployees';
import '../../styles/Category.css';
import '../../styles/Product.css';

const EditEmployee = ({ employees, setEmployees }) => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Find target employee by ID or employeeId
  const targetEmployee = useMemo(() => {
    return (employees || []).find((e) => String(e.id) === String(id) || e.employeeId === id);
  }, [employees, id]);

  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    phone: '',
    email: '',
    joinDate: '',
    state: 'Tamil Nadu',
    district: 'Chennai',
    city: 'Chennai',
    pincode: '',
    address: '',
    status: 'Active',
    territory: 'Chennai',
    department: 'Sales',
    role: 'Sales Executive',
    reportingManager: '',
    employeeType: 'Permanent',
    experience: 0,
    seniorEmployee: 'No',
    availability: 'Available',
    enquiryAssignable: 'No',
    createdBy: '',
    createdDate: ''
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (targetEmployee) {
      setFormData({
        employeeId: targetEmployee.employeeId || '',
        employeeName: targetEmployee.employeeName || '',
        phone: targetEmployee.phone || '',
        email: targetEmployee.email || '',
        joinDate: targetEmployee.joinDate || '',
        state: targetEmployee.state || 'Tamil Nadu',
        district: targetEmployee.district || 'Chennai',
        city: targetEmployee.city || 'Chennai',
        pincode: targetEmployee.pincode || '',
        address: targetEmployee.address || '',
        status: targetEmployee.status || 'Active',
        territory: targetEmployee.territory || 'Chennai',
        department: targetEmployee.department || 'Sales',
        role: targetEmployee.role || 'Sales Executive',
        reportingManager: targetEmployee.reportingManager || '',
        employeeType: targetEmployee.employeeType || 'Permanent',
        experience: targetEmployee.experience !== undefined && targetEmployee.experience !== null ? targetEmployee.experience : 0,
        seniorEmployee: targetEmployee.seniorEmployee || 'No',
        availability: targetEmployee.availability || 'Available',
        enquiryAssignable: targetEmployee.enquiryAssignable || 'No',
        createdBy: targetEmployee.createdBy || `${mockEmployeeAuditData.employeeId} (${mockEmployeeAuditData.name})`,
        createdDate: targetEmployee.createdDate || ''
      });
    }
  }, [targetEmployee]);

  const isEligibleDept = isDepartmentEnquiryEligible(formData.department);

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'department' && !isDepartmentEnquiryEligible(value)) {
        next.enquiryAssignable = 'No';
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
    if (!formData.employeeName.trim()) {
      errors.employeeName = 'Employee Name is required';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Invalid email address format';
    }
    if (!formData.joinDate) {
      errors.joinDate = 'Join Date is required';
    }
    if (
      formData.experience === '' ||
      formData.experience === null ||
      formData.experience === undefined ||
      isNaN(formData.experience) ||
      Number(formData.experience) < 0
    ) {
      errors.experience = 'Experience must be a valid non-negative number';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix all validation errors before submitting.');
      return;
    }

    const currentDateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setEmployees((prev) =>
      prev.map((emp) =>
        emp.employeeId === formData.employeeId || String(emp.id) === String(id)
          ? {
              ...emp,
              employeeName: formData.employeeName.trim(),
              phone: formData.phone.trim(),
              email: formData.email.trim(),
              joinDate: formData.joinDate,
              state: formData.state,
              district: formData.district,
              city: formData.city,
              pincode: formData.pincode ? formData.pincode.trim() : '',
              address: formData.address ? formData.address.trim() : '',
              status: formData.status,
              territory: formData.territory,
              department: formData.department,
              role: formData.role,
              reportingManager: formData.reportingManager ? formData.reportingManager.trim() : '',
              employeeType: formData.employeeType,
              experience: Number(formData.experience) || 0,
              seniorEmployee: formData.seniorEmployee || 'No',
              availability: formData.availability,
              enquiryAssignable: isEligibleDept ? formData.enquiryAssignable : 'No',
              updatedBy: `${mockEmployeeAuditData.employeeId} (${mockEmployeeAuditData.name})`,
              updatedDate: currentDateStr
            }
          : emp
      )
    );

    toast.success('Employee updated successfully');
    navigate('/masters/employees');
  };

  if (!targetEmployee) {
    return (
      <div className="container-fluid py-5 text-center">
        <h4 className="text-muted">Employee record not found.</h4>
        <button className="btn btn-primary mt-3" onClick={() => navigate('/masters/employees')}>
          Back to Employee Master
        </button>
      </div>
    );
  }

  return (
    <div className="product-master-page container-fluid px-0 px-md-1">
      <Helmet>
        <title>Edit Employee | Sonocare CRM</title>
        <meta name="description" content="Edit existing organization employee details in Sonocare CRM." />
      </Helmet>
      <ToastContainer />

      {/* HEADER SECTION */}
      <div className="category-page-header mb-4">
        <div className="category-page-title-group">
          <button
            type="button"
            className="btn btn-sm btn-light border me-2"
            onClick={() => navigate('/masters/employees')}
            title="Back to Employee Master"
          >
            <ArrowLeft size={18} />
          </button>
          <UserCog size={28} style={{ color: '#2E3192' }} />
          <h1 className="category-page-title">Edit Employee ({formData.employeeId})</h1>
        </div>
      </div>

      {/* FORM CARD */}
      <form onSubmit={handleSubmit} noValidate>
        {/* SECTION 1 — EMPLOYEE DETAILS */}
        <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
          <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
            <Building2 size={20} color="#2E3192" />
            <h5 className="mb-0 fw-bold text-dark fs-6">SECTION 1 — EMPLOYEE DETAILS</h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              {/* Row 1: Employee ID & Name */}
              <div className="col-12 col-md-6">
                <InputField
                  label="Employee ID (Read-only)"
                  value={formData.employeeId}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Employee Name *"
                  placeholder="Employee Name"
                  required={true}
                  value={formData.employeeName}
                  onChange={(e) => handleInputChange('employeeName', e.target.value)}
                  error={formErrors.employeeName}
                />
              </div>

              {/* Row 2: Phone & Email */}
              <div className="col-12 col-md-6">
                <InputField
                  label="Phone *"
                  placeholder="Phone Number"
                  required={true}
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  error={formErrors.phone}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Email *"
                  type="email"
                  placeholder="Email Address"
                  required={true}
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={formErrors.email}
                />
              </div>

              {/* Row 3: Join Date & State */}
              <div className="col-12 col-md-6">
                <InputField
                  label="Join Date *"
                  type="date"
                  required={true}
                  value={formData.joinDate}
                  onChange={(e) => handleInputChange('joinDate', e.target.value)}
                  onClick={(e) => {
                    if (e.target && typeof e.target.showPicker === 'function') {
                      try { e.target.showPicker(); } catch (err) {}
                    }
                  }}
                  error={formErrors.joinDate}
                />
              </div>
              <div className="col-12 col-md-6">
                <Dropdown
                  label="Territory"
                  options={mockStateData}
                  value={formData.territory || formData.state}
                  onChange={(e) => {
                    handleInputChange('territory', e.target.value);
                    handleInputChange('state', e.target.value);
                  }}
                />
              </div>

              {/* Row 4: District & City */}
              <div className="col-12 col-md-6">
                <Dropdown
                  label="District"
                  options={mockDistrictData}
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                />
              </div>
              <div className="col-12 col-md-6">
                <Dropdown
                  label="City"
                  options={mockCityData}
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>

              {/* Row 5: Pincode & Status */}
              <div className="col-12 col-md-6">
                <InputField
                  label="Pincode (Optional)"
                  placeholder="Pincode"
                  value={formData.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                />
              </div>
              <div className="col-12 col-md-6">
                <Dropdown
                  label="Status"
                  options={['Active', 'Inactive']}
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                />
              </div>

              {/* Row 6: Address */}
              <div className="col-12">
                <InputField
                  label="Address (Optional)"
                  type="textarea"
                  rows={2}
                  placeholder="Street address..."
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2 — ROLE-BASED DETAILS */}
        <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
          <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
            <ShieldCheck size={20} color="#2E3192" />
            <h5 className="mb-0 fw-bold text-dark fs-6">SECTION 2 — ROLE-BASED DETAILS</h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              {/* Row 1: Territory & Department */}
              <div className="col-12 col-md-6">
                <Dropdown
                  label="Territory"
                  options={mockTerritoryData}
                  value={formData.territory}
                  onChange={(e) => handleInputChange('territory', e.target.value)}
                />
              </div>
              <div className="col-12 col-md-6">
                <Dropdown
                  label="Department"
                  options={mockDepartmentData}
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                />
              </div>

              {/* Row 2: Role & Reporting Manager Input Field */}
              <div className="col-12 col-md-6">
                <Dropdown
                  label="Role"
                  options={mockRoleData}
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Reporting Manager"
                  placeholder="e.g. Sales Manager / Admin User"
                  value={formData.reportingManager}
                  onChange={(e) => handleInputChange('reportingManager', e.target.value)}
                />
              </div>

              {/* Row 3: Employee Type & Experience */}
              <div className="col-12 col-md-6">
                <Dropdown
                  label="Employee Type"
                  options={mockEmployeeTypeData}
                  value={formData.employeeType}
                  onChange={(e) => handleInputChange('employeeType', e.target.value)}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Experience (Years) *"
                  type="number"
                  placeholder="e.g. 5"
                  required={true}
                  min="0"
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  error={formErrors.experience}
                />
              </div>

              {/* Row 4: Senior Employee (All Departments) */}
              <div className="col-12 col-md-6">
                <Dropdown
                  label="Senior Employee *"
                  options={['Yes', 'No']}
                  value={formData.seniorEmployee}
                  onChange={(e) => handleInputChange('seniorEmployee', e.target.value)}
                />
              </div>

              {/* Row 5: Availability, Enquiry Assignable & Active Enquiries (Eligible Departments Only) */}
              {isEligibleDept && (
                <>
                  <div className="col-12 col-md-6">
                    <Dropdown
                      label="Availability *"
                      options={['Available', 'On Leave']}
                      value={formData.availability}
                      onChange={(e) => handleInputChange('availability', e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <Dropdown
                      label="Enquiry Assignable *"
                      options={['Yes', 'No']}
                      value={formData.enquiryAssignable}
                      onChange={(e) => handleInputChange('enquiryAssignable', e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <InputField
                      label="Active Enquiries (Derived System Count)"
                      value={calculateActiveEnquiryCount(targetEmployee)}
                      disabled={true}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3 — SYSTEM / AUDIT */}
        <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
          <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
            <Clock size={20} color="#2E3192" />
            <h5 className="mb-0 fw-bold text-dark fs-6">SECTION 3 — SYSTEM / AUDIT</h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <InputField
                  label="Created By"
                  value={formData.createdBy}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Created Date"
                  value={formData.createdDate}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Updated By (System Auto)"
                  value={`${mockEmployeeAuditData.employeeId} (${mockEmployeeAuditData.name})`}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Updated Date (Current)"
                  value={new Date().toISOString().replace('T', ' ').substring(0, 16)}
                  disabled={true}
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
            onClick={() => navigate('/masters/employees')}
          >
            Cancel 
          </Button>
          <Button
            type="submit"
            variant="primary"
            style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
          >
            Update Employee
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditEmployee;
