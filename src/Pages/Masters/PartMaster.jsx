import React, { useState, useMemo } from 'react';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { InputField, Dropdown } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import { Wrench, Plus, Eye, Pencil, Trash2, Search, Filter } from 'lucide-react';
import { initialMockParts } from './mockParts';
import '../../styles/Category.css';
import '../../styles/Product.css';

/**
 * Part Master Component
 * Manages equipment spare parts with inline modal popups for Add, Edit, View, and Delete.
 */
const PartMaster = ({ parts: initialPartsFromProps, setParts: setPartsFromProps }) => {
  // Local state initialized with props or mockParts
  const [localParts, setLocalParts] = useState(initialMockParts);

  const parts = initialPartsFromProps && initialPartsFromProps.length > 0 ? initialPartsFromProps : localParts;

  const updatePartsState = (updater) => {
    if (setPartsFromProps) {
      setPartsFromProps(updater);
    } else {
      setLocalParts(updater);
    }
  };

  // --- SEARCH & FILTERS STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // --- MODAL POPUP STATES ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedPart, setSelectedPart] = useState(null);

  // --- FORM DATA STATE ---
  const [formData, setFormData] = useState({
    partId: '',
    brand: 'Sonoscape',
    partName: '',
    modelNumber: '',
    partNumber: '',
    price: '',
    quantity: '1',
    warranty: '1 Year',
    description: '',
    status: 'Active'
  });

  const [formErrors, setFormErrors] = useState({});

  // Dynamic list of Brands for filters
  const brandOptions = useMemo(() => {
    const brandsSet = new Set(parts.map((p) => p.brand).filter(Boolean));
    return Array.from(brandsSet);
  }, [parts]);

  // --- FILTERED PARTS LOGIC ---
  const filteredParts = useMemo(() => {
    return parts.filter((part) => {
      // 1. Search Query Filter (Part ID, Part Name, Model Number, Part Number, Brand)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchId = part.partId && part.partId.toLowerCase().includes(q);
        const matchName = part.partName && part.partName.toLowerCase().includes(q);
        const matchModel = part.modelNumber && part.modelNumber.toLowerCase().includes(q);
        const matchPartNo = part.partNumber && part.partNumber.toLowerCase().includes(q);
        const matchBrand = part.brand && part.brand.toLowerCase().includes(q);

        if (!matchId && !matchName && !matchModel && !matchPartNo && !matchBrand) {
          return false;
        }
      }

      // 2. Brand Filter
      if (brandFilter && brandFilter !== 'All Brands' && part.brand !== brandFilter) {
        return false;
      }

      // 3. Status Filter
      if (statusFilter && statusFilter !== 'All Statuses' && part.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [parts, searchQuery, brandFilter, statusFilter]);

  // Handle Form input change
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

  // --- ADD PART HANDLERS ---
  const handleOpenAddModal = () => {
    const nextIdNum = Math.floor(100 + Math.random() * 900);
    setFormData({
      partId: `PRT-2026-${nextIdNum}`,
      brand: brandOptions[0] || 'Sonoscape',
      partName: '',
      modelNumber: '',
      partNumber: '',
      price: '',
      quantity: '1',
      warranty: '1 Year',
      description: '',
      status: 'Active'
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.partName.trim()) {
      errors.partName = 'Part Name is required';
    }
    if (!formData.partNumber.trim()) {
      errors.partNumber = 'Part Number is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddPartSubmit = (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    const newPart = {
      id: Date.now(),
      partId: formData.partId || `PRT-2026-${Math.floor(100 + Math.random() * 900)}`,
      brand: formData.brand || 'Sonoscape',
      partName: formData.partName.trim(),
      modelNumber: formData.modelNumber.trim(),
      partNumber: formData.partNumber.trim(),
      price: Number(formData.price) || 0,
      quantity: Number(formData.quantity) || 0,
      warranty: formData.warranty || '1 Year',
      description: formData.description.trim(),
      status: formData.status || 'Active'
    };

    updatePartsState((prev) => [newPart, ...prev]);
    toast.success(`Part "${newPart.partName}" added successfully!`);
    setIsAddModalOpen(false);
  };

  // --- EDIT PART HANDLERS ---
  const handleOpenEditModal = (part) => {
    setSelectedPart(part);
    setFormData({
      partId: part.partId || '',
      brand: part.brand || 'Sonoscape',
      partName: part.partName || '',
      modelNumber: part.modelNumber || '',
      partNumber: part.partNumber || '',
      price: String(part.price || 0),
      quantity: String(part.quantity || 0),
      warranty: part.warranty || '1 Year',
      description: part.description || '',
      status: part.status || 'Active'
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleEditPartSubmit = (e) => {
    if (e) e.preventDefault();
    if (!selectedPart || !validateForm()) return;

    updatePartsState((prev) =>
      prev.map((item) =>
        item.id === selectedPart.id
          ? {
              ...item,
              brand: formData.brand,
              partName: formData.partName.trim(),
              modelNumber: formData.modelNumber.trim(),
              partNumber: formData.partNumber.trim(),
              price: Number(formData.price) || 0,
              quantity: Number(formData.quantity) || 0,
              warranty: formData.warranty,
              description: formData.description.trim(),
              status: formData.status
            }
          : item
      )
    );

    toast.success(`Part "${formData.partName}" updated successfully!`);
    setIsEditModalOpen(false);
    setSelectedPart(null);
  };

  // --- VIEW PART HANDLER ---
  const handleOpenViewModal = (part) => {
    setSelectedPart(part);
    setIsViewModalOpen(true);
  };

  // --- DELETE PART HANDLERS ---
  const handleOpenDeleteModal = (part) => {
    setSelectedPart(part);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedPart) return;
    updatePartsState((prev) => prev.filter((p) => p.id !== selectedPart.id));
    toast.success(`Part "${selectedPart.partName}" deleted successfully!`);
    setIsDeleteModalOpen(false);
    setSelectedPart(null);
  };

  // --- STATUS TOGGLE IN TABLE ---
  const handleStatusChange = (id, newStatus) => {
    updatePartsState((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    toast.success('Part status updated successfully');
  };

  // --- TABLE COLUMNS SETUP ---
  const columns = [
    {
      key: 'brand',
      title: 'BRAND',
      sortable: true,
      render: (val) => <span className="fw-semibold text-dark">{val || '—'}</span>
    },
    {
      key: 'partName',
      title: 'PART NAME',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="fw-bold text-dark d-block">{val}</span>
          <small className="text-muted font-monospace">{row.partId}</small>
        </div>
      )
    },
    {
      key: 'modelNumber',
      title: 'MODEL NUMBER',
      sortable: true,
      render: (val) => <span className="font-monospace text-dark">{val || '—'}</span>
    },
    {
      key: 'partNumber',
      title: 'PART NUMBER',
      sortable: true,
      render: (val) => <span className="badge bg-light text-primary border font-monospace">{val}</span>
    },
    {
      key: 'price',
      title: 'PRICE (₹)',
      sortable: true,
      align: 'right',
      render: (val) => (
        <span className="font-monospace fw-semibold text-dark">
          ₹{Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      )
    },
    {
      key: 'quantity',
      title: 'QTY',
      sortable: true,
      align: 'center',
      render: (val) => (
        <span className="badge bg-secondary font-monospace fs-6 px-2 py-1">
          {val !== undefined ? val : 0}
        </span>
      )
    },
    {
      key: 'warranty',
      title: 'WARRANTY',
      sortable: true,
      align: 'center',
      render: (val) => <span className="small text-dark font-monospace">{val || '—'}</span>
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

  // --- TABLE ACTIONS (View, Edit, Delete) ---
  const tableActions = (row) => (
    <div className="category-actions-container">
      {/* VIEW BUTTON */}
      <button
        type="button"
        className="category-action-btn view-btn"
        title="View Part Details"
        aria-label={`View ${row.partName}`}
        onClick={() => handleOpenViewModal(row)}
      >
        <Eye size={15} color="#2563EB" />
      </button>

      {/* EDIT BUTTON */}
      <button
        type="button"
        className="category-action-btn edit-btn"
        title="Edit Part"
        aria-label={`Edit ${row.partName}`}
        onClick={() => handleOpenEditModal(row)}
      >
        <Pencil size={15} color="#16A34A" />
      </button>

      {/* DELETE BUTTON */}
      <button
        type="button"
        className="category-action-btn delete-btn"
        title="Delete Part"
        aria-label={`Delete ${row.partName}`}
        onClick={() => handleOpenDeleteModal(row)}
      >
        <Trash2 size={15} color="#DC2626" />
      </button>
    </div>
  );

  return (
    <div className="product-master-page container-fluid px-0 px-md-1">
      <ToastContainer />

      {/* 1. TOP HEADER SECTION */}
      <div className="category-page-header">
        <div className="category-page-title-group">
          <Wrench size={28} style={{ color: '#2E3192' }} />
          <h1 className="category-page-title">Part Master</h1>
        </div>

        <button
          type="button"
          className="category-add-btn"
          onClick={handleOpenAddModal}
        >
          <Plus size={18} />
          <span>Add Part</span>
        </button>
      </div>

      {/* 2. MAIN CARD LIST */}
      <div className="category-card">
        {/* Card Header & Search Box */}
        <div className="category-card-header pb-3 border-bottom">
          <h2 className="category-card-title">Part Register List</h2>

          {/* Search Box */}
          <div className="category-search-wrapper">
            <Search size={16} className="category-search-icon" />
            <input
              type="text"
              className="category-search-input"
              placeholder="Search by Part ID, Name, Model, Part No..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Dropdown Filters Toolbar */}
        <div className="p-3 bg-light border-bottom">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-auto d-flex align-items-center text-muted small me-2">
              <Filter size={15} className="me-1" />
              <span className="fw-semibold">Filters:</span>
            </div>

            {/* Brand Filter */}
            <div className="col-12 col-sm-4 col-md-3">
              <select
                className="form-select form-select-sm"
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
              >
                <option value="">All Brands</option>
                {brandOptions.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
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

            {/* Clear Filters Button */}
            {(brandFilter || statusFilter || searchQuery) && (
              <div className="col-12 col-md-auto ms-auto">
                <button
                  type="button"
                  className="btn btn-sm btn-link text-decoration-none text-danger p-0 fw-semibold"
                  onClick={() => {
                    setBrandFilter('');
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
            data={filteredParts}
            showSerialNumber={true}
            serialNumberHeader="S.No"
            actions={tableActions}
            actionHeader="ACTIONS"
            actionWidth="120px"
            emptyMessage="No part records found matching criteria"
            emptyIcon="bi-wrench"
            paginated={true}
            pageSizeOptions={[10, 25, 50]}
            defaultPageSize={10}
            tableClassName="category-custom-table"
            headerClassName=""
            bordered={false}
            striped={false}
            hover={true}
            minWidth="850px"
          />
        </div>
      </div>

      {/* 3. ADD PART POPUP MODAL */}
      <Modal
        show={isAddModalOpen}
        onHide={() => setIsAddModalOpen(false)}
        title="Add Part"
        size="lg"
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
              onClick={handleAddPartSubmit}
              style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
            >
              Save Part
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAddPartSubmit} noValidate>
          <div className="row g-3">
            {/* PART ID & BRAND */}
            <div className="col-12 col-md-6">
              <InputField
                label="Part ID"
                value={formData.partId}
                onChange={(e) => handleInputChange('partId', e.target.value)}
                placeholder="e.g. PRT-2026-001"
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="Brand"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                placeholder="e.g. Sonoscape, Mindray, GE, Philips"
              />
            </div>

            {/* PART NAME & MODEL NUMBER */}
            <div className="col-12 col-md-6">
              <InputField
                label="Part Name *"
                value={formData.partName}
                onChange={(e) => handleInputChange('partName', e.target.value)}
                placeholder="e.g. Convex Array Transducer Probe"
                error={formErrors.partName}
                required={true}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="Model Number"
                value={formData.modelNumber}
                onChange={(e) => handleInputChange('modelNumber', e.target.value)}
                placeholder="e.g. MOD-3CA-99"
              />
            </div>

            {/* PART NUMBER & PRICE */}
            <div className="col-12 col-md-6">
              <InputField
                label="Part Number *"
                value={formData.partNumber}
                onChange={(e) => handleInputChange('partNumber', e.target.value)}
                placeholder="e.g. PN-99201-C"
                error={formErrors.partNumber}
                required={true}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="Price (₹)"
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="e.g. 125000"
              />
            </div>

            {/* QUANTITY & WARRANTY */}
            <div className="col-12 col-md-6">
              <InputField
                label="Quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                placeholder="e.g. 10"
              />
            </div>

            <div className="col-12 col-md-6">
              <Dropdown
                label="Warranty"
                options={['6 Months', '1 Year', '18 Months', '2 Years', '3 Years']}
                value={formData.warranty}
                onChange={(e) => handleInputChange('warranty', e.target.value)}
              />
            </div>

            {/* DESCRIPTION */}
            <div className="col-12">
              <InputField
                label="Description"
                type="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter detailed technical description of the spare part..."
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* 4. EDIT PART POPUP MODAL */}
      <Modal
        show={isEditModalOpen}
        onHide={() => setIsEditModalOpen(false)}
        title={`Edit Part — ${formData.partId}`}
        size="lg"
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
              onClick={handleEditPartSubmit}
              style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
            >
              Update Part
            </Button>
          </div>
        }
      >
        <form onSubmit={handleEditPartSubmit} noValidate>
          <div className="row g-3">
            {/* PART ID & BRAND */}
            <div className="col-12 col-md-6">
              <InputField
                label="Part ID"
                value={formData.partId}
                disabled={true}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="Brand"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
              />
            </div>

            {/* PART NAME & MODEL NUMBER */}
            <div className="col-12 col-md-6">
              <InputField
                label="Part Name *"
                value={formData.partName}
                onChange={(e) => handleInputChange('partName', e.target.value)}
                error={formErrors.partName}
                required={true}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="Model Number"
                value={formData.modelNumber}
                onChange={(e) => handleInputChange('modelNumber', e.target.value)}
              />
            </div>

            {/* PART NUMBER & PRICE */}
            <div className="col-12 col-md-6">
              <InputField
                label="Part Number *"
                value={formData.partNumber}
                onChange={(e) => handleInputChange('partNumber', e.target.value)}
                error={formErrors.partNumber}
                required={true}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="Price (₹)"
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
              />
            </div>

            {/* QUANTITY & WARRANTY */}
            <div className="col-12 col-md-6">
              <InputField
                label="Quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6">
              <Dropdown
                label="Warranty"
                options={['6 Months', '1 Year', '18 Months', '2 Years', '3 Years']}
                value={formData.warranty}
                onChange={(e) => handleInputChange('warranty', e.target.value)}
              />
            </div>

            {/* DESCRIPTION */}
            <div className="col-12">
              <InputField
                label="Description"
                type="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* 5. VIEW PART POPUP MODAL (EXACT SAME DESIGN AS EDIT POPUP WITH DISABLED FIELDS) */}
      <Modal
        show={isViewModalOpen}
        onHide={() => setIsViewModalOpen(false)}
        title={`View Part Details — ${selectedPart?.partId || ''}`}
        size="lg"
        centered={true}
        footer={
          <div className="d-flex justify-content-end w-100">
            <Button
              variant="outline-secondary"
              onClick={() => setIsViewModalOpen(false)}
            >
              Close
            </Button>
          </div>
        }
      >
        {selectedPart && (
          <div className="row g-3">
            {/* PART ID & BRAND */}
            <div className="col-12 col-md-6">
              <InputField
                label="Part ID"
                value={selectedPart.partId}
                disabled={true}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="Brand"
                value={selectedPart.brand || '—'}
                disabled={true}
              />
            </div>

            {/* PART NAME & MODEL NUMBER */}
            <div className="col-12 col-md-6">
              <InputField
                label="Part Name"
                value={selectedPart.partName || ''}
                disabled={true}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="Model Number"
                value={selectedPart.modelNumber || '—'}
                disabled={true}
              />
            </div>

            {/* PART NUMBER & PRICE */}
            <div className="col-12 col-md-6">
              <InputField
                label="Part Number"
                value={selectedPart.partNumber || '—'}
                disabled={true}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="Price (₹)"
                value={selectedPart.price !== undefined ? String(selectedPart.price) : '0'}
                disabled={true}
              />
            </div>

            {/* QUANTITY & WARRANTY */}
            <div className="col-12 col-md-6">
              <InputField
                label="Quantity"
                value={selectedPart.quantity !== undefined ? String(selectedPart.quantity) : '0'}
                disabled={true}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="Warranty"
                value={selectedPart.warranty || '—'}
                disabled={true}
              />
            </div>

            {/* DESCRIPTION */}
            <div className="col-12">
              <InputField
                label="Description"
                type="textarea"
                rows={3}
                value={selectedPart.description || ''}
                disabled={true}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* 6. DELETE PART CONFIRMATION POPUP MODAL */}
      <Modal
        show={isDeleteModalOpen}
        onHide={() => setIsDeleteModalOpen(false)}
        title="Delete Part"
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
        {selectedPart && (
          <div className="py-2">
            <p className="text-dark fs-6 mb-0">
              Are you sure you want to delete the part &quot;
              <strong className="text-danger">{selectedPart.partName}</strong>&quot; (ID: {selectedPart.partId})?
            </p>
            <span className="text-muted small d-block mt-2">
              This action will permanently remove this part from your register.
            </span>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PartMaster;
