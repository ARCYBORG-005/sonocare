import React, { useState, useMemo } from 'react';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { Helmet } from 'react-helmet-async';
import { InputField, Dropdown } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import { Building2, Plus, Pencil, Trash2, Search, Filter } from 'lucide-react';
import '../../styles/Category.css';
import '../../styles/Product.css';

// Initial Mock Dataset for Department Master
const initialDepartments = [
  {
    id: 1,
    deptId: 'D001',
    deptName: 'Administration',
    description: 'Handles administrative activities, facility operations, and corporate management.',
    status: 'Active'
  },
  {
    id: 2,
    deptId: 'D002',
    deptName: 'Production',
    description: 'Handles production activities, assembly lines, and diagnostic equipment manufacturing.',
    status: 'Active'
  },
  {
    id: 3,
    deptId: 'D003',
    deptName: 'Sales',
    description: 'Handles sales activities, client relationships, and healthcare product inquiries.',
    status: 'Inactive'
  },
  {
    id: 4,
    deptId: 'D004',
    deptName: 'Support',
    description: 'Handles customer support, diagnostic machine maintenance, and AMC services.',
    status: 'Active'
  },
  {
    id: 5,
    deptId: 'D005',
    deptName: 'Quality Control',
    description: 'Manages quality assurance, safety testing, and medical device compliance standards.',
    status: 'Active'
  },
  {
    id: 6,
    deptId: 'D006',
    deptName: 'Research & Development',
    description: 'Engineers ultrasound transducer probes, AI software algorithms, and hardware updates.',
    status: 'Active'
  }
];

const Department = () => {
  // --- LOCAL MOCK STATE ---
  const [departments, setDepartments] = useState(initialDepartments);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // --- MODAL STATES ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // --- SELECTED DEPT & FORM STATES ---
  const [selectedDept, setSelectedDept] = useState(null);
  const [formData, setFormData] = useState({
    deptId: '',
    deptName: '',
    description: '',
    status: 'Active'
  });
  const [formErrors, setFormErrors] = useState({});

  // --- FILTERED DATA ---
  const filteredDepartments = useMemo(() => {
    return departments.filter((dept) => {
      // 1. Search Query Filter (Dept ID, Dept Name, Description)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchId = dept.deptId && dept.deptId.toLowerCase().includes(q);
        const matchName = dept.deptName && dept.deptName.toLowerCase().includes(q);
        const matchDesc = dept.description && dept.description.toLowerCase().includes(q);
        if (!matchId && !matchName && !matchDesc) return false;
      }

      // 2. Status Filter
      if (statusFilter && statusFilter !== 'All Statuses') {
        if (dept.status !== statusFilter) return false;
      }

      return true;
    });
  }, [departments, searchQuery, statusFilter]);

  // --- INPUT CHANGE HANDLER ---
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

  // --- ADD DEPARTMENT HANDLERS ---
  const handleOpenAddModal = () => {
    const nextNum = departments.length + 1;
    const autoDeptId = `D${String(nextNum).padStart(3, '0')}`;
    setFormData({
      deptId: autoDeptId,
      deptName: '',
      description: '',
      status: 'Active'
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.deptId.trim()) {
      errors.deptId = 'Department ID is required';
    }
    if (!formData.deptName.trim()) {
      errors.deptName = 'Department Name is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSubmit = (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    const newDept = {
      id: Date.now(),
      deptId: formData.deptId.trim(),
      deptName: formData.deptName.trim(),
      description: formData.description.trim(),
      status: formData.status || 'Active'
    };

    setDepartments((prev) => [newDept, ...prev]);
    setIsAddModalOpen(false);
    toast.success('Department added successfully');
  };

  // --- EDIT DEPARTMENT HANDLERS ---
  const handleOpenEditModal = (dept) => {
    setSelectedDept(dept);
    setFormData({
      deptId: dept.deptId || '',
      deptName: dept.deptName || '',
      description: dept.description || '',
      status: dept.status || 'Active'
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setDepartments((prev) =>
      prev.map((item) =>
        item.id === selectedDept.id
          ? {
              ...item,
              deptId: formData.deptId.trim(),
              deptName: formData.deptName.trim(),
              description: formData.description.trim()
            }
          : item
      )
    );
    setIsEditModalOpen(false);
    setSelectedDept(null);
    toast.success('Department updated successfully');
  };

  // --- DELETE DEPARTMENT HANDLERS ---
  const handleOpenDeleteModal = (dept) => {
    setSelectedDept(dept);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedDept) return;
    setDepartments((prev) => prev.filter((item) => item.id !== selectedDept.id));
    setIsDeleteModalOpen(false);
    setSelectedDept(null);
    toast.success('Department deleted successfully');
  };

  // --- DIRECT IN-TABLE STATUS CHANGE HANDLER ---
  const handleStatusChange = (id, newStatus) => {
    setDepartments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    toast.success('Department status updated successfully');
  };

  // --- TABLE COLUMNS CONFIGURATION ---
  const columns = [
    {
      key: 'deptId',
      title: 'DEPT ID',
      sortable: true,
      render: (val) => <span className="badge bg-secondary font-monospace">{val}</span>
    },
    {
      key: 'deptName',
      title: 'DEPARTMENT NAME',
      sortable: true,
      render: (val) => <span className="fw-bold text-dark">{val}</span>
    },
    {
      key: 'description',
      title: 'DESCRIPTION',
      sortable: true,
      render: (val) => <span className="category-desc-text">{val || '—'}</span>
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
          onChange={(e) => handleStatusChange(row.id, e.target.value)}
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      )
    }
  ];

  // Table Action Buttons (Edit, Delete)
  const tableActions = (row) => (
    <div className="category-actions-container">
      <button
        type="button"
        className="category-action-btn edit-btn"
        title="Edit Department"
        aria-label={`Edit ${row.deptName}`}
        onClick={() => handleOpenEditModal(row)}
      >
        <Pencil size={15} color="#16A34A" />
      </button>

      <button
        type="button"
        className="category-action-btn delete-btn"
        title="Delete Department"
        aria-label={`Delete ${row.deptName}`}
        onClick={() => handleOpenDeleteModal(row)}
      >
        <Trash2 size={15} color="#DC2626" />
      </button>
    </div>
  );

  return (
    <div className="product-master-page container-fluid px-0 px-md-1">
      <Helmet>
        <title>Department Master | Sonocare CRM</title>
        <meta name="description" content="Manage organizational departments for Sonocare healthcare CRM." />
      </Helmet>
      <ToastContainer />

      {/* 1. TOP HEADER SECTION */}
      <div className="category-page-header">
        <div className="category-page-title-group">
          <Building2 size={28} style={{ color: '#2E3192' }} />
          <h1 className="category-page-title">Department Master</h1>
        </div>

        <button
          type="button"
          className="category-add-btn"
          onClick={handleOpenAddModal}
        >
          <Plus size={18} />
          <span>Add Department</span>
        </button>
      </div>

      {/* 2. MAIN CARD CONTAINER */}
      <div className="category-card">
        {/* Card Header & Search / Filters */}
        <div className="category-card-header pb-3 border-bottom">
          <h2 className="category-card-title">Department Register List</h2>

          {/* Search Box */}
          <div className="category-search-wrapper">
            <Search size={16} className="category-search-icon" />
            <input
              type="text"
              className="category-search-input"
              placeholder="Search by Dept ID, Name, Description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="p-3 bg-light border-bottom">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-auto d-flex align-items-center text-muted small me-2">
              <Filter size={15} className="me-1" />
              <span className="fw-semibold">Filter Status:</span>
            </div>

            <div className="col-12 col-sm-4 col-md-3">
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

            {(statusFilter || searchQuery) && (
              <div className="col-12 col-md-auto ms-auto">
                <button
                  type="button"
                  className="btn btn-sm btn-link text-decoration-none text-danger p-0 fw-semibold"
                  onClick={() => {
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
            data={filteredDepartments}
            showSerialNumber={true}
            serialNumberHeader="S.No"
            actions={tableActions}
            actionHeader="ACTIONS"
            actionWidth="110px"
            emptyMessage="No department records found"
            emptyIcon="bi-building"
            paginated={true}
            pageSizeOptions={[10, 25, 50]}
            defaultPageSize={10}
            tableClassName="category-custom-table"
            headerClassName=""
            bordered={false}
            striped={false}
            hover={true}
            minWidth="750px"
          />
        </div>
      </div>

      {/* 3. ADD DEPARTMENT MODAL POPUP */}
      <Modal
        show={isAddModalOpen}
        onHide={() => setIsAddModalOpen(false)}
        title="Add Department"
        size="md"
        centered={true}
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            <Button
              variant="outline-secondary"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddSubmit}
              style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
            >
              Add Department
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAddSubmit} noValidate>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <InputField
                label="Department ID"
                placeholder="e.g. D001"
                required={true}
                value={formData.deptId}
                onChange={(e) => handleInputChange('deptId', e.target.value)}
                error={formErrors.deptId}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="Department Name"
                placeholder="e.g. Administration"
                required={true}
                value={formData.deptName}
                onChange={(e) => handleInputChange('deptName', e.target.value)}
                error={formErrors.deptName}
              />
            </div>

            <div className="col-12">
              <InputField
                label="Description"
                type="textarea"
                rows={3}
                placeholder="Enter detailed department description..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6">
              <Dropdown
                label="Status"
                options={['Active', 'Inactive']}
                value={formData.status}
                placeholder=""
                onChange={(e) => handleInputChange('status', e.target.value)}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* 4. EDIT DEPARTMENT MODAL POPUP */}
      <Modal
        show={isEditModalOpen}
        onHide={() => setIsEditModalOpen(false)}
        title="Edit Department"
        size="md"
        centered={true}
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            <Button
              variant="outline-secondary"
              onClick={() => setIsEditModalOpen(false)}
            >
              Back
            </Button>
            <Button
              variant="primary"
              onClick={handleEditSubmit}
              style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
            >
              Update Department
            </Button>
          </div>
        }
      >
        <form onSubmit={handleEditSubmit} noValidate>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <InputField
                label="Department ID"
                placeholder="Department ID"
                required={true}
                value={formData.deptId}
                onChange={(e) => handleInputChange('deptId', e.target.value)}
                error={formErrors.deptId}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="Department Name"
                placeholder="Department Name"
                required={true}
                value={formData.deptName}
                onChange={(e) => handleInputChange('deptName', e.target.value)}
                error={formErrors.deptName}
              />
            </div>

            <div className="col-12">
              <InputField
                label="Description"
                type="textarea"
                rows={3}
                placeholder="Enter department description..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* 5. DELETE DEPARTMENT CONFIRMATION MODAL POPUP */}
      <Modal
        show={isDeleteModalOpen}
        onHide={() => setIsDeleteModalOpen(false)}
        title="Delete Department"
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
        {selectedDept && (
          <div className="py-2">
            <p className="text-dark fs-6 mb-0">
              Are you sure you want to delete the department &quot;
              <strong className="text-danger">{selectedDept.deptName}</strong>&quot;?
            </p>
            <span className="text-muted small d-block mt-2">
              This action will remove the department record from your local state.
            </span>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Department;
