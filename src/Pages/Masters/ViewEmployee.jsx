import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { InputField } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import { ArrowLeft, Pencil, Trash2, UserCog, Building2, ShieldCheck, Clock } from 'lucide-react';
import { calculateActiveEnquiryCount, isDepartmentEnquiryEligible } from './mockEmployees';
import '../../styles/Category.css';
import '../../styles/Product.css';

const ViewEmployee = ({ employees, setEmployees }) => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Find target employee by ID or employeeId
  const employee = useMemo(() => {
    return (employees || []).find((e) => String(e.id) === String(id) || e.employeeId === id);
  }, [employees, id]);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleConfirmDelete = () => {
    if (!employee) return;
    setEmployees((prev) => prev.filter((item) => item.id !== employee.id && item.employeeId !== employee.employeeId));
    setIsDeleteModalOpen(false);
    toast.success('Employee deleted successfully');
    navigate('/masters/employees');
  };

  if (!employee) {
    return (
      <div className="container-fluid py-5 text-center">
        <h4 className="text-muted">Employee record not found.</h4>
        <button className="btn btn-primary mt-3" onClick={() => navigate('/masters/employees')}>
          Back to Employee Master
        </button>
      </div>
    );
  }

  const isEligibleDept = isDepartmentEnquiryEligible(employee.department);

  return (
    <div className="product-master-page container-fluid px-0 px-md-1">
      <Helmet>
        <title>{`View Employee (${employee.employeeId})`} | Sonocare CRM</title>
        <meta name="description" content="View detailed organization employee information in Sonocare CRM." />
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
          <h1 className="category-page-title">View Employee ({employee.employeeId})</h1>
        </div>

        {/* TOP ACTIONS */}
      
      </div>

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
                value={employee.employeeId}
                disabled={true}
              />
            </div>
            <div className="col-12 col-md-6">
              <InputField
                label="Employee Name"
                value={employee.employeeName}
                disabled={true}
              />
            </div>

            {/* Row 2: Phone & Email */}
            <div className="col-12 col-md-6">
              <InputField
                label="Phone"
                value={employee.phone}
                disabled={true}
              />
            </div>
            <div className="col-12 col-md-6">
              <InputField
                label="Email"
                value={employee.email}
                disabled={true}
              />
            </div>

            {/* Row 3: Join Date & State */}
            <div className="col-12 col-md-6">
              <InputField
                label="Join Date"
                value={employee.joinDate}
                disabled={true}
              />
            </div>
            <div className="col-12 col-md-6">
              <InputField
                label="Territory"
                value={employee.territory || employee.state || '—'}
                disabled={true}
              />
            </div>

            {/* Row 4: District & City */}
            <div className="col-12 col-md-6">
              <InputField
                label="District"
                value={employee.district || '—'}
                disabled={true}
              />
            </div>
            <div className="col-12 col-md-6">
              <InputField
                label="City"
                value={employee.city || '—'}
                disabled={true}
              />
            </div>

            {/* Row 5: Pincode & Status */}
            <div className="col-12 col-md-6">
              <InputField
                label="Pincode"
                value={employee.pincode || '—'}
                disabled={true}
              />
            </div>
            <div className="col-12 col-md-6">
              <InputField
                label="Status"
                value={employee.status || 'Active'}
                disabled={true}
              />
            </div>

            {/* Row 6: Address */}
            <div className="col-12">
              <InputField
                label="Address"
                type="textarea"
                rows={2}
                value={employee.address || '—'}
                disabled={true}
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
              <InputField
                label="Territory"
                value={employee.territory || '—'}
                disabled={true}
              />
            </div>
            <div className="col-12 col-md-6">
              <InputField
                label="Department"
                value={employee.department || '—'}
                disabled={true}
              />
            </div>

            {/* Row 2: Role & Reporting Manager */}
            <div className="col-12 col-md-6">
              <InputField
                label="Role"
                value={employee.role || '—'}
                disabled={true}
              />
            </div>
            <div className="col-12 col-md-6">
              <InputField
                label="Reporting Manager"
                value={employee.reportingManager || '—'}
                disabled={true}
              />
            </div>

            {/* Row 3: Employee Type & Experience */}
            <div className="col-12 col-md-6">
              <InputField
                label="Employee Type"
                value={employee.employeeType || '—'}
                disabled={true}
              />
            </div>
            <div className="col-12 col-md-6">
              <InputField
                label="Experience (Years)"
                value={employee.experience !== undefined && employee.experience !== null ? `${employee.experience} yrs` : '0 yrs'}
                disabled={true}
              />
            </div>

            {/* Row 4: Senior Employee (All Departments) */}
            <div className="col-12 col-md-6">
              <InputField
                label="Senior Employee"
                value={employee.seniorEmployee || 'No'}
                disabled={true}
              />
            </div>

            {/* Row 5: Availability, Enquiry Assignable & Active Enquiries (Eligible Departments Only) */}
            {isEligibleDept && (
              <>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Availability"
                    value={employee.availability || 'Available'}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Enquiry Assignable"
                    value={employee.enquiryAssignable || 'No'}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Active Enquiries (Derived System Count)"
                    value={calculateActiveEnquiryCount(employee)}
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
                value={employee.createdBy || 'System'}
                disabled={true}
              />
            </div>
            <div className="col-12 col-md-6">
              <InputField
                label="Created Date"
                value={employee.createdDate || '—'}
                disabled={true}
              />
            </div>
            <div className="col-12 col-md-6">
              <InputField
                label="Updated By"
                value={employee.updatedBy || '—'}
                disabled={true}
              />
            </div>
            <div className="col-12 col-md-6">
              <InputField
                label="Updated Date"
                value={employee.updatedDate || '—'}
                disabled={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* FORM ACTION BUTTONS */}
      <div className="d-flex justify-content-end gap-2 pb-5">
        <Button
          type="button"
          variant="outline-secondary"
          onClick={() => navigate('/masters/employees')}
        >
          Back
        </Button>
      
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        show={isDeleteModalOpen}
        onHide={() => setIsDeleteModalOpen(false)}
        title="Delete Employee"
        size="md"
        centered={true}
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            <Button
              variant="outline-secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </div>
        }
      >
        <div className="py-2">
          <p className="text-dark fs-6 mb-0">
            Are you sure you want to delete the employee "{employee.employeeName}"?
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default ViewEmployee;
