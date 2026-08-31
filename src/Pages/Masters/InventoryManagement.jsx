import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { InputField } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import {
  Boxes,
  Package,
  Plus,
  Minus,
  Target,
  Search,
  Eye,
  Pencil,
  Sliders,
  Filter
} from 'lucide-react';
import '../../styles/Category.css';
import '../../styles/Product.css';
import '../../styles/Inventory.css';

/**
 * Inventory Management Workspace
 * Displays Inventory Register for Products & Kits with Stock Adjustment Modal matching Category Page Modal design
 */
const InventoryManagement = ({ inventory = [], setInventory }) => {
  const navigate = useNavigate();

  // --- FILTER STATES ---
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All'); // 'All' | 'Product' | 'Kit'
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'In Stock' | 'Low Stock' | 'Out of Stock'

  // --- STOCK SHIFT MODAL STATE ---
  const [selectedShiftItem, setSelectedShiftItem] = useState(null);
  const [shiftAction, setShiftAction] = useState('Add'); // 'Add' | 'Subtract' | 'Set'
  const [shiftValue, setShiftValue] = useState('');
  const [shiftReason, setShiftReason] = useState('');

  // --- FILTERED DATA ---
  const filteredInventory = useMemo(() => {
    return (inventory || []).filter((item) => {
      // 1. Search Query Filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchId = item.inventoryId && item.inventoryId.toLowerCase().includes(q);
        const matchName = item.productName && item.productName.toLowerCase().includes(q);
        const matchCat = item.category && item.category.toLowerCase().includes(q);

        if (!matchId && !matchName && !matchCat) {
          return false;
        }
      }

      // 2. Item Type Filter
      if (typeFilter !== 'All' && item.itemType !== typeFilter) {
        return false;
      }

      // 3. Stock Level Status Filter
      if (statusFilter !== 'All' && item.stockStatus !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [inventory, searchTerm, typeFilter, statusFilter]);

  // Open Stock Shift Modal handler
  const handleOpenShiftModal = (item) => {
    setSelectedShiftItem(item);
    setShiftAction('Add');
    setShiftValue('1');
    setShiftReason('Stock replenishment batch');
  };

  // Close Stock Shift Modal handler
  const handleCloseShiftModal = () => {
    setSelectedShiftItem(null);
    setShiftValue('');
    setShiftReason('');
  };

  // Apply Stock Shift submit handler
  const handleApplyStockShift = (e) => {
    if (e) e.preventDefault();
    if (!selectedShiftItem) return;

    const changeVal = Number(shiftValue);
    if (isNaN(changeVal) || changeVal < 0) {
      toast.error('Please enter a valid non-negative number for stock change!');
      return;
    }

    if (!shiftReason.trim()) {
      toast.error('Please provide a reason for stock adjustment!');
      return;
    }

    const prevStock = Number(selectedShiftItem.totalQuantity) || 0;
    let newStock = prevStock;

    if (shiftAction === 'Add') {
      newStock = prevStock + changeVal;
    } else if (shiftAction === 'Subtract') {
      newStock = Math.max(0, prevStock - changeVal);
    } else if (shiftAction === 'Set') {
      newStock = changeVal;
    }

    // Determine updated Stock Status
    let newStatus = 'In Stock';
    if (newStock === 0) {
      newStatus = 'Out of Stock';
    } else if (newStock <= 5) {
      newStatus = 'Low Stock';
    }

    const unitPrice = Number(selectedShiftItem.unitPrice) || 0;
    const newValuation = newStock * unitPrice;

    // Create adjustment history log entry
    const historyEntry = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      action: `${shiftAction} (${shiftAction === 'Add' ? '+' : shiftAction === 'Subtract' ? '-' : '='})`,
      changedQty: changeVal,
      previousStock: prevStock,
      newStock: newStock,
      reason: shiftReason,
      adjustedBy: 'Operations Administrator'
    };

    // Update global state
    if (setInventory) {
      setInventory((prev) =>
        prev.map((item) =>
          item.id === selectedShiftItem.id
            ? {
                ...item,
                totalQuantity: newStock,
                totalValuation: newValuation,
                stockStatus: newStatus,
                lastShiftDate: new Date().toISOString().split('T')[0],
                adjustmentHistory: [historyEntry, ...(item.adjustmentHistory || [])]
              }
            : item
        )
      );
    }

    toast.success(`Stock level shifted successfully for ${selectedShiftItem.inventoryId}! New Stock: ${newStock}`);
    handleCloseShiftModal();
  };

  // --- TABLE COLUMNS CONFIGURATION ---
  const columns = [
    {
      key: 'inventoryId',
      title: 'INVENTORY ID',
      sortable: true,
      render: (val) => <span className="badge bg-secondary font-monospace">{val}</span>
    },
    {
      key: 'itemType',
      title: 'ITEM TYPE',
      sortable: true,
      render: (val) => (
        <span className={`inventory-type-badge ${val === 'Product' ? 'product' : 'kit'}`}>
          {val === 'Product' ? (
            <>
              <Package size={14} /> Product
            </>
          ) : (
            <>
              <Boxes size={14} /> Kit
            </>
          )}
        </span>
      )
    },
    {
      key: 'productName',
      title: 'PRODUCT / KIT NAME',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="fw-bold text-dark d-block">{val}</span>
          <small className="text-muted">{row.category || 'General Category'}</small>
        </div>
      )
    },
    {
      key: 'unitPrice',
      title: 'UNIT PRICE (₹)',
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-monospace fw-semibold">₹{Number(val || 0).toLocaleString('en-IN')}</span>
    },
    {
      key: 'totalQuantity',
      title: 'TOTAL STOCK',
      sortable: true,
      align: 'center',
      render: (val) => (
        <span className="badge bg-secondary font-monospace fs-6 px-3 py-1">
          {val} Units
        </span>
      )
    },
    {
      key: 'stockStatus',
      title: 'STOCK LEVEL',
      sortable: true,
      align: 'center',
      render: (val) => {
        let statusClass = 'in-stock';
        if (val === 'Low Stock') statusClass = 'low-stock';
        if (val === 'Out of Stock') statusClass = 'out-of-stock';

        return <span className={`inventory-status-pill ${statusClass}`}>{val}</span>;
      }
    },
    {
      key: 'totalValuation',
      title: 'TOTAL VALUATION (₹)',
      sortable: true,
      align: 'right',
      render: (val) => (
        <span className="font-monospace fw-bold text-dark">
          ₹{Number(val || 0).toLocaleString('en-IN')}
        </span>
      )
    }
  ];

  // --- TABLE ACTIONS (View, Edit, Level Icon) ---
  const tableActions = (row) => (
    <div className="category-actions-container">
      {/* VIEW ICON */}
      <button
        type="button"
        className="category-action-btn view-btn"
        title="View Item Details & History"
        aria-label={`View ${row.productName}`}
        onClick={() => navigate(`/inventory/view/${row.id}`)}
      >
        <Eye size={15} color="#2563EB" />
      </button>

      {/* EDIT ICON */}
      <button
        type="button"
        className="category-action-btn edit-btn"
        title="Edit Inventory Item"
        aria-label={`Edit ${row.productName}`}
        onClick={() => navigate(`/inventory/edit/${row.id}`)}
      >
        <Pencil size={15} color="#16A34A" />
      </button>

      {/* LEVEL / STOCK SHIFT ICON */}
      <button
        type="button"
        className="category-action-btn edit-btn"
        style={{ color: '#7C3AED', backgroundColor: '#F5F3FF', borderColor: '#DDD6FE' }}
        title="Stock Adjustment Shift (Level Icon)"
        aria-label={`Shift Stock ${row.productName}`}
        onClick={() => handleOpenShiftModal(row)}
      >
        <Sliders size={15} />
      </button>
    </div>
  );

  return (
    <div className="product-master-page container-fluid px-0 px-md-1">
      <Helmet>
        <title>Inventory Master | Sonocare CRM</title>
        <meta name="description" content="Manage organization stock register, product and kit levels in Sonocare CRM." />
      </Helmet>
      <ToastContainer />

      {/* 1. TOP HEADER SECTION */}
      <div className="category-page-header">
        <div className="category-page-title-group">
          <Boxes size={28} style={{ color: '#2E3192' }} />
          <h1 className="category-page-title">Inventory Master</h1>
        </div>

        <button
          type="button"
          className="category-add-btn"
          onClick={() => navigate('/inventory/add')}
        >
          <Plus size={18} />
          <span>Add Inventory Item</span>
        </button>
      </div>

      {/* 2. MAIN CARD CONTAINER */}
      <div className="category-card">
        {/* Card Header & Search Box */}
        <div className="category-card-header pb-3 border-bottom">
          <h2 className="category-card-title">Inventory Register List</h2>

          {/* Search Box */}
          <div className="category-search-wrapper">
            <Search size={16} className="category-search-icon" />
            <input
              type="text"
              className="category-search-input"
              placeholder="Search by Inventory ID, Name, Category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

            {/* Item Type Filter */}
            <div className="col-12 col-sm-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="All">All Item Types</option>
                <option value="Product">Product</option>
                <option value="Kit">Kit</option>
              </select>
            </div>

            {/* Stock Level Status Filter */}
            <div className="col-12 col-sm-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Stock Levels</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>

            {(typeFilter !== 'All' || statusFilter !== 'All' || searchTerm) && (
              <div className="col-12 col-md-auto ms-auto">
                <button
                  type="button"
                  className="btn btn-sm btn-link text-decoration-none text-danger p-0 fw-semibold"
                  onClick={() => {
                    setTypeFilter('All');
                    setStatusFilter('All');
                    setSearchTerm('');
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
            data={filteredInventory}
            showSerialNumber={true}
            serialNumberHeader="S.No"
            actions={tableActions}
            actionHeader="ACTIONS"
            actionWidth="130px"
            emptyMessage="No inventory records found"
            emptyIcon="bi-box-seam"
            paginated={true}
            pageSizeOptions={[25, 50, 100]}
            defaultPageSize={25}
            tableClassName="category-custom-table"
            headerClassName=""
            bordered={false}
            striped={false}
            hover={true}
            minWidth="950px"
          />
        </div>
      </div>

      {/* 3. LEVEL ICON — STOCK ADJUSTMENT SHIFT MODAL (EXACT POPUP DESIGN MATCHING ADD CATEGORY PAGE) */}
      <Modal
        show={Boolean(selectedShiftItem)}
        onHide={handleCloseShiftModal}
        title={`Stock Level Shift — ${selectedShiftItem?.inventoryId || ''}`}
        size="md"
        centered={true}
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            <Button
              variant="outline-secondary"
              onClick={handleCloseShiftModal}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleApplyStockShift}
              style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
            >
              Apply Stock Shift
            </Button>
          </div>
        }
      >
        {selectedShiftItem && (
          <form onSubmit={handleApplyStockShift} noValidate>
            <div className="row g-3">
              {/* INVENTORY ID */}
              <div className="col-12 col-md-6">
                <InputField
                  label="Inventory ID"
                  value={selectedShiftItem.inventoryId}
                  disabled={true}
                />
              </div>

              {/* CURRENT LEVEL IN HAND */}
              <div className="col-12 col-md-6">
                <InputField
                  label="Current Level in Hand"
                  value={`${selectedShiftItem.totalQuantity} Units`}
                  disabled={true}
                />
              </div>

              {/* PRODUCT / KIT NAME */}
              <div className="col-12">
                <InputField
                  label="Product / Kit Name"
                  value={selectedShiftItem.productName}
                  disabled={true}
                />
              </div>

              {/* CHOOSE ACTION (ADD, SUBTRACT, SET) */}
              <div className="col-12">
                <label className="sonocare-label mb-2">Choose Action *</label>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className={`btn btn-sm flex-fill fw-bold d-inline-flex align-items-center justify-content-center gap-1 ${shiftAction === 'Add' ? 'btn-success' : 'btn-outline-success'}`}
                    onClick={() => setShiftAction('Add')}
                  >
                    <Plus size={14} /> Add 
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm flex-fill fw-bold d-inline-flex align-items-center justify-content-center gap-1 ${shiftAction === 'Subtract' ? 'btn-danger' : 'btn-outline-danger'}`}
                    onClick={() => setShiftAction('Subtract')}
                  >
                    <Minus size={14} /> Subtract 
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm flex-fill fw-bold d-inline-flex align-items-center justify-content-center gap-1 ${shiftAction === 'Set' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setShiftAction('Set')}
                  >
                    <Target size={14} /> Set 
                  </button>
                </div>
              </div>

              {/* ENTER VALUE TO CHANGE STOCK */}
              <div className="col-12">
                <InputField
                  label="Enter Value to Change Stock "
                  type="number"
                  min="0"
                  value={shiftValue}
                  onChange={(e) => setShiftValue(e.target.value)}
                  placeholder="e.g. 5"
                  required={true}
                />
              </div>

              {/* REASON FOR ADJUSTMENT */}
              <div className="col-12">
                <InputField
                  label="Reason for Adjustment "
                  type="textarea"
                  rows={2}
                  value={shiftReason}
                  onChange={(e) => setShiftReason(e.target.value)}
                  placeholder="e.g. Received shipment, Physical audit shift, Damaged unit removal..."
                  required={true}
                />
              </div>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default InventoryManagement;
