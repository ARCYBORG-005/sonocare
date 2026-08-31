import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Boxes,
  ArrowLeft,
  Pencil,
  Sliders,
  DollarSign,
  History,
  Eye,
  Plus,
  Minus,
  Target
} from 'lucide-react';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { InputField } from '../../components/FormInputs';
import { toast } from '../../components/Toast';
import '../../styles/Inventory.css';

/**
 * View Inventory Item Details & Shift History Workspace
 * Exact same design layout as EditInventory page with disabled read-only fields and Category Page Modal popup
 */
const ViewInventory = ({ inventory = [], setInventory }) => {
  const navigate = useNavigate();
  const { id } = useParams();

  const targetItem = inventory.find((i) => String(i.id) === String(id)) || inventory[0];

  // Shift Modal state inside View Page
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [shiftAction, setShiftAction] = useState('Add');
  const [shiftValue, setShiftValue] = useState('1');
  const [shiftReason, setShiftReason] = useState('Stock adjustment from view desk');

  if (!targetItem) {
    return (
      <div className="p-5 text-center">
        <h4>Inventory Item Not Found</h4>
        <button className="btn btn-primary mt-3" onClick={() => navigate('/inventory')}>
          Cancel
        </button>
      </div>
    );
  }

  const itemType = targetItem?.itemType || 'Product';
  const inventoryId = targetItem?.inventoryId || '';
  const selectedItemName = targetItem?.productName || '';
  const category = targetItem?.category || '';
  const unitPrice = String(targetItem?.unitPrice || 0);
  const totalQuantity = String(targetItem?.totalQuantity || 0);

  const priceVal = Number(unitPrice) || 0;
  const qtyVal = Number(totalQuantity) || 0;
  const totalValuation = priceVal * qtyVal;

  // Stock Shift submission inside View page
  const handleApplyStockShift = (e) => {
    if (e) e.preventDefault();

    const changeVal = Number(shiftValue);
    if (isNaN(changeVal) || changeVal < 0) {
      toast.error('Please enter a valid non-negative number for stock change!');
      return;
    }

    if (!shiftReason.trim()) {
      toast.error('Please provide a reason for stock adjustment!');
      return;
    }

    const prevStock = Number(targetItem.totalQuantity) || 0;
    let newStock = prevStock;

    if (shiftAction === 'Add') newStock = prevStock + changeVal;
    if (shiftAction === 'Subtract') newStock = Math.max(0, prevStock - changeVal);
    if (shiftAction === 'Set') newStock = changeVal;

    let newStatus = 'In Stock';
    if (newStock === 0) newStatus = 'Out of Stock';
    else if (newStock <= 5) newStatus = 'Low Stock';

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

    if (setInventory) {
      setInventory((prev) =>
        prev.map((item) =>
          item.id === targetItem.id
            ? {
                ...item,
                totalQuantity: newStock,
                totalValuation: newStock * priceVal,
                stockStatus: newStatus,
                lastShiftDate: new Date().toISOString().split('T')[0],
                adjustmentHistory: [historyEntry, ...(item.adjustmentHistory || [])]
              }
            : item
        )
      );
    }

    toast.success(`Stock shift applied! New Stock: ${newStock} Units`);
    setIsShiftModalOpen(false);
  };

  // History Columns
  const historyColumns = [
    {
      key: 'date',
      title: 'DATE & TIME',
      sortable: true,
      render: (val) => <span className="small font-monospace text-dark fw-bold">{val}</span>
    },
    {
      key: 'action',
      title: 'ACTION TYPE',
      sortable: true,
      render: (val) => {
        let badgeClass = 'bg-success-subtle text-success border-success';
        if (val.includes('-')) badgeClass = 'bg-danger-subtle text-danger border-danger';
        if (val.includes('=')) badgeClass = 'bg-primary-subtle text-primary border-primary';

        return <span className={`badge border font-monospace px-2 py-1 ${badgeClass}`}>{val}</span>;
      }
    },
    {
      key: 'changedQty',
      title: 'QTY CHANGED',
      sortable: true,
      align: 'center',
      render: (val) => <span className="badge bg-secondary font-monospace fs-6">{val}</span>
    },
    {
      key: 'previousStock',
      title: 'PREVIOUS STOCK',
      sortable: true,
      align: 'center',
      render: (val) => <span className="text-muted font-monospace">{val !== undefined ? `${val} Units` : 'N/A'}</span>
    },
    {
      key: 'newStock',
      title: 'NEW STOCK LEVEL',
      sortable: true,
      align: 'center',
      render: (val) => <span className="badge bg-primary font-monospace fs-6">{val} Units</span>
    },
    {
      key: 'reason',
      title: 'REASON FOR ADJUSTMENT',
      sortable: true,
      render: (val) => <span className="small text-dark">{val}</span>
    },
    {
      key: 'adjustedBy',
      title: 'ADJUSTED BY',
      sortable: true,
      render: (val) => <span className="small text-muted">{val || 'Admin'}</span>
    }
  ];

  return (
    <div className="inventory-master-page">
      {/* HEADER */}
      <div className="inventory-page-header">
        <div className="inventory-title-group">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm me-2 d-inline-flex align-items-center gap-1"
            onClick={() => navigate('/inventory')}
          >
            <ArrowLeft size={16} /> 
          </button>
          <Eye className="category-icon" color="#2E3192" size={26} />
          <div>
            <h4 className="inventory-page-title">View Inventory Item — {targetItem.inventoryId}</h4>
            <p className="inventory-page-subtitle">Read-only inventory record & complete stock adjustment history</p>
          </div>
        </div>

        
      </div>

      {/* 1. VIEW FORM CARD */}
      <div className="inventory-card mb-4">
        <div className="inventory-card-header">
          <h6 className="inventory-card-title">
            <Boxes size={18} color="#2E3192" />
            <span>1. Inventory Details ({itemType})</span>
          </h6>
        </div>

        <div className="p-4">
          <div className="row g-3">
            {/* ITEM TYPE */}
            <div className="col-12 col-md-6">
              <InputField
                label="Product Type"
                value={itemType}
                disabled={true}
              />
            </div>

            {/* INVENTORY ID */}
            <div className="col-12 col-md-6">
              <InputField
                label="Inventory ID"
                value={inventoryId}
                disabled={true}
              />
            </div>

            {/* CATEGORY */}
            <div className="col-12 col-md-6">
              <InputField
                label="Category"
                value={category}
                disabled={true}
              />
            </div>

            {/* ITEM NAME */}
            <div className="col-12 col-md-6">
              <InputField
                label={itemType === 'Product' ? 'Product Name' : 'Kit Name'}
                value={selectedItemName}
                disabled={true}
              />
            </div>

            {/* UNIT PRICE */}
            <div className="col-12 col-md-6">
              <InputField
                label="Unit Price (₹)"
                value={unitPrice}
                disabled={true}
              />
            </div>

            {/* TOTAL QUANTITY */}
            <div className="col-12 col-md-6">
              <InputField
                label="Total Quantity"
                value={totalQuantity}
                disabled={true}
              />
            </div>

            {/* VALUATION DISPLAY STRIP */}
            <div className="col-12">
              <div className="p-3 bg-light rounded border d-flex align-items-center justify-content-between w-100 flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2">
                 
                  <span className="fw-bold text-dark">TOTAL VALUATION (₹):</span>
                </div>
                <span className="fs-5 fw-bold text-success font-monospace ms-auto">
                  ₹{totalValuation.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STOCK ADJUSTMENT HISTORY TABLE */}
      <div className="category-card shadow-sm border mb-4" style={{ borderRadius: '10px' }}>
        <div className="section-card-title-bar">
          <History size={18} color="#2E3192" />
          <span>2. Stock Adjustment History ({targetItem?.adjustmentHistory?.length || 0} Shifts Logged)</span>
        </div>

        <div className="p-3">
          <div className="category-table-wrapper border rounded bg-white">
            <Table
              columns={historyColumns}
              data={targetItem?.adjustmentHistory || []}
              showSerialNumber={true}
              serialNumberHeader="S.No"
              paginated={false}
              tableClassName="category-custom-table"
              bordered={false}
              striped={false}
              hover={true}
              minWidth="750px"
            />
          </div>
        </div>
      </div>

      {/* BOTTOM BUTTON BAR */}
      <div className="d-flex justify-content-end gap-3 mb-5">
        <button
          type="button"
          className="btn btn-outline-secondary px-4 fw-semibold"
          onClick={() => navigate('/inventory')}
        >
          Back
        </button>

       
      </div>

      {/* SHIFT MODAL INSIDE VIEW (MATCHING ADD CATEGORY MODAL DESIGN) */}
      <Modal
        show={isShiftModalOpen}
        onHide={() => setIsShiftModalOpen(false)}
        title={`Stock Level Shift — ${targetItem.inventoryId}`}
        size="md"
        centered={true}
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            <Button
              variant="outline-secondary"
              onClick={() => setIsShiftModalOpen(false)}
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
        <form onSubmit={handleApplyStockShift} noValidate>
          <div className="row g-3">
            {/* INVENTORY ID */}
            <div className="col-12 col-md-6">
              <InputField
                label="Inventory ID"
                value={targetItem.inventoryId}
                disabled={true}
              />
            </div>

            {/* CURRENT LEVEL IN HAND */}
            <div className="col-12 col-md-6">
              <InputField
                label="Current Level in Hand"
                value={`${targetItem.totalQuantity} Units`}
                disabled={true}
              />
            </div>

            {/* PRODUCT / KIT NAME */}
            <div className="col-12">
              <InputField
                label="Product / Kit Name"
                value={targetItem.productName}
                disabled={true}
              />
            </div>

            {/* CHOOSE ACTION */}
            <div className="col-12">
              <label className="sonocare-label mb-2">Choose Action</label>
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
                label="Enter Value to Change Stock *"
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
      </Modal>
    </div>
  );
};

export default ViewInventory;
