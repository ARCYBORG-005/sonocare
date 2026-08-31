import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { InputField } from '../../components/FormInputs';
import { ToastContainer } from '../../components/Toast';
import {
  Ban,
  ArrowLeft,
  UserCheck,
  PackageCheck,
  DollarSign,
  Boxes,
  Edit,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import { initialMockCancellations } from './mockCancellationData';
import '../../styles/Category.css';
import '../../styles/Product.css';
import '../../styles/Lead.css';
import './OrderFulfilment.css';
import '../AMC/AMCManagement.css';

/**
 * ViewCancellation Component
 * Read-only view workspace page for Order Cancellation requests.
 * Route: /order-cancellation/:id/view
 */
const ViewCancellation = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Locate target cancellation request
  const targetCancellation = useMemo(() => {
    let list = [...initialMockCancellations];
    try {
      const stored = JSON.parse(localStorage.getItem('app_order_cancellations') || '[]');
      if (stored.length > 0) list = stored;
    } catch (e) {
      console.error(e);
    }
    const decoded = decodeURIComponent(id || '');
    return (
      list.find((c) => c.cancellationId === decoded || c.id === decoded) ||
      list[0]
    );
  }, [id]);

  return (
    <div className="order-fulfilment-page container-fluid px-0 px-md-2 py-2">
      <Helmet>
        <title>View Order Cancellation Details | Sonocare CRM</title>
        <meta name="description" content="View Rule 3.3.8 Order Cancellation Details." />
      </Helmet>
      <ToastContainer />

      {/* HEADER BAR (CLEAN TRANSPARENT HEADER — NO CARD BEHIND IT) */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 py-1">
        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary p-1"
            onClick={() => navigate('/order-cancellation')}
            title="Back to Order Cancellation Register"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="d-flex align-items-center gap-2">
            <Ban size={26} className="text-danger" />
            <div>
              <h2 className="fs-5 fw-bold mb-0 text-dark">
                Order Cancellation Details — {targetCancellation?.cancellationId}
              </h2>
              <span className="small text-muted font-monospace">
                Order Ref: {targetCancellation?.orderFulfilmentId} | Date: {targetCancellation?.requestDate}
              </span>
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-primary px-3 fw-bold d-inline-flex align-items-center gap-1"
            style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
            onClick={() => navigate(`/order-cancellation/${encodeURIComponent(targetCancellation?.cancellationId)}/edit`)}
          >
            <Edit size={15} />
            <span>Edit Cancellation</span>
          </button>
        </div>
      </div>

      <div className="d-flex flex-column gap-4 mb-4">
        
        {/* CARD 1: CUSTOMER DETAILS & ORDER REFERENCE (READ ONLY) */}
        <div className="category-card shadow-sm border bg-white" style={{ borderRadius: '10px' }}>
          <div className="section-card-title-bar">
            <UserCheck size={18} color="#2E3192" />
            <span>Customer & Order Reference</span>
          </div>
          <div className="p-3">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <InputField
                  label="Customer / Hospital Name"
                  value={targetCancellation?.customerName}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Contact Person"
                  value={targetCancellation?.contactPerson}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Mobile & Email"
                  value={`${targetCancellation?.mobile} | ${targetCancellation?.email}`}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Order Fulfilment ID"
                  value={targetCancellation?.orderFulfilmentId}
                  disabled={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: SECTION 2 — CANCELLATION STAGE & RULE 3.3.8 FINANCIAL REFUND BREAKDOWN */}
        <div className="category-card shadow-sm border bg-white" style={{ borderRadius: '10px' }}>
          <div className="section-card-title-bar">
            <PackageCheck size={18} color="#2E3192" />
            <span>Cancellation Stage & Financial Breakdown</span>
          </div>

          <div className="p-3 d-flex flex-column gap-4">
            
            {/* Product Header */}
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 pb-2 border-bottom">
              <div className="d-flex align-items-center gap-2">
                <Boxes size={18} className="text-primary" />
                <h6 className="fw-bold text-dark mb-0 fs-6">
                  Product: {targetCancellation?.productName}
                </h6>
                <span className="badge bg-secondary font-monospace">Qty: {targetCancellation?.productQty || 1}</span>
              </div>

              <div className="d-flex align-items-center gap-2">
                <span className="small text-muted fw-semibold">Cancellation Stage:</span>
                <span className="badge bg-danger">{targetCancellation?.cancellationStage}</span>
              </div>
            </div>

            {/* Rule 3.3.8 Terms Information Fields */}
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <InputField
                  label="Cancellation Stage"
                  value={targetCancellation?.cancellationStage}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Applied Rule 3.3.8 Terms"
                  value={targetCancellation?.refundTerms}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Total Order Amount (₹)"
                  value={`₹${Number(targetCancellation?.orderTotal || 0).toLocaleString()}`}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Deduction / Restocking Charge"
                  value={
                    targetCancellation?.chargePercent > 0
                      ? `${targetCancellation?.chargePercent}% Deduction`
                      : `₹${Number(targetCancellation?.processingFee || 0).toLocaleString()} Processing Fee`
                  }
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Calculated Refund Amount (₹)"
                  value={`₹${Number(targetCancellation?.refundAmount || 0).toLocaleString()}`}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Manager Approval Requirement"
                  value={targetCancellation?.managerApprovalRequired ? 'Manager Approval Required (Post-Installation Return)' : 'Auto-Permitted / Standard Policy'}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Manager Approval Status"
                  value={targetCancellation?.managerApprovalStatus || 'Pending Review'}
                  disabled={true}
                />
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold text-dark mb-1">
                  Cancellation Reason & Customer Notes
                </label>
                <textarea
                  className="form-control bg-light"
                  rows={2}
                  value={targetCancellation?.reason || 'No additional notes specified.'}
                  disabled={true}
                />
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold text-dark mb-1">
                  Manager Review Notes
                </label>
                <textarea
                  className="form-control bg-light font-monospace"
                  rows={2}
                  value={targetCancellation?.managerNotes || 'Pending Manager Review.'}
                  disabled={true}
                />
              </div>
            </div>

            {/* CARD BOTTOM FOOTER */}
            <div className="d-flex flex-column align-items-end border-top pt-3 mt-2 gap-3">
              <div className="d-flex align-items-center gap-3 flex-wrap justify-content-end text-end">
                <span className="small text-muted fw-semibold">Net Calculated Refund Amount:</span>
                <span className="fs-3 fw-bold text-success font-monospace">
                  ₹{Number(targetCancellation?.refundAmount || 0).toLocaleString()}
                </span>
              </div>

              <div className="d-flex gap-2 justify-content-end">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 fw-semibold"
                  onClick={() => navigate('/order-cancellation')}
                >
                  Back 
                </button>
                
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ViewCancellation;
