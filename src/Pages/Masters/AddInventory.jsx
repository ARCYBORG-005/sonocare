import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Boxes,
  Package,
  ArrowLeft,
  CheckCircle2,
  Save,
  DollarSign,
  Layers,
  History,
  Info
} from 'lucide-react';
import Table from '../../components/Table';
import { InputField, Dropdown } from '../../components/FormInputs';
import { toast } from '../../components/Toast';
import { initialMockProducts } from './mockProducts';
import { initialMockKits } from './mockKits';
import '../../styles/Inventory.css';

/**
 * Add Inventory Item Workspace
 * Supports creating inventory entries for Products and Kits with auto-calculated valuation and initial stock history
 */
const AddInventory = ({ inventory = [], setInventory, products = [], kits = [] }) => {
  const navigate = useNavigate();

  const productListSource = products && products.length > 0 ? products : initialMockProducts;
  const kitListSource = kits && kits.length > 0 ? kits : initialMockKits;

  // Form State
  const [itemType, setItemType] = useState('Product'); // 'Product' | 'Kit'
  const [inventoryId, setInventoryId] = useState('INV-PRD-005');
  const [selectedItemName, setSelectedItemName] = useState('');
  const [category, setCategory] = useState('Medical & Diagnostic Scanners');
  const [unitPrice, setUnitPrice] = useState('5000000');
  const [totalQuantity, setTotalQuantity] = useState('10');
  const [remarks, setRemarks] = useState('Initial stock batch entry');

  // Sync default options on type change
  useEffect(() => {
    if (itemType === 'Product') {
      const defaultProd = productListSource[0];
      setInventoryId(`INV-PRD-${String(Math.floor(100 + Math.random() * 900))}`);
      setSelectedItemName(defaultProd?.productName || 'Sonoscape X5 Portable Ultrasound System');
      setUnitPrice(String(defaultProd?.unitPrice || 5000000));
      setCategory(defaultProd?.category || 'Medical & Diagnostic Scanners');
    } else {
      const defaultKit = kitListSource[0];
      setInventoryId(`INV-KIT-${String(Math.floor(100 + Math.random() * 900))}`);
      setSelectedItemName(defaultKit?.kitName || 'Sonoscape X5 Standard Transducer & Trolley Kit');
      setUnitPrice(String(defaultKit?.kitPrice || 135000));
      setCategory(defaultKit?.category || 'Ultrasound Transducers & Accessories');
    }
  }, [itemType, productListSource, kitListSource]);

  // Handle Product / Kit Item selection from dropdown
  const handleItemSelectChange = (name) => {
    setSelectedItemName(name);
    if (itemType === 'Product') {
      const matched = productListSource.find((p) => p.productName === name);
      if (matched) {
        setUnitPrice(String(matched.unitPrice || 5000000));
        setCategory(matched.category || 'Medical & Diagnostic Scanners');
      }
    } else {
      const matched = kitListSource.find((k) => k.kitName === name);
      if (matched) {
        setUnitPrice(String(matched.kitPrice || 135000));
        setCategory(matched.category || 'Ultrasound Transducers & Accessories');
      }
    }
  };

  // Total Valuation Calculation
  const priceVal = Number(unitPrice) || 0;
  const qtyVal = Number(totalQuantity) || 0;
  const totalValuation = priceVal * qtyVal;

  // Initial Stock Adjustment History Log preview
  const initialHistory = [
    {
      id: 1,
      date: new Date().toLocaleString(),
      action: 'Initial Add ',
      changedQty: qtyVal,
      previousStock: 0,
      newStock: qtyVal,
      reason: remarks || 'Initial inventory onboarding',
      adjustedBy: 'Operations Admin'
    }
  ];

  // History table columns
  const historyColumns = [
    {
      key: 'date',
      title: 'DATE & TIME',
      sortable: true,
      render: (val) => <span className="small font-monospace">{val}</span>
    },
    {
      key: 'action',
      title: 'ACTION TYPE',
      sortable: true,
      render: (val) => <span className="badge bg-success-subtle text-success border border-success px-2 py-1">{val}</span>
    },
    {
      key: 'changedQty',
      title: 'QTY CHANGED',
      sortable: true,
      align: 'center',
      render: (val) => <span className="badge bg-secondary font-monospace">{val}</span>
    },
    {
      key: 'newStock',
      title: 'NEW STOCK LEVEL',
      sortable: true,
      align: 'center',
      render: (val) => <span className="badge bg-primary font-monospace">{val} Units</span>
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
      render: (val) => <span className="small text-muted">{val}</span>
    }
  ];

  // Save submit handler
  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    if (!inventoryId.trim()) {
      toast.error('Please enter a valid Inventory ID!');
      return;
    }

    if (!selectedItemName.trim()) {
      toast.error('Please select or enter an Item Name!');
      return;
    }

    let stockStatus = 'In Stock';
    if (qtyVal === 0) stockStatus = 'Out of Stock';
    else if (qtyVal <= 5) stockStatus = 'Low Stock';

    const newItem = {
      id: Date.now(),
      inventoryId: inventoryId.trim(),
      itemType: itemType,
      productName: selectedItemName,
      unitPrice: priceVal,
      totalQuantity: qtyVal,
      totalValuation: totalValuation,
      stockStatus: stockStatus,
      category: category,
      lastShiftDate: new Date().toISOString().split('T')[0],
      adjustmentHistory: initialHistory
    };

    if (setInventory) {
      setInventory((prev) => [newItem, ...prev]);
    }

    toast.success(`Inventory Item "${inventoryId}" created successfully!`);
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
          <Boxes className="category-icon" color="#2E3192" size={26} />
          <div>
            <h4 className="inventory-page-title">Add New Inventory Item</h4>
            <p className="inventory-page-subtitle">Create stock record for Product or Kit with automated valuation</p>
          </div>
        </div>
      </div>

      {/* FORM CARD */}
      <form onSubmit={handleSubmit}>
        <div className="inventory-card mb-6">
          <div className="inventory-card-header">
            <h6 className="inventory-card-title">
              <Boxes size={18} color="#2E3192" />
              <span>1. Basic Inventory Details & Type Selection</span>
            </h6>
          </div>

          <div className="p-4">
            <div className="row g-3">
              {/* ITEM TYPE SELECTION */}
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
                  placeholder="e.g. INV-PRD-001 or INV-KIT-001"
                  required={true}
                />
              </div>

              {/* CATEGORY */}
              <div className="col-12 col-md-6">
                <InputField
                  label="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Medical & Diagnostic Scanners"
                />
              </div>

              {/* PRODUCT / KIT NAME DROPDOWN */}
              <div className="col-12 col-md-6">
                {itemType === 'Product' ? (
                  <Dropdown
                    label="Product Name "
                    options={productListSource.map((p) => p.productName)}
                    value={selectedItemName}
                    onChange={(e) => handleItemSelectChange(e.target.value)}
                    required={true}
                  />
                ) : (
                  <Dropdown
                    label="Kit Name "
                    options={kitListSource.map((k) => k.kitName)}
                    value={selectedItemName}
                    onChange={(e) => handleItemSelectChange(e.target.value)}
                    required={true}
                  />
                )}
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
              {/* REMARKS / INITIAL REASON */}
              <div className="col-12">
                <InputField
                  label="Initial Stock Onboarding Remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Notes on initial stock batch..."
                />
              </div>

              {/* AUTO-CALCULATED TOTAL VALUATION STRIP */}
              <div className="col-12">
                <div className="p-3 bg-light rounded border d-flex align-items-center justify-content-between w-100 flex-wrap gap-2">
                  <div className="d-flex align-items-center gap-2">
                  
                    <span className="fw-bold text-dark">TOTAL STOCK VALUATION (₹):</span>
                  </div>
                  <span className="fs-5 fw-bold text-success font-monospace ms-auto">
                    ₹{totalValuation.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* INITIAL STOCK ADJUSTMENT HISTORY TABLE */}
        <div className="category-card shadow-sm border mb-4" style={{ borderRadius: '10px' }}>
          <div className="section-card-title-bar">
            <History size={18} color="#2E3192" />
            <span>2. Stock Adjustment History</span>
          </div>

          <div className="p-3">
            <div className="category-table-wrapper border rounded bg-white">
              <Table
                columns={historyColumns}
                data={initialHistory}
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

        {/* SUBMIT BUTTON BAR */}
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
            <span>Save Inventory Item</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddInventory;
