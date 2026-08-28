import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { Helmet } from 'react-helmet-async';
import { toast, ToastContainer } from '../../components/Toast';
import { UserCog, Plus, Eye, Pencil, Trash2, Search, Filter } from 'lucide-react';
import {
  mockDepartmentData,
  mockRoleData,
  mockTerritoryData,
  mockEmployeeTypeData,
  calculateActiveEnquiryCount,
  isDepartmentEnquiryEligible
} from './mockEmployees';
import '../../styles/Category.css';
import '../../styles/Product.css';

const EmployeeList = ({ employees, setEmployees }) => {
  const navigate = useNavigate();

  // --- FILTER STATES ---
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [territoryFilter, setTerritoryFilter] = useState('');
  const [employeeTypeFilter, setEmployeeTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // --- MODAL STATES ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // --- FILTERED DATA ---
  const filteredEmployees = useMemo(() => {
    return (employees || []).filter((emp) => {
      // 1. Search Query Filter (Employee ID, Employee Name, Phone, Email, City)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchId = emp.employeeId && emp.employeeId.toLowerCase().includes(q);
        const matchName = emp.employeeName && emp.employeeName.toLowerCase().includes(q);
        const matchPhone = emp.phone && emp.phone.includes(q);
        const matchEmail = emp.email && emp.email.toLowerCase().includes(q);
        const matchCity = emp.city && emp.city.toLowerCase().includes(q);

        if (!matchId && !matchName && !matchPhone && !matchEmail && !matchCity) {
          return false;
        }
      }

      // 2. Department Filter
      if (departmentFilter && emp.department !== departmentFilter) {
        return false;
      }

      // 3. Role Filter
      if (roleFilter && emp.role !== roleFilter) {
        return false;
      }

      // 4. Territory Filter
      if (territoryFilter && emp.territory !== territoryFilter) {
        return false;
      }

      // 5. Employee Type Filter
      if (employeeTypeFilter && emp.employeeType !== employeeTypeFilter) {
        return false;
      }

      // 6. Status Filter
      if (statusFilter && emp.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [employees, searchQuery, departmentFilter, roleFilter, territoryFilter, employeeTypeFilter, statusFilter]);

  // --- DELETE HANDLERS ---
  const handleOpenDeleteModal = (emp) => {
    setSelectedEmployee(emp);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedEmployee) return;
    setEmployees((prev) => prev.filter((item) => item.id !== selectedEmployee.id && item.employeeId !== selectedEmployee.employeeId));
    setIsDeleteModalOpen(false);
    setSelectedEmployee(null);
    toast.success('Employee deleted successfully');
  };

  // --- IN-TABLE STATUS & CONFIG TOGGLES ---
  const handleStatusChange = (employeeId, newStatus) => {
    setEmployees((prev) =>
      prev.map((item) => (item.employeeId === employeeId ? { ...item, status: newStatus } : item))
    );
    toast.success('Employee status updated successfully');
  };

  const handleSeniorEmployeeChange = (employeeId, newSeniorStatus) => {
    setEmployees((prev) =>
      prev.map((item) => (item.employeeId === employeeId ? { ...item, seniorEmployee: newSeniorStatus } : item))
    );
    toast.success(`Senior Employee updated to ${newSeniorStatus}`);
  };

  const handleAvailabilityChange = (employeeId, newAvailability) => {
    setEmployees((prev) =>
      prev.map((item) => (item.employeeId === employeeId ? { ...item, availability: newAvailability } : item))
    );
    toast.success(`Availability updated to ${newAvailability}`);
  };

  const handleEnquiryAssignableChange = (employeeId, newAssignable) => {
    setEmployees((prev) =>
      prev.map((item) => (item.employeeId === employeeId ? { ...item, enquiryAssignable: newAssignable } : item))
    );
    toast.success(`Enquiry Assignable updated to ${newAssignable}`);
  };

  // --- TABLE COLUMNS CONFIGURATION ---
  const columns = [
    {
      key: 'employeeId',
      title: 'EMPLOYEE ID',
      sortable: true,
      render: (val) => <span className="badge bg-secondary font-monospace">{val}</span>
    },
    {
      key: 'employeeName',
      title: 'EMPLOYEE NAME',
      sortable: true,
      render: (val) => <span className="fw-bold text-dark">{val}</span>
    },
    {
      key: 'department',
      title: 'DEPARTMENT',
      sortable: true,
      render: (val) => <span className="small text-dark">{val || '—'}</span>
    },
    {
      key: 'role',
      title: 'ROLE',
      sortable: true,
      render: (val) => <span className="small text-dark">{val || '—'}</span>
    },
    {
      key: 'territory',
      title: 'TERRITORY',
      sortable: true,
      render: (val) => <span className="small text-dark">{val || '—'}</span>
    },
    {
      key: 'experience',
      title: 'EXPERIENCE',
      sortable: true,
      render: (val) => <span className="fw-semibold text-dark">{val !== undefined && val !== null ? `${val} yrs` : '0 yrs'}</span>
    },
    {
      key: 'seniorEmployee',
      title: 'SENIOR EMPLOYEE',
      sortable: true,
      align: 'center',
      render: (val, row) => (
        <select
          className={`table-status-select ${row.seniorEmployee === 'Yes' ? 'active' : 'inactive'}`}
          value={row.seniorEmployee || 'No'}
          onChange={(e) => handleSeniorEmployeeChange(row.employeeId, e.target.value)}
        >
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      )
    },
    {
      key: 'availability',
      title: 'AVAILABILITY',
      sortable: true,
      align: 'center',
      render: (val, row) => {
        if (!isDepartmentEnquiryEligible(row.department)) {
          return <span className="text-muted">—</span>;
        }
        return (
          <select
            className={`table-status-select ${row.availability === 'On Leave' ? 'inactive' : 'active'}`}
            value={row.availability || 'Available'}
            onChange={(e) => handleAvailabilityChange(row.employeeId, e.target.value)}
          >
            <option value="Available">Available</option>
            <option value="On Leave">On Leave</option>
          </select>
        );
      }
    },
    {
      key: 'enquiryAssignable',
      title: 'ENQUIRY ASSIGNABLE',
      sortable: true,
      align: 'center',
      render: (val, row) => {
        if (!isDepartmentEnquiryEligible(row.department)) {
          return <span className="text-muted">—</span>;
        }
        return (
          <select
            className={`table-status-select ${row.enquiryAssignable === 'Yes' ? 'active' : 'inactive'}`}
            value={row.enquiryAssignable || 'No'}
            onChange={(e) => handleEnquiryAssignableChange(row.employeeId, e.target.value)}
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        );
      }
    },
    {
      key: 'activeEnquiries',
      title: 'ACTIVE ENQUIRIES',
      sortable: true,
      align: 'center',
      render: (val, row) => {
        if (!isDepartmentEnquiryEligible(row.department)) {
          return <span className="text-muted">—</span>;
        }
        const count = calculateActiveEnquiryCount(row);
        return <span className="badge bg-info text-dark font-monospace fs-6">{count}</span>;
      }
    },
    {
      key: 'status',
      title: 'STATUS',
      sortable: true,
      align: 'center',
      render: (val, row) => (
        <select
          className={`table-status-select ${row.status === 'Active' ? 'active' : 'inactive'}`}
          value={row.status || 'Active'}
          onChange={(e) => handleStatusChange(row.employeeId, e.target.value)}
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      )
    }
  ];

  // Table Action Buttons (View, Edit, Delete)
  const tableActions = (row) => (
    <div className="category-actions-container">
      <button
        type="button"
        className="category-action-btn view-btn"
        title="View Employee"
        aria-label={`View ${row.employeeName}`}
        onClick={() => navigate(`/masters/employees/${row.employeeId}/view`)}
      >
        <Eye size={15} color="#2563EB" />
      </button>

      <button
        type="button"
        className="category-action-btn edit-btn"
        title="Edit Employee"
        aria-label={`Edit ${row.employeeName}`}
        onClick={() => navigate(`/masters/employees/${row.employeeId}/edit`)}
      >
        <Pencil size={15} color="#16A34A" />
      </button>

      <button
        type="button"
        className="category-action-btn delete-btn"
        title="Delete Employee"
        aria-label={`Delete ${row.employeeName}`}
        onClick={() => handleOpenDeleteModal(row)}
      >
        <Trash2 size={15} color="#DC2626" />
      </button>
    </div>
  );

  return (
    <div className="product-master-page container-fluid px-0 px-md-1">
      <Helmet>
        <title>Employee Master | Sonocare CRM</title>
        <meta name="description" content="Manage organization employees, roles, and territories in Sonocare CRM." />
      </Helmet>
      <ToastContainer />

      {/* 1. TOP HEADER SECTION */}
      <div className="category-page-header">
        <div className="category-page-title-group">
          <UserCog size={28} style={{ color: '#2E3192' }} />
          <h1 className="category-page-title">Employee Master</h1>
        </div>

        <button
          type="button"
          className="category-add-btn"
          onClick={() => navigate('/masters/employees/add')}
        >
          <Plus size={18} />
          <span>Add Employee</span>
        </button>
      </div>

      {/* 2. MAIN CARD CONTAINER */}
      <div className="category-card">
        {/* Card Header & Search / Filters */}
        <div className="category-card-header pb-3 border-bottom">
          <h2 className="category-card-title">Employee Register List</h2>

          {/* Search Box */}
          <div className="category-search-wrapper">
            <Search size={16} className="category-search-icon" />
            <input
              type="text"
              className="category-search-input"
              placeholder="Search by Employee ID, Name, Phone, Email, City..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="p-3 bg-light border-bottom">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-auto d-flex align-items-center text-muted small me-1">
              <Filter size={15} className="me-1" />
              <span className="fw-semibold">Filters:</span>
            </div>

            {/* Department Filter */}
            <div className="col-12 col-sm-6 col-md-2">
              <select
                className="form-select form-select-sm"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="">All Departments</option>
                {mockDepartmentData.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Filter */}
            <div className="col-12 col-sm-6 col-md-2">
              <select
                className="form-select form-select-sm"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                {mockRoleData.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Territory Filter */}
            <div className="col-12 col-sm-6 col-md-2">
              <select
                className="form-select form-select-sm"
                value={territoryFilter}
                onChange={(e) => setTerritoryFilter(e.target.value)}
              >
                <option value="">All Territories</option>
                {mockTerritoryData.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Employee Type Filter */}
            <div className="col-12 col-sm-6 col-md-2">
              <select
                className="form-select form-select-sm"
                value={employeeTypeFilter}
                onChange={(e) => setEmployeeTypeFilter(e.target.value)}
              >
                <option value="">All Employee Types</option>
                {mockEmployeeTypeData.map((et) => (
                  <option key={et} value={et}>
                    {et}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="col-12 col-sm-6 col-md-2">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {(departmentFilter || roleFilter || territoryFilter || employeeTypeFilter || statusFilter || searchQuery) && (
              <div className="col-12 col-md-auto ms-auto">
                <button
                  type="button"
                  className="btn btn-sm btn-link text-decoration-none text-danger p-0 fw-semibold"
                  onClick={() => {
                    setDepartmentFilter('');
                    setRoleFilter('');
                    setTerritoryFilter('');
                    setEmployeeTypeFilter('');
                    setStatusFilter('');
                    setSearchQuery('');
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Table Container */}
        <div className="category-table-wrapper">
          <Table
            columns={columns}
            data={filteredEmployees}
            showSerialNumber={true}
            serialNumberHeader="S.No"
            actions={tableActions}
            actionHeader="ACTIONS"
            actionWidth="120px"
            emptyMessage="No employee records found"
            emptyIcon="bi-person-badge"
            paginated={true}
            pageSizeOptions={[10, 25, 50]}
            defaultPageSize={10}
            tableClassName="category-custom-table"
            headerClassName=""
            bordered={false}
            striped={false}
            hover={true}
            minWidth="1050px"
          />
        </div>
      </div>

      {/* 3. DELETE EMPLOYEE CONFIRMATION MODAL */}
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
        {selectedEmployee && (
          <div className="py-2">
            <p className="text-dark fs-6 mb-0">
              Are you sure you want to delete the employee "{selectedEmployee.employeeName}"?
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EmployeeList;
