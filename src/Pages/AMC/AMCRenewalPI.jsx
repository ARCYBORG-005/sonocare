import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { InputField, Dropdown } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import {
  ShieldCheck,
  ArrowLeft,
  UserCheck,
  PackageCheck,
  DollarSign,
  Boxes,
  Receipt,
  Upload,
  Send,
  CheckCircle2
} from 'lucide-react';
import { initialMockAMCContracts } from './mockAMCData';
import '../../styles/Category.css';
import '../../styles/Product.css';
import '../../styles/Lead.css';
import '../OrderFulfilment/OrderFulfilment.css';
import './AMCManagement.css';

/**
 * AMCRenewalPI Component
 * Dedicated workspace page for approving AMC Renewal Proforma Invoice (PI) & Tax Invoice Generation.
 * Follows the EXACT UI design of EditAMCContract.jsx.
 * Route: /warranty-amc/renewal/:id/pi
 */
const AMCRenewalPI = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Locate target contract
  const targetContract = useMemo(() => {
    if (!id) return initialMockAMCContracts[0];
    const decoded = decodeURIComponent(id);
    return (
      initialMockAMCContracts.find((c) => c.contractId === decoded || c.id === decoded) ||
      initialMockAMCContracts[0]
    );
  }, [id]);

  // Product details
  const prod = useMemo(() => {
    return {
      productName: targetContract?.productSummary || 'Sonoscape X5 Portable Ultrasound System',
      category: 'Diagnostic Ultrasound System',
      serialNumber: 'SN-X5-2026-8841',
      softwareVersion: 'v4.2.1-PRO',
      licenseKey: 'LIC-SONO-X5-9982-A3',
      installationDate: '2024-05-10',
      warrantyMonths: '12 Months',
      warrantyEndDate: '2025-05-10',
      quantity: targetContract?.productQty || 1,
      amcType: targetContract?.amcType || 'SAMC (Support AMC)',
      period: targetContract?.period || '1 Year',
      alertBeforeDays: targetContract?.alertBeforeDays || '30 Days',
      basePrice: targetContract?.basePrice || 135000,
      discountPercent: targetContract?.discountPercent || 5,
      gstPercent: targetContract?.gstPercent || 18,
      totalAmountCycle: targetContract?.totalAmountCycle || 150000,
      startDate: targetContract?.startDate || '2025-05-11',
      endDate: targetContract?.endDate || '2026-05-10'
    };
  }, [targetContract]);

  // Editable Payment Details State
  const [paymentForm, setPaymentForm] = useState({
    paymentType: 'NEFT / RTGS',
    paidAmount: prod.totalAmountCycle,
    remainingAmount: 0,
    proofDocumentName: 'NEFT_Payment_Receipt_AMC.pdf',
    customerOtp: '482910',
    isOtpSent: false
  });

  // Handle Paid Amount Change & Auto-Calculate Remaining Amount
  const handlePaidAmountChange = (val) => {
    const paid = Number(val) || 0;
    const tot = prod.totalAmountCycle;
    const rem = Math.max(0, tot - paid);
    setPaymentForm((prev) => ({
      ...prev,
      paidAmount: val,
      remainingAmount: rem
    }));
  };

  // Send OTP handler
  const handleSendOtp = () => {
    setPaymentForm((prev) => ({
      ...prev,
      isOtpSent: true,
      customerOtp: '482910'
    }));
    toast.info(`OTP 482910 sent to customer mobile (${targetContract?.mobile || '9811223344'})!`);
  };

  // Form Submit Handler — Customer Approval & Tax Invoice Generation
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (Number(paymentForm.remainingAmount) > 0) {
      toast.error('Remaining Amount must be 0 to submit Customer Approval!');
      return;
    }
    if (!paymentForm.customerOtp) {
      toast.error('Please enter valid Customer OTP to proceed with approval!');
      return;
    }

    // Auto-generate Tax Invoice Reference
    const generatedInvoiceNo = `INV-AMC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    // Calculate extended End Date (+1 Year)
    const currentEnd = new Date(prod.endDate || Date.now());
    currentEnd.setFullYear(currentEnd.getFullYear() + 1);
    const newEndDateStr = currentEnd.toISOString().split('T')[0];

    // Build brand new renewed contract object for main AMC Management table
    const newRenewedContract = {
      id: `AMC-RENEWED-${targetContract.contractId}-${Date.now()}`,
      contractId: `${targetContract.contractId}-R1`,
      orderFulfilmentId: targetContract.orderFulfilmentId,
      piNumber: targetContract.piNumber,
      client: targetContract.client,
      contactPerson: targetContract.contactPerson,
      mobile: targetContract.mobile,
      email: targetContract.email,
      territory: targetContract.territory,
      productSummary: prod.productName,
      productQty: prod.quantity || 1,
      amcType: prod.amcType,
      nature: 'Mandatory support & renewal',
      startDate: prod.endDate,
      endDate: newEndDateStr,
      period: prod.period,
      basePrice: prod.basePrice,
      discountPercent: prod.discountPercent,
      gstPercent: prod.gstPercent,
      totalAmountCycle: prod.totalAmountCycle,
      totalAmount: prod.totalAmountCycle,
      alertBeforeDays: prod.alertBeforeDays,
      status: 'Active',
      alertStatus: 'Normal',
      isRenewed: true,
      renewalStatus: 'Renewed',
      notes: `New Renewal Contract generated via Tax Invoice ${generatedInvoiceNo} on ${new Date().toISOString().split('T')[0]}.`
    };

    // Store in localStorage so both AMCRenewal and AMCManagement page tables instantly show the new record
    try {
      const existing = JSON.parse(localStorage.getItem('amc_renewed_ids') || '[]');
      if (!existing.includes(targetContract.contractId)) {
        existing.push(targetContract.contractId);
      }
      localStorage.setItem('amc_renewed_ids', JSON.stringify(existing));

      const invoices = JSON.parse(localStorage.getItem('amc_tax_invoices') || '{}');
      invoices[targetContract.contractId] = {
        invoiceNo: generatedInvoiceNo,
        paidAmount: prod.totalAmountCycle,
        paymentType: paymentForm.paymentType,
        newEndDate: newEndDateStr,
        generatedAt: new Date().toISOString()
      };
      localStorage.setItem('amc_tax_invoices', JSON.stringify(invoices));

      // Append new contract to amc_new_renewed_contracts
      const newContractsList = JSON.parse(localStorage.getItem('amc_new_renewed_contracts') || '[]');
      if (!newContractsList.some((c) => c.contractId === newRenewedContract.contractId)) {
        newContractsList.push(newRenewedContract);
      }
      localStorage.setItem('amc_new_renewed_contracts', JSON.stringify(newContractsList));
    } catch (err) {
      console.error('LocalStorage update error:', err);
    }

    toast.success(`Customer Approved! New AMC Record ${newRenewedContract.contractId} created & Tax Invoice ${generatedInvoiceNo} generated!`);
    setTimeout(() => {
      navigate('/warranty-amc/renewal');
    }, 1400);
  };

  return (
    <div className="order-fulfilment-page container-fluid px-0 px-md-2 py-2">
      <Helmet>
        <title>AMC Renewal PI Approval | Sonocare CRM</title>
        <meta name="description" content="Approve AMC Renewal Proforma Invoice following Edit AMC page design." />
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
                AMC Renewal Proforma Invoice (PI) — {targetContract?.contractId}
              </h2>
              <span className="small text-muted font-monospace">
                Order Ref: {targetContract?.orderFulfilmentId} | PI: {targetContract?.piNumber || 'PI-2026-003-V1'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="d-flex flex-column gap-4 mb-4">
          
          {/* CARD 1: CUSTOMER DETAILS & INSTALLATION SITE LOCATION (READ ONLY) */}
          <div className="category-card shadow-sm border bg-white" style={{ borderRadius: '10px' }}>
            <div className="section-card-title-bar">
              <UserCheck size={18} color="#2E3192" />
              <span>Customer Details & Installation Site Location</span>
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
                    label="Territory / Location"
                    value={targetContract?.territory || 'Bengaluru, Karnataka'}
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
                    Product 1: {prod.productName}
                  </h6>
                  <span className="badge bg-secondary font-monospace">Qty: {prod.quantity}</span>
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
                    value={prod.category}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-sm-6 col-md-6">
                  <InputField
                    label="Serial Number"
                    value={prod.serialNumber}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-sm-6 col-md-6">
                  <InputField
                    label="Software Version"
                    value={prod.softwareVersion}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-sm-6 col-md-6">
                  <InputField
                    label="Software License Key"
                    value={prod.licenseKey}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-sm-6 col-md-6">
                  <InputField
                    label="Installation Date"
                    type="date"
                    value={prod.installationDate}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-sm-6 col-md-6">
                  <InputField
                    label="Warranty Duration"
                    value={prod.warrantyMonths}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-sm-6 col-md-6">
                  <InputField
                    label="Warranty End Date"
                    type="date"
                    value={prod.warrantyEndDate}
                    disabled={true}
                  />
                </div>
              </div>

              {/* Product AMC Commercial Terms Fields (READ ONLY) */}
              <div className="border-top pt-3">
                <h6 className="fw-bold text-dark mb-3 small d-flex align-items-center gap-2">
                  <DollarSign size={16} className="text-primary" />
                  <span>Product AMC Commercial & Financial Terms</span>
                </h6>
                <div className="row g-3">
                  <div className="col-12 col-md-6 col-lg-6">
                    <InputField
                      label="AMC Type"
                      value={prod.amcType}
                      disabled={true}
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-6">
                    <InputField
                      label="AMC Period (Cycle)"
                      value={prod.period}
                      disabled={true}
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-6">
                    <InputField
                      label="Alert Before Days"
                      value={prod.alertBeforeDays}
                      disabled={true}
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-6">
                    <InputField
                      label="Base AMC Price (₹)"
                      value={`₹${Number(prod.basePrice).toLocaleString()}`}
                      disabled={true}
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-6">
                    <InputField
                      label="Discount (%)"
                      value={`${prod.discountPercent}%`}
                      disabled={true}
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-6">
                    <InputField
                      label="GST %"
                      value={`${prod.gstPercent}%`}
                      disabled={true}
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-6">
                    <InputField
                      label="1 Cycle Total (₹)"
                      value={`₹${Number(prod.totalAmountCycle).toLocaleString()}`}
                      disabled={true}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <InputField
                      label="AMC Start Date"
                      type="date"
                      value={prod.startDate}
                      disabled={true}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <InputField
                      label="AMC End Date (Calculated)"
                      type="date"
                      value={prod.endDate}
                      disabled={true}
                    />
                  </div>
                </div>
              </div>

              {/* Renewal Payment & Customer OTP Approval Fields (EDITABLE ONLY) */}
              <div className="border-top pt-3">
                <h6 className="fw-bold text-dark mb-3 small d-flex align-items-center gap-2">
                  <Receipt size={16} className="text-primary" />
                  <span>Renewal Payment & Customer OTP Approval (EDITABLE)</span>
                </h6>
                <div className="row g-3">
                  <div className="col-12 col-md-6 col-lg-6">
                    <Dropdown
                      label="Payment Type / Mode *"
                      options={['NEFT / RTGS', 'UPI / GPay', 'Cheque / DD', 'Credit / Debit Card']}
                      value={paymentForm.paymentType}
                      onChange={(e) => setPaymentForm({ ...paymentForm, paymentType: e.target.value })}
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-6">
                    <InputField
                      label="Paid Amount (₹) *"
                      type="number"
                      value={paymentForm.paidAmount}
                      onChange={(e) => handlePaidAmountChange(e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-6">
                    <InputField
                      label="Remaining Amount (₹)"
                      type="number"
                      value={paymentForm.remainingAmount}
                      disabled={true}
                      helpText="Calculated: (1-Cycle Total - Paid Amount)"
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold text-dark mb-1">
                      Proof Document Upload (PDF / Image)
                    </label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control font-monospace text-primary"
                        value={paymentForm.proofDocumentName}
                        onChange={(e) => setPaymentForm({ ...paymentForm, proofDocumentName: e.target.value })}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary d-inline-flex align-items-center gap-1"
                        onClick={() => toast.info('Selected payment receipt attachment updated!')}
                      >
                        <Upload size={14} />
                        <span>Browse...</span>
                      </button>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold text-dark mb-1">
                      Customer OTP Verification
                    </label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control font-monospace fw-bold"
                        placeholder="Enter 6-digit OTP"
                        value={paymentForm.customerOtp}
                        onChange={(e) => setPaymentForm({ ...paymentForm, customerOtp: e.target.value })}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-primary d-inline-flex align-items-center gap-1"
                        onClick={handleSendOtp}
                      >
                        <Send size={14} />
                        <span>Send OTP</span>
                      </button>
                    </div>
                    <span className="small text-muted font-monospace"> Customer OTP: <strong>482910</strong></span>
                  </div>
                </div>
              </div>

              {/* CARD BOTTOM FOOTER: APPLIED DISCOUNT/GST, GRAND TOTAL, CANCEL & CUSTOMER APPROVED BUTTONS */}
              <div className="d-flex flex-column align-items-end border-top pt-3 mt-2 gap-3">
                <div className="d-flex align-items-center gap-3 flex-wrap justify-content-end text-end">
                  <span className="small text-muted font-monospace border-end pe-3">
                    Applied: Discount ({prod.discountPercent}%) | GST ({prod.gstPercent}%)
                  </span>
                  <span className="small text-muted fw-semibold">Grand Total AMC Amount for 1 Cycle:</span>
                  <span className="fs-3 fw-bold text-success font-monospace">
                    ₹{Number(prod.totalAmountCycle).toLocaleString()}
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
                    type="submit"
                    className="btn btn-success px-5 fw-bold shadow-sm d-inline-flex align-items-center gap-2"
                    disabled={Number(paymentForm.remainingAmount) > 0 || !paymentForm.customerOtp}
                    style={{ backgroundColor: Number(paymentForm.remainingAmount) === 0 && paymentForm.customerOtp ? '#28a745' : '#6c757d' }}
                  >
                    
                    <span>Customer Approved </span>
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </form>
    </div>
  );
};

export default AMCRenewalPI;
