import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import { InputField, Dropdown } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import {
  Wrench,
  ArrowLeft,
  Clock,
  Save,
  FileText,
  AlertTriangle,
  Package,
  User,
  DollarSign,
  Upload,
  CheckCircle2,
  FileSpreadsheet,
  Check,
  Building2,
  CreditCard,
  Printer,
  Download,
  Send,
  Receipt,
  Percent
} from 'lucide-react';
import { initialMockTickets } from './mockTicketData';
import '../../styles/Category.css';
import '../../styles/Product.css';
import '../../styles/Lead.css';

/**
 * Helper function to format current date and time in local timezone (YYYY-MM-DDTHH:mm)
 */
const getFormattedNowLocal = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * WaitingForCustomerOrParts Component
 * Dedicated Workspace Page for Waiting for Customer / Parts logic.
 * Official Proforma Invoice (PI) full page view designed following TaxInvoiceEWayBill.jsx structure.
 * Route: /service/operations/:id/waiting
 */
const WaitingForCustomerOrParts = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Active View Mode: 'form' (Waiting workspace form) | 'pi' (Official PI page view)
  const [activeView, setActiveView] = useState('form');

  // Locate target ticket from localStorage or mock
  const targetTicket = useMemo(() => {
    let list = [...initialMockTickets];
    try {
      const stored = JSON.parse(localStorage.getItem('app_service_tickets') || '[]');
      if (stored.length > 0) list = stored;
    } catch (e) {
      console.error(e);
    }
    const decoded = decodeURIComponent(id || '');
    return (
      list.find((t) => t.ticketId === decoded || t.id === decoded) ||
      list[0]
    );
  }, [id]);

  // Main Waiting State ('Customer' | 'Parts')
  const [waitingReasonType, setWaitingReasonType] = useState('Parts');

  // CUSTOMER REASON FORM STATE
  const [customerForm, setCustomerForm] = useState({
    customerReasonCategory: 'Hospital Site Access / OT Busy',
    waitingStartDateTime: getFormattedNowLocal(),
    waitedHours: '24',
    siteAccessRemarks: 'Hospital cardiology OT currently occupied for surgeries. Site access post 2:00 PM.'
  });

  // PARTS REASON FORM STATE
  const [partsForm, setPartsForm] = useState({
    partName: 'OEM Probe High Voltage Board Assembly',
    expectedArrivalDateTime: getFormattedNowLocal(),
    waitedHours: '48',
    partsRemarks: 'Part ordered from HQ central warehouse. Tracking reference #WH-88401.',
    partCost: 8500,
    discountPercent: 5, // Discount %
    isAmcCovered: false,
    customerPaid: 'Yes', // 'Yes' | 'No'
    paidAmount: 5000,
    paymentType: 'NEFT / RTGS',
    uploadedReceiptName: 'Payment_Receipt_Ref_581920.pdf'
  });

  // Sync initial data from targetTicket if existing
  useEffect(() => {
    if (targetTicket) {
      const isAmc = targetTicket.type === 'CAMC' || targetTicket.type === 'SAMC';
      setPartsForm((prev) => ({
        ...prev,
        isAmcCovered: isAmc,
        partCost: isAmc ? 0 : prev.partCost,
        partName: targetTicket.productName ? `${targetTicket.productName} Replacement Component` : prev.partName
      }));
    }
  }, [targetTicket]);

  // Auto-calculated Financial Values for PI
  const unitPrice = Number(partsForm.partCost) || 0;
  const discountAmount = Math.round(unitPrice * ((Number(partsForm.discountPercent) || 0) / 100));
  const taxableValue = Math.max(0, unitPrice - discountAmount);
  const cgstAmount = Math.round(taxableValue * 0.09);
  const sgstAmount = Math.round(taxableValue * 0.09);
  const totalTaxAmount = cgstAmount + sgstAmount;
  const grandTotalPayable = taxableValue + totalTaxAmount;

  // Auto-calculated Pending Amount
  const pendingAmount = useMemo(() => {
    if (partsForm.isAmcCovered) return 0;
    const total = grandTotalPayable;
    if (partsForm.customerPaid === 'No') return total;
    const paid = Number(partsForm.paidAmount) || 0;
    return Math.max(0, total - paid);
  }, [grandTotalPayable, partsForm.isAmcCovered, partsForm.customerPaid, partsForm.paidAmount]);

  // Check if Proforma Invoice (PI) is required (> ₹5,000 threshold & not AMC covered)
  const isPiRequired = useMemo(() => {
    if (partsForm.isAmcCovered) return false;
    return unitPrice > 5000;
  }, [unitPrice, partsForm.isAmcCovered]);

  // Handle File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPartsForm((prev) => ({
        ...prev,
        uploadedReceiptName: file.name
      }));
      toast.success(`Uploaded receipt file: ${file.name}`);
    }
  };

  // Generate PI Action Handler (Switch to 'pi' page view)
  const handleGeneratePI = () => {
    setActiveView('pi');
  };

  // SUBMIT / SAVE WAITING WORKSPACE FORM
  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    if (waitingReasonType === 'Parts') {
      if (!partsForm.partName.trim()) {
        toast.error('Please specify the Part Name!');
        return;
      }
      if (!partsForm.isAmcCovered && partsForm.customerPaid === 'Yes' && (!partsForm.paidAmount || Number(partsForm.paidAmount) <= 0)) {
        toast.error('Please enter valid Paid Amount!');
        return;
      }
    } else {
      if (!customerForm.customerReasonCategory.trim()) {
        toast.error('Please enter Customer Waiting Reason Category!');
        return;
      }
    }

    const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');

    try {
      let list = [...initialMockTickets];
      const stored = JSON.parse(localStorage.getItem('app_service_tickets') || '[]');
      if (stored.length > 0) list = stored;

      const updatedList = list.map((item) =>
        item.ticketId === targetTicket.ticketId
          ? {
              ...item,
              status: 'Waiting for Customer/Parts',
              lastUpdated: nowStr,
              pausedAt: new Date().toISOString(),
              waitingReasonType: waitingReasonType,
              waitingDetails: waitingReasonType === 'Customer' ? customerForm : partsForm,
              partsList: [
                ...(item.partsList || []),
                ...(waitingReasonType === 'Parts'
                  ? [
                      {
                        id: Date.now(),
                        partName: partsForm.partName,
                        expectedArrivalDateTime: partsForm.expectedArrivalDateTime,
                        waitedHours: partsForm.waitedHours,
                        partsRemarks: partsForm.partsRemarks,
                        cost: partsForm.isAmcCovered ? 0 : partsForm.partCost,
                        discountPercent: partsForm.discountPercent,
                        discountAmount: discountAmount,
                        taxableValue: taxableValue,
                        totalAmount: grandTotalPayable,
                        isAmcCovered: partsForm.isAmcCovered,
                        customerPaid: partsForm.customerPaid,
                        paidAmount: partsForm.customerPaid === 'Yes' ? partsForm.paidAmount : 0,
                        pendingAmount: pendingAmount,
                        paymentType: partsForm.paymentType,
                        uploadedReceiptName: partsForm.uploadedReceiptName,
                        piRequired: isPiRequired
                      }
                    ]
                  : [])
              ]
            }
          : item
      );

      localStorage.setItem('app_service_tickets', JSON.stringify(updatedList));
    } catch (err) {
      console.error(err);
    }

    toast.info(`Ticket ${targetTicket?.ticketId} status updated to Waiting for Customer/Parts (SLA Clock Paused).`);

    setTimeout(() => {
      navigate('/service/operations');
    }, 1000);
  };

  // Table Columns for PI Spare Part Line Items Table (Structured like TaxInvoiceEWayBill.jsx)
  const piTableColumns = useMemo(() => [
    {
      key: 'partName',
      title: 'PART DETAILS & SPECIFICATIONS',
      sortable: true,
      render: (val) => (
        <div>
          <span className="fw-bold text-dark d-block">{val}</span>
          <span className="small text-muted d-block font-monospace">
            HSN: 90181200 | {partsForm.partsRemarks || 'OEM Replacement Part'}
          </span>
        </div>
      )
    },
    {
      key: 'quantity',
      title: 'QTY',
      align: 'center',
      render: () => <span className="badge bg-secondary font-monospace fs-6">1</span>
    },
    {
      key: 'unitPrice',
      title: 'UNIT PRICE (₹)',
      align: 'right',
      render: () => <span className="font-monospace">₹{unitPrice.toLocaleString('en-IN')}</span>
    },
    {
      key: 'discountAmount',
      title: `DISCOUNT (${partsForm.discountPercent}%)`,
      align: 'right',
      render: () => <span className="text-danger font-monospace">-₹{discountAmount.toLocaleString('en-IN')}</span>
    },
    {
      key: 'taxableValue',
      title: 'TAXABLE VALUE (₹)',
      align: 'right',
      render: () => <span className="fw-bold text-dark font-monospace">₹{taxableValue.toLocaleString('en-IN')}</span>
    },
    {
      key: 'cgstAmount',
      title: 'CGST (9%)',
      align: 'right',
      render: () => <span className="text-muted font-monospace">₹{cgstAmount.toLocaleString('en-IN')}</span>
    },
    {
      key: 'sgstAmount',
      title: 'SGST (9%)',
      align: 'right',
      render: () => <span className="text-muted font-monospace">₹{sgstAmount.toLocaleString('en-IN')}</span>
    },
    {
      key: 'grandTotal',
      title: 'TOTAL (₹)',
      align: 'right',
      render: () => <span className="fw-bold font-monospace" style={{ color: 'rgb(46, 49, 146)' }}>₹{grandTotalPayable.toLocaleString('en-IN')}</span>
    }
  ], [unitPrice, discountAmount, taxableValue, cgstAmount, sgstAmount, grandTotalPayable, partsForm]);

  // ----------------------------------------------------
  // RENDER OFFICIAL PROFORMA INVOICE (PI) PAGE VIEW
  // (Follows exact design & card structure of TaxInvoiceEWayBill.jsx)
  // ----------------------------------------------------
  if (activeView === 'pi') {
    return (
      <div className="category-master-page lead-management-page container-fluid px-0 px-md-2 py-2">
        <Helmet>
          <title>Proforma Invoice (PI) — {targetTicket?.ticketId} | Sonocare CRM</title>
        </Helmet>
        <ToastContainer />

        {/* HEADER SECTION */}
        <div className="category-page-header mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="category-page-title-group">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary me-2 px-2 py-1"
              onClick={() => setActiveView('form')}
              title="Back to Waiting Workspace"
            >
              <ArrowLeft size={16} />
            </button>
            <Receipt size={28} style={{ color: '#2E3192' }} />
            <div>
              <h1 className="category-page-title mb-0">
               Proforma Invoice (PI) — {targetTicket?.ticketId}
              </h1>
            </div>
          </div>

          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-primary px-3 py-2 fw-semibold d-inline-flex align-items-center gap-1"
              onClick={() => window.print()}
            >
              <Printer size={16} />
              <span>Print Invoice</span>
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-success px-3 py-2 fw-semibold d-inline-flex align-items-center gap-1"
              onClick={() => toast.success(`Downloaded PI PDF for ${targetTicket?.ticketId}`)}
            >
              <Download size={16} />
              <span>Download Invoice PDF</span>
            </button>
            <button
              type="button"
              className="btn btn-sm text-white fw-bold px-4 py-2 d-inline-flex align-items-center gap-2 shadow-sm"
              style={{ backgroundColor: 'rgb(46, 49, 146)', borderColor: 'rgb(46, 49, 146)' }}
              onClick={() => {
                toast.success(`Proforma Invoice (PI) confirmed & sent for ${targetTicket?.ticketId}!`);
                setTimeout(() => setActiveView('form'), 1200);
              }}
            >
              <Send size={16} />
              <span>Confirm & Send PI to Customer</span>
            </button>
          </div>
        </div>

        {/* SECTIONS CONTAINER STRUCTURED LIKE TaxInvoiceEWayBill.jsx */}
        <div className="d-flex flex-column gap-4 mb-4">

          {/* SECTION 1 — TICKET & SERVICE CONTRACT REFERENCE DETAILS */}
          <div className="category-card shadow-sm border" style={{ borderRadius: '10px' }}>
            <div className="section-card-title-bar">
              <FileText size={18} color="#2E3192" />
              <span>SECTION 1 — Ticket & Service Contract Reference Details</span>
            </div>
            <div className="p-3">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <InputField
                    label="Ticket ID Reference"
                    value={targetTicket?.ticketId || 'TCK-2026-003'}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Proforma Invoice Number"
                    value={`PI-2026-${(targetTicket?.ticketId || '003').replace(/\D/g, '') || '003'}`}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Customer / Hospital Name"
                    value={targetTicket?.customerName || 'Apollo Multi-Specialty Hospital'}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Service Type / Contract"
                    value={targetTicket?.type || 'CAMC'}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Equipment & Product Details"
                    value={targetTicket?.productName || 'Ultrasound Scanner'}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Serial Number"
                    value={targetTicket?.serialNumber || 'SN-2026-001'}
                    disabled={true}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2 — SPARE PART SPECIFICATIONS & PRICING BREAKDOWN */}
          <div className="category-card shadow-sm border" style={{ borderRadius: '10px' }}>
            <div className="section-card-title-bar">
              <Package size={18} color="#2E3192" />
              <span>SECTION 2 — Spare Part Specifications & Pricing Breakdown</span>
            </div>
            <div className="p-3">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <InputField
                    label="Spare Part Name"
                    value={partsForm.partName}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Unit Price (₹ INR)"
                    value={`₹ ${unitPrice.toLocaleString('en-IN')}`}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Discount (%)"
                    type="number"
                    value={partsForm.discountPercent}
                    onChange={(e) => setPartsForm({ ...partsForm, discountPercent: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Discount Amount (₹ INR)"
                    value={`- ₹ ${discountAmount.toLocaleString('en-IN')}`}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Taxable Value (₹ INR)"
                    value={`₹ ${taxableValue.toLocaleString('en-IN')}`}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="GST Rate & Amount (18% GST)"
                    value={`18% GST (₹ ${totalTaxAmount.toLocaleString('en-IN')})`}
                    disabled={true}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3 — PROFORMA INVOICE LINE ITEMS TABLE & TAX CALCULATION */}
          <div className="category-card shadow-sm border" style={{ borderRadius: '10px' }}>
            <div className="section-card-title-bar justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <Receipt size={18} color="#2E3192" />
                <span>SECTION 3 — Proforma Invoice Line Items & Tax Calculation</span>
              </div>
            </div>
            <div className="p-3">
              
              {/* Line Items Table */}
              <div className="category-table-wrapper border rounded bg-white mb-4">
                <Table
                  columns={piTableColumns}
                  data={[{ id: 1, partName: partsForm.partName }]}
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

              {/* Tax Calculation Summary Box in One Row (Identical to TaxInvoiceEWayBill.jsx) */}
              <div className="p-3 bg-light border rounded-3 mb-2">
                <div className="row g-3 text-center align-items-center">
                  <div className="col-12 col-sm-6 col-md">
                    <span className="small text-muted d-block">Unit Price:</span>
                    <span className="fw-bold font-monospace text-dark">₹{unitPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="col-12 col-sm-6 col-md">
                    <span className="small text-muted d-block">Discount ({partsForm.discountPercent}%):</span>
                    <span className="fw-bold font-monospace text-danger">-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="col-12 col-sm-6 col-md">
                    <span className="small text-muted d-block">Taxable Value:</span>
                    <span className="fw-bold font-monospace text-dark">₹{taxableValue.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="col-12 col-sm-6 col-md">
                    <span className="small text-muted d-block">GST Amount (18%):</span>
                    <span className="fw-bold font-monospace text-dark">₹{totalTaxAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="col-12 col-sm-6 col-md bg-white p-2 rounded border shadow-sm">
                    <span className="small text-primary fw-bold d-block">Grand Total PI Value:</span>
                    <span className="fw-bold fs-6 font-monospace" style={{ color: 'rgb(46, 49, 146)' }}>
                      ₹{grandTotalPayable.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 4 — ACTIONS & FOOTER */}
          <div className="category-card shadow-sm border" style={{ borderRadius: '10px' }}>
            <div className="section-card-title-bar">
              <CreditCard size={18} color="#2E3192" />
              <span>SECTION 4 — Actions & Approval</span>
            </div>
            <div className="p-3">
              <div className="d-flex align-items-center justify-content-end flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 fw-semibold"
                  onClick={() => setActiveView('form')}
                >
                  Back 
                </button>
                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className="btn text-white px-5 fw-bold shadow-sm d-inline-flex align-items-center gap-2"
                    style={{ backgroundColor: 'rgb(46, 49, 146)', borderColor: 'rgb(46, 49, 146)' }}
                    onClick={() => {
                      toast.success(`Proforma Invoice (PI) confirmed & sent for ${targetTicket?.ticketId}!`);
                      setTimeout(() => setActiveView('form'), 1000);
                    }}
                  >
                    <Send size={18} />
                    <span>Confirm </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // MAIN FORM WORKSPACE VIEW
  // ----------------------------------------------------
  return (
    <div className="order-fulfilment-page container-fluid px-0 px-md-2 py-2">
      <Helmet>
        <title>Waiting for Customer / Parts Workspace | Sonocare CRM</title>
        <meta name="description" content="Waiting for Customer / Parts Workspace in Sonocare CRM." />
      </Helmet>
      <ToastContainer />

      {/* HEADER BAR */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 py-1">
        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary p-1"
            onClick={() => navigate('/service/operations')}
            title="Back to Service Operations Register"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="d-flex align-items-center gap-2">
            <Clock size={26} color="#FB923C" />
            <div>
              <h2 className="fs-5 fw-bold mb-0 text-dark">
                Waiting for Customer / Parts Workspace — {targetTicket?.ticketId}
              </h2>
              <span className="small text-muted font-monospace">
                Customer: {targetTicket?.customerName} | Equipment: {targetTicket?.productName || 'Diagnostic Scanner'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="d-flex flex-column gap-4 mb-4">
          
          {/* TICKET SUMMARY REFERENCE CARD */}
          <div className="category-card shadow-sm border bg-white" style={{ borderRadius: '10px' }}>
            <div className="section-card-title-bar">
              <FileText size={18} color="#2E3192" />
              <span>Ticket Reference Summary</span>
            </div>
            <div className="p-3">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <InputField
                    label="Ticket ID Reference"
                    value={targetTicket?.ticketId || ''}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Customer / Hospital Name"
                    value={targetTicket?.customerName || ''}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Service Contract Type"
                    value={targetTicket?.type || 'CAMC'}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Equipment & Serial Number"
                    value={`${targetTicket?.productName || 'Ultrasound Scanner'} (SN: ${targetTicket?.serialNumber || 'SN-2026-001'})`}
                    disabled={true}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* WAITING REASON TYPE SELECTION CARD */}
          <div className="category-card shadow-sm border bg-white" style={{ borderRadius: '10px' }}>
            <div className="section-card-title-bar">
              <Clock size={18} color="#FB923C" />
              <span>Select Waiting Category</span>
            </div>

            <div className="p-3">
              {/* CLEAN PLAIN INLINE RADIO BUTTONS */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-dark mb-2">Waiting For: *</label>
                <div className="d-flex align-items-center gap-4">
                  <label className="form-check-label d-flex align-items-center gap-2 cursor-pointer fw-bold text-dark">
                    <input
                      type="radio"
                      className="form-check-input mt-0"
                      name="waitingReasonType"
                      value="Customer"
                      checked={waitingReasonType === 'Customer'}
                      onChange={() => setWaitingReasonType('Customer')}
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                    <span>Customer</span>
                  </label>

                  <label className="form-check-label d-flex align-items-center gap-2 cursor-pointer fw-bold text-dark">
                    <input
                      type="radio"
                      className="form-check-input mt-0"
                      name="waitingReasonType"
                      value="Parts"
                      checked={waitingReasonType === 'Parts'}
                      onChange={() => setWaitingReasonType('Parts')}
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                    <span>Parts</span>
                  </label>
                </div>
              </div>

              {/* DYNAMIC SECTION: IF CUSTOMER REASON IS SELECTED */}
              {waitingReasonType === 'Customer' && (
                <div className="p-3 rounded border mt-3 bg-white">
                  <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                    <User size={18} className="text-primary" />
                    <span>Customer Availability & Site Details</span>
                  </h6>

                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <InputField
                        label="Customer Waiting Reason Category *"
                        value={customerForm.customerReasonCategory}
                        onChange={(e) => setCustomerForm({ ...customerForm, customerReasonCategory: e.target.value })}
                        placeholder="Enter customer waiting reason (e.g. Hospital Site Access / OT Busy)"
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <InputField
                        label="Waiting Start Date & Time *"
                        type="datetime-local"
                        value={customerForm.waitingStartDateTime}
                        onChange={(e) => setCustomerForm({ ...customerForm, waitingStartDateTime: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <InputField
                        label="Waited Hours / Expected Duration (Hours) *"
                        value={customerForm.waitedHours}
                        onChange={(e) => setCustomerForm({ ...customerForm, waitedHours: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark mb-1">Site Access Remarks & Notes</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={customerForm.siteAccessRemarks}
                        onChange={(e) => setCustomerForm({ ...customerForm, siteAccessRemarks: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* DYNAMIC SECTION: IF PARTS REASON IS SELECTED */}
              {waitingReasonType === 'Parts' && (
                <div className="p-3 rounded border mt-3 d-flex flex-column gap-3 bg-white">
                  <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                    <Package size={18} className="text-warning" />
                    <span>Spare Part Specifications & Payment Workflow</span>
                  </h6>

                  {/* ROW 1: PART NAME & COVERED UNDER AMC (RADIO TYPE YES/NO) */}
                  <div className="row g-3 align-items-center">
                    <div className="col-12 col-md-6">
                      <InputField
                        label="Part Name *"
                        value={partsForm.partName}
                        onChange={(e) => setPartsForm({ ...partsForm, partName: e.target.value })}
                        placeholder="Enter part name"
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold text-dark mb-2">Covered Under AMC: *</label>
                      <div className="d-flex align-items-center gap-4 py-1">
                        <label className="form-check-label d-flex align-items-center gap-2 cursor-pointer fw-bold text-dark">
                          <input
                            type="radio"
                            className="form-check-input mt-0"
                            name="isAmcCovered"
                            value="Yes"
                            checked={partsForm.isAmcCovered === true}
                            onChange={() =>
                              setPartsForm({
                                ...partsForm,
                                isAmcCovered: true,
                                partCost: 0,
                                customerPaid: 'No'
                              })
                            }
                            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                          />
                          <span>Yes</span>
                        </label>

                        <label className="form-check-label d-flex align-items-center gap-2 cursor-pointer fw-bold text-dark">
                          <input
                            type="radio"
                            className="form-check-input mt-0"
                            name="isAmcCovered"
                            value="No"
                            checked={partsForm.isAmcCovered === false}
                            onChange={() =>
                              setPartsForm({
                                ...partsForm,
                                isAmcCovered: false,
                                partCost: partsForm.partCost || 8500
                              })
                            }
                            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                          />
                          <span>No</span>
                        </label>
                      </div>
                    </div>

                    {/* ROW 2: EXPECTED ARRIVAL DATE/TIME & WAITED HOURS */}
                    <div className="col-12 col-md-6">
                      <InputField
                        label="Expected Arrival Date & Time *"
                        type="datetime-local"
                        value={partsForm.expectedArrivalDateTime}
                        onChange={(e) => setPartsForm({ ...partsForm, expectedArrivalDateTime: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <InputField
                        label="Waited Hours / Expected Duration (Hours) *"
                        value={partsForm.waitedHours}
                        onChange={(e) => setPartsForm({ ...partsForm, waitedHours: e.target.value })}
                        placeholder="Enter waited hours (e.g. 48)"
                      />
                    </div>

                    {/* ROW 3: PARTS REMARKS & DISPATCH NOTES */}
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark mb-1">Parts Remarks & Dispatch Notes</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={partsForm.partsRemarks}
                        onChange={(e) => setPartsForm({ ...partsForm, partsRemarks: e.target.value })}
                        placeholder="Enter tracking reference, dispatch notes, or supplier remarks..."
                      />
                    </div>

                    {/* ROW 4: PART COST (DISPLAYED ONLY WHEN NOT COVERED UNDER AMC) */}
                    {!partsForm.isAmcCovered && (
                      <div className="col-12 col-md-6">
                        <InputField
                          label="Part Cost (₹ INR) *"
                          type="number"
                          value={partsForm.partCost}
                          onChange={(e) => setPartsForm({ ...partsForm, partCost: e.target.value })}
                          placeholder="Enter part cost"
                        />
                      </div>
                    )}
                  </div>

                  {/* PROFORMA INVOICE (PI) RULE & BUTTON (ONLY IF AMOUNT > 5000 AND NOT AMC COVERED) */}
                  {isPiRequired && (
                    <div className="p-3 border rounded d-flex align-items-center justify-content-end flex-wrap gap-2 bg-light">
                      

                      <button
                        type="button"
                        className="btn text-white fw-bold px-4 py-2 d-inline-flex align-items-center gap-2 shadow-sm"
                        style={{ backgroundColor: 'rgb(46, 49, 146)', borderColor: 'rgb(46, 49, 146)' }}
                        onClick={handleGeneratePI}
                      >
                        <FileSpreadsheet size={18} />
                        <span>Generate Proforma Invoice (PI)</span>
                      </button>
                    </div>
                  )}

                  {/* CUSTOMER PAYMENT SECTION (ONLY DISPLAYED WHEN NOT COVERED UNDER AMC) */}
                  {!partsForm.isAmcCovered && (
                    <div className="p-3 bg-white rounded border">
                      <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                        <CreditCard size={18} className="text-primary" />
                        <span>Customer Payment Details</span>
                      </h6>

                      <div className="row g-3">
                        {/* Customer Paid Y/N */}
                        <div className="col-12 col-md-6">
                          <label className="form-label small fw-bold text-dark mb-1">Customer Paid </label>
                          <select
                            className="form-select form-select-sm fw-semibold text-dark"
                            value={partsForm.customerPaid}
                            onChange={(e) => setPartsForm({ ...partsForm, customerPaid: e.target.value })}
                          >
                            <option value="Yes">Yes </option>
                            <option value="No">No </option>
                          </select>
                        </div>

                        {/* If Customer Paid = Yes */}
                        {partsForm.customerPaid === 'Yes' && (
                          <>
                            <div className="col-12 col-md-6">
                              <InputField
                                label="Paid Amount (₹ INR) *"
                                type="number"
                                value={partsForm.paidAmount}
                                onChange={(e) => setPartsForm({ ...partsForm, paidAmount: e.target.value })}
                              />
                            </div>

                            <div className="col-12 col-md-6">
                              <InputField
                                label="Pending Amount (Auto-calculated ₹ INR)"
                                value={`₹ ${pendingAmount.toLocaleString('en-IN')}`}
                                disabled={true}
                              />
                            </div>

                            <div className="col-12 col-md-6">
                              <Dropdown
                                label="Payment Type *"
                                options={['NEFT / RTGS', 'UPI / QR Code', 'Cheque', 'Credit / Debit Card', 'Cash']}
                                value={partsForm.paymentType}
                                onChange={(e) => setPartsForm({ ...partsForm, paymentType: e.target.value })}
                              />
                            </div>

                            <div className="col-12">
                              <label className="form-label small fw-semibold text-dark mb-1">
                                Upload Payment Receipt / Proof *
                              </label>
                              <div className="input-group">
                                <input
                                  type="file"
                                  className="form-control form-control-sm"
                                  accept=".pdf,.png,.jpg,.jpeg"
                                  onChange={handleFileUpload}
                                />
                                <button
                                  type="button"
                                  className="btn btn-outline-secondary d-inline-flex align-items-center gap-1"
                                >
                                  <Upload size={14} />
                                  <span>Browse</span>
                                </button>
                              </div>
                              {partsForm.uploadedReceiptName && (
                                <span className="small text-success font-monospace mt-1 d-block">
                                  Selected File: <strong>{partsForm.uploadedReceiptName}</strong>
                                </span>
                              )}
                            </div>
                          </>
                        )}

                        {partsForm.customerPaid === 'No' && (
                          <div className="col-12 col-md-6">
                            <InputField
                              label="Pending Amount (₹ INR)"
                              value={`₹ ${(Number(partsForm.partCost) || 0).toLocaleString('en-IN')}`}
                              disabled={true}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* SAVE & SUBMIT FOOTER - COLOR: rgb(46, 49, 146) */}
              <div className="d-flex gap-2 justify-content-end border-top pt-3 mt-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 fw-semibold"
                  onClick={() => navigate('/service/operations')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn text-white px-5 fw-bold shadow-sm d-inline-flex align-items-center gap-2"
                  style={{ backgroundColor: 'rgb(46, 49, 146)', borderColor: 'rgb(46, 49, 146)' }}
                >
                  <Save size={18} />
                  <span>Save</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      </form>

    </div>
  );
};

export default WaitingForCustomerOrParts;
