import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import { InputField, Dropdown } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import {
  FileText,
  Eye,
  GitFork,
  Layers,
  CheckCircle2,
  XCircle,
  Trophy,
  UserCheck,
  Upload,
  Phone,
  ShieldCheck,
  Check,
  Package,
  CreditCard,
  Receipt,
  Plus,
  History
} from 'lucide-react';
import '../../styles/Category.css';
import '../../styles/Product.css';
import '../../styles/Lead.css';

// Operations Execution Department Employees Filtered by Territory
const operationsEmployees = [
  { id: 'EMP-001', name: 'Rajesh Kumar', department: 'Operations Execution', territory: 'Tamil Nadu' },
  { id: 'EMP-002', name: 'Priya Sundaram', department: 'Operations Execution', territory: 'Tamil Nadu' },
  { id: 'EMP-003', name: 'Karthik Subramanian', department: 'Operations Execution', territory: 'Karnataka' },
  { id: 'EMP-004', name: 'Anitha Ramesh', department: 'Operations Execution', territory: 'Kerala' }
];

// Field Executive Departments & Employees for Section 3 Final Confirmation Desk
const fieldExecDepartments = ['Sales & Marketing', 'Operations Execution', 'Service & Support', 'Pre-Sales'];

const fieldExecEmployees = [
  { id: 'FE-001', name: 'Suresh Babu', department: 'Sales & Marketing', territory: 'Tamil Nadu' },
  { id: 'FE-002', name: 'Kavitha Rajan', department: 'Sales & Marketing', territory: 'Tamil Nadu' },
  { id: 'FE-003', name: 'Dinesh Menon', department: 'Sales & Marketing', territory: 'Kerala' },
  { id: 'FE-004', name: 'Manivannan S', department: 'Operations Execution', territory: 'Tamil Nadu' },
  { id: 'FE-005', name: 'Sridevi Raghavan', department: 'Operations Execution', territory: 'Karnataka' },
  { id: 'FE-006', name: 'Ramesh Nair', department: 'Service & Support', territory: 'Kerala' },
  { id: 'FE-007', name: 'Geetha Krishnamurthy', department: 'Service & Support', territory: 'Tamil Nadu' },
  { id: 'FE-008', name: 'Vikram Pillai', department: 'Pre-Sales', territory: 'Karnataka' },
  { id: 'FE-009', name: 'Harini Balaji', department: 'Pre-Sales', territory: 'Tamil Nadu' }
];

/**
 * PIVersionManagement Component
 * Dedicated page for Proforma Invoice Version Management Register Table View.
 * Displays PID, Version, Lead ID, Customer Name, Territory, Status, Order Confirmation Status,
 * Transaction History & Log controls.
 */
const PIVersionManagement = ({ pis = [], setPIs, leads = [], setLeads }) => {
  const navigate = useNavigate();

  // Active Order Confirmation Modal State
  const [selectedPIRow, setSelectedPIRow] = useState(null);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  // Order Confirmation Form State
  const [confirmationType, setConfirmationType] = useState('Customer'); // 'Customer' | 'Employee'

  // Customer Form State
  const [customerMobile, setCustomerMobile] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [billingAddress, setBillingAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);

  // Customer Payment Fields
  const [isCustomerPaymentDone, setIsCustomerPaymentDone] = useState('No');
  const [customerPaymentType, setCustomerPaymentType] = useState('Online');
  const [customerPaidAmount, setCustomerPaidAmount] = useState('');
  const [customerPaymentProofFile, setCustomerPaymentProofFile] = useState(null);

  // Employee Form State
  const [employeeTerritory, setEmployeeTerritory] = useState('Tamil Nadu');
  const [selectedEmployeeName, setSelectedEmployeeName] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);

  // Employee Payment Fields
  const [isEmployeePaymentDone, setIsEmployeePaymentDone] = useState('No');
  const [employeePaidAmount, setEmployeePaidAmount] = useState('');
  const [employeePaymentProofFile, setEmployeePaymentProofFile] = useState(null);

  // Section 3 — Final Confirmation Desk — Field Executive Fields
  const [fieldExecDepartment, setFieldExecDepartment] = useState('Sales & Marketing');
  const [fieldExecTerritory, setFieldExecTerritory] = useState('Tamil Nadu');
  const [fieldExecEmployee, setFieldExecEmployee] = useState('');

  // --- TRANSACTION LOG & HISTORY MODAL STATES ---
  const [selectedTxnPIRow, setSelectedTxnPIRow] = useState(null);
  const [isTxnHistoryModalOpen, setIsTxnHistoryModalOpen] = useState(false);
  const [isAddTxnSubModalOpen, setIsAddTxnSubModalOpen] = useState(false);

  // Add Transaction Form Inputs
  const [txnDate, setTxnDate] = useState(new Date().toISOString().split('T')[0]);
  const [txnPaymentMethod, setTxnPaymentMethod] = useState('Bank Transfer');
  const [txnNewPaidAmount, setTxnNewPaidAmount] = useState('');
  const [txnRemarks, setTxnRemarks] = useState('');
  const [txnProofFile, setTxnProofFile] = useState(null);

  // Filter Employees based on Department & Territory
  const filteredEmployees = useMemo(() => {
    return operationsEmployees.filter(
      (e) => e.department === 'Operations Execution' && e.territory === employeeTerritory
    );
  }, [employeeTerritory]);

  // Filter Field Exec Employees for Section 3 (based on selected department & territory)
  const filteredFieldExecEmployees = useMemo(() => {
    return fieldExecEmployees.filter(
      (e) => e.department === fieldExecDepartment && e.territory === fieldExecTerritory
    );
  }, [fieldExecDepartment, fieldExecTerritory]);

  // Open Order Confirmation Modal
  const handleOpenConfirmationModal = (row) => {
    setSelectedPIRow(row);

    const matchedLead = (leads || []).find((l) => l.leadId === row.leadId);
    const terr = row.territory || (matchedLead ? matchedLead.territory : 'Tamil Nadu');

    // Pre-fill fields
    setConfirmationType('Customer');
    setCustomerMobile(row.mobile || (matchedLead ? matchedLead.mobile : '9842155667'));
    setOtpInput('');
    setIsOtpSent(false);
    setIsOtpVerified(false);
    setBillingAddress(row.billingAddress || (matchedLead ? matchedLead.address : ''));
    setDeliveryAddress(row.deliveryAddress || (matchedLead ? matchedLead.address : ''));
    setIsTermsAccepted(false);

    setIsCustomerPaymentDone('No');
    setCustomerPaymentType('Online');
    setCustomerPaidAmount('');
    setCustomerPaymentProofFile(null);

    setEmployeeTerritory(terr);
    const availableEmps = operationsEmployees.filter(
      (e) => e.department === 'Operations Execution' && e.territory === terr
    );
    setSelectedEmployeeName(availableEmps.length > 0 ? availableEmps[0].name : 'Rajesh Kumar');
    setUploadedFile(null);

    setIsEmployeePaymentDone('No');
    setEmployeePaidAmount('');
    setEmployeePaymentProofFile(null);

    // Section 3 Field Executive defaults
    setFieldExecDepartment('Sales & Marketing');
    setFieldExecTerritory(terr);
    const defFieldExecEmps = fieldExecEmployees.filter(
      (e) => e.department === 'Sales & Marketing' && e.territory === terr
    );
    setFieldExecEmployee(defFieldExecEmps.length > 0 ? defFieldExecEmps[0].name : '');

    setIsConfirmationModalOpen(true);
  };

  // OTP Verification Handlers
  const handleSendOTP = () => {
    setIsOtpSent(true);
    toast.info(`OTP sent to ${customerMobile}! Use demo OTP: 123456`);
  };

  const handleVerifyOTP = () => {
    if (otpInput.trim() === '123456' || otpInput.trim().length === 6) {
      setIsOtpVerified(true);
      toast.success('Mobile OTP verified successfully!');
    } else {
      toast.error('Invalid OTP. Please enter 123456');
    }
  };

  // Handle File Upload Simulation
  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
      toast.success(`Attached file: ${e.target.files[0].name}`);
    }
  };

  // Final Confirmation Decision Handler (Accept / Reject)
  const handleFinalOrderDecision = (decisionStatus) => {
    if (!selectedPIRow) return;

    if (confirmationType === 'Customer') {
      if (!isTermsAccepted) {
        toast.error('Customer must accept Terms & Conditions before confirmation.');
        return;
      }
    }

    if (confirmationType === 'Employee') {
      if (!selectedEmployeeName) {
        toast.error('Please select an Operations Executive employee name.');
        return;
      }
    }

    const updatedStatus = decisionStatus === 'Accept' ? 'Order Confirmed' : 'Order Rejected';

    const orderValue = Number(selectedPIRow?.totalOrderValue || 11800000);
    const actualPaid = confirmationType === 'Customer'
      ? (isCustomerPaymentDone === 'Yes' ? Number(customerPaidAmount) || 0 : 0)
      : (isEmployeePaymentDone === 'Yes' ? Number(employeePaidAmount) || 0 : 0);
    const actualRemaining = Math.max(0, orderValue - actualPaid);

    // Initial payment transaction if paid
    const initialTxns = selectedPIRow.transactions ? [...selectedPIRow.transactions] : [];
    if (actualPaid > 0) {
      initialTxns.push({
        id: `TXN-${String(Math.floor(100 + Math.random() * 900))}`,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: confirmationType === 'Customer' ? customerPaymentType : 'Bank Transfer',
        paidAmount: actualPaid,
        remainingBalance: actualRemaining,
        proofFileName: confirmationType === 'Customer'
          ? (customerPaymentProofFile ? customerPaymentProofFile.name : 'Payment_Proof.pdf')
          : (employeePaymentProofFile ? employeePaymentProofFile.name : 'Payment_Proof.pdf'),
        remarks: `Order Confirmation Payment (${confirmationType})`,
        status: 'Verified'
      });
    }

    // 1. Update PI State
    if (setPIs) {
      setPIs((prev) =>
        prev.map((p) =>
          p.id === selectedPIRow.id
            ? {
              ...p,
              orderConfirmationStatus: updatedStatus,
              transactions: initialTxns,
              orderConfirmationData: {
                confirmationType,
                customerMobile,
                isOtpVerified,
                billingAddress,
                deliveryAddress,
                isTermsAccepted,
                paymentDone: confirmationType === 'Customer' ? isCustomerPaymentDone : isEmployeePaymentDone,
                paymentType: confirmationType === 'Customer' ? customerPaymentType : 'N/A',
                paidAmount: actualPaid,
                remainingAmount: actualRemaining,
                paymentProofFileName: confirmationType === 'Customer'
                  ? (customerPaymentProofFile ? customerPaymentProofFile.name : '')
                  : (employeePaymentProofFile ? employeePaymentProofFile.name : ''),
                employeeDepartment: 'Operations Execution',
                employeeTerritory,
                employeeName: selectedEmployeeName,
                uploadedFileName: uploadedFile ? uploadedFile.name : 'PO_Signed_Document.pdf',
                // Section 3 Field Executive Assignment
                fieldExecDepartment,
                fieldExecTerritory,
                fieldExecEmployee,
                finalDecision: updatedStatus,
                confirmedAt: new Date().toLocaleString()
              }
            }
            : p
        )
      );
    }

    // 2. Update Lead Status in Lead Register to 'Won' when Order Confirmation is accepted
    if (decisionStatus === 'Accept') {
      if (setLeads && selectedPIRow.leadId) {
        setLeads((prevLeads) =>
          prevLeads.map((l) =>
            l.leadId === selectedPIRow.leadId
              ? {
                ...l,
                leadStatus: 'Won',
                closingDate: new Date().toISOString().split('T')[0],
                wonDate: new Date().toISOString().split('T')[0]
              }
              : l
          )
        );
      }
      toast.success(`Order Confirmed! Lead ${selectedPIRow.leadId} status changed to WON in Lead Register.`);
    } else {
      toast.error(`Order Rejected for ${selectedPIRow.piNumber}. Status updated in table.`);
    }

    setIsConfirmationModalOpen(false);
  };

  // --- OPEN TRANSACTION HISTORY MODAL ---
  const handleOpenTxnHistoryModal = (row) => {
    setSelectedTxnPIRow(row);

    // Initialize mock transaction if none present yet
    if (!row.transactions || row.transactions.length === 0) {
      const orderVal = Number(row.totalOrderValue || 11800000);
      const mockInitPaid = 5000000;
      const mockInitTxns = [
        {
          id: 'TXN-2026-001',
          date: row.piDate || '2026-08-25',
          paymentMethod: 'Bank Transfer',
          paidAmount: mockInitPaid,
          remainingBalance: Math.max(0, orderVal - mockInitPaid),
          proofFileName: 'Advance_Payment_NEFT.pdf',
          remarks: '50% Commercial Advance Payment',
          status: 'Verified'
        }
      ];

      if (setPIs) {
        setPIs((prev) =>
          prev.map((p) => (p.id === row.id ? { ...p, transactions: mockInitTxns } : p))
        );
      }
      setSelectedTxnPIRow({ ...row, transactions: mockInitTxns });
    }

    setIsTxnHistoryModalOpen(true);
  };

  // --- OPEN ADD TRANSACTION SUB-MODAL ---
  const handleOpenAddTxnModal = () => {
    setTxnDate(new Date().toISOString().split('T')[0]);
    setTxnPaymentMethod('Bank Transfer');
    setTxnNewPaidAmount('');
    setTxnRemarks('');
    setTxnProofFile(null);
    setIsAddTxnSubModalOpen(true);
  };

  // --- SUBMIT NEW TRANSACTION HANDLER ---
  const handleAddTxnSubmit = (e) => {
    if (e) e.preventDefault();

    const newAmount = Number(txnNewPaidAmount) || 0;
    if (newAmount <= 0) {
      toast.error('Please enter a valid paid amount greater than 0.');
      return;
    }

    const orderVal = Number(selectedTxnPIRow?.totalOrderValue || 11800000);
    const existingTxns = selectedTxnPIRow?.transactions || [];
    const prevTotalPaid = existingTxns.reduce((sum, t) => sum + Number(t.paidAmount || 0), 0);
    const newTotalPaid = prevTotalPaid + newAmount;
    const newRemaining = Math.max(0, orderVal - newTotalPaid);

    const newTxnObj = {
      id: `TXN-2026-${String(Math.floor(100 + Math.random() * 900))}`,
      date: txnDate,
      paymentMethod: txnPaymentMethod,
      paidAmount: newAmount,
      remainingBalance: newRemaining,
      proofFileName: txnProofFile ? txnProofFile.name : 'Payment_Proof_Attachment.pdf',
      remarks: txnRemarks.trim() || 'Additional installment payment',
      status: 'Verified'
    };

    const updatedTxnList = [newTxnObj, ...existingTxns];

    // Update in PIs State
    if (setPIs) {
      setPIs((prev) =>
        prev.map((p) =>
          p.id === selectedTxnPIRow.id ? { ...p, transactions: updatedTxnList } : p
        )
      );
    }

    setSelectedTxnPIRow((prev) => ({ ...prev, transactions: updatedTxnList }));
    setIsAddTxnSubModalOpen(false);
    toast.success(` Transaction recorded! Paid: ₹${newAmount.toLocaleString()} | Remaining Balance: ₹${newRemaining.toLocaleString()}`);
  };

  // --- VERSION BUTTON CLICKED IN TABLE VIEW ---
  const handleVersionButtonClick = (sourcePI) => {
    if (!sourcePI) return;
    const matchedLead = (leads || []).find((l) => l.leadId === sourcePI.leadId);
    const targetLeadId = matchedLead ? matchedLead.leadId : sourcePI.leadId;
    navigate(`/leads/${targetLeadId}/pi?piId=${sourcePI.id}&mode=version`);
  };

  // --- VIEW BUTTON CLICKED IN TABLE VIEW ---
  const handleViewButtonClick = (sourcePI) => {
    if (!sourcePI) return;
    const matchedLead = (leads || []).find((l) => l.leadId === sourcePI.leadId);
    const targetLeadId = matchedLead ? matchedLead.leadId : sourcePI.leadId;
    navigate(`/leads/${targetLeadId}/pi?piId=${sourcePI.id}&mode=view`);
  };

  // --- PROFORMA INVOICE REGISTER TABLE COLUMNS ---
  const piRegisterColumns = [
    {
      key: 'piNumber',
      title: 'PID (PI NUMBER)',
      sortable: true,
      render: (val) => <span className="fw-bold font-monospace text-primary">{val}</span>
    },
    {
      key: 'versionNumber',
      title: 'VERSION',
      sortable: true,
      align: 'center',
      render: (val) => <span className="badge bg-secondary font-monospace fs-9 px-3 py-1">Version {val || 1}</span>
    },
    {
      key: 'leadId',
      title: 'LEAD ID',
      sortable: true,
      render: (val) => <span className="badge bg-light text-dark border font-monospace">{val}</span>
    },
    {
      key: 'customerName',
      title: 'CUSTOMER NAME',
      sortable: true,
      render: (val) => <span className="fw-bold text-dark">{val}</span>
    },
    {
      key: 'territory',
      title: 'TERRITORY',
      sortable: true,
      render: (val, row) => {
        const leadObj = (leads || []).find((l) => l.leadId === row.leadId);
        return <span className="small text-muted">{row.territory || (leadObj ? leadObj.territory : 'Tamil Nadu')}</span>;
      }
    },
    {
      key: 'piStatus',
      title: 'STATUS',
      sortable: true,
      align: 'center',
      render: (val) => {
        const isAccepted = val === 'Accepted';
        return (
          <span className={`badge ${isAccepted ? 'bg-success' : 'bg-danger'} px-3 py-2 fs-9 fw-bold`}>
            {isAccepted ? 'Accepted' : 'Rejected'}
          </span>
        );
      }
    },
    {
      key: 'orderConfirmationStatus',
      title: 'ORDER CONFIRMATION',
      sortable: true,
      align: 'center',
      render: (val, row) => {
        const status = val || row.orderConfirmationStatus || 'Pending Confirmation';
        const isConfirmed = status === 'Order Confirmed';
        const isRejected = status === 'Order Rejected';

        return (
          <span
            className={`badge ${isConfirmed ? 'bg-success' : isRejected ? 'bg-danger' : 'bg-warning text-dark'
              } px-3 py-2 fs-9 fw-bold d-inline-flex align-items-center gap-1`}
          >
            {isConfirmed && <CheckCircle2 size={14} />}
            {isRejected && <XCircle size={14} />}
            {status}
          </span>
        );
      }
    },
    {
      key: 'transactions',
      title: 'TRANSACTION HISTORY',
      sortable: false,
      align: 'center',
      render: (_, row) => {
        const txns = row.transactions || [];
        const totalPaid = txns.reduce((sum, t) => sum + Number(t.paidAmount || 0), 0);
        const orderVal = Number(row.totalOrderValue || 11800000);
        const rem = Math.max(0, orderVal - totalPaid);

        return (
          <button
            type="button"
            className="btn btn-sm btn-outline-primary px-2 py-1 fw-bold d-inline-flex align-items-center gap-1 shadow-sm"
            style={{ fontSize: '12px' }}
            title="View Transaction History & Add Transaction Log"
            onClick={() => handleOpenTxnHistoryModal(row)}
          >
            <Receipt size={14} />
            <span>History ({txns.length})</span>
          </button>
        );
      }
    }
  ];

  // Actions Column Renderer (View, Version, and Order Confirmation button)
  const piRegisterActions = (row) => (
    <div className="category-actions-container d-flex align-items-center gap-1">
      <button
        type="button"
        className="category-action-btn view-btn"
        title="View Proforma Invoice Details"
        onClick={() => handleViewButtonClick(row)}
      >
        <Eye size={16} color="#2E3192" />
      </button>
      <button
        type="button"
        className="category-action-btn edit-btn"
        title={`Create New Version (Version ${(row.versionNumber || 1) + 1})`}
        onClick={() => handleVersionButtonClick(row)}
      >
        <GitFork size={16} color="#059669" />
      </button>

      {/* ORDER CONFIRMATION BUTTON IN TABLE VIEW */}
      <button
        type="button"
        className="btn btn-sm btn-primary px-2 py-1 fw-bold d-inline-flex align-items-center gap-1 shadow-sm ms-1"
        style={{ backgroundColor: '#2E3192', borderColor: '#2E3192', fontSize: '12px' }}
        title="Open Order Confirmation Flow"
        onClick={() => handleOpenConfirmationModal(row)}
      >
        <Trophy size={14} />
      </button>
    </div>
  );

  // --- PRODUCT SUMMARY TABLE COLUMNS CONFIGURATION FOR MODAL ---
  const productSummaryColumns = [
    {
      key: 'category',
      title: 'PRODUCT CATEGORY',
      sortable: true,
      render: (val) => <span className="badge bg-light text-secondary border font-monospace">{val || '—'}</span>
    },
    {
      key: 'productName',
      title: 'PRODUCT NAME',
      sortable: true,
      render: (val) => <span className="fw-bold text-dark">{val}</span>
    },
    {
      key: 'quantity',
      title: 'QTY',
      sortable: true,
      align: 'center',
      render: (val) => <span className="badge bg-secondary font-monospace">{val || 1}</span>
    },
    {
      key: 'unitPrice',
      title: 'UNIT PRICE (₹)',
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-monospace">₹{Number(val || 0).toLocaleString()}</span>
    },
    {
      key: 'lineTotal',
      title: 'TOTAL (₹)',
      sortable: true,
      align: 'right',
      render: (val) => <span className="fw-bold text-dark font-monospace">₹{Number(val || 0).toLocaleString()}</span>
    }
  ];

  // --- TRANSACTION HISTORY TABLE COLUMNS CONFIGURATION FOR MODAL ---
  const txnHistoryColumns = [
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
      render: (val) => <span className="font-monospace">{val}</span>
    },
    {
      key: 'paymentMethod',
      title: 'PAYMENT METHOD',
      sortable: true,
      render: (val) => <span className="badge bg-light text-dark border">{val}</span>
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
      title: 'PROOF OF PAYMENT',
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
  ];

  return (
    <div className="category-master-page lead-management-page container-fluid px-0 px-md-2 py-2">
      <Helmet>
        <title>Proforma Invoice Version Management | Sonocare CRM</title>
        <meta name="description" content="Proforma Invoice version management register table view in Sonocare CRM." />
      </Helmet>
      <ToastContainer />

      {/* HEADER SECTION */}
      <div className="category-page-header mb-3">
        <div className="category-page-title-group">
          <FileText size={28} style={{ color: '#2E3192' }} />
          <div>
            <h1 className="category-page-title mb-0">Proforma Invoice (PI) & Version Management</h1>
          </div>
        </div>
      </div>

      {/* PROFORMA INVOICE REGISTER TABLE VIEW */}
      <div className="category-card shadow-sm border mb-4" style={{ borderRadius: '10px' }}>
        <div className="category-card-header pb-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <Layers size={20} color="#2E3192" />
            <h2 className="category-card-title mb-0">PROFORMA INVOICE REGISTER TABLE ({pis.length})</h2>
          </div>
        </div>

        <div className="category-table-wrapper">
          <Table
            columns={piRegisterColumns}
            data={pis || []}
            showSerialNumber={true}
            serialNumberHeader="S.NO"
            actions={piRegisterActions}
            actionHeader="ACTIONS"
            actionWidth="210px"
            emptyMessage="No Proforma Invoice records generated yet."
            emptyIcon={<FileText size={40} className="text-muted d-block mx-auto mb-2 opacity-50" />}
            paginated={false}
            tableClassName="category-custom-table"
            headerClassName=""
            bordered={false}
            striped={false}
            hover={true}
            minWidth="1200px"
          />
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* TRANSACTION HISTORY & PAYMENT LOGGER MODAL                         */}
      {/* ------------------------------------------------------------------ */}
      {selectedTxnPIRow && (
        <Modal
          show={isTxnHistoryModalOpen}
          onHide={() => setIsTxnHistoryModalOpen(false)}
          title={`Transaction History & Payment Logger — ${selectedTxnPIRow.piNumber}`}
          size="lg"
          centered={true}
          footer={
            <div className="d-flex justify-content-between align-items-center w-100">
              <Button
                variant="primary"
                style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
                onClick={handleOpenAddTxnModal}
              >
                <Plus size={16} className="me-1" /> Add Transaction Log
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => setIsTxnHistoryModalOpen(false)}
              >
                Close
              </Button>
            </div>
          }
        >
          <div className="py-2">
            {/* PI & COMMERCIAL SUMMARY CARD */}
            <div className="category-card border mb-4 p-3 bg-light" style={{ borderRadius: '8px' }}>
              {(() => {
                const txns = selectedTxnPIRow.transactions || [];
                const totPaid = txns.reduce((sum, t) => sum + Number(t.paidAmount || 0), 0);
                const totVal = Number(selectedTxnPIRow.totalOrderValue || 11800000);
                const totRem = Math.max(0, totVal - totPaid);

                return (
                  <div className="row g-3 align-items-center">
                    <div className="col-12 col-md-3">
                      <span className="small text-muted d-block fw-semibold">PID / PI Number:</span>
                      <span className="fw-bold font-monospace text-primary fs-6">{selectedTxnPIRow.piNumber}</span>
                    </div>
                    <div className="col-12 col-md-3">
                      <span className="small text-muted d-block fw-semibold">Total Order Value:</span>
                      <span className="fw-bold text-dark font-monospace fs-6">₹{totVal.toLocaleString()}</span>
                    </div>
                    <div className="col-12 col-md-3">
                      <span className="small text-muted d-block fw-semibold">Total Paid Amount:</span>
                      <span className="fw-bold text-success font-monospace fs-6">₹{totPaid.toLocaleString()}</span>
                    </div>
                    <div className="col-12 col-md-3 text-md-end">
                      <span className="small text-muted d-block fw-semibold">Remaining Balance:</span>
                      <span className="fw-bold text-danger font-monospace fs-6">₹{totRem.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* TRANSACTION HISTORY TABLE */}
            <div className="category-card border mb-3" style={{ borderRadius: '8px' }}>
              <div className="category-card-header py-2 px-3 border-bottom d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <History size={18} color="#2E3192" />
                  <h6 className="category-card-title mb-0 fs-6">Transaction History Log ({selectedTxnPIRow.transactions?.length || 0})</h6>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-primary px-3 fw-bold d-inline-flex align-items-center gap-1 shadow-sm"
                  style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
                  onClick={handleOpenAddTxnModal}
                >
                  <Plus size={14} />
                  <span>Add Transaction</span>
                </button>
              </div>

              <div className="p-3">
                <div className="category-table-wrapper border rounded bg-white">
                  <Table
                    columns={txnHistoryColumns}
                    data={selectedTxnPIRow.transactions || []}
                    showSerialNumber={true}
                    serialNumberHeader="S.No"
                    paginated={false}
                    emptyMessage="No transaction logs recorded yet. Click 'Add Transaction' to record payment."
                    emptyIcon={<CreditCard size={36} className="text-muted d-block mx-auto mb-2 opacity-50" />}
                    tableClassName="category-custom-table"
                    headerClassName=""
                    bordered={false}
                    striped={false}
                    hover={true}
                    minWidth="750px"
                  />
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* SUB-MODAL: ADD NEW TRANSACTION LOG                                  */}
      {/* ------------------------------------------------------------------ */}
      {selectedTxnPIRow && isAddTxnSubModalOpen && (
        <Modal
          show={isAddTxnSubModalOpen}
          onHide={() => setIsAddTxnSubModalOpen(false)}
          title={`Add New Payment Transaction — ${selectedTxnPIRow.piNumber}`}
          size="md"
          centered={true}
          footer={
            <div className="d-flex justify-content-end gap-2 w-100">
              <Button
                variant="outline-secondary"
                onClick={() => setIsAddTxnSubModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
                onClick={handleAddTxnSubmit}
              >
                Save Transaction Log
              </Button>
            </div>
          }
        >
          <form onSubmit={handleAddTxnSubmit}>
            <div className="row g-3">
              {/* DISPLAY READ-ONLY TOTAL ORDER VALUE & PREVIOUS PAID */}
              {(() => {
                const orderVal = Number(selectedTxnPIRow.totalOrderValue || 11800000);
                const prevPaid = (selectedTxnPIRow.transactions || []).reduce(
                  (sum, t) => sum + Number(t.paidAmount || 0),
                  0
                );
                const newAmt = Number(txnNewPaidAmount) || 0;
                const calculatedRem = Math.max(0, orderVal - prevPaid - newAmt);

                return (
                  <>
                    <div className="col-12 col-md-6">
                      <InputField
                        label="Total Order Value (₹)"
                        value={`₹${orderVal.toLocaleString()}`}
                        disabled={true}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <InputField
                        label="Previously Paid Total (₹)"
                        value={`₹${prevPaid.toLocaleString()}`}
                        disabled={true}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <InputField
                        label="Transaction Date *"
                        type="date"
                        value={txnDate}
                        required={true}
                        onChange={(e) => setTxnDate(e.target.value)}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <Dropdown
                        label="Payment Method *"
                        options={['Bank Transfer', 'Online', 'UPI / Card', 'Cheque', 'Cash']}
                        value={txnPaymentMethod}
                        onChange={(e) => setTxnPaymentMethod(e.target.value)}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <InputField
                        label="New Paid Amount (₹) *"
                        type="number"
                        placeholder="Enter paid amount..."
                        value={txnNewPaidAmount}
                        required={true}
                        onChange={(e) => setTxnNewPaidAmount(e.target.value)}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <InputField
                        label="Remaining Balance (₹) [Auto-calculated]"
                        value={`₹${calculatedRem.toLocaleString()}`}
                        disabled={true}
                      />
                    </div>

                    <div className="col-12">
                      <InputField
                        label="Transaction Remarks / Bank UTR Reference"
                        placeholder="e.g. NEFT/UTR-89123019 via HDFC Bank"
                        value={txnRemarks}
                        onChange={(e) => setTxnRemarks(e.target.value)}
                      />
                    </div>

                    <div className="col-12">
                      <label className="fw-bold small text-dark mb-1">Upload Proof of Payment Document</label>
                      <input
                        type="file"
                        className="form-control form-control-sm"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setTxnProofFile(e.target.files[0]);
                            toast.success(`Attached: ${e.target.files[0].name}`);
                          }
                        }}
                      />
                      {txnProofFile && (
                        <span className="small text-success fw-bold mt-1 d-block">
                          <Upload size={12} className="me-1" /> Attached: {txnProofFile.name}
                        </span>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </form>
        </Modal>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* ORDER CONFIRMATION MODAL                                           */}
      {/* ------------------------------------------------------------------ */}
      {selectedPIRow && (
        <Modal
          show={isConfirmationModalOpen}
          onHide={() => setIsConfirmationModalOpen(false)}
          title={`Order Confirmation Workflow — ${selectedPIRow.piNumber}`}
          size="lg"
          centered={true}
          footer={
            <div className="d-flex justify-content-end gap-2 w-100">
              <Button
                variant="outline-secondary"
                onClick={() => setIsConfirmationModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => handleFinalOrderDecision('Reject')}
              >
                <XCircle size={16} className="me-1" /> Reject Confirmation
              </Button>
              <Button
                variant="success"
                onClick={() => handleFinalOrderDecision('Accept')}
              >
                <CheckCircle2 size={16} className="me-1" /> Accept Confirmation
              </Button>
            </div>
          }
        >
          <div className="py-2">
            {/* PI HEADER SUMMARY CARD */}
            <div className="category-card border mb-4 p-3 bg-light" style={{ borderRadius: '8px' }}>
              <div className="row g-3 align-items-center mb-3">
                <div className="col-12 col-md-3">
                  <span className="small text-muted d-block fw-semibold">PID / PI Number:</span>
                  <span className="fw-bold font-monospace text-primary fs-6">{selectedPIRow.piNumber}</span>
                </div>
                <div className="col-12 col-md-2">
                  <span className="small text-muted d-block fw-semibold">Version:</span>
                  <span className="badge bg-secondary font-monospace">Version {selectedPIRow.versionNumber || 1}</span>
                </div>
                <div className="col-12 col-md-4">
                  <span className="small text-muted d-block fw-semibold">Customer Name:</span>
                  <span className="fw-bold text-dark">{selectedPIRow.customerName}</span>
                </div>
                <div className="col-12 col-md-3 text-md-end">
                  <span className="small text-muted d-block fw-semibold">Total Order Value:</span>
                  <span className="fw-bold text-success font-monospace fs-6">
                    ₹{Number(selectedPIRow.totalOrderValue || 11800000).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* PRODUCTS DETAILS SUMMARY TABLE */}
              <div className="pt-2 border-top">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Package size={16} color="#2E3192" />
                  <span className="fw-bold text-dark small">Products Details Summary</span>
                </div>

                <div className="category-table-wrapper border rounded bg-white">
                  <Table
                    columns={productSummaryColumns}
                    data={selectedPIRow.lineItems || []}
                    showSerialNumber={true}
                    serialNumberHeader="S.No"
                    paginated={false}
                    emptyMessage="No product items available"
                    tableClassName="category-custom-table"
                    headerClassName=""
                    bordered={false}
                    striped={false}
                    hover={true}
                    minWidth="650px"
                  />
                </div>
              </div>
            </div>

            {/* 1. CHOOSE CONFIRMATION TYPE (CUSTOMER vs EMPLOYEE PROXY) */}
            <div className="category-card border mb-4" style={{ borderRadius: '8px' }}>
              <div className="category-card-header py-2 px-3 border-bottom d-flex align-items-center justify-content-start gap-2 text-start">
                <UserCheck size={18} color="#2E3192" className="flex-shrink-0" />
                <h6 className="category-card-title mb-0 fs-6 text-start text-dark fw-bold">1. Choose Order Confirmation Type</h6>
              </div>
              <div className="p-3">
                <div className="d-flex gap-4 mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="confType"
                      id="confTypeCustomer"
                      value="Customer"
                      checked={confirmationType === 'Customer'}
                      onChange={() => setConfirmationType('Customer')}
                    />
                    <label className="form-check-input-label fw-bold text-dark ms-1" htmlFor="confTypeCustomer">
                      Customer Confirmation (Direct Verification)
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="confType"
                      id="confTypeEmployee"
                      value="Employee"
                      checked={confirmationType === 'Employee'}
                      onChange={() => setConfirmationType('Employee')}
                    />
                    <label className="form-check-input-label fw-bold text-dark ms-1" htmlFor="confTypeEmployee">
                      Employee Confirmation (Operations Executive Proxy)
                    </label>
                  </div>
                </div>

                {/* --- CUSTOMER CONFIRMATION DETAILS --- */}
                {confirmationType === 'Customer' && (
                  <div className="p-3 bg-light rounded border">
                    <h6 className="fw-bold text-dark mb-3 small border-bottom pb-2">Customer Verification & Address Details</h6>
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <InputField
                          label="Customer Mobile Number (Autofilled)"
                          value={customerMobile}
                          disabled={true}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="fw-bold small text-dark mb-1 d-block">OTP Verification *</label>
                        <div className="input-group input-group-sm">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter 6-digit OTP (e.g. 123456)"
                            value={otpInput}
                            onChange={(e) => setOtpInput(e.target.value)}
                          />
                          {!isOtpSent ? (
                            <button className="btn btn-outline-primary fw-bold" type="button" onClick={handleSendOTP}>
                              <Phone size={14} className="me-1" /> Send OTP
                            </button>
                          ) : (
                            <button className="btn btn-success fw-bold" type="button" onClick={handleVerifyOTP}>
                              <Check size={14} className="me-1" /> Verify OTP
                            </button>
                          )}
                        </div>
                        {isOtpVerified && <span className="small text-success fw-bold mt-1 d-block">✓ Mobile Verified</span>}
                      </div>

                      <div className="col-12 col-md-6">
                        <InputField
                          label="Billing Address"
                          type="textarea"
                          rows={2}
                          value={billingAddress}
                          onChange={(e) => setBillingAddress(e.target.value)}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <InputField
                          label="Delivery Address"
                          type="textarea"
                          rows={2}
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                        />
                      </div>

                      <div className="col-12 pt-2 border-top">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="acceptTC"
                            checked={isTermsAccepted}
                            onChange={(e) => setIsTermsAccepted(e.target.checked)}
                          />
                          <label className="form-check-label fw-bold text-dark ms-1" htmlFor="acceptTC">
                            Customer accepts commercial Terms & Conditions (Required to confirm order)
                          </label>
                        </div>
                      </div>

                      {/* NEW PAYMENT FIELDS FOR CUSTOMER */}
                      <div className="col-12 pt-3 mt-2 border-top">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <CreditCard size={16} color="#2E3192" />
                          <h6 className="fw-bold text-dark mb-0 small">Payment Status Details</h6>
                        </div>

                        <div className="row g-3">
                          <div className="col-12 col-md-6">
                            <Dropdown
                              label="Payment Done? *"
                              options={['No', 'Yes']}
                              value={isCustomerPaymentDone}
                              onChange={(e) => setIsCustomerPaymentDone(e.target.value)}
                            />
                          </div>

                          {isCustomerPaymentDone === 'Yes' && (
                            <>
                              <div className="col-12 col-md-6">
                                <Dropdown
                                  label="Payment Type "
                                  options={['Online', 'Bank Transfer', 'UPI / Card', 'Cheque']}
                                  value={customerPaymentType}
                                  onChange={(e) => setCustomerPaymentType(e.target.value)}
                                />
                              </div>

                              <div className="col-12 col-md-4">
                                <InputField
                                  label="Paid Amount (₹) "
                                  type="number"
                                  placeholder="Enter paid amount..."
                                  value={customerPaidAmount}
                                  onChange={(e) => setCustomerPaidAmount(e.target.value)}
                                />
                              </div>

                              <div className="col-12 col-md-4">
                                <InputField
                                  label="Remaining Amount (₹) [Auto-calculated]"
                                  value={`₹${Math.max(
                                    0,
                                    Number(selectedPIRow?.totalOrderValue || 11800000) - (Number(customerPaidAmount) || 0)
                                  ).toLocaleString()}`}
                                  disabled={true}
                                />
                              </div>

                              <div className="col-12 col-md-4">
                                <label className="fw-bold small text-dark mb-1">Upload Proof of Payment</label>
                                <input
                                  type="file"
                                  className="form-control form-control-sm"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      setCustomerPaymentProofFile(e.target.files[0]);
                                      toast.success(`Attached payment proof: ${e.target.files[0].name}`);
                                    }
                                  }}
                                />
                                {customerPaymentProofFile && (
                                  <span className="small text-success fw-bold mt-1 d-block">
                                    <Upload size={12} className="me-1" /> Attached: {customerPaymentProofFile.name}
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- EMPLOYEE (PROXY) CONFIRMATION DETAILS --- */}
                {confirmationType === 'Employee' && (
                  <div className="p-3 bg-light rounded border">
                    <h6 className="fw-bold text-dark mb-3 small border-bottom pb-2">Operations Executive Proxy Details</h6>
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <InputField
                          label="Customer Territory (Autofilled)"
                          value={employeeTerritory}
                          disabled={true}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <InputField
                          label="Department (Executive Proxy)"
                          value="Operations Execution"
                          disabled={true}
                        />
                      </div>

                      <div className="col-12 col-md-6">
                        <Dropdown
                          label="Operations Executive (Filtered by Territory) *"
                          options={filteredEmployees.map((e) => e.name)}
                          value={selectedEmployeeName}
                          onChange={(e) => setSelectedEmployeeName(e.target.value)}
                        />
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="fw-bold small text-dark mb-1">Upload Signed PO / Confirmation Document</label>
                        <input
                          type="file"
                          className="form-control form-control-sm"
                          accept=".pdf,.doc,.docx,.png,.jpg"
                          onChange={handleFileUpload}
                        />
                        {uploadedFile && (
                          <span className="small text-success fw-bold mt-1 d-block">
                            <Upload size={12} className="me-1" /> Attached: {uploadedFile.name}
                          </span>
                        )}
                      </div>

                      {/* NEW PAYMENT FIELDS FOR EMPLOYEE */}
                      <div className="col-12 pt-3 mt-2 border-top">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <CreditCard size={16} color="#2E3192" />
                          <h6 className="fw-bold text-dark mb-0 small">Payment Status Details</h6>
                        </div>

                        <div className="row g-3">
                          <div className="col-12 col-md-6">
                            <Dropdown
                              label="Payment Done? *"
                              options={['No', 'Yes']}
                              value={isEmployeePaymentDone}
                              onChange={(e) => setIsEmployeePaymentDone(e.target.value)}
                            />
                          </div>

                          {isEmployeePaymentDone === 'Yes' && (
                            <>
                              <div className="col-12 col-md-6">
                                <InputField
                                  label="Paid Amount (₹) *"
                                  type="number"
                                  placeholder="Enter paid amount..."
                                  value={employeePaidAmount}
                                  onChange={(e) => setEmployeePaidAmount(e.target.value)}
                                />
                              </div>

                              <div className="col-12 col-md-6">
                                <InputField
                                  label="Remaining Amount (₹) [Auto-calculated]"
                                  value={`₹${Math.max(
                                    0,
                                    Number(selectedPIRow?.totalOrderValue || 11800000) - (Number(employeePaidAmount) || 0)
                                  ).toLocaleString()}`}
                                  disabled={true}
                                />
                              </div>

                              <div className="col-12 col-md-6">
                                <label className="fw-bold small text-dark mb-1">Upload Proof of Payment</label>
                                <input
                                  type="file"
                                  className="form-control form-control-sm"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      setEmployeePaymentProofFile(e.target.files[0]);
                                      toast.success(`Attached payment proof: ${e.target.files[0].name}`);
                                    }
                                  }}
                                />
                                {employeePaymentProofFile && (
                                  <span className="small text-success fw-bold mt-1 d-block">
                                    <Upload size={12} className="me-1" /> Attached: {employeePaymentProofFile.name}
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. FINAL CONFIRMATION SECTION (PRESENTS REGARDLESS OF CUSTOMER / EMPLOYEE SELECTION) */}
            <div className="category-card border mb-2" style={{ borderRadius: '8px' }}>
              <div className="category-card-header py-2 px-3 border-bottom d-flex align-items-center justify-content-start gap-2 text-start">
                <ShieldCheck size={18} color="#2E3192" className="flex-shrink-0" />
                <h6 className="category-card-title mb-0 fs-6 text-start text-dark fw-bold me-auto">3. Final Commercial Confirmation Desk</h6>
                <span className="badge bg-secondary">Department: Operations Execution</span>
              </div>
              <div className="p-3">
                {/* Read-only summary row */}
                <div className="row g-3 align-items-center mb-3">
                  <div className="col-12 col-md-4">
                    <span className="small text-muted d-block fw-semibold">Department:</span>
                    <span className="fw-bold text-dark">Operations Execution</span>
                  </div>
                  <div className="col-12 col-md-4">
                    <span className="small text-muted d-block fw-semibold">Territory:</span>
                    <span className="fw-bold text-dark">{employeeTerritory}</span>
                  </div>
                  <div className="col-12 col-md-4">
                    <span className="small text-muted d-block fw-semibold">Confirming Executive Name:</span>
                    <span className="fw-bold text-primary">
                      {confirmationType === 'Employee' ? selectedEmployeeName : 'Rajesh Kumar (Operations Execution Desk)'}
                    </span>
                  </div>
                </div>

                {/* Field Executive fields */}
                <div className="border-top pt-3">
                  <p className="small fw-semibold text-muted mb-2">Field Executive Assignment</p>
                  <div className="row g-3">
                    {/* Field Executive Department */}
                    <div className="col-12 col-md-4">
                      <Dropdown
                        label="Field Executive Department *"
                        options={fieldExecDepartments}
                        value={fieldExecDepartment}
                        onChange={(e) => {
                          const dept = e.target.value;
                          setFieldExecDepartment(dept);
                          // Reset employee when dept changes
                          const available = fieldExecEmployees.filter(
                            (fe) => fe.department === dept && fe.territory === fieldExecTerritory
                          );
                          setFieldExecEmployee(available.length > 0 ? available[0].name : '');
                        }}
                      />
                    </div>

                    {/* Territory (filters Field Employee list) */}
                    <div className="col-12 col-md-4">
                      <Dropdown
                        label="Territory *"
                        options={['Tamil Nadu', 'Karnataka', 'Kerala', 'Andhra Pradesh', 'Telangana']}
                        value={fieldExecTerritory}
                        onChange={(e) => {
                          const terr = e.target.value;
                          setFieldExecTerritory(terr);
                          // Reset employee when territory changes
                          const available = fieldExecEmployees.filter(
                            (fe) => fe.department === fieldExecDepartment && fe.territory === terr
                          );
                          setFieldExecEmployee(available.length > 0 ? available[0].name : '');
                        }}
                      />
                    </div>

                    {/* Field Employee (filtered by department + territory) */}
                    <div className="col-12 col-md-4">
                      <Dropdown
                        label="Field Employee (Filtered) *"
                        options={
                          filteredFieldExecEmployees.length > 0
                            ? filteredFieldExecEmployees.map((fe) => fe.name)
                            : ['No employees in this territory']
                        }
                        value={fieldExecEmployee}
                        onChange={(e) => setFieldExecEmployee(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PIVersionManagement;
