import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import { InputField, Dropdown } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import {
  Receipt,
  FileText,
  Truck,
  Lock,
  Unlock,
  Printer,
  Download,
  ArrowLeft,
  Building2,
  CreditCard,
  FileSpreadsheet
} from 'lucide-react';
import '../../styles/Category.css';
import '../../styles/Product.css';
import '../../styles/Lead.css';
import './OrderFulfilment.css';

/**
 * TaxInvoiceEWayBill Component
 * Auto-created Finance Task page from Proforma Invoice (PI).
 * Pre-filled with customer, product, tax, and amount details.
 * Locked once generated for financial and regulatory compliance.
 */
const TaxInvoiceEWayBill = ({ pis = [], setPIs, leads = [] }) => {
  const { id } = useParams(); // URL parameter (PI Number or ID)
  const navigate = useNavigate();

  // Resolve target PI record from state or fallback
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

  // Locked Status state (Default true: Locked once generated)
  const [isLocked, setIsLocked] = useState(true);

  // Invoice & E-Way Bill Form Data State
  const [invoiceData, setInvoiceData] = useState({
    financeTaskId: `FIN-TASK-2026-${String(targetPI?.id || '003').padStart(3, '0')}`,
    taskCreatedDate: targetPI?.createdDate || '2026-08-25',
    financeStatus: 'Completed & Locked',
    
    // Tax Invoice Metadata
    invoiceNumber: targetPI ? `INV-2026-${String(targetPI.id || '003').padStart(3, '0')}` : 'INV-2026-003',
    invoiceDate: new Date().toISOString().split('T')[0],
    placeOfSupply: '33-Tamil Nadu',
    reverseCharge: 'No',
    gstin: targetPI?.gstin || '33AAACF1234A1Z5',
    pan: targetPI?.pan || 'AAACF1234A',

    // Customer & Addresses
    customerName: targetPI?.customerName || targetLead?.customerName || 'KMCH Specialty Hospital',
    contactPerson: targetLead?.contactPerson || targetPI?.contactPerson || 'Dr. Subramanian',
    mobile: targetPI?.mobile || targetLead?.mobile || '9842155667',
    email: targetLead?.email || 'purchasing@kmch.org',
    billingAddress: targetPI?.billingAddress || targetLead?.address || 'KMCH Hospital Road, Avinashi Road, Coimbatore, Tamil Nadu 641014',
    deliveryAddress: targetPI?.deliveryAddress || targetLead?.address || 'KMCH Diagnostic Wing, Floor 2, Avinashi Road, Coimbatore, Tamil Nadu 641014',

    // E-Way Bill Information
    ewayBillNumber: `EWB-3810-${String(Math.floor(1000 + Math.random() * 9000))}-7492`,
    ewayBillDate: new Date().toISOString().split('T')[0],
    validUntil: '2026-08-28 23:59:59',
    supplyType: 'Outward - Supply',
    subType: 'Supply',
    docType: 'Tax Invoice',
    transporterName: 'VRL Logistics & Express Services',
    transporterId: '33TRP9812A1Z0',
    transportMode: 'Road',
    vehicleNumber: 'TN-37-AZ-4921',
    distanceKm: '340',
    dispatchFrom: 'Sonocare Healthcare Warehouse, Plot 14, SIDCO Estate, Coimbatore, TN - 641021',

    // Financial Overview
    paymentStatus: targetPI?.orderConfirmationData?.paymentDone === 'Yes' ? 'Paid' : 'Partial',
    paidAmount: targetPI?.orderConfirmationData?.paidAmount || 5000000,
    remarks: 'Tax Invoice & E-Way Bill generated automatically from PI confirmation.'
  });

  // Line items loaded from selected PI
  const lineItems = useMemo(() => {
    if (targetPI && targetPI.lineItems && targetPI.lineItems.length > 0) {
      return targetPI.lineItems.map((item, idx) => {
        const qty = item.quantity || 1;
        const price = item.unitPrice || 5000000;
        const taxable = qty * price;
        const cgst = taxable * 0.09;
        const sgst = taxable * 0.09;
        const total = taxable + cgst + sgst;
        return {
          id: item.id || idx + 1,
          hsnCode: item.hsnCode || '90181200',
          category: item.category || 'Ultrasound System',
          productName: item.productName || 'Sonoscape X5 Portable Ultrasound System',
          specifications: item.specifications || '3D/4D Color Doppler, 2 Probes included',
          quantity: qty,
          unitPrice: price,
          taxableValue: taxable,
          cgstRate: '9%',
          cgstAmount: cgst,
          sgstRate: '9%',
          sgstAmount: sgst,
          totalAmount: total
        };
      });
    }

    return [
      {
        id: 1,
        hsnCode: '90181200',
        category: 'Ultrasound System',
        productName: 'Sonoscape X5 Portable Ultrasound System',
        specifications: '3D/4D Color Doppler, 2 Probes included',
        quantity: 2,
        unitPrice: 5000000,
        taxableValue: 10000000,
        cgstRate: '9%',
        cgstAmount: 900000,
        sgstRate: '9%',
        sgstAmount: 900000,
        totalAmount: 11800000
      }
    ];
  }, [targetPI]);

  // Tax Financial Calculations
  const totalTaxable = useMemo(() => lineItems.reduce((acc, item) => acc + item.taxableValue, 0), [lineItems]);
  const totalCGST = useMemo(() => lineItems.reduce((acc, item) => acc + item.cgstAmount, 0), [lineItems]);
  const totalSGST = useMemo(() => lineItems.reduce((acc, item) => acc + item.sgstAmount, 0), [lineItems]);
  const totalTax = totalCGST + totalSGST;
  const grandTotal = totalTaxable + totalTax;

  // Toggle Lock Handler
  const handleToggleLock = () => {
    if (isLocked) {
      setIsLocked(false);
      toast.info('Invoice unlocked for administrative editing.');
    } else {
      setIsLocked(true);
      toast.success('🔒 Tax Invoice & E-Way Bill saved and LOCKED.');
    }
  };

  // Print & Export Handlers
  const handlePrint = () => {
    toast.info(` Printing Tax Invoice ${invoiceData.invoiceNumber}...`);
    window.print();
  };

  const handleDownloadPDF = () => {
    toast.success(` Tax Invoice PDF (${invoiceData.invoiceNumber}) downloaded successfully!`);
  };

  const handleDownloadEWayBill = () => {
    toast.success(` E-Way Bill PDF & JSON (${invoiceData.ewayBillNumber}) downloaded!`);
  };

  // Extract Service Type and Subscription Type from target PI
  const serviceType = targetPI?.serviceType || 'One Time + AMC';
  const subscriptionType = targetPI?.subscriptionType || 'Monthly';
  const isSubscription = serviceType === 'Subscription';

  // Table Columns for Product & Tax Calculation Table
  const productTaxColumns = useMemo(() => [
    {
      key: 'hsnCode',
      title: 'HSN / SAC',
      sortable: true,
      render: (val) => <span className="badge bg-secondary font-monospace">{val}</span>
    },
    {
      key: 'productName',
      title: 'PRODUCT & DESCRIPTION',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="fw-bold text-dark d-block">{val}</span>
          <span className="small text-muted d-block">{row.specifications}</span>
          <div className="mt-1 d-flex flex-wrap gap-1">
            <span className="badge bg-light text-secondary border font-monospace" style={{ fontSize: '10px' }}>
              License: LIC-SONO-9821-KMCH-PROD
            </span>
            <span className="badge bg-light text-primary border font-monospace" style={{ fontSize: '10px' }}>
              Kits: Sonoscape X5 Standard Transducer & Trolley Kit
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'quantity',
      title: isSubscription ? 'NO. OF CYCLES' : 'QTY',
      sortable: true,
      align: 'center',
      render: (val) => <span className="badge bg-secondary font-monospace fs-6">{val}</span>
    },
    {
      key: 'unitPrice',
      title: isSubscription ? '1 CYCLE PRICE (₹)' : 'UNIT PRICE (₹)',
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-monospace">₹{Number(val || 0).toLocaleString()}</span>
    },
    {
      key: 'taxableValue',
      title: 'TAXABLE VALUE (₹)',
      sortable: true,
      align: 'right',
      render: (val) => <span className="fw-bold text-dark font-monospace">₹{Number(val || 0).toLocaleString()}</span>
    },
    {
      key: 'cgstAmount',
      title: 'CGST (9%)',
      sortable: true,
      align: 'right',
      render: (val) => <span className="text-muted font-monospace">₹{Number(val || 0).toLocaleString()}</span>
    },
    {
      key: 'sgstAmount',
      title: 'SGST (9%)',
      sortable: true,
      align: 'right',
      render: (val) => <span className="text-muted font-monospace">₹{Number(val || 0).toLocaleString()}</span>
    },
    {
      key: 'totalAmount',
      title: 'TOTAL (₹)',
      sortable: true,
      align: 'right',
      render: (val) => <span className="fw-bold text-primary font-monospace">₹{Number(val || 0).toLocaleString()}</span>
    }
  ], [isSubscription]);

  return (
    <div className="category-master-page lead-management-page container-fluid px-0 px-md-2 py-2">
      <Helmet>
        <title>Tax Invoice & E-Way Bill | Sonocare CRM</title>
        <meta name="description" content="Tax Invoice and E-Way Bill Auto-Created Finance Task Page in Sonocare CRM." />
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
          <Receipt size={28} style={{ color: '#2E3192' }} />
          <div>
            <h1 className="category-page-title mb-0">
              Tax Invoice & E-Way Bill — {targetPI?.piNumber || 'PI Reference'}
            </h1>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* SECTIONS CONTAINER                                                 */}
      {/* ------------------------------------------------------------------ */}
      <div className="d-flex flex-column gap-4 mb-4">

        {/* SECTION 1 — FINANCE TASK & PI REFERENCE DETAILS */}
        <div className="category-card shadow-sm border" style={{ borderRadius: '10px' }}>
          <div className="section-card-title-bar">
            <FileText size={18} color="#2E3192" />
            <span>SECTION 1 — Auto-Created Finance Task & PI Reference Details</span>
          </div>
          <div className="p-3">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <InputField
                  label="Finance Task ID"
                  value={invoiceData.financeTaskId}
                  disabled={true}
                />
              </div>
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
                  label="Task Created Date"
                  value={invoiceData.taskCreatedDate}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Field Employee"
                  value={targetPI?.fieldEmployee || 'Suresh Babu'}
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
                  label="Finance Status"
                  value={invoiceData.financeStatus}
                  disabled={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2 — CUSTOMER & GSTIN DETAILS */}
        <div className="category-card shadow-sm border" style={{ borderRadius: '10px' }}>
          <div className="section-card-title-bar">
            <Building2 size={18} color="#2E3192" />
            <span>SECTION 2 — Customer & GSTIN Registration Information</span>
          </div>
          <div className="p-3">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <InputField
                  label="Customer / Buyer Name"
                  value={invoiceData.customerName}
                  disabled={isLocked}
                  onChange={(e) => setInvoiceData({ ...invoiceData, customerName: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Contact Person"
                  value={invoiceData.contactPerson}
                  disabled={isLocked}
                  onChange={(e) => setInvoiceData({ ...invoiceData, contactPerson: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Buyer GSTIN"
                  value={invoiceData.gstin}
                  disabled={isLocked}
                  onChange={(e) => setInvoiceData({ ...invoiceData, gstin: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="PAN Number"
                  value={invoiceData.pan}
                  disabled={isLocked}
                  onChange={(e) => setInvoiceData({ ...invoiceData, pan: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Mobile Number"
                  value={invoiceData.mobile}
                  disabled={isLocked}
                  onChange={(e) => setInvoiceData({ ...invoiceData, mobile: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Email Address"
                  value={invoiceData.email}
                  disabled={isLocked}
                  onChange={(e) => setInvoiceData({ ...invoiceData, email: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Billing Address (Pre-filled from PI)"
                  type="textarea"
                  rows={2}
                  value={invoiceData.billingAddress}
                  disabled={isLocked}
                  onChange={(e) => setInvoiceData({ ...invoiceData, billingAddress: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Delivery / Shipping Address"
                  type="textarea"
                  rows={2}
                  value={invoiceData.deliveryAddress}
                  disabled={isLocked}
                  onChange={(e) => setInvoiceData({ ...invoiceData, deliveryAddress: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3 — TAX INVOICE DETAILS & ITEMIZED CALCULATION */}
        <div className="category-card shadow-sm border" style={{ borderRadius: '10px' }}>
          <div className="section-card-title-bar justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <Receipt size={18} color="#2E3192" />
              <span>SECTION 3 — Tax Invoice Details & GST Line Items Calculation</span>
            </div>
            {isSubscription && (
              <span className="badge bg-purple text-white px-3 py-1 fs-6" style={{ backgroundColor: '#7C3AED' }}>
                Subscription Model: {subscriptionType}
              </span>
            )}
          </div>
          <div className="p-3">
            <div className="row g-3 mb-4">
              <div className="col-12 col-md-6">
                <InputField
                  label="Tax Invoice Number"
                  value={invoiceData.invoiceNumber}
                  disabled={isLocked}
                  onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Invoice Date"
                  type="date"
                  value={invoiceData.invoiceDate}
                  disabled={isLocked}
                  onChange={(e) => setInvoiceData({ ...invoiceData, invoiceDate: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Place of Supply"
                  value={invoiceData.placeOfSupply}
                  disabled={isLocked}
                  onChange={(e) => setInvoiceData({ ...invoiceData, placeOfSupply: e.target.value })}
                />
              </div>
            </div>

            {/* Line Items Table */}
            <div className="category-table-wrapper border rounded bg-white mb-4">
              <Table
                columns={productTaxColumns}
                data={lineItems}
                showSerialNumber={true}
                serialNumberHeader="S.No"
                paginated={false}
                tableClassName="category-custom-table"
                bordered={false}
                striped={false}
                hover={true}
                minWidth="950px"
              />
            </div>

            {/* Tax Calculation Summary Box in One Row */}
            <div className="p-3 bg-light border rounded-3 mb-2">
              <div className="row g-3 text-center align-items-center">
                <div className="col-12 col-sm-6 col-md">
                  <span className="small text-muted d-block">Total Taxable Value:</span>
                  <span className="fw-bold font-monospace text-dark">₹{totalTaxable.toLocaleString()}</span>
                </div>
                <div className="col-12 col-sm-6 col-md">
                  <span className="small text-muted d-block">Central GST (CGST @ 9%):</span>
                  <span className="fw-bold font-monospace text-dark">₹{totalCGST.toLocaleString()}</span>
                </div>
                <div className="col-12 col-sm-6 col-md">
                  <span className="small text-muted d-block">State GST (SGST @ 9%):</span>
                  <span className="fw-bold font-monospace text-dark">₹{totalSGST.toLocaleString()}</span>
                </div>
                <div className="col-12 col-sm-6 col-md">
                  <span className="small text-muted d-block">Total GST Tax Amount:</span>
                  <span className="fw-bold font-monospace text-dark">₹{totalTax.toLocaleString()}</span>
                </div>
                <div className="col-12 col-sm-6 col-md bg-white p-2 rounded border shadow-sm">
                  <span className="small text-primary fw-bold d-block">Grand Total Invoice Value:</span>
                  <span className="fw-bold text-primary fs-6 font-monospace">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4 — E-WAY BILL DETAILS */}
        <div className="category-card shadow-sm border" style={{ borderRadius: '10px' }}>
          <div className="section-card-title-bar">
            <Truck size={18} color="#2E3192" />
            <span>SECTION 4 — E-Way Bill Details & Transport Manifest</span>
          </div>
          <div className="p-3">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <InputField
                  label="E-Way Bill Number"
                  value={invoiceData.ewayBillNumber}
                  disabled={isLocked}
                  onChange={(e) => setInvoiceData({ ...invoiceData, ewayBillNumber: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="E-Way Bill Date"
                  type="date"
                  value={invoiceData.ewayBillDate}
                  disabled={isLocked}
                  onChange={(e) => setInvoiceData({ ...invoiceData, ewayBillDate: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Valid Until"
                  value={invoiceData.validUntil}
                  disabled={isLocked}
                  onChange={(e) => setInvoiceData({ ...invoiceData, validUntil: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Transporter Name"
                  value={invoiceData.transporterName}
                  disabled={isLocked}
                  onChange={(e) => setInvoiceData({ ...invoiceData, transporterName: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Transporter ID"
                  value={invoiceData.transporterId}
                  disabled={isLocked}
                  onChange={(e) => setInvoiceData({ ...invoiceData, transporterId: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Vehicle Number"
                  value={invoiceData.vehicleNumber}
                  disabled={isLocked}
                  onChange={(e) => setInvoiceData({ ...invoiceData, vehicleNumber: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Approx. Distance (KM)"
                  value={invoiceData.distanceKm}
                  disabled={isLocked}
                  onChange={(e) => setInvoiceData({ ...invoiceData, distanceKm: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Mode of Transport"
                  value={invoiceData.transportMode}
                  disabled={isLocked}
                  onChange={(e) => setInvoiceData({ ...invoiceData, transportMode: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Document Type"
                  value={invoiceData.docType}
                  disabled={isLocked}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Dispatch From (Origin Address)"
                  value={invoiceData.dispatchFrom}
                  disabled={isLocked}
                  onChange={(e) => setInvoiceData({ ...invoiceData, dispatchFrom: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5 — PAYMENT OVERVIEW & ACTIONS */}
        <div className="category-card shadow-sm border" style={{ borderRadius: '10px' }}>
          <div className="section-card-title-bar">
            <CreditCard size={18} color="#2E3192" />
            <span>SECTION 5 — Financial Summary & Actions</span>
          </div>
          <div className="p-3">
            <div className="row g-3 align-items-center mb-3">
              <div className="col-12 col-md-4">
                <div className="p-3 border rounded bg-light">
                  <span className="small text-muted d-block">Grand Total Order Value</span>
                  <span className="fs-5 fw-bold text-dark font-monospace">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="p-3 border rounded bg-light">
                  <span className="small text-muted d-block">Amount Received</span>
                  <span className="fs-5 fw-bold text-success font-monospace">₹{Number(invoiceData.paidAmount).toLocaleString()}</span>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="p-3 border rounded bg-light">
                  <span className="small text-muted d-block">Outstanding Balance</span>
                  <span className="fs-5 fw-bold text-danger font-monospace">₹{Math.max(0, grandTotal - Number(invoiceData.paidAmount)).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* ACTION TOOLBAR BUTTONS */}
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 pt-3 border-top">
              

              <div className="d-flex align-items-center gap-2 flex-wrap">
                <button
                  type="button"
                  className="btn btn-outline-primary px-3 py-2 fw-semibold d-inline-flex align-items-center gap-1"
                  onClick={handlePrint}
                >
                  <Printer size={16} />
                  <span>Print Invoice</span>
                </button>

                <button
                  type="button"
                  className="btn btn-outline-success px-3 py-2 fw-semibold d-inline-flex align-items-center gap-1"
                  onClick={handleDownloadPDF}
                >
                  <Download size={16} />
                  <span>Download Invoice PDF</span>
                </button>

                <button
                  type="button"
                  className="btn btn-outline-info text-dark px-3 py-2 fw-semibold d-inline-flex align-items-center gap-1"
                  onClick={handleDownloadEWayBill}
                >
                  <FileSpreadsheet size={16} />
                  <span>Download E-Way Bill</span>
                </button>

                <button
                  type="button"
                  className={`btn ${isLocked ? 'btn-warning text-dark' : 'btn-success'} px-3 py-2 fw-bold d-inline-flex align-items-center gap-1 shadow-sm`}
                  onClick={handleToggleLock}
                >
                  {isLocked ? <Unlock size={16} /> : <Lock size={16} />}
                  <span>{isLocked ? 'Unlock Record' : 'Lock Record'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TaxInvoiceEWayBill;
