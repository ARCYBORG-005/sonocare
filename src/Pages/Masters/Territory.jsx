import React, { useState, useMemo } from 'react';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { Helmet } from 'react-helmet-async';
import { InputField, Dropdown } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import { MapPin, Plus, Pencil, Trash2, Search, Filter } from 'lucide-react';
import '../../styles/Category.css';
import '../../styles/Product.css';

// Initial Mock Dataset for Territory Master
const initialTerritories = [
  {
    id: 1,
    territoryId: 'T001',
    district: 'Chennai',
    city: 'Chennai',
    pincode: '600001',
    description: 'Chennai metro territory covering major medical hubs and hospitals.',
    status: 'Active'
  },
  {
    id: 2,
    territoryId: 'T002',
    district: 'Coimbatore',
    city: 'Coimbatore',
    pincode: '641001',
    description: 'Coimbatore industrial and diagnostic center territory.',
    status: 'Active'
  },
  {
    id: 3,
    territoryId: 'T003',
    district: 'Madurai',
    city: 'Madurai',
    pincode: '625001',
    description: 'Madurai southern region medical equipment distribution zone.',
    status: 'Active'
  },
  {
    id: 4,
    territoryId: 'T004',
    district: 'Salem',
    city: 'Salem',
    pincode: '636001',
    description: 'Salem western healthcare territory.',
    status: 'Inactive'
  },
  {
    id: 5,
    territoryId: 'T005',
    district: 'Tiruchirappalli',
    city: 'Trichy',
    pincode: '620001',
    description: 'Central Tamil Nadu medical sales and service division.',
    status: 'Active'
  },
  {
    id: 6,
    territoryId: 'T006',
    district: 'Tirunelveli',
    city: 'Tirunelveli',
    pincode: '627001',
    description: 'Deep south healthcare diagnostic probe territory.',
    status: 'Active'
  }
];

const Territory = () => {
  // --- LOCAL MOCK STATE ---
  const [territories, setTerritories] = useState(initialTerritories);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // --- MODAL STATES ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // --- SELECTED TERRITORY & FORM STATES ---
  const [selectedTerritory, setSelectedTerritory] = useState(null);
  const [formData, setFormData] = useState({
    territoryId: '',
    district: '',
    city: '',
    pincode: '',
    description: '',
    status: 'Active'
  });
  const [formErrors, setFormErrors] = useState({});

  // --- FILTERED DATA ---
  const filteredTerritories = useMemo(() => {
    return territories.filter((terr) => {
      // 1. Search Query Filter (Territory ID, District, City, Description)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchId = terr.territoryId && terr.territoryId.toLowerCase().includes(q);
        const matchDistrict = terr.district && terr.district.toLowerCase().includes(q);
        const matchCity = terr.city && terr.city.toLowerCase().includes(q);
        const matchDesc = terr.description && terr.description.toLowerCase().includes(q);
        if (!matchId && !matchDistrict && !matchCity && !matchDesc) return false;
      }

      // 2. Status Filter
      if (statusFilter && statusFilter !== 'All Statuses') {
        if (terr.status !== statusFilter) return false;
      }

      return true;
    });
  }, [territories, searchQuery, statusFilter]);

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

  // --- ADD TERRITORY HANDLERS ---
  const handleOpenAddModal = () => {
    const nextNum = territories.length + 1;
    const autoTerrId = `T${String(nextNum).padStart(3, '0')}`;
    setFormData({
      territoryId: autoTerrId,
      district: '',
      city: '',
      pincode: '',
      description: '',
      status: 'Active'
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.territoryId.trim()) {
      errors.territoryId = 'Territory ID is required';
    }
    if (!formData.district.trim()) {
      errors.district = 'District is required';
    }
    if (!formData.city.trim()) {
      errors.city = 'City is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSubmit = (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    const newTerritory = {
      id: Date.now(),
      territoryId: formData.territoryId.trim(),
      district: formData.district.trim(),
      city: formData.city.trim(),
      pincode: formData.pincode ? formData.pincode.trim() : '',
      description: formData.description ? formData.description.trim() : '',
      status: formData.status || 'Active'
    };

    setTerritories((prev) => [newTerritory, ...prev]);
    setIsAddModalOpen(false);
    toast.success('Territory added successfully');
  };

  // --- EDIT TERRITORY HANDLERS ---
  const handleOpenEditModal = (terr) => {
    setSelectedTerritory(terr);
    setFormData({
      territoryId: terr.territoryId || '',
      district: terr.district || '',
      city: terr.city || '',
      pincode: terr.pincode || '',
      description: terr.description || '',
      status: terr.status || 'Active'
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setTerritories((prev) =>
      prev.map((item) =>
        item.id === selectedTerritory.id
          ? {
              ...item,
              territoryId: formData.territoryId.trim(),
              district: formData.district.trim(),
              city: formData.city.trim(),
              pincode: formData.pincode ? formData.pincode.trim() : '',
              description: formData.description ? formData.description.trim() : '',
              status: formData.status
            }
          : item
      )
    );
    setIsEditModalOpen(false);
    setSelectedTerritory(null);
    toast.success('Territory updated successfully');
  };

  // --- DELETE TERRITORY HANDLERS ---
  const handleOpenDeleteModal = (terr) => {
    setSelectedTerritory(terr);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedTerritory) return;
    setTerritories((prev) => prev.filter((item) => item.id !== selectedTerritory.id));
    setIsDeleteModalOpen(false);
    setSelectedTerritory(null);
    toast.success('Territory deleted successfully');
  };

  // --- DIRECT IN-TABLE STATUS CHANGE HANDLER ---
  const handleStatusChange = (id, newStatus) => {
    setTerritories((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    toast.success('Territory status updated successfully');
  };

  // --- TABLE COLUMNS CONFIGURATION ---
  const columns = [
    {
      key: 'territoryId',
      title: 'TERRITORY ID',
      sortable: true,
      render: (val) => <span className="badge bg-secondary font-monospace">{val}</span>
    },
    {
      key: 'district',
      title: 'DISTRICT',
      sortable: true,
      render: (val) => <span className="fw-bold text-dark">{val}</span>
    },
    {
      key: 'city',
      title: 'CITY',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="fw-semibold text-dark me-1">{val}</span>
          {row.pincode && <span className="badge bg-light text-secondary border extra-small">{row.pincode}</span>}
        </div>
      )
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
        title="Edit Territory"
        aria-label={`Edit ${row.territoryId}`}
        onClick={() => handleOpenEditModal(row)}
      >
        <Pencil size={15} color="#16A34A" />
      </button>

      <button
        type="button"
        className="category-action-btn delete-btn"
        title="Delete Territory"
        aria-label={`Delete ${row.territoryId}`}
        onClick={() => handleOpenDeleteModal(row)}
      >
        <Trash2 size={15} color="#DC2626" />
      </button>
    </div>
  );

  return (
    <div className="product-master-page container-fluid px-0 px-md-1">
      <Helmet>
        <title>Territory Master | Sonocare CRM</title>
        <meta name="description" content="Manage sales and service territories for Sonocare healthcare CRM." />
      </Helmet>
      <ToastContainer />

      {/* 1. TOP HEADER SECTION */}
      <div className="category-page-header">
        <div className="category-page-title-group">
          <MapPin size={28} style={{ color: '#2E3192' }} />
          <h1 className="category-page-title">Territory Master</h1>
        </div>

        <button
          type="button"
          className="category-add-btn"
          onClick={handleOpenAddModal}
        >
          <Plus size={18} />
          <span>Add Territory</span>
        </button>
      </div>

      {/* 2. MAIN CARD CONTAINER */}
      <div className="category-card">
        {/* Card Header & Search / Filters */}
        <div className="category-card-header pb-3 border-bottom">
          <h2 className="category-card-title">Territory Register List</h2>

          {/* Search Box */}
          <div className="category-search-wrapper">
            <Search size={16} className="category-search-icon" />
            <input
              type="text"
              className="category-search-input"
              placeholder="Search by Territory ID, District, City..."
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
            data={filteredTerritories}
            showSerialNumber={true}
            serialNumberHeader="S.No"
            actions={tableActions}
            actionHeader="ACTIONS"
            actionWidth="110px"
            emptyMessage="No territory records found"
            emptyIcon="bi-geo-alt"
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

      {/* 3. ADD TERRITORY MODAL POPUP */}
      <Modal
        show={isAddModalOpen}
        onHide={() => setIsAddModalOpen(false)}
        title="Add Territory"
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
              Add Territory
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAddSubmit} noValidate>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <InputField
                label="Territory ID"
                placeholder="e.g. T001"
                required={true}
                value={formData.territoryId}
                onChange={(e) => handleInputChange('territoryId', e.target.value)}
                error={formErrors.territoryId}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="District"
                placeholder="e.g. Chennai"
                required={true}
                value={formData.district}
                onChange={(e) => handleInputChange('district', e.target.value)}
                error={formErrors.district}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="City"
                placeholder="e.g. Chennai"
                required={true}
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                error={formErrors.city}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="Pincode"
                placeholder="e.g. 600001"
                value={formData.pincode}
                onChange={(e) => handleInputChange('pincode', e.target.value)}
              />
            </div>

            <div className="col-12">
              <InputField
                label="Description"
                type="textarea"
                rows={3}
                placeholder="Enter detailed territory scope..."
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

      {/* 4. EDIT TERRITORY MODAL POPUP */}
      <Modal
        show={isEditModalOpen}
        onHide={() => setIsEditModalOpen(false)}
        title="Edit Territory"
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
              Update Territory
            </Button>
          </div>
        }
      >
        <form onSubmit={handleEditSubmit} noValidate>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <InputField
                label="Territory ID"
                placeholder="Territory ID"
                required={true}
                value={formData.territoryId}
                onChange={(e) => handleInputChange('territoryId', e.target.value)}
                error={formErrors.territoryId}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="District"
                placeholder="District"
                required={true}
                value={formData.district}
                onChange={(e) => handleInputChange('district', e.target.value)}
                error={formErrors.district}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="City"
                placeholder="City"
                required={true}
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                error={formErrors.city}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="Pincode"
                placeholder="Pincode"
                value={formData.pincode}
                onChange={(e) => handleInputChange('pincode', e.target.value)}
              />
            </div>

            <div className="col-12">
              <InputField
                label="Description"
                type="textarea"
                rows={3}
                placeholder="Enter territory description..."
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

      {/* 5. DELETE TERRITORY CONFIRMATION MODAL POPUP */}
      <Modal
        show={isDeleteModalOpen}
        onHide={() => setIsDeleteModalOpen(false)}
        title="Delete Territory"
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
        {selectedTerritory && (
          <div className="py-2">
            <p className="text-dark fs-6 mb-0">
              Are you sure you want to delete territory &quot;
              <strong className="text-danger">{selectedTerritory.territoryId}</strong>&quot; ({selectedTerritory.city})?
            </p>
            <span className="text-muted small d-block mt-2">
              This action will remove the territory record from your local state.
            </span>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Territory;
