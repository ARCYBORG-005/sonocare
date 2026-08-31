import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { InputField, Dropdown } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import {
  CreditCard,
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
import { initialMockSubscriptions } from './mockSubscriptionData';
import '../../styles/Category.css';
import '../../styles/Product.css';
import '../../styles/Lead.css';
import '../OrderFulfilment/OrderFulfilment.css';
import '../AMC/AMCManagement.css';
import './SubscriptionManagement.css';

/**
 * SubscriptionRenewalPI Component
 * Dedicated workspace page for approving Subscription Renewal Proforma Invoice (PI) & Tax Invoice Generation.
 * Route: /subscription/renewal/:id/pi
 */
const SubscriptionRenewalPI = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Locate target subscription
  const targetSub = useMemo(() => {
    let list = [...initialMockSubscriptions];
    try {
      const stored = JSON.parse(localStorage.getItem('app_subscriptions') || '[]');
      if (stored.length > 0) list = stored;
    } catch (e) {
      console.error(e);
    }
    const decoded = decodeURIComponent(id || '');
    return (
      list.find((s) => s.subscriptionId === decoded || s.id === decoded) ||
      list[0]
    );
  }, [id]);

  // Product details
  const prod = useMemo(() => {
    return {
      productName: targetSub?.productSummary || 'Sonoscape P20 Expert Diagnostic Ultrasound System',
      category: targetSub?.category || 'Diagnostic Ultrasound System',
      serialNumber: targetSub?.serialNumber || 'SN-P20-2026-4412',
      softwareVersion: targetSub?.softwareVersion || 'v5.1.0-SUB',
      licenseKey: targetSub?.licenseKey || 'LIC-SUB-P20-8812-B',
      installationDate: targetSub?.installationDate || '2025-01-15',
      warrantyMonths: 'Bundled in Subscription',
      warrantyEndDate: 'N/A (Bundled)',
      quantity: targetSub?.productQty || 1,
      subscriptionType: targetSub?.subscriptionType || 'Monthly',
      billingCycle: targetSub?.billingCycle || 'Monthly (1st of month)',
      alertBeforeDays: targetSub?.alertBeforeDays || '30 Days',
      basePrice: targetSub?.basePrice || 40000,
      discountPercent: targetSub?.discountPercent || 5,
      gstPercent: targetSub?.gstPercent || 18,
      price: targetSub?.price || 45000,
      startDate: targetSub?.startDate || '2025-01-16',
      nextBillingDate: targetSub?.nextBillingDate || '2026-06-16'
    };
  }, [targetSub]);

  // Editable Payment Details State
  const [paymentForm, setPaymentForm] = useState({
    paymentType: 'NEFT / RTGS',
    paidAmount: prod.price,
    remainingAmount: 0,
    proofDocumentName: 'Subscription_Payment_Receipt.pdf',
    customerOtp: '482910',
    isOtpSent: false
  });

  // Handle Paid Amount Change
  const handlePaidAmountChange = (val) => {
    const paid = Number(val) || 0;
    const tot = prod.price;
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
    toast.info(`OTP 482910 sent to customer mobile (${targetSub?.mobile || '9845012345'})!`);
  };

  // Form Submit Handler
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

    const generatedInvoiceNo = `INV-SUB-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const currentNext = new Date(prod.nextBillingDate || Date.now());
    currentNext.setMonth(currentNext.getMonth() + 1);
    const newNextDateStr = currentNext.toISOString().split('T')[0];

    // Build brand new renewed subscription record with SAME Subscription ID
    const newRenewedSub = {
      id: `SUB-RENEWED-${targetSub.subscriptionId}-${Date.now()}`,
      subscriptionId: targetSub.subscriptionId,
      orderFulfilmentId: targetSub.orderFulfilmentId,
      piNumber: targetSub.piNumber,
      client: targetSub.client,
      contactPerson: targetSub.contactPerson,
      mobile: targetSub.mobile,
      email: targetSub.email,
      territory: targetSub.territory,
      productSummary: prod.productName,
      productQty: prod.quantity || 1,
      category: prod.category,
      serialNumber: prod.serialNumber,
      softwareVersion: prod.softwareVersion,
      licenseKey: prod.licenseKey,
      installationDate: prod.installationDate,
      warrantyMonths: 'Bundled in Subscription',
      warrantyEndDate: 'N/A (Bundled)',
      subscriptionType: prod.subscriptionType,
      billingCycle: prod.billingCycle,
      alertBeforeDays: prod.alertBeforeDays,
      price: prod.price,
      basePrice: prod.basePrice,
      discountPercent: prod.discountPercent,
      gstPercent: prod.gstPercent,
      startDate: prod.nextBillingDate,
      nextBillingDate: newNextDateStr,
      status: 'Active',
      alertStatus: 'Normal',
      isRenewed: true,
      notes: `New Renewal Subscription cycle generated via Tax Invoice ${generatedInvoiceNo} on ${new Date().toISOString().split('T')[0]}.`
    };

    try {
      const existing = JSON.parse(localStorage.getItem('sub_renewed_ids') || '[]');
      if (!existing.includes(targetSub.subscriptionId)) {
        existing.push(targetSub.subscriptionId);
      }
      localStorage.setItem('sub_renewed_ids', JSON.stringify(existing));

      const invoices = JSON.parse(localStorage.getItem('sub_tax_invoices') || '{}');
      invoices[targetSub.subscriptionId] = {
        invoiceNo: generatedInvoiceNo,
        paidAmount: prod.price,
        paymentType: paymentForm.paymentType,
        newBillingDate: newNextDateStr,
        generatedAt: new Date().toISOString()
      };
      localStorage.setItem('sub_tax_invoices', JSON.stringify(invoices));

      // Append new subscription record into sub_new_renewed_records
      const newSubList = JSON.parse(localStorage.getItem('sub_new_renewed_records') || '[]');
      newSubList.push(newRenewedSub);
      localStorage.setItem('sub_new_renewed_records', JSON.stringify(newSubList));
    } catch (err) {
      console.error(err);
    }

    toast.success(`Customer Approved! New Subscription Cycle created for ${targetSub?.subscriptionId}.`);
    setTimeout(() => {
      navigate('/subscription/renewal');
    }, 1400);
  };

  return (
    <div className="order-fulfilment-page container-fluid px-0 px-md-2 py-2">
      <Helmet>
        <title>Subscription Renewal PI Approval | Sonocare CRM</title>
        <meta name="description" content="Approve Subscription Renewal Proforma Invoice." />
      </Helmet>
      <ToastContainer />

      {/* HEADER BAR (CLEAN TRANSPARENT HEADER — NO CARD BEHIND IT) */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 py-1">
        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary p-1"
            onClick={() => navigate('/subscription/renewal')}
            title="Back to Subscription Renewal Register"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="d-flex align-items-center gap-2">
            <CreditCard size={26} color="#2E3192" />
            <div>
              <h2 className="fs-5 fw-bold mb-0 text-dark">
                Subscription Renewal Proforma Invoice (PI) — {targetSub?.subscriptionId}
              </h2>
              <span className="small text-muted font-monospace">
                Order Ref: {targetSub?.orderFulfilmentId} | PI: {targetSub?.piNumber || 'PI-2026-002-V1'}
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
                    value={targetSub?.client || 'Apollo Hospitals & Diagnostic Centre'}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Contact Person"
                    value={targetSub?.contactPerson || 'Dr. Rajesh Kumar'}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Mobile & Email"
                    value={`${targetSub?.mobile || '9845012345'} | ${targetSub?.email || 'purchase@apollo.com'}`}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Territory / Location"
                    value={targetSub?.territory || 'Chennai, Tamil Nadu'}
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
                  <span className="badge bg-success">Bundled in Subscription</span>
                </div>
              </div>

              {/* Product Software Info Input Boxes */}
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
                    label="Support & Warranty Model"
                    value="Bundled in Subscription (BR-ORD-016)"
                    disabled={true}
                  />
                </div>
              </div>

              {/* Subscription Commercial Terms Fields (READ ONLY) */}
              <div className="border-top pt-3">
                <h6 className="fw-bold text-dark mb-3 small d-flex align-items-center gap-2">
                  <DollarSign size={16} className="text-primary" />
                  <span>Subscription Commercial & Financial Terms</span>
                </h6>
                <div className="row g-3">
                  <div className="col-12 col-md-6 col-lg-6">
                    <InputField
                      label="Subscription Type"
                      value={prod.subscriptionType}
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
                      label="Base Price per Cycle (₹)"
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
                      label="Recurring Cycle Total (₹)"
                      value={`₹${Number(prod.price).toLocaleString()}`}
                      disabled={true}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <InputField
                      label="Subscription Start Date"
                      type="date"
                      value={prod.startDate}
                      disabled={true}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <InputField
                      label="Next Billing Date"
                      type="date"
                      value={prod.nextBillingDate}
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
                  <span className="small text-muted fw-semibold">Grand Total Subscription Price for 1 Cycle:</span>
                  <span className="fs-3 fw-bold text-success font-monospace">
                    ₹{Number(prod.price).toLocaleString()}
                  </span>
                </div>

                <div className="d-flex gap-2 justify-content-end">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4 fw-semibold"
                    onClick={() => navigate('/subscription/renewal')}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success px-5 fw-bold shadow-sm d-inline-flex align-items-center gap-2"
                    disabled={Number(paymentForm.remainingAmount) > 0 || !paymentForm.customerOtp}
                    style={{ backgroundColor: Number(paymentForm.remainingAmount) === 0 && paymentForm.customerOtp ? '#28a745' : '#6c757d' }}
                  >
                    <CheckCircle2 size={18} />
                    <span>Customer Approved</span>
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

export default SubscriptionRenewalPI;
