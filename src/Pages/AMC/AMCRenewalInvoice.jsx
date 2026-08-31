import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { InputField } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import {
  ShieldCheck,
  ArrowLeft,
  UserCheck,
  PackageCheck,
  DollarSign,
  Boxes,
  Receipt,
  Printer,
  CheckCircle2
} from 'lucide-react';
import { initialMockAMCContracts } from './mockAMCData';
import '../../styles/Category.css';
import '../../styles/Product.css';
import '../../styles/Lead.css';
import '../OrderFulfilment/OrderFulfilment.css';
import './AMCManagement.css';

/**
 * AMCRenewalInvoice Component
 * Dedicated workspace page for viewing & printing AMC Tax Invoices based on PI renewal details.
 * Follows the EXACT UI design of EditAMCContract.jsx.
 * Route: /warranty-amc/renewal/:id/invoice
 */
const AMCRenewalInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Locate target contract & tax invoice metadata from localStorage
  const { targetContract, invoiceMeta } = useMemo(() => {
    const decoded = decodeURIComponent(id || '');
    const contract =
      initialMockAMCContracts.find((c) => c.contractId === decoded || c.id === decoded) ||
      initialMockAMCContracts[0];

    let invoices = {};
    try {
      invoices = JSON.parse(localStorage.getItem('amc_tax_invoices') || '{}');
    } catch (err) {
      console.error(err);
    }

    const meta = invoices[contract.contractId] || {
      invoiceNo: 'INV-AMC-2026-9021',
      paidAmount: contract.totalAmountCycle || 150000,
      paymentType: 'NEFT / RTGS',
      newEndDate: '2027-05-10',
      generatedAt: new Date().toISOString().split('T')[0]
    };

    return { targetContract: contract, invoiceMeta: meta };
  }, [id]);

  // Financial breakdown based on PI details
  const financialData = useMemo(() => {
    const base = Number(targetContract?.basePrice) || 135000;
    const discPct = Number(targetContract?.discountPercent) || 5;
    const gstPct = Number(targetContract?.gstPercent) || 18;

    const discountAmount = Math.round((base * discPct) / 100);
    const taxable = Math.max(0, base - discountAmount);
    const gstAmount = Math.round((taxable * gstPct) / 100);
    const grandTotal = taxable + gstAmount;

    return {
      basePrice: base,
      discountPercent: discPct,
      discountAmount,
      taxableAmount: taxable,
      gstPercent: gstPct,
      gstAmount,
      grandTotal
    };
  }, [targetContract]);

  // Print Invoice Handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="order-fulfilment-page container-fluid px-0 px-md-2 py-2">
      <Helmet>
        <title>AMC Tax Invoice | Sonocare CRM</title>
        <meta name="description" content="View AMC Tax Invoice generated from PI renewal details." />
      </Helmet>
      <ToastContainer />

      {/* HEADER BAR (CLEAN TRANSPARENT HEADER — NO CARD BEHIND IT) */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 py-1">
        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary p-1"
            onClick={() => navigate('/warranty-amc/renewal')}
            title="Back to AMC Renewal Register"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="d-flex align-items-center gap-2">
            <ShieldCheck size={26} color="#2E3192" />
            <div>
              <h2 className="fs-5 fw-bold mb-0 text-dark">
                AMC Tax Invoice — {invoiceMeta.invoiceNo}
              </h2>
              <span className="small text-muted font-monospace">
                Contract ID: {targetContract?.contractId} | Order Ref: {targetContract?.orderFulfilmentId}
              </span>
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-success px-3 py-2 fw-bold"> Tax Invoice Active</span>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary px-3 fw-bold d-inline-flex align-items-center gap-1"
            onClick={handlePrint}
          >
            <Printer size={15} />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      <div className="d-flex flex-column gap-4 mb-4">
        
        {/* CARD 1: CUSTOMER DETAILS & INSTALLATION SITE LOCATION (READ ONLY) */}
        <div className="category-card shadow-sm border bg-white" style={{ borderRadius: '10px' }}>
          <div className="section-card-title-bar">
            <UserCheck size={18} color="#2E3192" />
            <span>Customer Details & Tax Invoice Metadata</span>
          </div>
          <div className="p-3">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <InputField
                  label="Client / Hospital Name"
                  value={targetContract?.client || 'Fortis Healthcare Centre'}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Contact Person"
                  value={targetContract?.contactPerson || 'Dr. Ananya Verma'}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Mobile & Email"
                  value={`${targetContract?.mobile || '9811223344'} | ${targetContract?.email || 'purchase@fortis.com'}`}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Tax Invoice Number"
                  value={invoiceMeta.invoiceNo}
                  disabled={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: SECTION 2 — PRODUCT SYSTEM & SOFTWARE LICENSE SUMMARY (SINGLE CLEAN CARD CONSOLIDATED) */}
        <div className="category-card shadow-sm border bg-white" style={{ borderRadius: '10px' }}>
          <div className="section-card-title-bar">
            <PackageCheck size={18} color="#2E3192" />
            <span>SECTION 2 — Product System & Software License Summary (1 Product(s))</span>
          </div>

          <div className="p-3 d-flex flex-column gap-4">
            
            {/* Product Header */}
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 pb-2 border-bottom">
              <div className="d-flex align-items-center gap-2">
                <Boxes size={18} className="text-primary" />
                <h6 className="fw-bold text-dark mb-0 fs-6">
                  Product 1: {targetContract?.productSummary || 'Sonoscape X5 Portable Ultrasound System'}
                </h6>
                <span className="badge bg-secondary font-monospace">Qty: 1</span>
              </div>

              <div className="d-flex align-items-center gap-2">
                <span className="small text-muted fw-semibold">Warranty Status:</span>
                <span className="badge bg-danger">Warranty Ended</span>
              </div>
            </div>

            {/* Product Software & Warranty Info Input Boxes */}
            <div className="row g-3">
              <div className="col-12 col-sm-6 col-md-6">
                <InputField
                  label="Product Category"
                  value="Diagnostic Ultrasound System"
                  disabled={true}
                />
              </div>
              <div className="col-12 col-sm-6 col-md-6">
                <InputField
                  label="Serial Number"
                  value="SN-X5-2026-8841"
                  disabled={true}
                />
              </div>
              <div className="col-12 col-sm-6 col-md-6">
                <InputField
                  label="Software Version"
                  value="v4.2.1-PRO"
                  disabled={true}
                />
              </div>
              <div className="col-12 col-sm-6 col-md-6">
                <InputField
                  label="Software License Key"
                  value="LIC-SONO-X5-9982-A3"
                  disabled={true}
                />
              </div>
              <div className="col-12 col-sm-6 col-md-6">
                <InputField
                  label="Installation Date"
                  type="date"
                  value="2024-05-10"
                  disabled={true}
                />
              </div>
              <div className="col-12 col-sm-6 col-md-6">
                <InputField
                  label="Warranty Duration"
                  value="12 Months"
                  disabled={true}
                />
              </div>
              <div className="col-12 col-sm-6 col-md-6">
                <InputField
                  label="Extended AMC Expiry Date"
                  type="date"
                  value={invoiceMeta.newEndDate || targetContract?.endDate || '2027-05-10'}
                  disabled={true}
                />
              </div>
            </div>

            {/* Product AMC Commercial & Tax Invoice Breakdown */}
            <div className="border-top pt-3">
              <h6 className="fw-bold text-dark mb-3 small d-flex align-items-center gap-2">
                <DollarSign size={16} className="text-primary" />
                <span>Product AMC Commercial & Tax Invoice Financial Breakdown</span>
              </h6>
              <div className="row g-3">
                <div className="col-12 col-md-6 col-lg-6">
                  <InputField
                    label="AMC Type"
                    value={targetContract?.amcType || 'SAMC (Support AMC)'}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6 col-lg-6">
                  <InputField
                    label="AMC Period (Cycle)"
                    value={targetContract?.period || '1 Year'}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6 col-lg-6">
                  <InputField
                    label="Base AMC Price (₹)"
                    value={`₹${financialData.basePrice.toLocaleString()}`}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6 col-lg-6">
                  <InputField
                    label="Discount (%)"
                    value={`${financialData.discountPercent}%`}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6 col-lg-6">
                  <InputField
                    label="Taxable Amount (₹)"
                    value={`₹${financialData.taxableAmount.toLocaleString()}`}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6 col-lg-6">
                  <InputField
                    label="GST Rate & Amount (18%)"
                    value={`${financialData.gstPercent}% (₹${financialData.gstAmount.toLocaleString()})`}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6 col-lg-6">
                  <InputField
                    label="Grand Total Paid Amount (₹)"
                    value={`₹${financialData.grandTotal.toLocaleString()}`}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6 col-lg-6">
                  <InputField
                    label="Payment Method / Mode"
                    value={invoiceMeta.paymentType || 'NEFT / RTGS'}
                    disabled={true}
                  />
                </div>
              </div>
            </div>

            {/* CARD BOTTOM FOOTER: APPLIED DISCOUNT/GST, GRAND TOTAL, BACK & PRINT BUTTONS */}
            <div className="d-flex flex-column align-items-end border-top pt-3 mt-2 gap-3">
              <div className="d-flex align-items-center gap-3 flex-wrap justify-content-end text-end">
                <span className="small text-muted font-monospace border-end pe-3">
                  Applied: Discount ({financialData.discountPercent}%) | GST ({financialData.gstPercent}%)
                </span>
                <span className="small text-muted fw-semibold">Grand Total AMC Tax Invoice Amount:</span>
                <span className="fs-3 fw-bold text-success font-monospace">
                  ₹{financialData.grandTotal.toLocaleString()}
                </span>
              </div>

              <div className="d-flex gap-2 justify-content-end">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 fw-semibold"
                  onClick={() => navigate('/warranty-amc/renewal')}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary px-5 fw-bold shadow-sm d-inline-flex align-items-center gap-2"
                  style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
                  onClick={handlePrint}
                >
                  <Printer size={18} />
                  <span>Print Tax Invoice</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default AMCRenewalInvoice;
