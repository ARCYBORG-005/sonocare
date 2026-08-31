import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import { InputField, Dropdown, MultiSelect } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import {
  Wrench,
  UserCheck,
  Building2,
  FileText,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Key,
  ShieldCheck,
  CreditCard,
  Star,
  Lock,
  PackageCheck,
  Send,
  AlertCircle,
  Truck,
  Upload
} from 'lucide-react';
import {
  initialMockEmployees,
  mockTerritoryData,
  mockDepartmentData
} from '../Masters/mockEmployees';
import '../../styles/Category.css';
import '../../styles/Product.css';
import '../../styles/Lead.css';
import './OrderFulfilment.css';

/**
 * InstallationTaskAssignment Component
 * Page for assigning and executing Equipment & Software Installation tasks.
 * Includes:
 * 1. Territory-based dynamic filtering for Department & Employee MultiSelects.
 * 2. Manual Payment Details entry (Payment Received Y/N, Amount, Pending, Proof Upload, Remarks / Mandatory Zero Payment Remarks).
 * 3. 3-step Prerequisite verification bar.
 * 4. Customer Happy Code (OTP) verification and auto-triggered Feedback Survey.
 */
const InstallationTaskAssignment = ({ pis = [], setPIs, leads = [], employees = [] }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Resolve target PI record from state
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

  // Service Type & Subscription Type from PI
  const serviceType = targetPI?.serviceType || 'One Time + AMC';
  const subscriptionType = targetPI?.subscriptionType || 'Monthly';
  const isSubscription = serviceType === 'Subscription';

  // Total Order Value calculation
  const totalOrderValue = Number(targetPI?.totalOrderValue || 11800000);

  // Real-time Total Paid Amount from Transaction History Log
  const totalPaidFromHistory = useMemo(() => {
    if (targetPI && targetPI.transactions && targetPI.transactions.length > 0) {
      return targetPI.transactions.reduce((acc, t) => acc + Number(t.paidAmount || 0), 0);
    }
    return Number(targetPI?.paidAmount || 5000000);
  }, [targetPI]);

  // -------------------------------------------------------------------------
  // SECTION 3: MANUAL PAYMENT DETAILS & ZERO PAYMENT AUTHORIZATION STATE
  // -------------------------------------------------------------------------
  const [paymentReceived, setPaymentReceived] = useState('Yes'); // 'Yes' | 'No'
  const [paymentStatus, setPaymentStatus] = useState('Partial');
  const [amountPaid, setAmountPaid] = useState('');
  const [proofFileName, setProofFileName] = useState('NEFT_Receipt_50L.pdf');
  const [operationsRemarks, setOperationsRemarks] = useState('Payment verified via NEFT bank transfer.');

  const effectivePaidAmount = amountPaid !== '' ? (Number(amountPaid) || 0) : totalPaidFromHistory;
  const paidVal = paymentReceived === 'No' ? 0 : effectivePaidAmount;
  const remainingVal = Math.max(0, totalOrderValue - paidVal);

  // -------------------------------------------------------------------------
  // SECTION 4: TERRITORY & EMPLOYEE MASTER DYNAMIC FILTERING LOGIC
  // -------------------------------------------------------------------------
  const employeeMasterList = useMemo(() => {
    return (employees && employees.length > 0) ? employees : initialMockEmployees;
  }, [employees]);

  // Master Territory List
  const territoryOptions = useMemo(() => {
    const fromEmps = Array.from(new Set(employeeMasterList.map((e) => e.territory).filter(Boolean)));
    const combined = Array.from(new Set([...fromEmps, ...mockTerritoryData]));
    return combined.length > 0 ? combined : ['Coimbatore', 'Chennai', 'Madurai', 'Bengaluru', 'Kochi', 'Salem'];
  }, [employeeMasterList]);

  // Selected Territory State
  const [selectedTerritory, setSelectedTerritory] = useState('Coimbatore');

  // Filter Active Employees based on Selected Territory
  const filteredEmployees = useMemo(() => {
    if (!selectedTerritory) return employeeMasterList;
    return employeeMasterList.filter(
      (emp) => emp.status === 'Active' && String(emp.territory).toLowerCase().includes(String(selectedTerritory).toLowerCase())
    );
  }, [employeeMasterList, selectedTerritory]);

  // Filter Department Options based on Selected Territory
  const departmentOptions = useMemo(() => {
    const deptsInTerritory = Array.from(
      new Set(filteredEmployees.map((emp) => emp.department).filter(Boolean))
    );
    return deptsInTerritory.length > 0 ? deptsInTerritory : mockDepartmentData;
  }, [filteredEmployees]);

  // Formatted Employee Options: "Name (Role - Dept)"
  const employeeOptions = useMemo(() => {
    if (filteredEmployees.length === 0) {
      return [`Default Field Executive (${selectedTerritory})`];
    }
    return filteredEmployees.map(
      (emp) => `${emp.employeeName} (${emp.role || emp.department || 'Executive'})`
    );
  }, [filteredEmployees, selectedTerritory]);

  // Task Assignment Form State
  const [assignmentData, setAssignmentData] = useState({
    territory: selectedTerritory,
    departments: [departmentOptions[0] || 'Field Sales'],
    assignedEmployees: [employeeOptions[0] || 'Default Executive'],
    priority: 'High',
    targetDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    assignmentRemarks: 'Priority customer installation. Perform standard pre-commissioning checks.'
  });

  // Handle Territory Selection Change & Dynamic MultiSelect Update
  const handleTerritoryChange = (newTerritory) => {
    setSelectedTerritory(newTerritory);

    // Compute new filtered employees & departments
    const newEmps = employeeMasterList.filter(
      (emp) => emp.status === 'Active' && String(emp.territory).toLowerCase().includes(String(newTerritory).toLowerCase())
    );
    const newDepts = Array.from(new Set(newEmps.map((emp) => emp.department).filter(Boolean)));
    const finalDepts = newDepts.length > 0 ? newDepts : mockDepartmentData;
    const finalEmpLabels = newEmps.length > 0
      ? newEmps.map((emp) => `${emp.employeeName} (${emp.role || emp.department || 'Executive'})`)
      : [`Default Field Executive (${newTerritory})`];

    setAssignmentData((prev) => ({
      ...prev,
      territory: newTerritory,
      departments: [finalDepts[0]],
      assignedEmployees: [finalEmpLabels[0]]
    }));

    toast.info(`Updated department & employee options for ${newTerritory} territory.`);
  };

  // -------------------------------------------------------------------------
  // WARRANTY & INSTALLATION DATE STATE (SECTION 2 & TABLE INTEGRATION)
  // -------------------------------------------------------------------------
  const [installationDate, setInstallationDate] = useState(
    targetPI?.installationData?.installationDate || new Date().toISOString().split('T')[0]
  );
  const [warrantyMonths, setWarrantyMonths] = useState(
    targetPI?.installationData?.warrantyMonths || 12
  );

  // Calculate Warranty End Date: Installation Date + Warranty Duration Months
  const warrantyEndDate = useMemo(() => {
    if (!installationDate) return '';
    const d = new Date(installationDate);
    if (isNaN(d.getTime())) return '';
    d.setMonth(d.getMonth() + Number(warrantyMonths || 12));
    return d.toISOString().split('T')[0];
  }, [installationDate, warrantyMonths]);

  // -------------------------------------------------------------------------
  // SECTION 5: INSTALLATION WORKFLOW EXECUTION & OTP STATE
  // -------------------------------------------------------------------------
  const [workflowState, setWorkflowState] = useState({
    taskAccepted: true,
    installationDate: new Date().toISOString().split('T')[0],
    installationStartDate: new Date().toISOString().split('T')[0],
    installationStartTime: '09:30 AM',
    installationEndDate: new Date().toISOString().split('T')[0],
    installationEndTime: '04:30 PM',
    serviceReportNumber: 'SR-2026-0891',
    serviceNotes: 'All ultrasound transducers tested. Software license key activated cleanly.',
    happyCodeOtp: '',
    otpVerified: false,
    rating: 5,
    customerFeedback: 'Excellent installation work and prompt demonstration by Medialogic executive.',
    installationStatus: 'In Progress'
  });

  // Verify Customer Happy Code OTP
  const handleVerifyOtp = () => {
    if (!workflowState.happyCodeOtp || workflowState.happyCodeOtp.trim().length < 4) {
      toast.error('Please enter a valid 6-digit Customer Happy Code OTP.');
      return;
    }
    setWorkflowState((prev) => ({ ...prev, otpVerified: true }));
    toast.success('Customer Happy Code OTP Verified Successfully!');
  };

  // Save Assignment Handler
  const handleSaveAssignment = (e) => {
    if (e) e.preventDefault();

    // Zero Upfront Payment Validation Rule
    if ((paymentReceived === 'No' || paidVal === 0) && (!operationsRemarks || !operationsRemarks.trim())) {
      toast.error('Upfront payment received is zero. Mandatory Operations Executive remarks are required before Task Assignment can be saved.');
      return;
    }

    if (!assignmentData.assignedEmployees || assignmentData.assignedEmployees.length === 0) {
      toast.error(`Please select at least one executive for ${selectedTerritory} territory.`);
      return;
    }

    if (setPIs && targetPI) {
      setPIs((prev) =>
        prev.map((p) =>
          p.id === targetPI.id
            ? {
                ...p,
                installationData: {
                  installationDate,
                  warrantyMonths,
                  warrantyEndDate,
                  assignmentData,
                  savedAt: new Date().toLocaleString()
                }
              }
            : p
        )
      );
    }

    toast.success(`Installation Task Assignment updated for ${selectedTerritory} territory!`);
  };

  // Complete Installation Handler
  const handleCompleteInstallation = () => {
    // Zero Upfront Payment Validation Rule
    if ((paymentReceived === 'No' || paidVal === 0) && (!operationsRemarks || !operationsRemarks.trim())) {
      toast.error('Upfront payment received is zero. Mandatory Operations Executive remarks are required before completing installation.');
      return;
    }

    if (!workflowState.otpVerified) {
      toast.error('Customer Happy Code (OTP) verification is required before marking installation completed.');
      return;
    }

    setWorkflowState((prev) => ({ ...prev, installationStatus: 'Completed' }));

    if (setPIs && targetPI) {
      setPIs((prev) =>
        prev.map((p) =>
          p.id === targetPI.id
            ? {
                ...p,
                installationStatus: 'Completed',
                installationData: {
                  installationDate,
                  warrantyMonths,
                  warrantyEndDate,
                  assignmentData,
                  savedAt: new Date().toLocaleString()
                }
              }
            : p
        )
      );
    }

    toast.success('Installation Task Marked COMPLETED! Customer feedback survey dispatched.');
    setTimeout(() => {
      navigate('/order-fulfilment');
    }, 1200);
  };

  return (
    <div className="category-master-page lead-management-page container-fluid px-0 px-md-2 py-2">
      <Helmet>
        <title>Installation Task Assignment | Sonocare CRM</title>
        <meta name="description" content="Installation Task Assignment and OTP Verification Workflow in Sonocare CRM." />
      </Helmet>
      <ToastContainer />

      {/* HEADER SECTION */}
      <div className="category-page-header mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="category-page-title-group">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary me-2 px-2 py-1"
            onClick={() => navigate('/order-fulfilment')}
            title="Back to Order Fulfilment Register"
          >
            <ArrowLeft size={16} />
          </button>
          <Wrench size={28} style={{ color: '#2E3192' }} />
          <div>
            <h1 className="category-page-title mb-0">
              Installation Task Assignment — {targetPI?.piNumber || 'PI Reference'}
            </h1>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-primary px-3 py-2 fs-6 d-inline-flex align-items-center gap-1">
            <UserCheck size={14} /> Field & Marketing Executive Task
          </span>
          <span className={`badge ${workflowState.installationStatus === 'Completed' ? 'bg-success' : 'bg-info text-dark'} px-3 py-2 fs-6`}>
            Status: {workflowState.installationStatus}
          </span>
        </div>
      </div>

      {/* PREREQUISITES VERIFICATION BAR */}
      <div className="card shadow-sm border mb-4 bg-light" style={{ borderRadius: '10px' }}>
        <div className="card-body p-3">
          <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
            <ShieldCheck size={18} color="#2E3192" />
            <span>Installation Prerequisites Checklist (All 3 Must Complete Before Software Installation Starts)</span>
          </h6>
          <div className="row g-2 mt-1">
            <div className="col-12 col-md-4">
              <div className="p-2 border rounded bg-white d-flex align-items-center gap-2">
                <CheckCircle2 size={18} className="text-success" />
                <div>
                  <span className="small fw-bold d-block text-dark">1. Kit Generation</span>
                  <span className="extra-small text-muted">Kits Configured & Ready</span>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="p-2 border rounded bg-white d-flex align-items-center gap-2">
                <CheckCircle2 size={18} className={paymentReceived === 'No' && (!operationsRemarks || !operationsRemarks.trim()) ? 'text-warning' : 'text-success'} />
                <div>
                  <span className="small fw-bold d-block text-dark">2. Payment Verification</span>
                  <span className="extra-small text-muted">
                    {paymentReceived === 'Yes' ? 'Upfront Payment Verified' : 'Zero Payment Remarks Required'}
                  </span>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="p-2 border rounded bg-white d-flex align-items-center gap-2">
                <CheckCircle2 size={18} className="text-success" />
                <div>
                  <span className="small fw-bold d-block text-dark">3. Dispatch & Transport</span>
                  <span className="extra-small text-muted">Goods Delivered to Site</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* SECTIONS CONTAINER                                                 */}
      {/* ------------------------------------------------------------------ */}
      <div className="d-flex flex-column gap-4 mb-4">

        {/* SECTION 1 — CUSTOMER DETAILS */}
        <div className="category-card shadow-sm border" style={{ borderRadius: '10px' }}>
          <div className="section-card-title-bar">
            <Building2 size={18} color="#2E3192" />
            <span>SECTION 1 — Customer Details & Site Location (Read-Only)</span>
          </div>
          <div className="p-3">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <InputField
                  label="Customer / Hospital Name"
                  value={targetPI?.customerName || targetLead?.customerName || 'KMCH Specialty Hospital'}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Contact Person"
                  value={targetLead?.contactPerson || targetPI?.contactPerson || 'Dr. Subramanian'}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Mobile Number"
                  value={targetPI?.mobile || targetLead?.mobile || '9842155667'}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Email Address"
                  value={targetLead?.email || 'purchasing@kmch.org'}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Installation Site Address"
                  type="textarea"
                  rows={2}
                  value={targetPI?.deliveryAddress || targetLead?.address || 'KMCH Diagnostic Wing, Floor 2, Avinashi Road, Coimbatore, Tamil Nadu 641014'}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Billing Address"
                  type="textarea"
                  rows={2}
                  value={targetPI?.billingAddress || targetLead?.address || 'KMCH Hospital Road, Avinashi Road, Coimbatore, Tamil Nadu 641014'}
                  disabled={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2 — PRODUCT & SOFTWARE LICENSE DETAILS */}
        <div className="category-card shadow-sm border" style={{ borderRadius: '10px' }}>
          <div className="section-card-title-bar justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <Key size={18} color="#2E3192" />
              <span>SECTION 2 — Product System & Software License Summary</span>
            </div>
            {isSubscription && (
              <span className="badge bg-purple text-white px-3 py-1 fs-6" style={{ backgroundColor: '#7C3AED' }}>
                Subscription Model: {subscriptionType}
              </span>
            )}
          </div>
          <div className="p-3">
            <div className="row g-3 ">
              <div className="col-12 col-md-6 ">
                <InputField
                  label="Product System"
                  value={targetPI?.lineItems?.[0]?.productName || 'Sonoscape X5 Portable Ultrasound System (Qty: 2)'}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Product Serial Number (SN)"
                  value={targetPI?.lineItems?.[0]?.serialNumber || 'SN-2026-001'}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Service Type (Pricing Model)"
                  value={isSubscription ? `Subscription (${subscriptionType})` : serviceType}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Product Software License Key (Product Level)"
                  value="LIC-SONO-9821-KMCH-PROD"
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="License Type"
                  value="Permanent Software Key (1-Year Standard)"
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Configured Kits (Selected for Product)"
                  value={
                    targetPI?.kitFulfilmentData?.selectedKitsMap
                      ? Object.values(targetPI.kitFulfilmentData.selectedKitsMap).flat().join(', ') || 'Sonoscape X5 Standard Transducer & Trolley Kit'
                      : 'Sonoscape X5 Standard Transducer & Trolley Kit'
                  }
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label={isSubscription ? `Amount per Cycle (${subscriptionType})` : "Total Order Value"}
                  value={`₹${totalOrderValue.toLocaleString()}`}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6  ">
                <InputField
                  label="Installation Date (Auto-set from Report) "
                  type="date"
                  value={installationDate}
                  onChange={(e) => setInstallationDate(e.target.value)}
                />
              </div>
              <div className="col-12 col-md-6">
                <Dropdown
                  label="Warranty Duration (Months) "
                  options={['6 Months', '12 Months', '24 Months', '36 Months', '48 Months', '60 Months']}
                  value={`${warrantyMonths} Months`}
                  dropUp={true}
                  onChange={(e) => {
                    const months = parseInt(e.target.value, 10) || 12;
                    setWarrantyMonths(months);
                  }}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Warranty Expiry Date (Calculated)"
                  type="date"
                  value={warrantyEndDate}
                  disabled={true}
                  helpText="Calculated: Installation Date + Duration"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3 — MANUAL PAYMENT DETAILS & ZERO PAYMENT AUTHORIZATION */}
        <div className="category-card shadow-sm border" style={{ borderRadius: '10px' }}>
          <div className="section-card-title-bar">
            <CreditCard size={18} color="#2E3192" />
            <span>SECTION 3 — Manual Payment Details & Operations Authorization</span>
          </div>
          <div className="p-3">
            <div className="row g-3">
              {/* Payment Received Dropdown (Yes / No) */}
              <div className="col-12 col-md-6">
                <Dropdown
                  label="Payment Received? "
                  options={['Yes', 'No']}
                  value={paymentReceived}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPaymentReceived(val);
                    if (val === 'No') {
                      setAmountPaid('0');
                      setPaymentStatus('Pending');
                    } else if (amountPaid === '0') {
                      setAmountPaid('5000000');
                      setPaymentStatus('Partial');
                    }
                  }}
                />
              </div>

              {/* IF PAYMENT RECEIVED IS YES */}
              {paymentReceived === 'Yes' && (
                <>
                  <div className="col-12 col-md-6">
                    <Dropdown
                      label="Payment Status *"
                      options={['Partial', 'Paid']}
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <InputField
                      label="Amount Paid (₹) "
                      type="number"
                      value={amountPaid !== '' ? amountPaid : effectivePaidAmount}
                      onChange={(e) => setAmountPaid(e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <InputField
                      label="Pending Amount (₹) [Auto-calculated]"
                      value={`₹${remainingVal.toLocaleString()}`}
                      disabled={true}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <InputField
                      label="Payment Proof Document Upload"
                      type="file"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setProofFileName(e.target.files[0].name);
                          toast.success(`Attached payment proof: "${e.target.files[0].name}"`);
                        }
                      }}
                      helpText={proofFileName ? `Current Document: ${proofFileName}` : ''}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <InputField
                      label="Operations Executive Remarks"
                      type="textarea"
                      rows={2}
                      placeholder="Enter payment verification remarks..."
                      value={operationsRemarks}
                      onChange={(e) => setOperationsRemarks(e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* IF PAYMENT RECEIVED IS NO (ZERO UPFRONT PAYMENT) */}
              {paymentReceived === 'No' && (
                <>
                  <div className="col-12 col-md-6">
                    <InputField
                      label="Amount Paid (₹)"
                      value="₹0"
                      disabled={true}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <InputField
                      label="Pending Amount (₹) [Auto-calculated]"
                      value={`₹${totalOrderValue.toLocaleString()}`}
                      disabled={true}
                    />
                  </div>
                  <div className="col-12 col-md-12">
                    <div className="p-3 border rounded border-warning">
                      <div className="d-flex align-items-center gap-2 mb-2 text-warning-emphasis fw-bold small">
                        <AlertCircle size={18} />
                        <span>Mandatory Operations Authorization (Upfront Payment Received is NO)</span>
                      </div>
                      <InputField
                        label="Mandatory Zero Upfront Payment Operations Executive Remarks *"
                        required={true}
                        type="textarea"
                        rows={2}
                        placeholder="Enter mandatory operations executive remarks explaining zero upfront payment approval..."
                        value={operationsRemarks}
                        onChange={(e) => setOperationsRemarks(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 4 — TASK ASSIGNMENT (FILTERED DYNAMICALLY BY TERRITORY) */}
        <div className="category-card shadow-sm border" style={{ borderRadius: '10px' }}>
          <div className="section-card-title-bar">
            <UserCheck size={18} color="#2E3192" />
            <span>SECTION 4 — Task Assignment (Filtered by Territory from Master Data)</span>
          </div>
          <div className="p-3">
            <form onSubmit={handleSaveAssignment}>
              <div className="row g-3">
                {/* Step 1: Territory Dropdown */}
                <div className="col-12 col-md-6">
                  <Dropdown
                    label="Territory (Step 1: Select Territory) *"
                    required={true}
                    options={territoryOptions}
                    value={selectedTerritory}
                    onChange={(e) => handleTerritoryChange(e.target.value)}
                  />
                </div>

                {/* Step 2: Department MultiSelect (Filtered for Selected Territory) */}
                <div className="col-12 col-md-6">
                  <MultiSelect
                    label={`Department (Filtered for ${selectedTerritory}) *`}
                    required={true}
                    options={departmentOptions}
                    value={assignmentData.departments}
                    onChange={(e) => setAssignmentData({ ...assignmentData, departments: e.target.value })}
                    placeholder="Select Department(s)..."
                  />
                </div>

                {/* Step 3: Employee MultiSelect (Filtered for Selected Territory) */}
                <div className="col-12 col-md-6">
                  <MultiSelect
                    label={`Assigned Executive(s) (Active in ${selectedTerritory}) *`}
                    required={true}
                    options={employeeOptions}
                    value={assignmentData.assignedEmployees}
                    onChange={(e) => setAssignmentData({ ...assignmentData, assignedEmployees: e.target.value })}
                    placeholder="Select Executive(s)..."
                  />
                </div>

                <div className="col-12 col-md-6">
                  <InputField
                    label="Target Completion Date"
                    type="date"
                    value={assignmentData.targetDate}
                    onChange={(e) => setAssignmentData({ ...assignmentData, targetDate: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-12">
                  <InputField
                    label="Assignment Instructions & Remarks"
                    type="textarea"
                    rows={2}
                    value={assignmentData.assignmentRemarks}
                    onChange={(e) => setAssignmentData({ ...assignmentData, assignmentRemarks: e.target.value })}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end mt-3">
                <Button
                  type="submit"
                  variant="primary"
                  style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
                  icon={<CheckCircle2 size={16} />}
                >
                  Save Task Assignment
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* SECTION 5 — INSTALLATION EXECUTION, SERVICE REPORT & HAPPY CODE (OTP) VERIFICATION */}
        <div className="category-card shadow-sm border" style={{ borderRadius: '10px' }}>
          <div className="section-card-title-bar">
            <CheckCircle2 size={18} color="#2E3192" />
            <span>SECTION 5 — Installation Execution, Service Report & Happy Code (OTP) Verification</span>
          </div>
          <div className="p-3">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <InputField
                  label="Service Report Number"
                  value={workflowState.serviceReportNumber}
                  onChange={(e) => setWorkflowState({ ...workflowState, serviceReportNumber: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Installation Start Date & Time *"
                  type="text"
                  placeholder="e.g. 2026-08-30 09:30 AM"
                  value={`${workflowState.installationStartDate} ${workflowState.installationStartTime}`}
                  onChange={(e) => {
                    const parts = e.target.value.split(' ');
                    setWorkflowState({
                      ...workflowState,
                      installationStartDate: parts[0] || workflowState.installationStartDate,
                      installationStartTime: parts.slice(1).join(' ') || workflowState.installationStartTime
                    });
                  }}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Installation Completion End Date & Time *"
                  type="text"
                  placeholder="e.g. 2026-08-30 04:30 PM"
                  value={`${workflowState.installationEndDate} ${workflowState.installationEndTime}`}
                  onChange={(e) => {
                    const parts = e.target.value.split(' ');
                    setWorkflowState({
                      ...workflowState,
                      installationEndDate: parts[0] || workflowState.installationEndDate,
                      installationEndTime: parts.slice(1).join(' ') || workflowState.installationEndTime
                    });
                  }}
                />
              </div>

              <div className="col-12 col-md-12">
                <InputField
                  label="Engineer Service & Calibration Notes"
                  type="textarea"
                  rows={2}
                  value={workflowState.serviceNotes}
                  onChange={(e) => setWorkflowState({ ...workflowState, serviceNotes: e.target.value })}
                />
              </div>

              {/* OTP HAPPY CODE VERIFICATION CARD */}
              <div className="col-12 col-md-12">
                <div className="p-3 border rounded-3 bg-light">
                  <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
                    <Lock size={18} className="text-primary" />
                    <span>Customer Verification Code ("Happy Code" OTP)</span>
                  </h6>
                  <p className="small text-muted mb-3">
                    Enter the 6-digit OTP code received by the customer to confirm installation completion.
                  </p>

                  <div className="row g-2 align-items-center">
                    <div className="col-12 col-sm-6 col-md-4">
                      <InputField
                        placeholder="Enter 6-digit Happy Code (e.g. 749201)"
                        value={workflowState.happyCodeOtp}
                        disabled={workflowState.otpVerified}
                        onChange={(e) => setWorkflowState({ ...workflowState, happyCodeOtp: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-sm-6 col-md-4">
                      {workflowState.otpVerified ? (
                        <span className="badge bg-success px-3 py-2 fs-10 d-inline-flex align-items-center gap-1">
                          <CheckCircle2 size={12} /> Happy Code Verified
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-primary px-3 py-2 fw-bold d-inline-flex align-items-center gap-1"
                          style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
                          onClick={handleVerifyOtp}
                        >
                          <Send size={14} />
                          <span>Verify Happy Code</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* AUTO-SENT CUSTOMER FEEDBACK FORM */}
              {workflowState.otpVerified && (
                <div className="col-12 col-md-12">
                  <div className="p-3 border rounded-3 bg-success-subtle">
                    <h6 className="fw-bold text-success mb-2 d-flex align-items-center gap-2">
                      <Star size={18} className="fill-warning text-warning" />
                      <span>Customer Feedback Form (Auto-sent to Customer)</span>
                    </h6>
                    <div className="row g-2">
                      
                      <div className="col-12 col-md-8">
                        <span className="small text-muted d-block">Customer Comments:</span>
                        <span className="small text-dark fw-semibold">{workflowState.customerFeedback}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ACTION TOOLBAR */}
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 pt-3 border-top mt-3">
              

              <button
                type="button"
                className="btn btn-success px-4 py-2 fw-bold d-inline-flex align-items-center gap-2 shadow-sm"
                onClick={handleCompleteInstallation}
                disabled={workflowState.installationStatus === 'Completed'}
              >
                <CheckCircle2 size={18} />
                <span>{workflowState.installationStatus === 'Completed' ? 'Installation Completed' : 'Confirm & Mark Installation Completed'}</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InstallationTaskAssignment;
