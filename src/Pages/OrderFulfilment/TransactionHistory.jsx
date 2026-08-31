import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Table from '../../components/Table';
import { InputField, Dropdown } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import {
  CreditCard,
  Plus,
  FileText,
  CheckCircle2,
  ArrowLeft,
  DollarSign,
  User,
  Building2,
  Receipt
} from 'lucide-react';
import '../../styles/Category.css';
import '../../styles/Product.css';
import '../../styles/Lead.css';
import './OrderFulfilment.css';

/**
 * TransactionHistory Component
 * Dedicated workspace page for managing Payment Transactions & Balance Tracking.
 * Linked directly to PI record and Order Fulfilment Register.
 */
const TransactionHistory = ({ pis = [], setPIs, leads = [] }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Target PI based on URL param (PI Number, e.g. PI-2026-003-V1)
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

  // Commercial Deal & Service Type
  const serviceType = targetPI?.serviceType || 'One Time + AMC';
  const subscriptionType = targetPI?.subscriptionType || 'Monthly';
  const isSubscription = serviceType === 'Subscription';
  const totalOrderValue = Number(targetPI?.totalOrderValue || 11800000);

  // Existing transactions or default initial transaction list
  const [transactions, setTransactions] = useState(() => {
    if (targetPI && targetPI.transactions && targetPI.transactions.length > 0) {
      return targetPI.transactions;
    }
    return [
      {
        id: 'TXN-2026-001',
        date: '2026-08-25',
        paymentMethod: 'Bank Transfer (NEFT / RTGS)',
        paidAmount: 5000000,
        remainingBalance: Math.max(0, totalOrderValue - 5000000),
        proofFileName: 'NEFT_Receipt_50L.pdf',
        remarks: 'Initial advance payment received.',
        status: 'Verified'
      }
    ];
  });

  // Calculate Total Paid & Remaining Balance
  const totalAmountPaid = useMemo(() => {
    return transactions.reduce((acc, t) => acc + (Number(t.paidAmount) || 0), 0);
  }, [transactions]);

  const remainingBalance = Math.max(0, totalOrderValue - totalAmountPaid);

  // New Transaction Form State
  const [newTxnForm, setNewTxnForm] = useState({
    txnDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Bank Transfer (NEFT / RTGS)',
    paidAmount: '',
    refId: `TXN-2026-${String(Math.floor(1000 + Math.random() * 9000))}`,
    proofFileName: '',
    remarks: ''
  });

  // Handle Add New Transaction Submit
  const handleAddTransaction = (e) => {
    if (e) e.preventDefault();

    const amt = Number(newTxnForm.paidAmount) || 0;
    if (amt <= 0) {
      toast.error('Please enter a valid positive payment amount.');
      return;
    }

    const newRem = Math.max(0, remainingBalance - amt);
    const newTxnEntry = {
      id: newTxnForm.refId || `TXN-2026-${String(Math.floor(1000 + Math.random() * 9000))}`,
      date: newTxnForm.txnDate || new Date().toISOString().split('T')[0],
      paymentMethod: newTxnForm.paymentMethod || 'Bank Transfer (NEFT / RTGS)',
      paidAmount: amt,
      remainingBalance: newRem,
      proofFileName: newTxnForm.proofFileName || 'Bank_Receipt.pdf',
      remarks: newTxnForm.remarks || '',
      status: 'Verified'
    };

    const updatedTxns = [...transactions, newTxnEntry];
    setTransactions(updatedTxns);

    // Update global PIs state
    if (setPIs && targetPI) {
      const newPaymentStatus = newRem === 0 ? 'Paid' : 'Partial';
      setPIs((prev) =>
        prev.map((p) =>
          p.id === targetPI.id
            ? {
                ...p,
                transactions: updatedTxns,
                paymentStatus: newPaymentStatus,
                paidAmount: totalAmountPaid + amt
              }
            : p
        )
      );
    }

    toast.success(`New payment of ₹${amt.toLocaleString()} recorded successfully! History table updated.`);

    // Reset Form
    setNewTxnForm({
      txnDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'Bank Transfer (NEFT / RTGS)',
      paidAmount: '',
      refId: `TXN-2026-${String(Math.floor(1000 + Math.random() * 9000))}`,
      proofFileName: '',
      remarks: ''
    });
  };

  return (
    <div className="category-master-page lead-management-page container-fluid px-0 px-md-2 py-2">
      <Helmet>
        <title>Transaction History & Payments | Sonocare CRM</title>
        <meta name="description" content="Transaction History and Payment Recording Page in Sonocare CRM." />
      </Helmet>
      <ToastContainer />

      {/* HEADER SECTION */}
      <div className="category-page-header mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="category-page-title-group">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary me-2 px-2 py-1"
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/proforma-invoice'))}
            title="Back to Register"
          >
            <ArrowLeft size={16} />
          </button>
          <CreditCard size={28} style={{ color: '#2E3192' }} />
          <div>
            <h1 className="category-page-title mb-0">
              Transaction History & Payment Tracking — {targetPI?.piNumber || 'PI Reference'}
            </h1>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className={`badge ${remainingBalance === 0 ? 'bg-success' : 'bg-warning text-dark'} px-3 py-2 fs-6`}>
            {remainingBalance === 0 ? 'Payment Completed' : 'Payment Pending'}
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* SECTIONS CONTAINER                                                 */}
      {/* ------------------------------------------------------------------ */}
      <div className="d-flex flex-column gap-4 mb-4">

        {/* SECTION 1 — CUSTOMER & COMMERCIAL DEAL DETAILS (NO BADGES) */}
        <div className="category-card shadow-sm border" style={{ borderRadius: '10px' }}>
          <div className="section-card-title-bar">
            <User size={18} color="#2E3192" />
            <span>SECTION 1 — Customer & Commercial Deal Details (Read-Only)</span>
          </div>
          <div className="p-3">
            <div className="row g-3">
              <div className="col-12 col-md-6 col-lg-4">
                <InputField
                  label="Customer / Hospital Name"
                  value={targetPI?.customerName || targetLead?.customerName || 'KMCH Specialty Hospital'}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <InputField
                  label="Contact Person"
                  value={targetPI?.contactPerson || targetLead?.contactPerson || 'Dr. Subramanian'}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <InputField
                  label="Mobile & Email"
                  value={`${targetPI?.mobile || targetLead?.mobile || '9842155667'} | ${targetLead?.email || 'purchasing@kmch.org'}`}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <InputField
                  label="Territory / Location"
                  value={targetPI?.territory || targetLead?.territory || 'Coimbatore, Tamil Nadu'}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <InputField
                  label="PI Reference & Version"
                  value={`${targetPI?.piNumber || 'PI-2026-003'} (Version ${targetPI?.versionNumber || 1})`}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <InputField
                  label="Service Type (Pricing Model)"
                  value={isSubscription ? `Subscription (${subscriptionType})` : serviceType}
                  disabled={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2 — FINANCIAL SUMMARY & BALANCE TRACKING */}
        <div className="category-card shadow-sm border p-4 bg-white" style={{ borderRadius: '10px' }}>
          <div className="row g-3 text-center text-md-start align-items-center">
            <div className="col-12 col-sm-4 border-end-md">
              <span className="small text-muted d-block fw-semibold">
                {isSubscription ? `Amount per Cycle (${subscriptionType}):` : 'Total Order Value:'}
              </span>
              <span className="fs-4 fw-bold text-dark font-monospace">₹{totalOrderValue.toLocaleString()}</span>
            </div>
            <div className="col-12 col-sm-4 border-end-md">
              <span className="small text-muted d-block fw-semibold">Total Amount Received (Paid):</span>
              <span className="fs-4 fw-bold text-success font-monospace">₹{totalAmountPaid.toLocaleString()}</span>
            </div>
            <div className="col-12 col-sm-4">
              <span className="small text-muted d-block fw-semibold">Outstanding Remaining Balance:</span>
              <span className="fs-4 fw-bold text-danger font-monospace">₹{remainingBalance.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* SECTION 3 — RECORD NEW PAYMENT TRANSACTION */}
        <div className="category-card shadow-sm border" style={{ borderRadius: '10px' }}>
          <div className="section-card-title-bar">
            <Plus size={18} color="#2E3192" />
            <span>SECTION 3 — Record New Payment Transaction</span>
          </div>
          <div className="p-3">
            <form onSubmit={handleAddTransaction}>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <InputField
                    label="Transaction Date "
                    type="date"
                    required={true}
                    value={newTxnForm.txnDate}
                    onChange={(e) => setNewTxnForm({ ...newTxnForm, txnDate: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <Dropdown
                    label="Payment Method / Type "
                    required={true}
                    options={[
                      'Bank Transfer (NEFT / RTGS)',
                      'Cheque',
                      'Credit / Debit Card',
                      'UPI / Online Payment',
                      'Cash'
                    ]}
                    value={newTxnForm.paymentMethod}
                    onChange={(e) => setNewTxnForm({ ...newTxnForm, paymentMethod: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Amount Paid (₹) "
                    type="number"
                    required={true}
                    placeholder="e.g. 5000000"
                    value={newTxnForm.paidAmount}
                    onChange={(e) => setNewTxnForm({ ...newTxnForm, paidAmount: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Transaction Reference / ID "
                    required={true}
                    placeholder="e.g. TXN-2026-8912"
                    value={newTxnForm.refId}
                    onChange={(e) => setNewTxnForm({ ...newTxnForm, refId: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Payment Proof Document Upload"
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setNewTxnForm({ ...newTxnForm, proofFileName: e.target.files[0].name });
                        toast.success(`Attached receipt: ${e.target.files[0].name}`);
                      }
                    }}
                    helpText={newTxnForm.proofFileName ? `Attached: ${newTxnForm.proofFileName}` : ''}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Remarks / Notes"
                    placeholder="Payment verification remarks..."
                    value={newTxnForm.remarks}
                    onChange={(e) => setNewTxnForm({ ...newTxnForm, remarks: e.target.value })}
                  />
                </div>
                <div className="col-12 d-flex justify-content-end mt-2">
                  <button
                    type="submit"
                    className="btn btn-primary px-4 py-2 fw-bold d-inline-flex align-items-center gap-1 shadow-sm"
                    style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
                  >
                    <Plus size={16} />
                    <span>Add Transaction</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* SECTION 4 — TRANSACTION HISTORY TABLE VIEW */}
        <div className="category-card shadow-sm border" style={{ borderRadius: '10px' }}>
          <div className="section-card-title-bar">
            <Receipt size={18} color="#2E3192" />
            <span>SECTION 4 — Transaction History Table View ({transactions.length})</span>
          </div>
          <div className="p-3">
            <div className="category-table-wrapper border rounded bg-white">
              <Table
                columns={[
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
                    render: (val) => <span className="font-monospace fw-semibold">{val}</span>
                  },
                  {
                    key: 'paymentMethod',
                    title: 'PAYMENT METHOD',
                    sortable: true,
                    render: (val) => <span className="small text-dark border-bottom">{val}</span>
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
                  },
                  {
                    key: 'status',
                    title: 'STATUS',
                    sortable: true,
                    align: 'center',
                    render: (val) => <span className="badge bg-success">{val || 'Verified'}</span>
                  }
                ]}
                data={transactions}
                showSerialNumber={true}
                serialNumberHeader="S.NO"
                paginated={false}
                tableClassName="category-custom-table"
                bordered={false}
                striped={false}
                hover={true}
                minWidth="750px"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TransactionHistory;
