import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  isDepartmentEnquiryEligible
} from './mockEmployees';
import '../../styles/Category.css';
import '../../styles/Product.css';

const AddEmployee = ({ employees, setEmployees }) => {
  const navigate = useNavigate();

  // Auto-generate next Employee ID
  const nextEmployeeId = useMemo(() => {
    if (!employees || employees.length === 0) return 'EMP001';
    const nums = employees
      .map((e) => parseInt((e.employeeId || '').replace('EMP', ''), 10))
      .filter(Boolean);
    const maxNum = nums.length > 0 ? Math.max(...nums) : 0;
    return `EMP${String(maxNum + 1).padStart(3, '0')}`;
  }, [employees]);

  // Form State
  const [formData, setFormData] = useState({
    employeeId: nextEmployeeId,
    employeeName: '',
    phone: '',
    email: '',
    joinDate: new Date().toISOString().split('T')[0],
    state: 'Tamil Nadu',
    district: 'Chennai',
    city: 'Chennai',
    pincode: '',
    address: '',
    status: 'Active',
    territory: 'Chennai',
    department: 'Telecaller Team',
    role: 'Telecaller Executive',
    reportingManager: '',
    employeeType: 'Permanent',
    experience: 0,
    seniorEmployee: 'No',
    availability: 'Available',
    enquiryAssignable: 'No'
  });

  const [formErrors, setFormErrors] = useState({});

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

    const newEmp = {
      id: Date.now(),
      employeeId: nextEmployeeId,
      employeeName: formData.employeeName.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      joinDate: formData.joinDate,
      state: formData.state || 'Tamil Nadu',
      district: formData.district || 'Chennai',
      city: formData.city || 'Chennai',
      pincode: formData.pincode ? formData.pincode.trim() : '',
      address: formData.address ? formData.address.trim() : '',
      status: formData.status || 'Active',
      territory: formData.territory || 'Chennai',
      department: formData.department || 'Telecaller Team',
      role: formData.role || 'Telecaller Executive',
      reportingManager: formData.reportingManager ? formData.reportingManager.trim() : '',
      employeeType: formData.employeeType || 'Permanent',
      experience: Number(formData.experience) || 0,
      seniorEmployee: formData.seniorEmployee || 'No',
      availability: formData.availability || 'Available',
      enquiryAssignable: isEligibleDept ? (formData.enquiryAssignable || 'No') : 'No',
      createdBy: `${mockEmployeeAuditData.employeeId} (${mockEmployeeAuditData.name})`,
      createdDate: currentDateStr,
      updatedBy: `${mockEmployeeAuditData.employeeId} (${mockEmployeeAuditData.name})`,
      updatedDate: currentDateStr
    };

    setEmployees((prev) => [newEmp, ...(prev || [])]);
    toast.success('Employee added successfully');
    navigate('/masters/employees');
  };

  return (
    <div className="product-master-page container-fluid px-0 px-md-1">
      <Helmet>
        <title>Add Employee | Sonocare CRM</title>
        <meta name="description" content="Add a new organization employee in Sonocare CRM." />
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
          <h1 className="category-page-title">Add Employee</h1>
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
                  label="Employee ID (Auto-generated)"
                  value={nextEmployeeId}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Employee Name "
                  placeholder="e.g. John Smith"
                  required={true}
                  value={formData.employeeName}
                  onChange={(e) => handleInputChange('employeeName', e.target.value)}
                  error={formErrors.employeeName}
                />
              </div>

              {/* Row 2: Phone & Email */}
              <div className="col-12 col-md-6">
                <InputField
                  label="Phone "
                  placeholder="e.g. 9876543210"
                  required={true}
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  error={formErrors.phone}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Email "
                  type="email"
                  placeholder="e.g. john@example.com"
                  required={true}
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={formErrors.email}
                />
              </div>

              {/* Row 3: Join Date & State */}
              <div className="col-12 col-md-6">
                <InputField
                  label="Join Date "
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
                  label="Pincode "
                  placeholder="e.g. 600006"
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
                  label="Address"
                  type="textarea"
                  rows={2}
                  placeholder="Enter complete street address..."
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
                  label="Experience (Years) "
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
                  label="Senior Employee "
                  options={['Yes', 'No']}
                  value={formData.seniorEmployee}
                  onChange={(e) => handleInputChange('seniorEmployee', e.target.value)}
                />
              </div>

              {/* Row 5: Availability & Enquiry Assignable (Eligible Departments Only) */}
              {isEligibleDept && (
                <>
                  <div className="col-12 col-md-6">
                    <Dropdown
                      label="Availability "
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
                  value={`${mockEmployeeAuditData.employeeId} (${mockEmployeeAuditData.name})`}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Created Date"
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
            Save Employee
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddEmployee;
