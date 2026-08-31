import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { InputField } from '../../components/FormInputs';
import { ToastContainer } from '../../components/Toast';
import {
  CreditCard,
  ArrowLeft,
  UserCheck,
  PackageCheck,
  DollarSign,
  Boxes,
  Edit
} from 'lucide-react';
import { initialMockSubscriptions } from './mockSubscriptionData';
import '../../styles/Category.css';
import '../../styles/Product.css';
import '../../styles/Lead.css';
import '../OrderFulfilment/OrderFulfilment.css';
import '../AMC/AMCManagement.css';
import './SubscriptionManagement.css';

/**
 * ViewSubscription Component
 * Dedicated workspace page for viewing Subscription deal details following AMC/Installation page layout.
 * Route: /subscription/:id/view
 */
const ViewSubscription = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Locate target subscription
  const sub = useMemo(() => {
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

  return (
    <div className="order-fulfilment-page container-fluid px-0 px-md-2 py-2">
      <Helmet>
        <title>View Subscription Details | Sonocare CRM</title>
        <meta name="description" content="View Subscription deal details following AMC page design." />
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
                Subscription Details — {sub?.subscriptionId}
              </h2>
              <span className="small text-muted font-monospace">
                Order Ref: {sub?.orderFulfilmentId} | PI: {sub?.piNumber}
              </span>
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-success px-3 py-2 fw-bold">{sub?.status || 'Active'}</span>
         
        </div>
      </div>

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
                  value={sub?.client || 'Apollo Hospitals & Diagnostic Centre'}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Contact Person"
                  value={sub?.contactPerson || 'Dr. Rajesh Kumar'}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Mobile & Email"
                  value={`${sub?.mobile || '9845012345'} | ${sub?.email || 'purchase@apollo.com'}`}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Territory / Location"
                  value={sub?.territory || 'Chennai, Tamil Nadu'}
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
                  Product 1: {sub?.productSummary || 'Sonoscape P20 Expert Diagnostic Ultrasound System'}
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
                  value={sub?.category || 'Diagnostic Ultrasound System'}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-sm-6 col-md-6">
                <InputField
                  label="Serial Number"
                  value={sub?.serialNumber || 'SN-P20-2026-4412'}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-sm-6 col-md-6">
                <InputField
                  label="Software Version"
                  value={sub?.softwareVersion || 'v5.1.0-SUB'}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-sm-6 col-md-6">
                <InputField
                  label="Software License Key"
                  value={sub?.licenseKey || 'LIC-SUB-P20-8812-B'}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-sm-6 col-md-6">
                <InputField
                  label="Installation Date"
                  type="date"
                  value={sub?.installationDate || '2025-01-15'}
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

            {/* Product Commercial & Subscription Financial Breakdown */}
            <div className="border-top pt-3">
              <h6 className="fw-bold text-dark mb-3 small d-flex align-items-center gap-2">
                <DollarSign size={16} className="text-primary" />
                <span>Subscription Financial Terms & Recurring Billing Cycle</span>
              </h6>
              <div className="row g-3">
                <div className="col-12 col-md-6 col-lg-6">
                  <InputField
                    label="Subscription Type"
                    value={sub?.subscriptionType || 'Monthly'}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6 col-lg-6">
                  <InputField
                    label="Billing Cycle Frequency"
                    value={sub?.billingCycle || 'Monthly (1st of every month)'}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6 col-lg-6">
                  <InputField
                    label="Base Price per Cycle (₹)"
                    value={`₹${Number(sub?.basePrice || 40000).toLocaleString()}`}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6 col-lg-6">
                  <InputField
                    label="Discount (%)"
                    value={`${sub?.discountPercent || 5}%`}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6 col-lg-6">
                  <InputField
                    label="GST %"
                    value={`${sub?.gstPercent || 18}%`}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6 col-lg-6">
                  <InputField
                    label="Recurring Cycle Total (₹)"
                    value={`₹${Number(sub?.price || 45000).toLocaleString()}`}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6 col-lg-6">
                  <InputField
                    label="Alert Before Days"
                    value={sub?.alertBeforeDays || '30 Days'}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Subscription Start Date"
                    type="date"
                    value={sub?.startDate || '2025-01-16'}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Next Recurring Billing Date"
                    type="date"
                    value={sub?.nextBillingDate || '2026-06-16'}
                    disabled={true}
                  />
                </div>
              </div>
            </div>

            {/* CARD BOTTOM FOOTER: APPLIED DISCOUNT/GST, GRAND TOTAL, BACK & EDIT BUTTONS */}
            <div className="d-flex flex-column align-items-end border-top pt-3 mt-2 gap-3">
              <div className="d-flex align-items-center gap-3 flex-wrap justify-content-end text-end">
                <span className="small text-muted font-monospace border-end pe-3">
                  Applied: Discount ({sub?.discountPercent || 5}%) | GST ({sub?.gstPercent || 18}%)
                </span>
                <span className="small text-muted fw-semibold">Grand Total Subscription Price for 1 Cycle:</span>
                <span className="fs-3 fw-bold text-success font-monospace">
                  ₹{Number(sub?.price || 45000).toLocaleString()}
                </span>
              </div>

              <div className="d-flex gap-2 justify-content-end">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 fw-semibold"
                  onClick={() => navigate('/subscription')}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn btn-primary px-5 fw-bold shadow-sm d-inline-flex align-items-center gap-2"
                  style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
                  onClick={() => navigate(`/subscription/${encodeURIComponent(sub?.subscriptionId)}/edit`)}
                >
                  <Edit size={18} />
                  <span>Update Subscription</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ViewSubscription;
