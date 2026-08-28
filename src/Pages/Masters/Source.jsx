import React, { useState, useMemo } from 'react';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { Helmet } from 'react-helmet-async';
import { InputField, Dropdown } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import { Layers, Plus, Pencil, Trash2, Search, Filter } from 'lucide-react';
import '../../styles/Category.css';
import '../../styles/Product.css';

// Initial Mock Dataset for Source Master
const initialSources = [
  {
    id: 1,
    sourceId: 'S001',
    sourceType: 'Referral',
    sourceName: 'Dr. A. Sharma (Cardiologist)',
    description: 'Leads referred directly by Dr. Sharma from City Hospital.',
    status: 'Active'
  },
  {
    id: 2,
    sourceId: 'S002',
    sourceType: 'Website',
    sourceName: 'Sonocare Landing Page Form',
    description: 'Online contact form enquiries submitted via official website.',
    status: 'Active'
  },
  {
    id: 3,
    sourceId: 'S003',
    sourceType: 'Exhibition',
    sourceName: 'MediTech Expo 2026',
    description: 'Leads collected at booth #B-42 during national diagnostic expo.',
    status: 'Active'
  },
  {
    id: 4,
    sourceId: 'S004',
    sourceType: 'Direct',
    sourceName: 'Walk-in Enquiry',
    description: 'Direct customer walk-in at main regional office.',
    status: 'Inactive'
  },
  {
    id: 5,
    sourceId: 'S005',
    sourceType: 'Referral',
    sourceName: 'Dr. K. Patel (Radiologist)',
    description: 'Ultrasound probe replacement lead referred by Dr. Patel.',
    status: 'Active'
  },
  {
    id: 6,
    sourceId: 'S006',
    sourceType: 'Channel Partner',
    sourceName: 'Apex Healthcare Distributors',
    description: 'Leads provided by authorized regional medical equipment distributors.',
    status: 'Active'
  }
];

const Source = () => {
  // --- LOCAL MOCK STATE ---
  const [sources, setSources] = useState(initialSources);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceTypeFilter, setSourceTypeFilter] = useState('');
  const [sourceNameFilter, setSourceNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // --- MODAL STATES ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // --- SELECTED SOURCE & FORM STATES ---
  const [selectedSource, setSelectedSource] = useState(null);
  const [formData, setFormData] = useState({
    sourceId: '',
    sourceType: 'Referral',
    sourceName: '',
    description: '',
    status: 'Active'
  });
  const [formErrors, setFormErrors] = useState({});

  // Dynamic unique Source Types for filter dropdown
  const uniqueSourceTypes = useMemo(() => {
    const types = sources.map((s) => s.sourceType).filter(Boolean);
    return Array.from(new Set(types));
  }, [sources]);

  // --- FILTERED DATA ---
  const filteredSources = useMemo(() => {
    return sources.filter((src) => {
      // 1. Search Query Filter (Source ID, Source Type, Source Name, Description)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchId = src.sourceId && src.sourceId.toLowerCase().includes(q);
        const matchType = src.sourceType && src.sourceType.toLowerCase().includes(q);
        const matchName = src.sourceName && src.sourceName.toLowerCase().includes(q);
        const matchDesc = src.description && src.description.toLowerCase().includes(q);
        if (!matchId && !matchType && !matchName && !matchDesc) return false;
      }

      // 2. Source Type Filter
      if (sourceTypeFilter) {
        if (src.sourceType !== sourceTypeFilter) return false;
      }

      // 3. Source Name Filter
      if (sourceNameFilter.trim()) {
        const nameQ = sourceNameFilter.toLowerCase().trim();
        if (!src.sourceName || !src.sourceName.toLowerCase().includes(nameQ)) return false;
      }

      // 4. Status Filter
      if (statusFilter && statusFilter !== 'All Statuses') {
        if (src.status !== statusFilter) return false;
      }

      return true;
    });
  }, [sources, searchQuery, sourceTypeFilter, sourceNameFilter, statusFilter]);

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

  // --- ADD SOURCE HANDLERS ---
  const handleOpenAddModal = () => {
    const nextNum = sources.length + 1;
    const autoSourceId = `S${String(nextNum).padStart(3, '0')}`;
    setFormData({
      sourceId: autoSourceId,
      sourceType: 'Referral',
      sourceName: '',
      description: '',
      status: 'Active'
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.sourceId.trim()) {
      errors.sourceId = 'Source ID is required';
    }
    if (!formData.sourceType.trim()) {
      errors.sourceType = 'Source Type is required';
    }
    if (!formData.sourceName.trim()) {
      errors.sourceName = 'Source Name is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSubmit = (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    const newSource = {
      id: Date.now(),
      sourceId: formData.sourceId.trim(),
      sourceType: formData.sourceType.trim(),
      sourceName: formData.sourceName.trim(),
      description: formData.description ? formData.description.trim() : '',
      status: formData.status || 'Active'
    };

    setSources((prev) => [newSource, ...prev]);
    setIsAddModalOpen(false);
    toast.success('Source added successfully');
  };

  // --- EDIT SOURCE HANDLERS ---
  const handleOpenEditModal = (src) => {
    setSelectedSource(src);
    setFormData({
      sourceId: src.sourceId || '',
      sourceType: src.sourceType || 'Referral',
      sourceName: src.sourceName || '',
      description: src.description || '',
      status: src.status || 'Active'
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setSources((prev) =>
      prev.map((item) =>
        item.id === selectedSource.id
          ? {
              ...item,
              sourceId: formData.sourceId.trim(),
              sourceType: formData.sourceType.trim(),
              sourceName: formData.sourceName.trim(),
              description: formData.description ? formData.description.trim() : '',
              status: formData.status
            }
          : item
      )
    );
    setIsEditModalOpen(false);
    setSelectedSource(null);
    toast.success('Source updated successfully');
  };

  // --- DELETE SOURCE HANDLERS ---
  const handleOpenDeleteModal = (src) => {
    setSelectedSource(src);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedSource) return;
    setSources((prev) => prev.filter((item) => item.id !== selectedSource.id));
    setIsDeleteModalOpen(false);
    setSelectedSource(null);
    toast.success('Source deleted successfully');
  };

  // --- DIRECT IN-TABLE STATUS CHANGE HANDLER ---
  const handleStatusChange = (id, newStatus) => {
    setSources((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    toast.success('Source status updated successfully');
  };

  // --- TABLE COLUMNS CONFIGURATION ---
  const columns = [
    {
      key: 'sourceId',
      title: 'SOURCE ID',
      sortable: true,
      render: (val) => <span className="badge bg-secondary font-monospace">{val}</span>
    },
    {
      key: 'sourceType',
      title: 'SOURCE TYPE',
      sortable: true,
      render: (val) => <span className="badge bg-light text-primary border font-monospace fw-semibold">{val}</span>
    },
    {
      key: 'sourceName',
      title: 'SOURCE NAME / DOCTOR NAME',
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
        title="Edit Source"
        aria-label={`Edit ${row.sourceName}`}
        onClick={() => handleOpenEditModal(row)}
      >
        <Pencil size={15} color="#16A34A" />
      </button>

      <button
        type="button"
        className="category-action-btn delete-btn"
        title="Delete Source"
        aria-label={`Delete ${row.sourceName}`}
        onClick={() => handleOpenDeleteModal(row)}
      >
        <Trash2 size={15} color="#DC2626" />
      </button>
    </div>
  );

  return (
    <div className="product-master-page container-fluid px-0 px-md-1">
      <Helmet>
        <title>Source Master | Sonocare CRM</title>
        <meta name="description" content="Manage inquiry and lead sources for Sonocare healthcare CRM." />
      </Helmet>
      <ToastContainer />

      {/* 1. TOP HEADER SECTION */}
      <div className="category-page-header">
        <div className="category-page-title-group">
          <Layers size={28} style={{ color: '#2E3192' }} />
          <h1 className="category-page-title">Source Master</h1>
        </div>

        <button
          type="button"
          className="category-add-btn"
          onClick={handleOpenAddModal}
        >
          <Plus size={18} />
          <span>Add Source</span>
        </button>
      </div>

      {/* 2. MAIN CARD CONTAINER */}
      <div className="category-card">
        {/* Card Header & Search / Filters */}
        <div className="category-card-header pb-3 border-bottom">
          <h2 className="category-card-title">Source Register List</h2>

          {/* Search Box */}
          <div className="category-search-wrapper">
            <Search size={16} className="category-search-icon" />
            <input
              type="text"
              className="category-search-input"
              placeholder="Search by Source ID, Source Type, Source Name..."
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
              <span className="fw-semibold">Filter By:</span>
            </div>

            {/* Source Type Filter Dropdown */}
            <div className="col-12 col-sm-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={sourceTypeFilter}
                onChange={(e) => setSourceTypeFilter(e.target.value)}
              >
                <option value="">All Source Types</option>
                {uniqueSourceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Source Name / Doctor Name Filter Input */}
            <div className="col-12 col-sm-6 col-md-3">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Filter by Source / Doctor Name..."
                value={sourceNameFilter}
                onChange={(e) => setSourceNameFilter(e.target.value)}
              />
            </div>

            {/* Status Filter Dropdown */}
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

            {(sourceTypeFilter || sourceNameFilter || statusFilter || searchQuery) && (
              <div className="col-12 col-md-auto ms-auto">
                <button
                  type="button"
                  className="btn btn-sm btn-link text-decoration-none text-danger p-0 fw-semibold"
                  onClick={() => {
                    setSourceTypeFilter('');
                    setSourceNameFilter('');
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
            data={filteredSources}
            showSerialNumber={true}
            serialNumberHeader="S.No"
            actions={tableActions}
            actionHeader="ACTIONS"
            actionWidth="110px"
            emptyMessage="No source records found"
            emptyIcon="bi-layers"
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

      {/* 3. ADD SOURCE MODAL POPUP */}
      <Modal
        show={isAddModalOpen}
        onHide={() => setIsAddModalOpen(false)}
        title="Add Source"
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
              Add Source
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAddSubmit} noValidate>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <InputField
                label="Source ID"
                placeholder="e.g. S001"
                required={true}
                value={formData.sourceId}
                onChange={(e) => handleInputChange('sourceId', e.target.value)}
                error={formErrors.sourceId}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="Source Type (Manual Entry)"
                placeholder="e.g. Referral, Website, Direct"
                required={true}
                value={formData.sourceType}
                onChange={(e) => handleInputChange('sourceType', e.target.value)}
                error={formErrors.sourceType}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="Source Name / Doctor Name"
                placeholder="e.g. Dr. A. Sharma / Website Form"
                required={true}
                value={formData.sourceName}
                onChange={(e) => handleInputChange('sourceName', e.target.value)}
                error={formErrors.sourceName}
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

            <div className="col-12">
              <InputField
                label="Description"
                type="textarea"
                rows={3}
                placeholder="Enter detailed lead source description..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* 4. EDIT SOURCE MODAL POPUP */}
      <Modal
        show={isEditModalOpen}
        onHide={() => setIsEditModalOpen(false)}
        title="Edit Source"
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
              Update Source
            </Button>
          </div>
        }
      >
        <form onSubmit={handleEditSubmit} noValidate>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <InputField
                label="Source ID"
                placeholder="Source ID"
                required={true}
                value={formData.sourceId}
                onChange={(e) => handleInputChange('sourceId', e.target.value)}
                error={formErrors.sourceId}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="Source Type"
                placeholder="e.g. Referral, Website, Direct"
                required={true}
                value={formData.sourceType}
                onChange={(e) => handleInputChange('sourceType', e.target.value)}
                error={formErrors.sourceType}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="Source Name / Doctor Name"
                placeholder="Source Name / Doctor Name"
                required={true}
                value={formData.sourceName}
                onChange={(e) => handleInputChange('sourceName', e.target.value)}
                error={formErrors.sourceName}
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

            <div className="col-12">
              <InputField
                label="Description"
                type="textarea"
                rows={3}
                placeholder="Enter source description..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* 5. DELETE SOURCE CONFIRMATION MODAL POPUP */}
      <Modal
        show={isDeleteModalOpen}
        onHide={() => setIsDeleteModalOpen(false)}
        title="Delete Source"
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
        {selectedSource && (
          <div className="py-2">
            <p className="text-dark fs-6 mb-0">
              Are you sure you want to delete the source &quot;
              <strong className="text-danger">{selectedSource.sourceName}</strong>&quot;?
            </p>
            <span className="text-muted small d-block mt-2">
              This action will remove the source record from your local state.
            </span>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Source;
