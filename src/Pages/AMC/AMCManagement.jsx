import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { InputField, Dropdown } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import {
  ShieldCheck,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  FileText,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  User,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  PackageCheck,
  Receipt
} from 'lucide-react';
import { initialMockAMCContracts } from './mockAMCData';
import { initialMockFulfilments } from '../OrderFulfilment/mockOrderFulfilment';
import '../../styles/Category.css';
import '../../styles/Product.css';
import '../../styles/Lead.css';
import './AMCManagement.css';

/**
 * AMCManagement Component
 * 3.3.6 Warranty & AMC (SAMC / CAMC) Management Module.
 * Out of Masters menu in Sidebar.
 */
const AMCManagement = ({ pis = [], leads = [] }) => {
  const navigate = useNavigate();

  // AMC Contracts State
  const [contracts, setContracts] = useState(initialMockAMCContracts);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [amcTypeFilter, setAmcTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);

  // Selected Contract State
  const [selectedContract, setSelectedContract] = useState(null);

  // Form State for Add / Edit
  const [contractForm, setContractForm] = useState({
    contractId: '',
    orderFulfilmentId: 'FUL-2026-001',
    piNumber: 'PI-2026-003-V1',
    client: '',
    contactPerson: '',
    mobile: '',
    email: '',
    territory: '',
    productSummary: '',
    productQty: 1,
    amcType: 'SAMC (Support AMC)',
    nature: 'Mandatory support only',
    period: '1 Year',
    basePrice: 100000,
    discount: 0,
    gstPercent: 18,
    totalAmountCycle: 118000,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 365).toISOString().split('T')[0],
    alertBeforeDays: '30 Days',
    status: 'Active',
    alertStatus: 'Normal',
    notes: ''
  });

  // Renewal Workflow State (4 Stages)
  const [renewStep, setRenewStep] = useState(1); // 1: Eligibility, 2: Quotation/PI, 3: Payment, 4: Invoice & Activate
  const [renewForm, setRenewForm] = useState({
    renewPeriod: '1 Year',
    quotationAmount: 150000,
    paymentMethod: 'Bank Transfer (NEFT / RTGS)',
    refId: 'TXN-AMC-8821',
    remarks: 'Annual AMC renewal accepted cleanly.'
  });

  // Available Order Fulfilment Options for auto-population
  const fulfilmentOptions = useMemo(() => {
    return initialMockFulfilments.map((f) => ({
      label: `${f.fulfilmentId} — ${f.customerName} (${f.piNumber})`,
      value: f.fulfilmentId,
      raw: f
    }));
  }, []);

  // Calculate 1 Cycle Total Amount dynamically: (basePrice - discount) * (1 + gstPercent / 100)
  const calculateCycleTotal = (base, disc, gst) => {
    const b = Number(base) || 0;
    const d = Number(disc) || 0;
    const g = Number(gst) || 0;
    const taxable = Math.max(0, b - d);
    return Math.round(taxable * (1 + g / 100));
  };

  // Calculate End Date dynamically from Start Date + Period
  const calculateEndDate = (start, periodStr) => {
    if (!start) return '';
    const d = new Date(start);
    if (isNaN(d.getTime())) return '';
    const p = String(periodStr).toLowerCase();
    if (p.includes('monthly')) d.setMonth(d.getMonth() + 1);
    else if (p.includes('quarterly')) d.setMonth(d.getMonth() + 3);
    else if (p.includes('half-yearly')) d.setMonth(d.getMonth() + 6);
    else if (p.includes('2 year')) d.setFullYear(d.getFullYear() + 2);
    else if (p.includes('3 year')) d.setFullYear(d.getFullYear() + 3);
    else d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  };

  // Auto-generate SAMC (Support AMC) contracts for orders whose  // Combine initial mock AMC contracts + Order Fulfilment Warranty Ended orders
  const allContracts = useMemo(() => {
    let renewedIds = [];
    let taxInvoices = {};
    let newRenewedContracts = [];
    try {
      renewedIds = JSON.parse(localStorage.getItem('amc_renewed_ids') || '[]');
      taxInvoices = JSON.parse(localStorage.getItem('amc_tax_invoices') || '{}');
      newRenewedContracts = JSON.parse(localStorage.getItem('amc_new_renewed_contracts') || '[]');
    } catch (err) {
      console.error(err);
    }

    const list = [...contracts];
    
    // Append brand-new renewed contract records generated upon PI Renewal Customer Approval
    newRenewedContracts.forEach((newC) => {
      if (!list.some((c) => c.contractId === newC.contractId)) {
        list.push(newC);
      }
    });

    const todayStr = new Date().toISOString().split('T')[0];

    // Combine PI records and initial mock fulfilments
    const allOrders = [
      ...initialMockFulfilments,
      ...(pis || []).map((p) => ({
        id: `FUL-${p.id}`,
        fulfilmentId: `FUL-2026-${p.id}`,
        piNumber: p.piNumber,
        customerName: p.customerName,
        contactPerson: p.contactPerson,
        mobile: p.mobile,
        email: p.email,
        productSummary: p.lineItems?.[0]?.productName || 'Ultrasound Machine',
        warrantyEndDate: p.installationData?.warrantyEndDate || '2025-05-10'
      }))
    ];

    allOrders.forEach((ord) => {
      // Rule 3.3.6: Subscription model includes bundled support — AMC is NOT required for Subscription deals
      if (ord.serviceType === 'Subscription') return;

      const expDate = ord.warrantyEndDate || '2025-05-10';
      const orderRef = ord.fulfilmentId || `FUL-${ord.id}`;
      const piNum = ord.piNumber || 'PI-2026-001-V1';
      const exists = list.some((c) => c.orderFulfilmentId === orderRef || c.piNumber === piNum);

      if (!exists && (expDate <= todayStr || (new Date(expDate) - new Date(todayStr)) / (1000 * 60 * 60 * 24) <= 90)) {
        // SAMC Start Date = Day after warranty ends
        const startDateObj = new Date(expDate);
        startDateObj.setDate(startDateObj.getDate() + 1);
        const samcStartDate = startDateObj.toISOString().split('T')[0];

        const endDateObj = new Date(samcStartDate);
        endDateObj.setFullYear(endDateObj.getFullYear() + 1);
        const samcEndDate = endDateObj.toISOString().split('T')[0];

        const daysDiff = Math.round((new Date(expDate) - new Date(todayStr)) / (1000 * 60 * 60 * 24));
        let alertStatus = 'Normal';
        if (daysDiff <= 0) alertStatus = '30-Day Alert';
        else if (daysDiff <= 30) alertStatus = '30-Day Alert';
        else if (daysDiff <= 60) alertStatus = '60-Day Alert';
        else if (daysDiff <= 90) alertStatus = '90-Day Alert';

        list.push({
          id: `AMC-AUTO-${ord.id || ord.fulfilmentId}`,
          contractId: `AMC-2026-${String(list.length + 1).padStart(3, '0')}`,
          orderFulfilmentId: orderRef,
          piNumber: piNum,
          client: ord.customerName || 'Fortis Healthcare Centre',
          contactPerson: ord.contactPerson || 'Dr. Ananya Verma',
          mobile: ord.mobile || '9811223344',
          email: ord.email || 'purchase@fortishealthcare.com',
          territory: ord.billingAddress || 'Bengaluru, Karnataka',
          productSummary: ord.productSummary || 'GE Voluson E8 Expert Ultrasound Machine',
          productQty: 1,
          amcType: 'SAMC (Support AMC)',
          nature: 'Mandatory support only',
          startDate: samcStartDate,
          endDate: samcEndDate,
          period: '1 Year',
          basePrice: 135000,
          discount: 8000,
          gstPercent: 18,
          totalAmountCycle: 150000,
          totalAmount: 150000,
          alertBeforeDays: '30 Days',
          status: daysDiff <= 0 ? 'Pending Renewal' : 'Active',
          alertStatus: alertStatus,
          notes: `Auto-created SAMC contract. Warranty ended on ${expDate}.`
        });
      }
    });

    return list.map((c) => {
      const isApprovedInPI = renewedIds.includes(c.contractId);
      const isNewRenewalRecord = c.contractId.includes('-R1') || String(c.id).includes('AMC-RENEWED');

      if (isApprovedInPI && !isNewRenewalRecord) {
        return {
          ...c,
          isRenewed: true,
          status: 'Expired',
          notes: `Previous AMC term expired. Renewed into new active contract term.`
        };
      }
      return c;
    });
  }, [contracts, pis]);

  // Filtered Contracts List
  const filteredContracts = useMemo(() => {
    return allContracts.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        c.contractId.toLowerCase().includes(q) ||
        c.client.toLowerCase().includes(q) ||
        c.orderFulfilmentId.toLowerCase().includes(q) ||
        c.piNumber.toLowerCase().includes(q);

      const matchesType = !amcTypeFilter || c.amcType.includes(amcTypeFilter);
      const matchesStatus = !statusFilter || c.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [allContracts, searchQuery, amcTypeFilter, statusFilter]);

  // Open Add Modal Handler
  const handleOpenAddModal = () => {
    const nextNum = contracts.length + 1;
    const defaultFulfilment = initialMockFulfilments[0];
    const initialBase = 100000;
    const initialDisc = 5000;
    const initialGst = 18;
    const initialTot = calculateCycleTotal(initialBase, initialDisc, initialGst);
    const initialStart = new Date().toISOString().split('T')[0];
    const initialEnd = calculateEndDate(initialStart, '1 Year');

    setContractForm({
      contractId: `AMC-2026-${String(nextNum).padStart(3, '0')}`,
      orderFulfilmentId: defaultFulfilment?.fulfilmentId || 'FUL-2026-001',
      piNumber: defaultFulfilment?.piNumber || 'PI-2026-003-V1',
      client: defaultFulfilment?.customerName || 'KMCH Specialty Hospital',
      contactPerson: defaultFulfilment?.contactPerson || 'Dr. Subramanian',
      mobile: defaultFulfilment?.mobile || '9842155667',
      email: defaultFulfilment?.email || 'purchasing@kmch.org',
      territory: defaultFulfilment?.billingAddress || 'Coimbatore, Tamil Nadu',
      productSummary: defaultFulfilment?.productSummary || 'Sonoscape X5 Portable Ultrasound System (Qty: 2)',
      productQty: 2,
      amcType: 'SAMC (Support AMC)',
      nature: 'Mandatory support only',
      period: '1 Year',
      basePrice: initialBase,
      discount: initialDisc,
      gstPercent: initialGst,
      totalAmountCycle: initialTot,
      startDate: initialStart,
      endDate: initialEnd,
      alertBeforeDays: '30 Days',
      status: 'Active',
      alertStatus: 'Normal',
      notes: 'New AMC Contract created.'
    });
    setIsAddModalOpen(true);
  };

  // Handle Order Fulfilment Change in Add Modal
  const handleOrderFulfilmentSelect = (fulId) => {
    const selectedF = initialMockFulfilments.find((f) => f.fulfilmentId === fulId);
    if (selectedF) {
      setContractForm((prev) => ({
        ...prev,
        orderFulfilmentId: selectedF.fulfilmentId,
        piNumber: selectedF.piNumber,
        client: selectedF.customerName,
        contactPerson: selectedF.contactPerson,
        mobile: selectedF.mobile,
        email: selectedF.email,
        territory: selectedF.billingAddress || 'Coimbatore, Tamil Nadu',
        productSummary: selectedF.productSummary
      }));
      toast.info(`Loaded customer & product details for ${selectedF.fulfilmentId}`);
    }
  };

  // Open Edit Modal Handler
  const handleOpenEditModal = (row) => {
    setSelectedContract(row);
    setContractForm({ ...row });
    setIsEditModalOpen(true);
  };

  // Open View Modal Handler
  const handleOpenViewModal = (row) => {
    setSelectedContract(row);
    setIsViewModalOpen(true);
  };

  // Open Delete Modal Handler
  const handleOpenDeleteModal = (row) => {
    setSelectedContract(row);
    setIsDeleteModalOpen(true);
  };

  // Open Billing Modal Handler
  const handleOpenBillingModal = (row) => {
    setSelectedContract(row);
    setIsBillingModalOpen(true);
  };

  // Open Renew Modal Handler
  const handleOpenRenewModal = (row) => {
    setSelectedContract(row);
    setRenewStep(1);
    setRenewForm({
      renewPeriod: '1 Year',
      quotationAmount: Number(row.totalAmountCycle || row.totalAmount || 120000),
      paymentMethod: 'Bank Transfer (NEFT / RTGS)',
      refId: `TXN-AMC-${String(Math.floor(1000 + Math.random() * 9000))}`,
      remarks: 'Annual AMC renewal accepted cleanly.'
    });
    setIsRenewModalOpen(true);
  };

  // Save New AMC Contract Submit
  const handleAddSubmit = (e) => {
    if (e) e.preventDefault();
    if (!contractForm.client) {
      toast.error('Please enter Client / Hospital Name.');
      return;
    }

    const calcTot = calculateCycleTotal(contractForm.basePrice, contractForm.discount, contractForm.gstPercent);
    const newContract = {
      ...contractForm,
      id: contractForm.contractId || `AMC-2026-${String(contracts.length + 1).padStart(3, '0')}`,
      totalAmountCycle: calcTot,
      totalAmount: calcTot
    };

    setContracts([newContract, ...contracts]);
    toast.success(`AMC Contract ${newContract.contractId} created successfully! Total amount: ₹${calcTot.toLocaleString()}`);
    setIsAddModalOpen(false);
  };

  // Save Edit AMC Contract Submit
  const handleEditSubmit = (e) => {
    if (e) e.preventDefault();
    if (!selectedContract) return;

    const calcTot = calculateCycleTotal(contractForm.basePrice, contractForm.discount, contractForm.gstPercent);
    const updated = {
      ...contractForm,
      totalAmountCycle: calcTot,
      totalAmount: calcTot
    };

    setContracts((prev) =>
      prev.map((c) => (c.id === selectedContract.id ? updated : c))
    );
    toast.success(`AMC Contract ${contractForm.contractId} updated successfully!`);
    setIsEditModalOpen(false);
  };

  // Confirm Delete Handler
  const handleDeleteConfirm = () => {
    if (!selectedContract) return;
    setContracts((prev) => prev.filter((c) => c.id !== selectedContract.id));
    toast.success(`AMC Contract ${selectedContract.contractId} deleted.`);
    setIsDeleteModalOpen(false);
  };

  // AMC Renewal Handler (Auto extends contract end date)
  const handleCompleteRenewal = () => {
    if (!selectedContract) return;

    const newEndDateStr = calculateEndDate(
      selectedContract.endDate || new Date().toISOString().split('T')[0],
      renewForm.renewPeriod
    );

    setContracts((prev) =>
      prev.map((c) =>
        c.id === selectedContract.id || c.contractId === selectedContract.contractId
          ? {
              ...c,
              endDate: newEndDateStr,
              period: renewForm.renewPeriod,
              status: 'Active',
              alertStatus: 'Normal',
              notes: `Renewed on ${new Date().toISOString().split('T')[0]}. End date extended to ${newEndDateStr}.`
            }
          : c
      )
    );

    toast.success(`AMC Contract ${selectedContract.contractId} successfully RENEWED to ${newEndDateStr}! Status updated to Active.`);
    setIsRenewModalOpen(false);
  };

  // Table Columns Definition (12 Specified Columns)
  const columns = [
    {
      key: 'contractId',
      title: 'CONTRACT ID',
      sortable: true,
      render: (val) => <span className="amc-contract-id">{val}</span>
    },
    {
      key: 'orderFulfilmentId',
      title: 'ORDER FULFILMENT ID',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-monospace small border-bottom d-block">{val}</span>
          <span className="small text-muted font-monospace">{row.piNumber || '—'}</span>
        </div>
      )
    },
    {
      key: 'client',
      title: 'CLIENT',
      sortable: true,
      render: (val) => <span className="amc-client-name">{val}</span>
    },
    {
      key: 'amcType',
      title: 'AMC TYPE',
      sortable: true,
      render: (val) => {
        const isCamc = String(val).includes('CAMC');
        return <span className={isCamc ? 'amc-type-camc' : 'amc-type-samc'}>{val}</span>;
      }
    },
    {
      key: 'startDate',
      title: 'START DATE',
      sortable: true,
      render: (val) => <span className="font-monospace small">{val}</span>
    },
    {
      key: 'endDate',
      title: 'END DATE',
      sortable: true,
      render: (val) => <span className="font-monospace small text-dark fw-semibold">{val}</span>
    },
    {
      key: 'period',
      title: 'PERIOD',
      sortable: true,
      render: (val) => <span className="small text-muted">{val || '1 Year'}</span>
    },
    {
      key: 'totalAmountCycle',
      title: 'CYCLE AMOUNT (₹)',
      sortable: true,
      align: 'right',
      render: (val, row) => <span className="fw-bold font-monospace text-dark">₹{Number(val || row.totalAmount || 0).toLocaleString()}</span>
    },
    {
      key: 'alertBeforeDays',
      title: 'ALERT BEFORE',
      sortable: true,
      align: 'center',
      render: (val) => <span className="small text-secondary font-monospace border-bottom">{val || '30 Days'}</span>
    },
    {
      key: 'status',
      title: 'STATUS',
      sortable: true,
      align: 'center',
      render: (val) => {
        const cls =
          val === 'Active' ? 'amc-status-active' : val === 'Lapsed' ? 'amc-status-lapsed' : 'amc-status-pending';
        return <span className={cls}>{val}</span>;
      }
    },
    {
      key: 'alertStatus',
      title: 'ALERT STATUS',
      sortable: true,
      align: 'center',
      render: (val) => {
        const isWarn = String(val).includes('Alert') || String(val).includes('Expiring');
        const isDanger = String(val).includes('30-Day') || String(val).includes('Expired');
        const cls = isDanger ? 'amc-alert-danger' : isWarn ? 'amc-alert-warning' : 'amc-alert-normal';
        return <span className={cls}>{val || 'Normal'}</span>;
      }
    },
    {
      key: 'renew',
      title: 'RENEW',
      sortable: false,
      align: 'center',
      render: (_, row) => {
        let renewedIds = [];
        try {
          renewedIds = JSON.parse(localStorage.getItem('amc_renewed_ids') || '[]');
        } catch (err) {
          console.error(err);
        }
        const isRenewed = renewedIds.includes(row.contractId) || row.isRenewed || row.status === 'Renewed';
        const isAlertReached = row.alertStatus && row.alertStatus !== 'Normal' || row.status === 'Pending Renewal' || row.status === 'Lapsed';

        if (isRenewed) {
          return <span className="badge bg-success px-3 py-2 fw-bold">Renewed</span>;
        }
        if (isAlertReached) {
          return <span className="badge bg-danger px-3 py-2 fw-bold">Not Renewed</span>;
        }

        return <span className="badge bg-secondary px-3 py-2 fw-bold">Normal</span>;
      }
    }
  ];

  // Action column renderer (View Page, Edit Page, Billing Details, Delete)
  const tableActions = (row) => (
    <div className="category-actions-container d-flex align-items-center gap-1">
      <button
        type="button"
        className="category-action-btn view-btn"
        title="View Contract Details Page"
        onClick={() => navigate(`/warranty-amc/${encodeURIComponent(row.contractId)}/view`)}
      >
        <Eye size={15} />
      </button>
      <button
        type="button"
        className="category-action-btn edit-btn"
        title="Edit Contract Details Page"
        onClick={() => navigate(`/warranty-amc/${encodeURIComponent(row.contractId)}/edit`)}
      >
        <Edit size={15} />
      </button>
      <button
        type="button"
        className="btn btn-sm btn-light border p-1 text-primary d-inline-flex align-items-center justify-content-center"
        style={{ width: '28px', height: '28px', borderRadius: '4px' }}
        title="View AMC Billing & Invoice History"
        onClick={() => handleOpenBillingModal(row)}
      >
      
        <Trash2 size={15} />
      </button>
    </div>
  );

  return (
    <div className="category-master-page amc-management-page container-fluid px-0 px-md-2 py-2">
      <Helmet>
        <title>Warranty & AMC Management | Sonocare CRM</title>
        <meta name="description" content="Warranty & AMC (SAMC / CAMC) Management in Sonocare CRM." />
      </Helmet>
      <ToastContainer />

      {/* HEADER SECTION */}
      <div className="category-page-header mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="category-page-title-group">
          <ShieldCheck size={28} className="amc-header-icon" />
          <div>
            <h1 className="category-page-title mb-0">Warranty & AMC (SAMC / CAMC) Management</h1>
            <span className="small text-muted">Contracts auto-created from Order Fulfilment Installation Reports upon warranty expiry</span>
          </div>
        </div>
      </div>

      {/* MAIN CARD CONTAINER */}
      <div className="category-card shadow-sm border mb-4" style={{ borderRadius: '10px' }}>
        {/* Card Header & Search / Filters */}
        <div className="category-card-header pb-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
          <h2 className="category-card-title mb-0">WARRANTY & AMC CONTRACTS REGISTER ({filteredContracts.length})</h2>

          {/* Search Box */}
          <div className="category-search-wrapper">
            <Search size={16} className="category-search-icon" />
            <input
              type="text"
              className="category-search-input"
              placeholder="Search Contract ID, Client, Order Ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="p-3 bg-light border-bottom">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-auto d-flex align-items-center text-muted small me-2">
              <Filter size={15} className="me-1" />
              <span className="fw-semibold">Filters:</span>
            </div>

            <div className="col-12 col-sm-4 col-md-3">
              <select
                className="form-select form-select-sm"
                value={amcTypeFilter}
                onChange={(e) => setAmcTypeFilter(e.target.value)}
              >
                <option value="">All AMC Types</option>
                <option value="SAMC">SAMC (Support AMC)</option>
                <option value="CAMC">CAMC (Comprehensive AMC)</option>
              </select>
            </div>

            <div className="col-12 col-sm-4 col-md-3">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending Renewal">Pending Renewal</option>
                <option value="Lapsed">Lapsed</option>
                <option value="Upgraded to CAMC">Upgraded to CAMC</option>
              </select>
            </div>

            {(amcTypeFilter || statusFilter || searchQuery) && (
              <div className="col-12 col-md-auto ms-auto">
                <button
                  type="button"
                  className="btn btn-sm btn-link text-decoration-none text-danger p-0 fw-semibold"
                  onClick={() => {
                    setAmcTypeFilter('');
                    setStatusFilter('');
                    setSearchQuery('');
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Table Wrapper */}
        <div className="category-table-wrapper">
          <Table
            columns={columns}
            data={filteredContracts}
            showSerialNumber={true}
            serialNumberHeader="S.NO"
            actions={tableActions}
            actionHeader="ACTIONS"
            actionWidth="140px"
            emptyMessage="No Warranty / AMC records found."
            paginated={true}
            pageSizeOptions={[25, 50, 100]}
            defaultPageSize={25}
            tableClassName="category-custom-table"
            bordered={false}
            striped={false}
            hover={true}
            minWidth="1400px"
          />
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* MODAL 1: ADD / EDIT AMC CONTRACT (STRUCTURED SECTIONS)             */}
      {/* ------------------------------------------------------------------ */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isAddModalOpen ? 'Create New AMC Contract' : `Edit AMC Contract — ${contractForm.contractId}`}
        size="lg"
      >
        <form onSubmit={isAddModalOpen ? handleAddSubmit : handleEditSubmit}>
          <div className="d-flex flex-column gap-3 p-1">
            
            {/* SECTION 1: ORDER & CUSTOMER DETAILS */}
            <div className="p-3 bg-light rounded border">
              <h6 className="fw-bold text-dark mb-3 small d-flex align-items-center gap-2 border-bottom pb-2">
                <User size={16} className="text-primary" />
                <span>SECTION 1 — Order & Customer Details (From Order Fulfilment)</span>
              </h6>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <InputField
                    label="AMC Contract ID *"
                    required={true}
                    value={contractForm.contractId}
                    onChange={(e) => setContractForm({ ...contractForm, contractId: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  {isAddModalOpen ? (
                    <Dropdown
                      label="Select Order Fulfilment Ref *"
                      required={true}
                      options={fulfilmentOptions}
                      value={contractForm.orderFulfilmentId}
                      onChange={(e) => handleOrderFulfilmentSelect(e.target.value)}
                    />
                  ) : (
                    <InputField
                      label="Order Fulfilment Ref ID *"
                      value={contractForm.orderFulfilmentId}
                      disabled={true}
                    />
                  )}
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Client / Hospital Name *"
                    required={true}
                    value={contractForm.client}
                    onChange={(e) => setContractForm({ ...contractForm, client: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Contact Person"
                    value={contractForm.contactPerson}
                    onChange={(e) => setContractForm({ ...contractForm, contactPerson: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Mobile & Email"
                    value={`${contractForm.mobile} | ${contractForm.email}`}
                    onChange={(e) => {
                      const parts = e.target.value.split('|');
                      setContractForm({
                        ...contractForm,
                        mobile: parts[0]?.trim() || contractForm.mobile,
                        email: parts[1]?.trim() || contractForm.email
                      });
                    }}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Territory / Location"
                    value={contractForm.territory}
                    onChange={(e) => setContractForm({ ...contractForm, territory: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: PRODUCT DETAILS */}
            <div className="p-3 bg-light rounded border">
              <h6 className="fw-bold text-dark mb-3 small d-flex align-items-center gap-2 border-bottom pb-2">
                <PackageCheck size={16} className="text-primary" />
                <span>SECTION 2 — Product System Details</span>
              </h6>
              <div className="row g-3">
                <div className="col-12">
                  <InputField
                    label="Product Model & System Specifications *"
                    required={true}
                    value={contractForm.productSummary}
                    onChange={(e) => setContractForm({ ...contractForm, productSummary: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: AMC TYPE & COMMERCIAL FINANCIAL TERMS */}
            <div className="p-3 bg-light rounded border">
              <h6 className="fw-bold text-dark mb-3 small d-flex align-items-center gap-2 border-bottom pb-2">
                <DollarSign size={16} className="text-primary" />
                <span>SECTION 3 — AMC Commercial & Financial Terms</span>
              </h6>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <Dropdown
                    label="AMC Type "
                    required={true}
                    options={[
                      'SAMC (Support AMC)',
                      'CAMC (Comprehensive AMC)'
                    ]}
                    value={contractForm.amcType}
                    onChange={(e) => {
                      const val = e.target.value;
                      const nat = val.includes('CAMC')
                        ? 'Optional upgrade (Support + Software Upgrades)'
                        : 'Mandatory support only';
                      setContractForm({ ...contractForm, amcType: val, nature: nat });
                    }}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <Dropdown
                    label="AMC Period (Cycle) "
                    required={true}
                    options={['Monthly', 'Quarterly', 'Half-Yearly', '1 Year', '2 Years', '3 Years']}
                    value={contractForm.period}
                    onChange={(e) => {
                      const p = e.target.value;
                      const newEnd = calculateEndDate(contractForm.startDate, p);
                      setContractForm({ ...contractForm, period: p, endDate: newEnd });
                    }}
                  />
                </div>
                <div className="col-12 col-md-3">
                  <InputField
                    label="Base AMC Price (₹) "
                    type="number"
                    required={true}
                    value={contractForm.basePrice}
                    onChange={(e) => {
                      const base = Number(e.target.value) || 0;
                      const tot = calculateCycleTotal(base, contractForm.discount, contractForm.gstPercent);
                      setContractForm({ ...contractForm, basePrice: base, totalAmountCycle: tot });
                    }}
                  />
                </div>
                <div className="col-12 col-md-3">
                  <InputField
                    label="Discount (₹)"
                    type="number"
                    value={contractForm.discount}
                    onChange={(e) => {
                      const disc = Number(e.target.value) || 0;
                      const tot = calculateCycleTotal(contractForm.basePrice, disc, contractForm.gstPercent);
                      setContractForm({ ...contractForm, discount: disc, totalAmountCycle: tot });
                    }}
                  />
                </div>
                <div className="col-12 col-md-3">
                  <Dropdown
                    label="GST % "
                    required={true}
                    options={['18%', '12%', '5%', '0%']}
                    value={`${contractForm.gstPercent}%`}
                    onChange={(e) => {
                      const gst = parseInt(e.target.value, 10) || 0;
                      const tot = calculateCycleTotal(contractForm.basePrice, contractForm.discount, gst);
                      setContractForm({ ...contractForm, gstPercent: gst, totalAmountCycle: tot });
                    }}
                  />
                </div>
                <div className="col-12 col-md-3">
                  <InputField
                    label="Total Amount / 1 Cycle (₹)"
                    type="number"
                    value={calculateCycleTotal(contractForm.basePrice, contractForm.discount, contractForm.gstPercent)}
                    disabled={true}
                    helpText="Auto-Calculated: (Base - Disc) + GST"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: PRODUCT DATES & ALERT CONFIGURATION */}
            <div className="p-3 bg-light rounded border">
              <h6 className="fw-bold text-dark mb-3 small d-flex align-items-center gap-2 border-bottom pb-2">
                <Calendar size={16} className="text-primary" />
                <span>SECTION 4 — Product Coverage Dates & Alert Escalation</span>
              </h6>
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <InputField
                    label="Start Date *"
                    type="date"
                    required={true}
                    value={contractForm.startDate}
                    onChange={(e) => {
                      const st = e.target.value;
                      const newEnd = calculateEndDate(st, contractForm.period);
                      setContractForm({ ...contractForm, startDate: st, endDate: newEnd });
                    }}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <InputField
                    label="End Date (Calculated) *"
                    type="date"
                    required={true}
                    value={contractForm.endDate}
                    onChange={(e) => setContractForm({ ...contractForm, endDate: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <Dropdown
                    label="Alert Before Days (Dropdown) *"
                    required={true}
                    options={['15 Days', '30 Days', '60 Days', '90 Days', '120 Days']}
                    value={contractForm.alertBeforeDays}
                    onChange={(e) => setContractForm({ ...contractForm, alertBeforeDays: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <Dropdown
                    label="Contract Status *"
                    required={true}
                    options={['Active', 'Pending Renewal', 'Lapsed', 'Upgraded to CAMC', 'Draft']}
                    value={contractForm.status}
                    onChange={(e) => setContractForm({ ...contractForm, status: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Contract Remarks"
                    placeholder="Coverage & support terms..."
                    value={contractForm.notes}
                    onChange={(e) => setContractForm({ ...contractForm, notes: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="col-12 d-flex justify-content-end gap-2 mt-2 border-top pt-3">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary px-3"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-sm btn-primary px-4 fw-bold">
                {isAddModalOpen ? 'Save Contract' : 'Update Contract'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ------------------------------------------------------------------ */}
      {/* MODAL 2: VIEW AMC CONTRACT DETAILS (CLEAN STRUCTURED TEXT)         */}
      {/* ------------------------------------------------------------------ */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Contract Details — ${selectedContract?.contractId || ''}`}
        size="lg"
      >
        {selectedContract && (
          <div className="p-2">
            <div className="amc-detail-section mb-3">
              <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">
                SECTION 1 — Order & Customer Details (Order Fulfilment)
              </h6>
              <div className="row g-3">
                <div className="col-12 col-sm-6 col-md-4">
                  <span className="amc-detail-label">AMC Contract ID:</span>
                  <span className="amc-detail-val font-monospace">{selectedContract.contractId}</span>
                </div>
                <div className="col-12 col-sm-6 col-md-4">
                  <span className="amc-detail-label">Order Fulfilment Ref:</span>
                  <span className="amc-detail-val font-monospace">{selectedContract.orderFulfilmentId}</span>
                </div>
                <div className="col-12 col-sm-6 col-md-4">
                  <span className="amc-detail-label">PI Reference:</span>
                  <span className="amc-detail-val font-monospace text-primary">{selectedContract.piNumber || '—'}</span>
                </div>
                <div className="col-12 col-sm-6 col-md-4">
                  <span className="amc-detail-label">Client Name:</span>
                  <span className="amc-detail-val">{selectedContract.client}</span>
                </div>
                <div className="col-12 col-sm-6 col-md-4">
                  <span className="amc-detail-label">Contact Person:</span>
                  <span className="amc-detail-val">{selectedContract.contactPerson || '—'}</span>
                </div>
                <div className="col-12 col-sm-6 col-md-4">
                  <span className="amc-detail-label">Mobile & Email:</span>
                  <span className="amc-detail-val">{selectedContract.mobile || '—'} | {selectedContract.email || '—'}</span>
                </div>
                <div className="col-12 col-sm-6 col-md-4">
                  <span className="amc-detail-label">Territory / Location:</span>
                  <span className="amc-detail-val">{selectedContract.territory || 'Tamil Nadu'}</span>
                </div>
              </div>
            </div>

            <div className="amc-detail-section mb-3">
              <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">
                SECTION 2 — Product System Details
              </h6>
              <div className="row g-3">
                <div className="col-12 col-md-8">
                  <span className="amc-detail-label">Product Model & System Summary:</span>
                  <span className="amc-detail-val">{selectedContract.productSummary}</span>
                </div>
                <div className="col-12 col-md-4">
                  <span className="amc-detail-label">Quantity:</span>
                  <span className="amc-detail-val">{selectedContract.productQty || 1} System(s)</span>
                </div>
              </div>
            </div>

            <div className="amc-detail-section mb-3">
              <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">
                SECTION 3 — AMC Commercial & Financial Terms
              </h6>
              <div className="row g-3">
                <div className="col-12 col-sm-6 col-md-4">
                  <span className="amc-detail-label">AMC Type:</span>
                  <span className="amc-detail-val">{selectedContract.amcType}</span>
                </div>
                <div className="col-12 col-sm-6 col-md-4">
                  <span className="amc-detail-label">AMC Period (Cycle):</span>
                  <span className="amc-detail-val">{selectedContract.period || '1 Year'}</span>
                </div>
                <div className="col-12 col-sm-6 col-md-4">
                  <span className="amc-detail-label">Base AMC Price:</span>
                  <span className="amc-detail-val font-monospace">₹{Number(selectedContract.basePrice || 100000).toLocaleString()}</span>
                </div>
                <div className="col-12 col-sm-6 col-md-4">
                  <span className="amc-detail-label">Discount:</span>
                  <span className="amc-detail-val font-monospace text-danger">₹{Number(selectedContract.discount || 0).toLocaleString()}</span>
                </div>
                <div className="col-12 col-sm-6 col-md-4">
                  <span className="amc-detail-label">GST Rate:</span>
                  <span className="amc-detail-val font-monospace">{selectedContract.gstPercent || 18}%</span>
                </div>
                <div className="col-12 col-sm-6 col-md-4">
                  <span className="amc-detail-label">Total Amount / 1 Cycle:</span>
                  <span className="amc-detail-val font-monospace text-success fw-bold">
                    ₹{Number(selectedContract.totalAmountCycle || selectedContract.totalAmount || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="amc-detail-section mb-3">
              <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">
                SECTION 4 — Product Coverage Dates & Escalation Alert
              </h6>
              <div className="row g-3">
                <div className="col-12 col-sm-6 col-md-4">
                  <span className="amc-detail-label">Start Date:</span>
                  <span className="amc-detail-val font-monospace">{selectedContract.startDate}</span>
                </div>
                <div className="col-12 col-sm-6 col-md-4">
                  <span className="amc-detail-label">End Date:</span>
                  <span className="amc-detail-val font-monospace">{selectedContract.endDate}</span>
                </div>
                <div className="col-12 col-sm-6 col-md-4">
                  <span className="amc-detail-label">Alert Before Days:</span>
                  <span className="amc-detail-val font-monospace">{selectedContract.alertBeforeDays || '30 Days'}</span>
                </div>
                <div className="col-12 col-sm-6 col-md-4">
                  <span className="amc-detail-label">Contract Status:</span>
                  <span className="amc-detail-val">{selectedContract.status}</span>
                </div>
                <div className="col-12 col-sm-6 col-md-4">
                  <span className="amc-detail-label">Escalation Alert Engine Status:</span>
                  <span className="amc-detail-val">{selectedContract.alertStatus || 'Normal'}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-light rounded border mb-3">
              <span className="amc-detail-label mb-1">Contract Remarks / Notes:</span>
              <p className="mb-0 text-dark small">{selectedContract.notes || 'No remarks recorded.'}</p>
            </div>

            <div className="d-flex justify-content-end">
              <button
                type="button"
                className="btn btn-sm btn-secondary px-4"
                onClick={() => setIsViewModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ------------------------------------------------------------------ */}
      {/* MODAL 3: AMC RENEWAL POPUP (AUTO NEW END DATE CALCULATION)        */}
      {/* ------------------------------------------------------------------ */}
      <Modal
        isOpen={isRenewModalOpen}
        onClose={() => setIsRenewModalOpen(false)}
        title={`Renew AMC Contract — ${selectedContract?.contractId || ''}`}
        size="md"
      >
        {selectedContract && (
          <div className="p-3">
            <div className="p-3 bg-light rounded border mb-3">
              <div className="row g-2">
                <div className="col-12 col-sm-6">
                  <span className="amc-detail-label">AMC Contract ID:</span>
                  <span className="amc-detail-val font-monospace fw-bold">{selectedContract.contractId}</span>
                </div>
                <div className="col-12 col-sm-6">
                  <span className="amc-detail-label">Client Name:</span>
                  <span className="amc-detail-val">{selectedContract.client}</span>
                </div>
                <div className="col-12 col-sm-6">
                  <span className="amc-detail-label">Current Start Date:</span>
                  <span className="amc-detail-val font-monospace">{selectedContract.startDate}</span>
                </div>
                <div className="col-12 col-sm-6">
                  <span className="amc-detail-label">Current End Date:</span>
                  <span className="amc-detail-val font-monospace text-danger fw-bold">{selectedContract.endDate}</span>
                </div>
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-12">
                <Dropdown
                  label="Select Renewal AMC Period *"
                  options={['1 Year', '2 Years', '3 Years', 'Half-Yearly', 'Quarterly', 'Monthly']}
                  value={renewForm.renewPeriod}
                  onChange={(e) => setRenewForm({ ...renewForm, renewPeriod: e.target.value })}
                />
              </div>
              <div className="col-12">
                <InputField
                  label="Calculated New End Date (Auto-Calculated)"
                  type="date"
                  value={calculateEndDate(selectedContract.endDate || new Date().toISOString().split('T')[0], renewForm.renewPeriod)}
                  disabled={true}
                  helpText="Automatically extended based on selected renewal AMC period"
                />
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 border-top pt-3">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary px-3"
                onClick={() => setIsRenewModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-sm btn-success px-4 fw-bold d-inline-flex align-items-center gap-1 shadow-sm"
                onClick={handleCompleteRenewal}
              >
                <RefreshCw size={14} />
                <span>Renew AMC (Extend Contract)</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ------------------------------------------------------------------ */}
      {/* MODAL 5: AMC BILLING & INVOICE DETAILS                             */}
      {/* ------------------------------------------------------------------ */}
      <Modal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
        title={`AMC Billing & Invoice History — ${selectedContract?.contractId || ''}`}
        size="md"
      >
        {selectedContract && (
          <div className="p-3">
            <div className="p-3 bg-light rounded border mb-3">
              <div className="row g-2">
                <div className="col-12 col-sm-6">
                  <span className="amc-detail-label">Tax Invoice No:</span>
                  <span className="amc-detail-val font-monospace text-primary fw-bold">INV-AMC-2026-092</span>
                </div>
                <div className="col-12 col-sm-6">
                  <span className="amc-detail-label">Client Name:</span>
                  <span className="amc-detail-val">{selectedContract.client}</span>
                </div>
                <div className="col-12 col-sm-6">
                  <span className="amc-detail-label">Base AMC Amount:</span>
                  <span className="amc-detail-val font-monospace">₹{Number(selectedContract.basePrice || 100000).toLocaleString()}</span>
                </div>
                <div className="col-12 col-sm-6">
                  <span className="amc-detail-label">Discount Applied:</span>
                  <span className="amc-detail-val font-monospace text-danger">₹{Number(selectedContract.discount || 0).toLocaleString()}</span>
                </div>
                <div className="col-12 col-sm-6">
                  <span className="amc-detail-label">GST Rate (18%):</span>
                  <span className="amc-detail-val font-monospace">18% GST Included</span>
                </div>
                <div className="col-12 col-sm-6">
                  <span className="amc-detail-label">Total Paid / Cycle:</span>
                  <span className="amc-detail-val font-monospace text-success fw-bold">
                    ₹{Number(selectedContract.totalAmountCycle || selectedContract.totalAmount || 0).toLocaleString()}
                  </span>
                </div>
                <div className="col-12">
                  <span className="amc-detail-label">Payment Transaction Ref:</span>
                  <span className="amc-detail-val font-monospace text-dark">TXN-AMC-8821 (NEFT / RTGS)</span>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end border-top pt-3">
              <button
                type="button"
                className="btn btn-sm btn-secondary px-4"
                onClick={() => setIsBillingModalOpen(false)}
              >
                Close Billing
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ------------------------------------------------------------------ */}
      {/* MODAL 4: DELETE CONFIRMATION                                        */}
      {/* ------------------------------------------------------------------ */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete Contract"
        size="sm"
      >
        {selectedContract && (
          <div className="p-2 text-center">
            <AlertTriangle size={36} className="text-danger mb-2 mx-auto" />
            <h6 className="fw-bold text-dark mb-2">Delete AMC Contract {selectedContract.contractId}?</h6>
            <p className="text-muted small mb-4">
              Are you sure you want to delete this contract for <strong>{selectedContract.client}</strong>? This action cannot be undone.
            </p>
            <div className="d-flex justify-content-center gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary px-3"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-sm btn-danger px-4 fw-bold"
                onClick={handleDeleteConfirm}
              >
                Delete Contract
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AMCManagement;
