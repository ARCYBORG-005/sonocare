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
  Save
} from 'lucide-react';
import { initialMockSubscriptions } from './mockSubscriptionData';
import '../../styles/Category.css';
import '../../styles/Product.css';
import '../../styles/Lead.css';
import '../OrderFulfilment/OrderFulfilment.css';
import '../AMC/AMCManagement.css';
import './SubscriptionManagement.css';

/**
 * EditSubscription Component
 * Dedicated workspace page for editing Subscription terms following Edit AMC page design.
 * Route: /subscription/:id/edit
 */
const EditSubscription = () => {
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

  // Form State
  const [formData, setFormData] = useState({
    subscriptionType: targetSub?.subscriptionType || 'Monthly',
    billingCycle: targetSub?.billingCycle || 'Monthly (1st of month)',
    basePrice: targetSub?.basePrice || 40000,
    discountPercent: targetSub?.discountPercent || 5,
    gstPercent: targetSub?.gstPercent || 18,
    price: targetSub?.price || 45000,
    startDate: targetSub?.startDate || '2025-01-16',
    nextBillingDate: targetSub?.nextBillingDate || '2026-06-16',
    alertBeforeDays: targetSub?.alertBeforeDays || '30 Days',
    status: targetSub?.status || 'Active'
  });

  // Calculate cycle total
  const calculateTotal = (base, discPct, gstPct) => {
    const b = Number(base) || 0;
    const d = Number(discPct) || 0;
    const g = Number(gstPct) || 0;
    const discAmount = (b * d) / 100;
    const taxable = Math.max(0, b - discAmount);
    const gstAmount = (taxable * g) / 100;
    return Math.round(taxable + gstAmount);
  };

  const handleBaseChange = (val) => {
    const newTot = calculateTotal(val, formData.discountPercent, formData.gstPercent);
    setFormData((prev) => ({
      ...prev,
      basePrice: val,
      price: newTot
    }));
  };

  const handleDiscountChange = (val) => {
    const newTot = calculateTotal(formData.basePrice, val, formData.gstPercent);
    setFormData((prev) => ({
      ...prev,
      discountPercent: val,
      price: newTot
    }));
  };

  const handleGstChange = (val) => {
    const newTot = calculateTotal(formData.basePrice, formData.discountPercent, val);
    setFormData((prev) => ({
      ...prev,
      gstPercent: val,
      price: newTot
    }));
  };

  // Submit Handler
  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    let list = [...initialMockSubscriptions];
    try {
      const stored = JSON.parse(localStorage.getItem('app_subscriptions') || '[]');
      if (stored.length > 0) list = stored;
    } catch (err) {
      console.error(err);
    }

    const updated = list.map((s) =>
      s.id === targetSub.id || s.subscriptionId === targetSub.subscriptionId
        ? {
            ...s,
            ...formData,
            price: Number(formData.price)
          }
        : s
    );

    try {
      localStorage.setItem('app_subscriptions', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }

    toast.success(`Subscription ${targetSub?.subscriptionId} updated successfully!`);
    setTimeout(() => {
      navigate('/subscription');
    }, 1200);
  };

  return (
    <div className="order-fulfilment-page container-fluid px-0 px-md-2 py-2">
      <Helmet>
        <title>Edit Subscription Details | Sonocare CRM</title>
        <meta name="description" content="Edit Subscription details following Edit AMC page design." />
      </Helmet>
      <ToastContainer />

      {/* HEADER BAR (CLEAN TRANSPARENT HEADER — NO CARD BEHIND IT) */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 py-1">
        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary p-1"
            onClick={() => navigate('/subscription')}
            title="Back to Subscription Register"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="d-flex align-items-center gap-2">
            <CreditCard size={26} color="#2E3192" />
            <div>
              <h2 className="fs-5 fw-bold mb-0 text-dark">
                Edit Subscription Details — {targetSub?.subscriptionId}
              </h2>
              <span className="small text-muted font-monospace">
                Order Ref: {targetSub?.orderFulfilmentId} | PI: {targetSub?.piNumber}
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
                    Product 1: {targetSub?.productSummary || 'Sonoscape P20 Expert Diagnostic Ultrasound System'}
                  </h6>
                  <span className="badge bg-secondary font-monospace">Qty: 1</span>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <span className="small text-muted fw-semibold">Warranty Status:</span>
                  <span className="badge bg-success">Bundled in Subscription (AMC Excluded)</span>
                </div>
              </div>

              {/* Product Software & Warranty Info Input Boxes */}
              <div className="row g-3">
                <div className="col-12 col-sm-6 col-md-6">
                  <InputField
                    label="Product Category"
                    value={targetSub?.category || 'Diagnostic Ultrasound System'}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-sm-6 col-md-6">
                  <InputField
                    label="Serial Number"
                    value={targetSub?.serialNumber || 'SN-P20-2026-4412'}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-sm-6 col-md-6">
                  <InputField
                    label="Software Version"
                    value={targetSub?.softwareVersion || 'v5.1.0-SUB'}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-sm-6 col-md-6">
                  <InputField
                    label="Software License Key"
                    value={targetSub?.licenseKey || 'LIC-SUB-P20-8812-B'}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-sm-6 col-md-6">
                  <InputField
                    label="Installation Date"
                    type="date"
                    value={targetSub?.installationDate || '2025-01-15'}
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

              {/* Editable Product Commercial & Subscription Financial Breakdown */}
              <div className="border-top pt-3">
                <h6 className="fw-bold text-dark mb-3 small d-flex align-items-center gap-2">
                  <DollarSign size={16} className="text-primary" />
                  <span>Subscription Financial Terms & Recurring Billing Cycle (EDITABLE)</span>
                </h6>
                <div className="row g-3">
                  <div className="col-12 col-md-6 col-lg-6">
                    <Dropdown
                      label="Subscription Type *"
                      options={['Monthly', 'Half-Yearly', 'Yearly']}
                      value={formData.subscriptionType}
                      onChange={(e) => setFormData({ ...formData, subscriptionType: e.target.value })}
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-6">
                    <Dropdown
                      label="Subscription Status *"
                      options={['Active', 'Pending Payment', 'Lapsed']}
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-6">
                    <InputField
                      label="Base Price per Cycle (₹) *"
                      type="number"
                      value={formData.basePrice}
                      onChange={(e) => handleBaseChange(e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-6">
                    <InputField
                      label="Discount (%) *"
                      type="number"
                      value={formData.discountPercent}
                      onChange={(e) => handleDiscountChange(e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-6">
                    <InputField
                      label="GST % *"
                      type="number"
                      value={formData.gstPercent}
                      onChange={(e) => handleGstChange(e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-6">
                    <InputField
                      label="Recurring Cycle Total (₹)"
                      type="number"
                      value={formData.price}
                      disabled={true}
                      helpText="Calculated: Base - Discount + GST"
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-6">
                    <Dropdown
                      label="Alert Before Days *"
                      options={['15 Days', '30 Days', '60 Days', '90 Days']}
                      value={formData.alertBeforeDays}
                      onChange={(e) => setFormData({ ...formData, alertBeforeDays: e.target.value })}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <InputField
                      label="Subscription Start Date *"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <InputField
                      label="Next Recurring Billing Date *"
                      type="date"
                      value={formData.nextBillingDate}
                      onChange={(e) => setFormData({ ...formData, nextBillingDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* CARD BOTTOM FOOTER: APPLIED DISCOUNT/GST, GRAND TOTAL, CANCEL & UPDATE BUTTONS */}
              <div className="d-flex flex-column align-items-end border-top pt-3 mt-2 gap-3">
                <div className="d-flex align-items-center gap-3 flex-wrap justify-content-end text-end">
                  <span className="small text-muted font-monospace border-end pe-3">
                    Applied: Discount ({formData.discountPercent}%) | GST ({formData.gstPercent}%)
                  </span>
                  <span className="small text-muted fw-semibold">Grand Total Subscription Price for 1 Cycle:</span>
                  <span className="fs-3 fw-bold text-success font-monospace">
                    ₹{Number(formData.price).toLocaleString()}
                  </span>
                </div>

                <div className="d-flex gap-2 justify-content-end">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4 fw-semibold"
                    onClick={() => navigate('/subscription')}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-5 fw-bold shadow-sm d-inline-flex align-items-center gap-2"
                    style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
                  >
                    <Save size={18} />
                    <span>Update Subscription</span>
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

export default EditSubscription;
