import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { InputField, Dropdown } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import {
  Ban,
  ArrowLeft,
  UserCheck,
  PackageCheck,
  DollarSign,
  Boxes,
  Save,
  ShieldCheck,
  AlertOctagon
} from 'lucide-react';
import { initialMockCancellations } from './mockCancellationData';
import '../../styles/Category.css';
import '../../styles/Product.css';
import '../../styles/Lead.css';
import './OrderFulfilment.css';
import '../AMC/AMCManagement.css';

/**
 * EditCancellation Component
 * Editable workspace page for Rule 3.3.8 Order Cancellation requests & Manager Approval.
 * Route: /order-cancellation/:id/edit
 */
const EditCancellation = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Locate target cancellation
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

  // Form State
  const [formState, setFormState] = useState({
    cancellationStage: 'Before Dispatch',
    chargePercent: 0,
    processingFee: 2500,
    managerApproved: false,
    managerNotes: '',
    status: 'Pending Manager Approval',
    reason: ''
  });

  // Populate state on load
  useEffect(() => {
    if (targetCancellation) {
      setFormState({
        cancellationStage: targetCancellation.cancellationStage || 'Before Dispatch',
        chargePercent: targetCancellation.chargePercent || 0,
        processingFee: targetCancellation.processingFee || 2500,
        managerApproved: targetCancellation.managerApproved || false,
        managerNotes: targetCancellation.managerNotes || '',
        status: targetCancellation.status || 'Pending Manager Approval',
        reason: targetCancellation.reason || ''
      });
    }
  }, [targetCancellation]);

  // Handle Stage Change & Recalculate Rule 3.3.8 Terms
  const handleStageChange = (newStage) => {
    let newChargePct = 0;
    let newFee = 0;
    let statusVal = formState.status;

    if (newStage === 'Before Dispatch') {
      newChargePct = 0;
      newFee = 2500;
      statusVal = 'Approved';
    } else if (newStage === 'After Dispatch') {
      newChargePct = 30; // Standard 30% charge between 20-50%
      newFee = 0;
      statusVal = 'Approved';
    } else if (newStage === 'After Installation') {
      newChargePct = 20; // 20% restocking fee
      newFee = 0;
      statusVal = 'Pending Manager Approval';
    }

    setFormState((prev) => ({
      ...prev,
      cancellationStage: newStage,
      chargePercent: newChargePct,
      processingFee: newFee,
      status: statusVal
    }));
  };

  // Calculated Refund Amount
  const calculatedRefund = useMemo(() => {
    const total = Number(targetCancellation?.orderTotal || 0);
    const stage = formState.cancellationStage;

    if (stage === 'Before Dispatch') {
      return Math.max(0, total - Number(formState.processingFee || 0));
    }
    const chargeAmt = Math.round((total * Number(formState.chargePercent || 0)) / 100);
    return Math.max(0, total - chargeAmt);
  }, [targetCancellation, formState.cancellationStage, formState.chargePercent, formState.processingFee]);

  // Form Submit Handler
  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    const isAfterInstallation = formState.cancellationStage === 'After Installation';
    if (isAfterInstallation && !formState.managerApproved) {
      toast.error('Rule 3.3.8: Manager Approval is REQUIRED for cancellations after installation!');
      return;
    }

    let finalTerms = '';
    if (formState.cancellationStage === 'Before Dispatch') {
      finalTerms = `100% Refund (-₹${Number(formState.processingFee).toLocaleString()} Fee)`;
    } else if (formState.cancellationStage === 'After Dispatch') {
      finalTerms = `${formState.chargePercent}% Cancellation Charge Applied`;
    } else {
      finalTerms = `20% Restocking Fee (Manager Approved)`;
    }

    const updatedRecord = {
      ...targetCancellation,
      cancellationStage: formState.cancellationStage,
      chargePercent: Number(formState.chargePercent),
      processingFee: Number(formState.processingFee),
      refundTerms: finalTerms,
      refundAmount: calculatedRefund,
      managerApprovalRequired: isAfterInstallation,
      managerApproved: formState.managerApproved,
      managerApprovalStatus: isAfterInstallation
        ? formState.managerApproved
          ? 'Approved by Manager'
          : 'Pending Manager Approval'
        : 'Auto-Approved',
      managerNotes: formState.managerNotes,
      status: formState.status,
      reason: formState.reason
    };

    try {
      let list = [...initialMockCancellations];
      const stored = JSON.parse(localStorage.getItem('app_order_cancellations') || '[]');
      if (stored.length > 0) list = stored;

      const updatedList = list.map((item) =>
        item.cancellationId === targetCancellation.cancellationId ? updatedRecord : item
      );

      localStorage.setItem('app_order_cancellations', JSON.stringify(updatedList));
    } catch (err) {
      console.error(err);
    }

    toast.success(`Cancellation ${targetCancellation?.cancellationId} terms updated successfully!`);
    setTimeout(() => {
      navigate('/order-cancellation');
    }, 1200);
  };

  return (
    <div className="order-fulfilment-page container-fluid px-0 px-md-2 py-2">
      <Helmet>
        <title>Edit Order Cancellation | Sonocare CRM</title>
        <meta name="description" content="Edit Rule 3.3.8 Order Cancellation & Manager Approval." />
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
                Edit Order Cancellation — {targetCancellation?.cancellationId}
              </h2>
              <span className="small text-muted font-monospace">
                Fulfilment Ref: {targetCancellation?.orderFulfilmentId} | Customer: {targetCancellation?.customerName}
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="d-flex flex-column gap-4 mb-4">
          
          {/* CARD 1: CUSTOMER DETAILS (READ ONLY) */}
          <div className="category-card shadow-sm border bg-white" style={{ borderRadius: '10px' }}>
            <div className="section-card-title-bar">
              <UserCheck size={18} color="#2E3192" />
              <span>Customer & Product Summary</span>
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
                    label="Product Name"
                    value={targetCancellation?.productName}
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
                    label="Request Date"
                    type="date"
                    value={targetCancellation?.requestDate}
                    disabled={true}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: SECTION 2 — RULE 3.3.8 CANCELLATION STAGE & MANAGER APPROVAL */}
          <div className="category-card shadow-sm border bg-white" style={{ borderRadius: '10px' }}>
            <div className="section-card-title-bar">
              <PackageCheck size={18} color="#2E3192" />
              <span>SECTION 2 — Rule 3.3.8 Cancellation Terms & Fee Calculations</span>
            </div>

            <div className="p-3 d-flex flex-column gap-4">
              
              <div className="row g-3">
                {/* Cancellation Stage Select */}
                <div className="col-12 col-md-6">
                  <Dropdown
                    label="Cancellation Stage *"
                    options={[
                      'Before Dispatch',
                      'After Dispatch',
                      'After Installation'
                    ]}
                    value={formState.cancellationStage}
                    onChange={(e) => handleStageChange(e.target.value)}
                  />
                </div>

                {/* Status Dropdown */}
                <div className="col-12 col-md-6">
                  <Dropdown
                    label="Cancellation Status *"
                    options={[
                      'Pending Manager Approval',
                      'Approved',
                      'Refund Processed',
                      'Rejected'
                    ]}
                    value={formState.status}
                    onChange={(e) => setFormState({ ...formState, status: e.target.value })}
                  />
                </div>

                {/* Stage Specific Fee Inputs */}
                {formState.cancellationStage === 'Before Dispatch' && (
                  <div className="col-12 col-md-6">
                    <InputField
                      label="Processing Fee (₹) *"
                      type="number"
                      value={formState.processingFee}
                      onChange={(e) => setFormState({ ...formState, processingFee: e.target.value })}
                      helpText="Rule 3.3.8: 100% refund minus standard processing fee"
                    />
                  </div>
                )}

                {formState.cancellationStage === 'After Dispatch' && (
                  <div className="col-12 col-md-6">
                    <InputField
                      label="Cancellation Charge (% Range 20%-50%) *"
                      type="number"
                      value={formState.chargePercent}
                      onChange={(e) => setFormState({ ...formState, chargePercent: e.target.value })}
                      helpText="Rule 3.3.8: 20% to 50% charge after dispatch"
                    />
                  </div>
                )}

                {formState.cancellationStage === 'After Installation' && (
                  <div className="col-12 col-md-6">
                    <InputField
                      label="Restocking Fee (%) *"
                      type="number"
                      value={formState.chargePercent}
                      disabled={true}
                      helpText="Rule 3.3.8: Standard 20% restocking fee on return"
                    />
                  </div>
                )}

                <div className="col-12 col-md-6">
                  <InputField
                    label="Calculated Refund Amount (₹)"
                    value={`₹${calculatedRefund.toLocaleString()}`}
                    disabled={true}
                    helpText="Net Refund payable to customer"
                  />
                </div>

                {/* Manager Approval Section for After Installation */}
                {formState.cancellationStage === 'After Installation' && (
                  <div className="col-12 border-top pt-3">
                    <div className="p-3 bg-light rounded border">
                      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <ShieldCheck size={20} className="text-warning" />
                          <h6 className="fw-bold mb-0 text-dark">Manager Approval Required (Rule 3.3.8)</h6>
                        </div>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="managerApprovedSwitch"
                            checked={formState.managerApproved}
                            onChange={(e) =>
                              setFormState({
                                ...formState,
                                managerApproved: e.target.checked,
                                status: e.target.checked ? 'Approved' : 'Pending Manager Approval'
                              })
                            }
                          />
                          <label className="form-check-label fw-bold text-dark" htmlFor="managerApprovedSwitch">
                            {formState.managerApproved ? 'Manager Approved' : 'Pending Approval'}
                          </label>
                        </div>
                      </div>
                      <span className="small text-muted d-block">
                        Post-installation cancellations require explicit Manager Approval before refund processing.
                      </span>
                    </div>
                  </div>
                )}

                <div className="col-12">
                  <label className="form-label small fw-semibold text-dark mb-1">
                    Manager Review Notes & Approval Justification
                  </label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Enter manager remarks or approval terms..."
                    value={formState.managerNotes}
                    onChange={(e) => setFormState({ ...formState, managerNotes: e.target.value })}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold text-dark mb-1">
                    Customer Reason / Reason Details
                  </label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={formState.reason}
                    onChange={(e) => setFormState({ ...formState, reason: e.target.value })}
                  />
                </div>
              </div>

              {/* CARD BOTTOM FOOTER */}
              <div className="d-flex flex-column align-items-end border-top pt-3 mt-2 gap-3">
                <div className="d-flex align-items-center gap-3 flex-wrap justify-content-end text-end">
                  <span className="small text-muted fw-semibold">Net Calculated Refund Total:</span>
                  <span className="fs-3 fw-bold text-success font-monospace">
                    ₹{calculatedRefund.toLocaleString()}
                  </span>
                </div>

                <div className="d-flex gap-2 justify-content-end">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4 fw-semibold"
                    onClick={() => navigate('/order-cancellation')}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-5 fw-bold shadow-sm d-inline-flex align-items-center gap-2"
                    style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
                  >
                    <Save size={18} />
                    <span>Save Cancellation Terms</span>
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

export default EditCancellation;
