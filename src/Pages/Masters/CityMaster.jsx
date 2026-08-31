import React, { useState, useMemo, useEffect } from 'react';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { Helmet } from 'react-helmet-async';
import { InputField, Dropdown } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import { MapPin, Plus, Pencil, Trash2, Search, Filter, Eye, Building2 } from 'lucide-react';
import '../../styles/Category.css';
import '../../styles/Product.css';

/**
 * Initial Mock Dataset for City Master
 */
export const initialCities = [
  {
    id: 1,
    cityId: 'C001',
    cityName: 'Chennai',
    stateName: 'Tamil Nadu',
    description: 'Major medical hub and headquarters zone covering multi-specialty hospitals.',
    status: 'Active',
    createdBy: 'Admin User',
    createdDate: '2026-01-10 10:00 AM'
  },
  {
    id: 2,
    cityId: 'C002',
    cityName: 'Coimbatore',
    stateName: 'Tamil Nadu',
    description: 'Western Tamil Nadu diagnostic scanner sales & service center.',
    status: 'Active',
    createdBy: 'Admin User',
    createdDate: '2026-01-12 11:30 AM'
  },
  {
    id: 3,
    cityId: 'C003',
    cityName: 'Bengaluru',
    stateName: 'Karnataka',
    description: 'Karnataka tech capital region and ultrasound probe distribution center.',
    status: 'Active',
    createdBy: 'Admin User',
    createdDate: '2026-01-15 02:15 PM'
  },
  {
    id: 4,
    cityId: 'C004',
    cityName: 'Madurai',
    stateName: 'Tamil Nadu',
    description: 'Southern region diagnostic ultrasound service & installation zone.',
    status: 'Active',
    createdBy: 'Admin User',
    createdDate: '2026-01-20 04:00 PM'
  },
  {
    id: 5,
    cityId: 'C005',
    cityName: 'Kochi',
    stateName: 'Kerala',
    description: 'Central Kerala coastal diagnostic center and hospital network.',
    status: 'Active',
    createdBy: 'Admin User',
    createdDate: '2026-02-01 09:30 AM'
  },
  {
    id: 6,
    cityId: 'C006',
    cityName: 'Salem',
    stateName: 'Tamil Nadu',
    description: 'Central Tamil Nadu healthcare equipment distribution zone.',
    status: 'Inactive',
    createdBy: 'Admin User',
    createdDate: '2026-02-10 03:00 PM'
  }
];

const CityMaster = () => {
  // ─── LOCAL STATE WITH LOCALSTORAGE SYNC ────────────────────────────────────
  const [cities, setCities] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('app_cities') || '[]');
      if (stored.length > 0) return stored;
    } catch (e) {
      console.error(e);
    }
    return [...initialCities];
  });

  useEffect(() => {
    try {
      localStorage.setItem('app_cities', JSON.stringify(cities));
    } catch (e) {
      console.error(e);
    }
  }, [cities]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Selected Record & Form State
  const [selectedCity, setSelectedCity] = useState(null);
  const [formData, setFormData] = useState({
    cityId: '',
    cityName: '',
    stateName: 'Tamil Nadu',
    description: '',
    status: 'Active'
  });
  const [formErrors, setFormErrors] = useState({});

  // ─── FILTERED DATASET ──────────────────────────────────────────────────────
  const filteredCities = useMemo(() => {
    return cities.filter((city) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchId = city.cityId && city.cityId.toLowerCase().includes(q);
        const matchName = city.cityName && city.cityName.toLowerCase().includes(q);
        const matchDesc = city.description && city.description.toLowerCase().includes(q);
        if (!matchId && !matchName && !matchDesc) return false;
      }

      if (statusFilter && statusFilter !== 'All Statuses') {
        if (city.status !== statusFilter) return false;
      }

      return true;
    });
  }, [cities, searchQuery, statusFilter]);

  // Form Input Change Handler
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

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.cityId.trim()) {
      errors.cityId = 'City ID (CID) is required';
    }
    if (!formData.cityName.trim()) {
      errors.cityName = 'City Name is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ─── ADD CITY HANDLERS ─────────────────────────────────────────────────────
  const handleOpenAddModal = () => {
    const nextNum = cities.length + 1;
    const autoCityId = `C${String(nextNum).padStart(3, '0')}`;
    setFormData({
      cityId: autoCityId,
      cityName: '',
      stateName: 'Tamil Nadu',
      description: '',
      status: 'Active'
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    const newCity = {
      id: Date.now(),
      cityId: formData.cityId.trim(),
      cityName: formData.cityName.trim(),
      stateName: formData.stateName ? formData.stateName.trim() : 'Tamil Nadu',
      description: formData.description ? formData.description.trim() : '',
      status: formData.status || 'Active',
      createdBy: 'Admin User',
      createdDate: new Date().toLocaleString()
    };

    setCities((prev) => [newCity, ...prev]);
    setIsAddModalOpen(false);
    toast.success(`City "${newCity.cityName}" added successfully!`);
  };

  // ─── EDIT CITY HANDLERS ────────────────────────────────────────────────────
  const handleOpenEditModal = (city) => {
    setSelectedCity(city);
    setFormData({
      cityId: city.cityId || '',
      cityName: city.cityName || '',
      stateName: city.stateName || 'Tamil Nadu',
      description: city.description || '',
      status: city.status || 'Active'
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setCities((prev) =>
      prev.map((item) =>
        item.id === selectedCity.id
          ? {
              ...item,
              cityId: formData.cityId.trim(),
              cityName: formData.cityName.trim(),
              stateName: formData.stateName.trim(),
              description: formData.description.trim(),
              status: formData.status
            }
          : item
      )
    );
    setIsEditModalOpen(false);
    setSelectedCity(null);
    toast.success(`City record updated successfully!`);
  };

  // ─── VIEW CITY HANDLER ─────────────────────────────────────────────────────
  const handleOpenViewModal = (city) => {
    setSelectedCity(city);
    setIsViewModalOpen(true);
  };

  // ─── DELETE CITY HANDLERS ──────────────────────────────────────────────────
  const handleOpenDeleteModal = (city) => {
    setSelectedCity(city);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedCity) return;
    setCities((prev) => prev.filter((item) => item.id !== selectedCity.id));
    setIsDeleteModalOpen(false);
    setSelectedCity(null);
    toast.success('City record deleted successfully!');
  };

  // Direct In-Table Status Change
  const handleStatusChange = (id, newStatus) => {
    setCities((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    toast.success('City status updated!');
  };

  // ─── TABLE COLUMNS DEFINITION ──────────────────────────────────────────────
  const columns = [
    {
      key: 'cityId',
      title: 'CID (CITY ID)',
      sortable: true,
      render: (val) => <span className="badge bg-secondary font-monospace">{val}</span>
    },
    {
      key: 'cityName',
      title: 'CITY NAME',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="fw-bold text-dark d-block">{val}</span>
          <span className="small text-muted font-monospace">{row.stateName || 'Tamil Nadu'}</span>
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

  // Table Action Buttons (View, Edit, Delete)
  const tableActions = (row) => (
    <div className="category-actions-container d-flex align-items-center gap-1">
      <button
        type="button"
        className="category-action-btn view-btn"
        title="View City Details"
        onClick={() => handleOpenViewModal(row)}
      >
        <Eye size={15} />
      </button>

      <button
        type="button"
        className="category-action-btn edit-btn"
        title="Edit City"
        onClick={() => handleOpenEditModal(row)}
      >
        <Pencil size={15} color="#16A34A" />
      </button>

      <button
        type="button"
        className="category-action-btn delete-btn"
        title="Delete City"
        onClick={() => handleOpenDeleteModal(row)}
      >
        <Trash2 size={15} color="#DC2626" />
      </button>
    </div>
  );

  return (
    <div className="product-master-page container-fluid px-0 px-md-1">
      <Helmet>
        <title>City Master | Sonocare CRM</title>
        <meta name="description" content="City Master Register in Sonocare Healthcare CRM." />
      </Helmet>
      <ToastContainer />

      {/* 1. TOP HEADER SECTION */}
      <div className="category-page-header mb-3">
        <div className="category-page-title-group">
          <Building2 size={28} style={{ color: '#2E3192' }} />
          <div>
            <h1 className="category-page-title mb-0">City Master</h1>
            <span className="small text-muted font-monospace">Manage city records and geographical diagnostic zones</span>
          </div>
        </div>

        <button
          type="button"
          className="category-add-btn"
          onClick={handleOpenAddModal}
        >
          <Plus size={18} />
          <span>Add City</span>
        </button>
      </div>

      {/* 2. MAIN CARD CONTAINER */}
      <div className="category-card shadow-sm border" style={{ borderRadius: '10px' }}>
        {/* Card Header & Search */}
        <div className="category-card-header pb-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
          <h2 className="category-card-title mb-0">CITY REGISTER LIST ({filteredCities.length})</h2>

          <div className="category-search-wrapper">
            <Search size={16} className="category-search-icon" />
            <input
              type="text"
              className="category-search-input"
              placeholder="Search City ID (CID), City Name, Description..."
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
            data={filteredCities}
            showSerialNumber={true}
            serialNumberHeader="S.No"
            actions={tableActions}
            actionHeader="ACTIONS"
            actionWidth="110px"
            emptyMessage="No city records found matching the criteria."
            paginated={true}
            pageSizeOptions={[10, 25, 50]}
            defaultPageSize={10}
            tableClassName="category-custom-table"
            bordered={false}
            striped={false}
            hover={true}
            minWidth="800px"
          />
        </div>
      </div>

      {/* 3. ADD CITY MODAL POPUP */}
      <Modal
        show={isAddModalOpen}
        onHide={() => setIsAddModalOpen(false)}
        title="Add City Master"
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
              Add City
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAddSubmit} noValidate>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <InputField
                label="City ID (CID)"
                placeholder="e.g. C001"
                required={true}
                value={formData.cityId}
                onChange={(e) => handleInputChange('cityId', e.target.value)}
                error={formErrors.cityId}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="City Name"
                placeholder="e.g. Chennai"
                required={true}
                value={formData.cityName}
                onChange={(e) => handleInputChange('cityName', e.target.value)}
                error={formErrors.cityName}
              />
            </div>

            <div className="col-12 col-md-6">
              <Dropdown
                label="State"
                options={['Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana']}
                value={formData.stateName}
                onChange={(e) => handleInputChange('stateName', e.target.value)}
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
                placeholder="Enter city scope description..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* 4. EDIT CITY MODAL POPUP */}
      <Modal
        show={isEditModalOpen}
        onHide={() => setIsEditModalOpen(false)}
        title="Edit City Master"
        size="md"
        centered={true}
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            <Button
              variant="outline-secondary"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleEditSubmit}
              style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
            >
              Update City
            </Button>
          </div>
        }
      >
        <form onSubmit={handleEditSubmit} noValidate>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <InputField
                label="City ID (CID)"
                placeholder="City ID"
                required={true}
                value={formData.cityId}
                onChange={(e) => handleInputChange('cityId', e.target.value)}
                error={formErrors.cityId}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="City Name"
                placeholder="City Name"
                required={true}
                value={formData.cityName}
                onChange={(e) => handleInputChange('cityName', e.target.value)}
                error={formErrors.cityName}
              />
            </div>

            <div className="col-12 col-md-6">
              <Dropdown
                label="State"
                options={['Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana']}
                value={formData.stateName}
                onChange={(e) => handleInputChange('stateName', e.target.value)}
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
                placeholder="Enter description..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* 5. VIEW CITY MODAL POPUP (EXACT SAME FORM DESIGN AS EDIT POPUP) */}
      <Modal
        show={isViewModalOpen}
        onHide={() => setIsViewModalOpen(false)}
        title="View City Master"
        size="md"
        centered={true}
        footer={
          <div className="d-flex justify-content-end w-100">
            <Button variant="outline-secondary" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        {selectedCity && (
          <form noValidate>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <InputField
                  label="City ID (CID)"
                  value={selectedCity.cityId || ''}
                  disabled={true}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="City Name"
                  value={selectedCity.cityName || ''}
                  disabled={true}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="State"
                  value={selectedCity.stateName || 'Tamil Nadu'}
                  disabled={true}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Status"
                  value={selectedCity.status || 'Active'}
                  disabled={true}
                />
              </div>

              <div className="col-12">
                <InputField
                  label="Description"
                  type="textarea"
                  rows={3}
                  value={selectedCity.description || ''}
                  disabled={true}
                />
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* 6. DELETE CONFIRMATION MODAL POPUP */}
      <Modal
        show={isDeleteModalOpen}
        onHide={() => setIsDeleteModalOpen(false)}
        title="Delete City Record"
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
        {selectedCity && (
          <div className="py-2">
            <p className="text-dark fs-6 mb-0">
              Are you sure you want to delete city &quot;
              <strong className="text-danger">{selectedCity.cityName}</strong>&quot; ({selectedCity.cityId})?
            </p>
            <span className="text-muted small d-block mt-2">
              This action will remove the city master record from your local state.
            </span>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CityMaster;
