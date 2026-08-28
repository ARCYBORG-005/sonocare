import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import { InputField, Dropdown, MultiSelect } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import {
  Package,
  FileText,
  User,
  PackageCheck,
  CreditCard,
  History,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowLeft,
  Key,
  Save,
  Receipt,
  Boxes,
  Pencil,
  Trash2,
  Check
} from 'lucide-react';
import { initialMockKits } from '../Masters/mockKits';
import '../../styles/Category.css';
import '../../styles/Product.css';
import '../../styles/Lead.css';
import './OrderFulfilment.css';

/**
 * KitGeneration Component
 * Dedicated workspace for managing Kit Selection & License Details
 * directly linked to the PI Version Management record and Kits Master.
 * Features Configured Kits Table with Edit/Delete actions and a single Add Kit card workflow.
 */
const KitGeneration = ({ pis = [], setPIs, leads = [], kits = initialMockKits }) => {
  const { id } = useParams(); // URL parameter (PI Number, e.g., PI-2026-003-V1)
  const navigate = useNavigate();

  // Find target PI from state
  const targetPI = useMemo(() => {
    if (!id) return pis[0] || null;
    const decoded = decodeURIComponent(id);
    return (pis || []).find((p) => p.piNumber === decoded || String(p.id) === decoded) || pis[0] || null;
  }, [id, pis]);

  // Target Lead linked to PI
  const targetLead = useMemo(() => {
    if (!targetPI) return null;
    return (leads || []).find((l) => l.leadId === targetPI.leadId) || null;
  }, [targetPI, leads]);

  // Products/Line Items loaded directly from selected PI
  const initialLineItems = useMemo(() => {
    if (targetPI && targetPI.lineItems && targetPI.lineItems.length > 0) {
      return targetPI.lineItems;
    }
    return [
      {
        id: 1,
        category: 'Ultrasound System',
        productName: 'Sonoscape X5 Portable Ultrasound System',
        specifications: '3D/4D Color Doppler, 2 Probes included',
        quantity: 2,
        unitPrice: 5000000,
        discount: 0,
        lineTotal: 10000000
      }
    ];
  }, [targetPI]);

  // Categories extracted from Kits Master
  const masterCategories = useMemo(() => {
    const kitList = (kits && kits.length > 0) ? kits : initialMockKits;
    const cats = Array.from(new Set(kitList.map((k) => k.category).filter(Boolean)));
    return cats.length > 0 ? cats : ['Ultrasound System', 'Medical & Diagnostic Scanners', 'Tooling & Accessories'];
  }, [kits]);

  // Product-Level License State per product (pKey)
  const [productLicenses, setProductLicenses] = useState({});

  // Product-Level Selected Kits MultiSelect state per product (pKey)
  const [selectedKitsMap, setSelectedKitsMap] = useState({});

  // Initialize state per product row
  useEffect(() => {
    const licensesMap = {};
    const kitsMap = {};

    initialLineItems.forEach((item, index) => {
      const pKey = item.id || index;
      licensesMap[pKey] = {
        licenseRequired: 'Yes',
        licenseType: 'Permanent Software Key',
        licenseKey: `LIC-SONO-${String(Math.floor(1000 + Math.random() * 9000))}-PROD`,
        licenseStartDate: new Date().toISOString().split('T')[0],
        licenseExpiryDate: '2027-08-26',
        licenseStatus: 'Generated',
        licenseRemarks: 'Standard 1-Year software license key active.'
      };

      kitsMap[pKey] = [
        'Sonoscape X5 Standard Transducer & Trolley Kit'
      ];
    });

    setProductLicenses(licensesMap);
    setSelectedKitsMap(kitsMap);
  }, [initialLineItems]);

  // Section 4 Payment Details State (Manually Entered)
  const [paymentReceived, setPaymentReceived] = useState('Yes'); // 'Yes' | 'No'
  const [paymentStatus, setPaymentStatus] = useState('Partial');
  const [amountPaid, setAmountPaid] = useState('5000000');
  const [proofFileName, setProofFileName] = useState('NEFT_Receipt_50L.pdf');
  const [operationsRemarks, setOperationsRemarks] = useState('');

  // Transaction History Modal State
  const [isTxnModalOpen, setIsTxnModalOpen] = useState(false);

  // Total Order Value calculations
  const totalOrderValue = Number(targetPI?.totalOrderValue || 11800000);
  const paidVal = paymentReceived === 'No' ? 0 : (Number(amountPaid) || 0);
  const remainingVal = Math.max(0, totalOrderValue - paidVal);

  // Save Kit Details & Fulfilment Handler
  const handleSaveFulfilment = (e) => {
    if (e) e.preventDefault();

    if (setPIs && targetPI) {
      setPIs((prev) =>
        prev.map((p) =>
          p.id === targetPI.id
            ? {
                ...p,
                kitFulfilmentData: {
                  selectedKitsMap,
                  productLicenses,
                  paymentStatus,
                  amountPaid: paidVal,
                  amountRemaining: remainingVal,
                  savedAt: new Date().toLocaleString()
                }
              }
            : p
        )
      );
    }

    toast.success(`Kit Details saved successfully for ${targetPI?.piNumber || 'PI'}!`);
    setTimeout(() => {
      navigate('/order-fulfilment');
    }, 800);
  };

  // Service Type & Subscription Type from target PI
  const serviceType = targetPI?.serviceType || 'One Time + AMC';
  const subscriptionType = targetPI?.subscriptionType || 'Monthly';
  const isSubscription = serviceType === 'Subscription';

  // Table Columns for Section 3 Product & Price Details (Matching Configured Kits Table Design)
  const productPriceColumns = useMemo(() => [
    {
      key: 'category',
      title: 'CATEGORY',
      sortable: true,
      render: (val) => <span className="category-name-text">{val || 'System'}</span>
    },
    {
      key: 'productName',
      title: 'PRODUCT & SPECIFICATIONS',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="fw-bold text-dark d-block">{val}</span>
          <span className="small text-muted">{row.specifications}</span>
        </div>
      )
    },
    {
      key: 'quantity',
      title: isSubscription ? 'NO. OF CYCLES' : 'QTY',
      sortable: true,
      align: 'center',
      render: (val) => <span className="badge bg-secondary font-monospace fs-6">{val || 1}</span>
    },
    {
      key: 'unitPrice',
      title: isSubscription ? '1 CYCLE PRICE (₹)' : 'UNIT PRICE (₹)',
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-monospace">₹{Number(val || 0).toLocaleString()}</span>
    },
    {
      key: 'lineTotal',
      title: 'LINE TOTAL (₹)',
      sortable: true,
      align: 'right',
      render: (val) => <span className="fw-bold text-dark font-monospace">₹{Number(val || 0).toLocaleString()}</span>
    }
  ], [isSubscription]);



  // Columns for Section 5 Transaction Details Table inside Modal
  const txnModalColumns = [
    {
      key: 'id',
      title: 'TRANSACTION ID',
      sortable: true,
      render: (val) => <span className="badge bg-secondary font-monospace">{val}</span>
    },
    {
      key: 'date',
      title: 'DATE',
      sortable: true,
      render: (val) => <span className="font-monospace">{val}</span>
    },
    {
      key: 'paymentMethod',
      title: 'PAYMENT METHOD',
      sortable: true,
      render: (val) => <span className="badge bg-light text-dark border">{val}</span>
    },
    {
      key: 'paidAmount',
      title: 'PAID AMOUNT (₹)',
      sortable: true,
      align: 'right',
      render: (val) => <span className="fw-bold text-success font-monospace">₹{Number(val || 0).toLocaleString()}</span>
    },
    {
      key: 'remainingBalance',
      title: 'REMAINING BALANCE (₹)',
      sortable: true,
      align: 'right',
      render: (val) => <span className="fw-bold text-danger font-monospace">₹{Number(val || 0).toLocaleString()}</span>
    },
    {
      key: 'proofFileName',
      title: 'PROOF FILE',
      sortable: false,
      render: (val) => (
        <span className="small text-primary font-monospace d-inline-flex align-items-center">
          <FileText size={13} className="me-1" />
          {val || 'Receipt.pdf'}
        </span>
      )
    }
  ];

  return (
    <div className="category-master-page lead-management-page container-fluid px-0 px-md-2 py-2">
      <Helmet>
        <title>Generate Kits Workspace | Sonocare CRM</title>
        <meta name="description" content="Generate Kits Page UI and Kit Selection Flow in Sonocare CRM." />
      </Helmet>
      <ToastContainer />

      {/* HEADER SECTION */}
      <div className="category-page-header mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="category-page-title-group">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary me-2 px-2 py-1"
            onClick={() => navigate('/order-fulfilment')}
            title="Back to Order Fulfilment Register"
          >
            <ArrowLeft size={16} />
          </button>
          <PackageCheck size={28} style={{ color: '#2E3192' }} />
          <div>
            <h1 className="category-page-title mb-0">
              Generate Kits Workspace — {targetPI?.piNumber || 'PI Reference'}
            </h1>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-success px-3 py-2 fs-6">Confirmed Order</span>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* VERTICALLY STACKED FULL-WIDTH SECTIONS CONTAINER                   */}
      {/* ------------------------------------------------------------------ */}
      <div className="d-flex flex-column gap-4 mb-4">

        {/* SECTION 1 — PI REFERENCE DETAILS & VERSION CONTROL */}
        <div className="category-card shadow-sm border" style={{ borderRadius: '10px' }}>
          <div className="section-card-title-bar">
            <FileText size={18} color="#2E3192" />
            <span>SECTION 1 — PI Reference Details & Version Control (Read-Only)</span>
          </div>
          <div className="p-3">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <InputField
                  label="PI Number"
                  value={targetPI?.piNumber || 'PI-2026-003-V1'}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="PI Version"
                  value={`Version ${targetPI?.versionNumber || 1}`}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="PI Date"
                  value={targetPI?.piDate || '2026-08-25'}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Lead ID"
                  value={targetPI?.leadId || 'LEAD-003'}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Enquiry ID"
                  value={targetLead?.enquiryId || 'ENQ-003'}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Service Type (Pricing Model)"
                  value={isSubscription ? `Subscription (${subscriptionType})` : serviceType}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="PI Status"
                  value={targetPI?.piStatus || 'Accepted'}
                  disabled={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2 — CUSTOMER DETAILS & DELIVERY ADDRESS */}
        <div className="category-card shadow-sm border" style={{ borderRadius: '10px' }}>
          <div className="section-card-title-bar">
            <User size={18} color="#2E3192" />
            <span>SECTION 2 — Customer Details & Delivery Address (Read-Only)</span>
          </div>
          <div className="p-3">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <InputField
                  label="Customer / Company Name"
                  value={targetPI?.customerName || targetLead?.customerName || 'KMCH Specialty Hospital'}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Contact Person"
                  value={targetLead?.contactPerson || 'Dr. Subramanian'}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Mobile Number"
                  value={targetPI?.mobile || targetLead?.mobile || '9842155667'}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Email Address"
                  value={targetLead?.email || 'purchasing@kmch.org'}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Billing Address"
                  type="textarea"
                  rows={2}
                  value={targetPI?.billingAddress || targetLead?.address || 'KMCH Hospital Road, Avinashi Road, Coimbatore, Tamil Nadu 641014'}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Delivery Address"
                  type="textarea"
                  rows={2}
                  value={targetPI?.deliveryAddress || targetLead?.address || 'KMCH Diagnostic Wing, Floor 2, Avinashi Road, Coimbatore, Tamil Nadu 641014'}
                  disabled={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3 — PRODUCT & PRICE DETAILS TABLE + KIT GENERATION CARDS */}
        <div className="category-card shadow-sm border" style={{ borderRadius: '10px' }}>
          <div className="section-card-title-bar justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <Package size={18} color="#2E3192" />
              <span>SECTION 3 — Product & Price Details (From PI Version)</span>
            </div>
            {isSubscription && (
              <span className="badge bg-purple text-white px-3 py-1 fs-6" style={{ backgroundColor: '#7C3AED' }}>
                Subscription Model: {subscriptionType}
              </span>
            )}
          </div>
          <div className="p-3">
            {/* Product & Price Table with 'Generate Kit' Action Column */}
            <div className="category-table-wrapper border rounded bg-white mb-4">
              <Table
                columns={productPriceColumns}
                data={initialLineItems}
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

            {/* PRODUCT-LEVEL KIT GENERATION CARDS */}
            {initialLineItems.map((prodItem, pIdx) => {
              const pKey = prodItem.id || pIdx;
              const kitListSource = (kits && kits.length > 0) ? kits : initialMockKits;
              const kitOptions = kitListSource.map((k) => k.kitName).filter(Boolean);
              if (kitOptions.length === 0) kitOptions.push('Standard Medical Scanner Kit');

              const curLicense = productLicenses[pKey] || {
                licenseRequired: 'Yes',
                licenseType: 'Permanent Software Key',
                licenseKey: `LIC-SONO-${String(Math.floor(1000 + Math.random() * 9000))}-PROD`,
                licenseStartDate: new Date().toISOString().split('T')[0],
                licenseExpiryDate: '2027-08-26',
                licenseStatus: 'Generated',
                licenseRemarks: 'Standard 1-Year software license key active.'
              };

              const curSelectedKits = selectedKitsMap[pKey] || [];

              const handleLicenseChange = (field, val) => {
                setProductLicenses((prev) => ({
                  ...prev,
                  [pKey]: {
                    ...(prev[pKey] || {}),
                    [field]: val
                  }
                }));
              };

              const handleKitsSelectionChange = (newKits) => {
                setSelectedKitsMap((prev) => ({
                  ...prev,
                  [pKey]: newKits
                }));
              };

              return (
                <div key={pKey} className="kit-product-item-card mb-4 border rounded p-3 bg-white shadow-sm" style={{ borderRadius: '10px' }}>
                  {/* CARD HEADER TITLE */}
                  <div className="kit-product-header d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 pb-2 border-bottom">
                    <div className="d-flex align-items-center gap-2">
                      <Boxes size={20} color="#2E3192" />
                      <h6 className="fw-bold text-dark mb-0 fs-6">
                        Product #{pIdx + 1}: {prodItem.productName}
                      </h6>
                      <span className="badge bg-secondary font-monospace ms-2">
                        {isSubscription ? `Cycles: ${prodItem.quantity || 1}` : `Qty: ${prodItem.quantity || 1}`}
                      </span>
                    </div>
                  </div>

                  {/* 1. PRODUCT-LEVEL LICENSE CONFIGURATION (1 TIME SHOW PER PRODUCT) */}
                  <div className="p-3 bg-light rounded border mb-4">
                    <h6 className="fw-bold text-primary mb-3 small d-flex align-items-center gap-2 border-bottom pb-2">
                      <Key size={16} />
                      <span>Product Software License Configuration (1-Time per Product)</span>
                    </h6>

                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <Dropdown
                          label="License Required? "
                          options={['Yes', 'No']}
                          value={curLicense.licenseRequired || 'Yes'}
                          onChange={(e) => handleLicenseChange('licenseRequired', e.target.value)}
                        />
                      </div>

                      {curLicense.licenseRequired === 'Yes' && (
                        <>
                          <div className="col-12 col-md-6">
                            <Dropdown
                              label="License Type "
                              options={[
                                'Permanent Software Key',
                                'Subscription Key',
                                'Dongle License',
                                'Cloud Activation'
                              ]}
                              value={curLicense.licenseType || 'Permanent Software Key'}
                              onChange={(e) => handleLicenseChange('licenseType', e.target.value)}
                            />
                          </div>

                          <div className="col-12 col-md-6">
                            <InputField
                              label="Software License Key / ID "
                              placeholder="e.g. LIC-SONO-8912-KEY"
                              value={curLicense.licenseKey || ''}
                              onChange={(e) => handleLicenseChange('licenseKey', e.target.value)}
                            />
                          </div>

                          <div className="col-12 col-md-6">
                            <InputField
                              label="License Start Date"
                              type="date"
                              value={curLicense.licenseStartDate || ''}
                              onChange={(e) => handleLicenseChange('licenseStartDate', e.target.value)}
                            />
                          </div>

                          <div className="col-12 col-md-6">
                            <InputField
                              label="License Expiry Date"
                              type="date"
                              value={curLicense.licenseExpiryDate || ''}
                              onChange={(e) => handleLicenseChange('licenseExpiryDate', e.target.value)}
                            />
                          </div>

                          <div className="col-12 col-md-6">
                            <Dropdown
                              label="License Status"
                              options={['Pending', 'Generated', 'Assigned', 'Activated', 'Expired']}
                              value={curLicense.licenseStatus || 'Generated'}
                              onChange={(e) => handleLicenseChange('licenseStatus', e.target.value)}
                            />
                          </div>

                          <div className="col-12 col-md-6">
                            <InputField
                              label="License Remarks"
                              placeholder="Notes on software activation..."
                              value={curLicense.licenseRemarks || ''}
                              onChange={(e) => handleLicenseChange('licenseRemarks', e.target.value)}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 2. SELECT KITS MULTISELECT DROPDOWN PER PRODUCT */}
                  <div className="p-3 bg-light rounded border mb-4">
                    <h6 className="fw-bold text-dark mb-2 small d-flex align-items-center gap-2">
                      <Boxes size={16} color="#2E3192" />
                      <span>Select Kits for {prodItem.productName} (MultiSelect)</span>
                    </h6>
                    <MultiSelect
                      label={`Select Kits for Product `}
                      options={kitOptions}
                      value={curSelectedKits}
                      onChange={(e) => handleKitsSelectionChange(e.target.value)}
                      placeholder="Choose one or multiple kits..."
                    />
                  </div>

                  {/* 3. CONFIGURED KITS & LICENSE SUMMARY FOR PRODUCT */}
                  <div className="p-3 bg-white rounded border">
                    <h6 className="fw-bold text-dark mb-2 small d-flex align-items-center gap-1">
                      <CheckCircle2 size={16} className="text-success" />
                      <span>Selected Kits & Product License Summary ({curSelectedKits.length} kit(s) selected)</span>
                    </h6>
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {curSelectedKits.length === 0 ? (
                        <span className="text-muted small fst-italic">No kits selected yet. Use the MultiSelect field above to choose kits for this product.</span>
                      ) : (
                        curSelectedKits.map((kName, kIdx) => (
                          <span key={kIdx} className="badge bg-primary px-3 py-2 fs-6 font-monospace d-inline-flex align-items-center gap-1 shadow-sm" style={{ backgroundColor: '#2E3192' }}>
                            <Boxes size={14} /> {kName}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 4 — PAYMENT DETAILS & VERIFICATION */}
        <div className="category-card shadow-sm border" style={{ borderRadius: '10px' }}>
          <div className="section-card-title-bar">
            <CreditCard size={18} color="#2E3192" />
            <span>SECTION 4 — Payment Details & Verification</span>
          </div>
          <div className="p-3">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <InputField
                  label={isSubscription ? `Total Amount per Cycle (₹) [From PI]` : "Total Amount (₹) [From PI]"}
                  value={`₹${totalOrderValue.toLocaleString()}`}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Amount Paid (₹)"
                  value="₹5,00,000"
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Pending Balance (₹)"
                  value={`₹${remainingVal.toLocaleString()}`}
                  disabled={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5 — TRANSACTION DETAILS (READ-ONLY INTEGRATION) */}
        <div className="category-card shadow-sm border" style={{ borderRadius: '10px' }}>
          <div className="section-card-title-bar justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <Receipt size={18} color="#2E3192" />
              <span>SECTION 5 — Existing Transaction History</span>
            </div>
         
          </div>
          <div className="p-3">
            <div className="category-table-wrapper border rounded bg-white">
              <Table
                columns={txnModalColumns}
                data={targetPI?.transactions || [
                  {
                    id: 'TXN-2026-001',
                    date: '2026-08-25',
                    paymentMethod: 'Bank Transfer',
                    paidAmount: 5000000,
                    remainingBalance: 6800000,
                    proofFileName: 'NEFT_Receipt_50L.pdf',
                    status: 'Verified'
                  }
                ]}
                showSerialNumber={true}
                serialNumberHeader="S.No"
                paginated={false}
                tableClassName="category-custom-table"
                bordered={false}
                striped={false}
                hover={true}
                minWidth="600px"
              />
            </div>
          </div>
        </div>

      </div>

      {/* ------------------------------------------------------------------ */}
      {/* BOTTOM ACTION TOOLBAR                                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="fulfilment-action-toolbar p-3 d-flex align-items-center justify-content-end gap-2 mb-4">
        <Button
          variant="outline-secondary"
          className="px-4 py-2 fw-bold"
          onClick={() => navigate('/order-fulfilment')}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          className="px-4 py-2 fw-bold d-inline-flex align-items-center gap-1 shadow-sm"
          style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
          onClick={handleSaveFulfilment}
        >
          <Save size={18} />
          <span>Save Kit Details</span>
        </Button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: VIEW TRANSACTION HISTORY DETAILS                             */}
      {/* ------------------------------------------------------------------ */}
      <Modal
        show={isTxnModalOpen}
        onHide={() => setIsTxnModalOpen(false)}
        title={`Transaction History — ${targetPI?.piNumber || 'PI Reference'}`}
        size="lg"
        centered={true}
        footer={
          <Button variant="outline-secondary" onClick={() => setIsTxnModalOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="py-2">
          <div className="p-3 bg-light rounded border mb-3">
            <div className="row g-3 align-items-center">
              <div className="col-12 col-md-4">
                <span className="small text-muted d-block fw-semibold">Total Order Value:</span>
                <span className="fw-bold font-monospace fs-6">₹{totalOrderValue.toLocaleString()}</span>
              </div>
              <div className="col-12 col-md-4">
                <span className="small text-muted d-block fw-semibold">Total Amount Paid:</span>
                <span className="fw-bold text-success font-monospace fs-6">₹{paidVal.toLocaleString()}</span>
              </div>
              <div className="col-12 col-md-4">
                <span className="small text-muted d-block fw-semibold">Remaining Balance:</span>
                <span className="fw-bold text-danger font-monospace fs-6">₹{remainingVal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="category-table-wrapper border rounded bg-white">
            <Table
              columns={txnModalColumns}
              data={targetPI?.transactions || [
                {
                  id: 'TXN-2026-001',
                  date: '2026-08-25',
                  paymentMethod: 'Bank Transfer',
                  paidAmount: 5000000,
                  remainingBalance: 6800000,
                  proofFileName: 'NEFT_Receipt_50L.pdf',
                  status: 'Verified'
                }
              ]}
              showSerialNumber={true}
              serialNumberHeader="S.No"
              paginated={false}
              tableClassName="category-custom-table"
              bordered={false}
              striped={false}
              hover={true}
              minWidth="600px"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default KitGeneration;
