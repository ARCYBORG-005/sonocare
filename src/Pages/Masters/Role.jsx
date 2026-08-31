import React, { useState, useMemo } from 'react';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { Helmet } from 'react-helmet-async';
import { InputField, Dropdown } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import { ShieldCheck, Plus, Pencil, Trash2, Search, Filter } from 'lucide-react';
import '../../styles/Category.css';
import '../../styles/Product.css';

// Local Mock Department List for UI relationship
const mockDepartments = [
  { deptId: 'D001', deptName: 'Administration' },
  { deptId: 'D002', deptName: 'Production' },
  { deptId: 'D003', deptName: 'Sales' },
  { deptId: 'D004', deptName: 'Support' },
  { deptId: 'D005', deptName: 'Quality Control' },
  { deptId: 'D006', deptName: 'Research & Development' }
];

// Initial Mock Dataset for Role Master
export const initialRoles = [
  {
    id: 1,
    roleId: 'R001',
    deptId: 'D001',
    deptName: 'Administration',
    roleName: 'Administrator',
    description: 'System administration role with full access permissions.',
    status: 'Active'
  },
  {
    id: 2,
    roleId: 'R002',
    deptId: 'D002',
    deptName: 'Production',
    roleName: 'Production Manager',
    description: 'Manages production activities, assembly lines, and machine scheduling.',
    status: 'Active'
  },
  {
    id: 3,
    roleId: 'R003',
    deptId: 'D003',
    deptName: 'Sales',
    roleName: 'Sales Executive',
    description: 'Handles sales activities, medical client leads, and quotations.',
    status: 'Active'
  },
  {
    id: 4,
    roleId: 'R004',
    deptId: 'D004',
    deptName: 'Support',
    roleName: 'Support Executive',
    description: 'Handles customer support, machine service calls, and AMC requests.',
    status: 'Inactive'
  },
  {
    id: 5,
    roleId: 'R005',
    deptId: 'D005',
    deptName: 'Quality Control',
    roleName: 'Quality Lead Inspector',
    description: 'Oversees ISO medical device quality audits and diagnostic scanner testing.',
    status: 'Active'
  },
  {
    id: 6,
    roleId: 'R006',
    deptId: 'D006',
    deptName: 'Research & Development',
    roleName: 'R&D Firmware Lead',
    description: 'Engineers ultrasound diagnostic software and sensor firmware.',
    status: 'Active'
  }
];

const Role = () => {
  // --- LOCAL MOCK STATE WITH LOCALSTORAGE SYNC ---
  const [roles, setRoles] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('app_roles') || '[]');
      if (stored.length > 0) return stored;
    } catch (e) {
      console.error(e);
    }
    return [...initialRoles];
  });

  React.useEffect(() => {
    try {
      localStorage.setItem('app_roles', JSON.stringify(roles));
    } catch (e) {
      console.error(e);
    }
  }, [roles]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // --- MODAL STATES ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // --- SELECTED ROLE & FORM STATES ---
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    roleId: '',
    deptId: 'D001',
    deptName: 'Administration',
    roleName: '',
    description: '',
    status: 'Active'
  });
  const [formErrors, setFormErrors] = useState({});

  // Dropdown Options
  const departmentOptions = mockDepartments.map((d) => d.deptName);

  // --- FILTERED DATA ---
  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      // 1. Search Query Filter (Role ID, Dept ID, Role Name, Description)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchRoleId = role.roleId && role.roleId.toLowerCase().includes(q);
        const matchDeptId = role.deptId && role.deptId.toLowerCase().includes(q);
        const matchRoleName = role.roleName && role.roleName.toLowerCase().includes(q);
        const matchDesc = role.description && role.description.toLowerCase().includes(q);
        if (!matchRoleId && !matchDeptId && !matchRoleName && !matchDesc) return false;
      }

      // 2. Status Filter
      if (statusFilter && statusFilter !== 'All Statuses') {
        if (role.status !== statusFilter) return false;
      }

      return true;
    });
  }, [roles, searchQuery, statusFilter]);

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

  // --- DEPARTMENT CHANGE HANDLER ---
  const handleDepartmentChange = (deptName) => {
    const matched = mockDepartments.find((d) => d.deptName === deptName);
    setFormData((prev) => ({
      ...prev,
      deptName: deptName,
      deptId: matched ? matched.deptId : ''
    }));
  };

  // --- ADD ROLE HANDLERS ---
  const handleOpenAddModal = () => {
    const nextNum = roles.length + 1;
    const autoRoleId = `R${String(nextNum).padStart(3, '0')}`;
    setFormData({
      roleId: autoRoleId,
      deptId: mockDepartments[0].deptId,
      deptName: mockDepartments[0].deptName,
      roleName: '',
      description: '',
      status: 'Active'
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.roleId.trim()) {
      errors.roleId = 'Role ID is required';
    }
    if (!formData.roleName.trim()) {
      errors.roleName = 'Role Name is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSubmit = (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    const newRole = {
      id: Date.now(),
      roleId: formData.roleId.trim(),
      deptId: formData.deptId,
      deptName: formData.deptName,
      roleName: formData.roleName.trim(),
      description: formData.description.trim(),
      status: formData.status || 'Active'
    };

    setRoles((prev) => [newRole, ...prev]);
    setIsAddModalOpen(false);
    toast.success('Role added successfully');
  };

  // --- EDIT ROLE HANDLERS ---
  const handleOpenEditModal = (role) => {
    setSelectedRole(role);
    setFormData({
      roleId: role.roleId || '',
      deptId: role.deptId || '',
      deptName: role.deptName || '',
      roleName: role.roleName || '',
      description: role.description || '',
      status: role.status || 'Active'
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setRoles((prev) =>
      prev.map((item) =>
        item.id === selectedRole.id
          ? {
              ...item,
              roleId: formData.roleId.trim(),
              deptId: formData.deptId,
              deptName: formData.deptName,
              roleName: formData.roleName.trim(),
              description: formData.description.trim(),
              status: formData.status
            }
          : item
      )
    );
    setIsEditModalOpen(false);
    setSelectedRole(null);
    toast.success('Role updated successfully');
  };

  // --- DELETE ROLE HANDLERS ---
  const handleOpenDeleteModal = (role) => {
    setSelectedRole(role);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedRole) return;
    setRoles((prev) => prev.filter((item) => item.id !== selectedRole.id));
    setIsDeleteModalOpen(false);
    setSelectedRole(null);
    toast.success('Role deleted successfully');
  };

  // --- DIRECT IN-TABLE STATUS CHANGE HANDLER ---
  const handleStatusChange = (id, newStatus) => {
    setRoles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    toast.success('Role status updated successfully');
  };

  // --- TABLE COLUMNS CONFIGURATION ---
  const columns = [
    {
      key: 'roleId',
      title: 'ROLE ID',
      sortable: true,
      render: (val) => <span className="badge bg-secondary font-monospace">{val}</span>
    },
    {
      key: 'deptId',
      title: 'DEPARTMENT ID',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="badge bg-light text-secondary border font-monospace me-1">{val}</span>
          <span className="small text-muted">({row.deptName})</span>
        </div>
      )
    },
    {
      key: 'roleName',
      title: 'ROLE NAME',
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
        title="Edit Role"
        aria-label={`Edit ${row.roleName}`}
        onClick={() => handleOpenEditModal(row)}
      >
        <Pencil size={15} color="#16A34A" />
      </button>

      <button
        type="button"
        className="category-action-btn delete-btn"
        title="Delete Role"
        aria-label={`Delete ${row.roleName}`}
        onClick={() => handleOpenDeleteModal(row)}
      >
        <Trash2 size={15} color="#DC2626" />
      </button>
    </div>
  );

  return (
    <div className="product-master-page container-fluid px-0 px-md-1">
      <Helmet>
        <title>Role Master | Sonocare CRM</title>
        <meta name="description" content="Manage user roles and permissions for Sonocare healthcare CRM." />
      </Helmet>
      <ToastContainer />

      {/* 1. TOP HEADER SECTION */}
      <div className="category-page-header">
        <div className="category-page-title-group">
          <ShieldCheck size={28} style={{ color: '#2E3192' }} />
          <h1 className="category-page-title">Role Master</h1>
        </div>

        <button
          type="button"
          className="category-add-btn"
          onClick={handleOpenAddModal}
        >
          <Plus size={18} />
          <span>Add Role</span>
        </button>
      </div>

      {/* 2. MAIN CARD CONTAINER */}
      <div className="category-card">
        {/* Card Header & Search / Filters */}
        <div className="category-card-header pb-3 border-bottom">
          <h2 className="category-card-title">Role Register List</h2>

          {/* Search Box */}
          <div className="category-search-wrapper">
            <Search size={16} className="category-search-icon" />
            <input
              type="text"
              className="category-search-input"
              placeholder="Search by Role ID, Dept ID, Role Name, Description..."
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
            data={filteredRoles}
            showSerialNumber={true}
            serialNumberHeader="S.No"
            actions={tableActions}
            actionHeader="ACTIONS"
            actionWidth="110px"
            emptyMessage="No role records found"
            emptyIcon="bi-shield-lock"
            paginated={true}
            pageSizeOptions={[10, 25, 50]}
            defaultPageSize={10}
            tableClassName="category-custom-table"
            headerClassName=""
            bordered={false}
            striped={false}
            hover={true}
            minWidth="800px"
          />
        </div>
      </div>

      {/* 3. ADD ROLE MODAL POPUP */}
      <Modal
        show={isAddModalOpen}
        onHide={() => setIsAddModalOpen(false)}
        title="Add Role"
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
              Add Role
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAddSubmit} noValidate>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <InputField
                label="Role ID"
                placeholder="e.g. R001"
                required={true}
                value={formData.roleId}
                onChange={(e) => handleInputChange('roleId', e.target.value)}
                error={formErrors.roleId}
              />
            </div>

            <div className="col-12 col-md-6">
              <Dropdown
                label="Department Name"
                options={departmentOptions}
                value={formData.deptName}
                onChange={(e) => handleDepartmentChange(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="Associated Department ID (Auto-populated)"
                value={formData.deptId}
                disabled={true}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="Role Name"
                placeholder="e.g. Production Manager"
                required={true}
                value={formData.roleName}
                onChange={(e) => handleInputChange('roleName', e.target.value)}
                error={formErrors.roleName}
              />
            </div>

            <div className="col-12">
              <InputField
                label="Description"
                type="textarea"
                rows={3}
                placeholder="Enter detailed role description..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
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
          </div>
        </form>
      </Modal>

      {/* 4. EDIT ROLE MODAL POPUP */}
      <Modal
        show={isEditModalOpen}
        onHide={() => setIsEditModalOpen(false)}
        title="Edit Role"
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
              Update Role
            </Button>
          </div>
        }
      >
        <form onSubmit={handleEditSubmit} noValidate>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <InputField
                label="Role ID"
                placeholder="Role ID"
                required={true}
                value={formData.roleId}
                onChange={(e) => handleInputChange('roleId', e.target.value)}
                error={formErrors.roleId}
              />
            </div>

            <div className="col-12 col-md-6">
              <Dropdown
                label="Department Name"
                options={departmentOptions}
                value={formData.deptName}
                onChange={(e) => handleDepartmentChange(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="Associated Department ID (Auto-populated)"
                value={formData.deptId}
                disabled={true}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="Role Name"
                placeholder="Role Name"
                required={true}
                value={formData.roleName}
                onChange={(e) => handleInputChange('roleName', e.target.value)}
                error={formErrors.roleName}
              />
            </div>

            <div className="col-12">
              <InputField
                label="Description"
                type="textarea"
                rows={3}
                placeholder="Enter role description..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
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
          </div>
        </form>
      </Modal>

      {/* 5. DELETE ROLE CONFIRMATION MODAL POPUP */}
      <Modal
        show={isDeleteModalOpen}
        onHide={() => setIsDeleteModalOpen(false)}
        title="Delete Role"
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
        {selectedRole && (
          <div className="py-2">
            <p className="text-dark fs-6 mb-0">
              Are you sure you want to delete the role &quot;
              <strong className="text-danger">{selectedRole.roleName}</strong>&quot;?
            </p>
            <span className="text-muted small d-block mt-2">
              This action will remove the role record from your local state.
            </span>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Role;
