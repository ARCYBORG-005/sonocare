import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Boxes,
  ArrowLeft,
  Save,
  DollarSign,
  History,
  Pencil
} from 'lucide-react';
import Table from '../../components/Table';
import { InputField, Dropdown } from '../../components/FormInputs';
import { toast } from '../../components/Toast';
import { initialMockProducts } from './mockProducts';
import { initialMockKits } from './mockKits';
import '../../styles/Inventory.css';

/**
 * Edit Inventory Item Workspace
 * Allows editing product/kit inventory properties and inspecting full stock shift history
 */
const EditInventory = ({ inventory = [], setInventory, products = [], kits = [] }) => {
  const navigate = useNavigate();
  const { id } = useParams();

  const targetItem = inventory.find((i) => String(i.id) === String(id)) || inventory[0];

  // Form State initialized from target item
  const [itemType, setItemType] = useState(targetItem?.itemType || 'Product');
  const [inventoryId, setInventoryId] = useState(targetItem?.inventoryId || '');
  const [selectedItemName, setSelectedItemName] = useState(targetItem?.productName || '');
  const [category, setCategory] = useState(targetItem?.category || '');
  const [unitPrice, setUnitPrice] = useState(String(targetItem?.unitPrice || 0));
  const [totalQuantity, setTotalQuantity] = useState(String(targetItem?.totalQuantity || 0));

  useEffect(() => {
    if (targetItem) {
      setItemType(targetItem.itemType || 'Product');
      setInventoryId(targetItem.inventoryId || '');
      setSelectedItemName(targetItem.productName || '');
      setCategory(targetItem.category || '');
      setUnitPrice(String(targetItem.unitPrice || 0));
      setTotalQuantity(String(targetItem.totalQuantity || 0));
    }
  }, [targetItem]);

  // Calculations
  const priceVal = Number(unitPrice) || 0;
  const qtyVal = Number(totalQuantity) || 0;
  const totalValuation = priceVal * qtyVal;

  // History table columns
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

  // Save Submit handler
  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    if (!inventoryId.trim()) {
      toast.error('Please enter a valid Inventory ID!');
      return;
    }

    let stockStatus = 'In Stock';
    if (qtyVal === 0) stockStatus = 'Out of Stock';
    else if (qtyVal <= 5) stockStatus = 'Low Stock';

    if (setInventory) {
      setInventory((prev) =>
        prev.map((item) =>
          String(item.id) === String(targetItem.id)
            ? {
                ...item,
                inventoryId: inventoryId.trim(),
                itemType: itemType,
                productName: selectedItemName,
                unitPrice: priceVal,
                totalQuantity: qtyVal,
                totalValuation: totalValuation,
                stockStatus: stockStatus,
                category: category
              }
            : item
        )
      );
    }

    toast.success(`Inventory record for "${inventoryId}" updated successfully!`);
    setTimeout(() => {
      navigate('/inventory');
    }, 600);
  };

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
            <ArrowLeft size={16} /> Back
          </button>
          <Pencil className="category-icon" color="#2E3192" size={26} />
          <div>
            <h4 className="inventory-page-title">Edit Inventory Item — {targetItem?.inventoryId}</h4>
            <p className="inventory-page-subtitle">Update stock pricing, quantity, and view shift history log</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* EDIT FORM CARD */}
        <div className="inventory-card mb-4">
          <div className="inventory-card-header">
            <h6 className="inventory-card-title">
              <Boxes size={18} color="#2E3192" />
              <span>1. Edit Inventory Details ({itemType})</span>
            </h6>
          </div>

          <div className="p-4">
            <div className="row g-3">
              {/* ITEM TYPE */}
              <div className="col-12 col-md-6">
                <Dropdown
                  label="Product Type "
                  options={['Product', 'Kit']}
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value)}
                  required={true}
                />
              </div>

              {/* INVENTORY ID */}
              <div className="col-12 col-md-6">
                <InputField
                  label="Inventory ID "
                  value={inventoryId}
                  onChange={(e) => setInventoryId(e.target.value)}
                  required={true}
                />
              </div>

              {/* CATEGORY */}
              <div className="col-12 col-md-6">
                <InputField
                  label="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              {/* ITEM NAME */}
              <div className="col-12 col-md-6">
                <InputField
                  label={itemType === 'Product' ? 'Product Name ' : 'Kit Name '}
                  value={selectedItemName}
                  onChange={(e) => setSelectedItemName(e.target.value)}
                  required={true}
                />
              </div>

              {/* UNIT PRICE */}
              <div className="col-12 col-md-6">
                <InputField
                  label="Unit Price (₹) "
                  type="number"
                  min="0"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  required={true}
                />
              </div>

              {/* TOTAL QUANTITY */}
              <div className="col-12 col-md-6">
                <InputField
                  label="Total Quantity "
                  type="number"
                  min="0"
                  value={totalQuantity}
                  onChange={(e) => setTotalQuantity(e.target.value)}
                  required={true}
                />
              </div>

              {/* VALUATION DISPLAY STRIP */}
              <div className="col-12">
                <div className="p-3 bg-light rounded border d-flex align-items-center justify-content-between w-100 flex-wrap gap-2">
                  <div className="d-flex align-items-center gap-2">
                    <DollarSign color="#10B981" size={20} />
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

        {/* STOCK ADJUSTMENT HISTORY TABLE */}
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

        {/* BUTTON BAR */}
        <div className="d-flex justify-content-end gap-3 mb-5">
          <button
            type="button"
            className="btn btn-outline-secondary px-4 fw-semibold"
            onClick={() => navigate('/inventory')}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn btn-primary px-5 fw-bold shadow-sm d-inline-flex align-items-center gap-2"
            style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
          >
            <Save size={18} />
            <span>Update Record</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditInventory;
