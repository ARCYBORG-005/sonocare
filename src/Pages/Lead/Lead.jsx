import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { InputField, Dropdown } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import {
  UserCheck,
  Plus,
  Eye,
  Pencil,
  Search,
  Filter,
  PhoneCall,
  Video,
  FileText,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import '../../styles/Category.css';
import '../../styles/Lead.css';
import {
  initialMockLeads,
  initialMockFollowUps,
  initialMockDemos,
  initialMockPIs,
  getNextLeadId
} from './mockLead';

const outreachTypeOptions = ['Call', 'Email', 'WhatsApp', 'SMS', 'Meeting', 'Other'];
const followUpStatusOptions = ['Interested', 'Not Interested'];
const outcomeOptions = ['Success', 'Failure', 'In Progress', 'Completed', 'Drop'];
const demoTypeOptions = ['Customer Site', 'Medialogic Site', 'Online'];
const demoStatusOptions = ['Scheduled', 'Rescheduled', 'Completed', 'Cancelled'];
const closureReasonOptions = [
  'Not Interested',
  'Lost to Competitor',
  'Budget',
  'No Response After N Follow-ups',
  'Other'
];

const Lead = ({
  leads = initialMockLeads,
  setLeads,
  followUps = initialMockFollowUps,
  setFollowUps,
  demos = initialMockDemos,
  setDemos,
  pis = initialMockPIs,
  setPIs
}) => {
  const navigate = useNavigate();

  // --- FILTER STATES ---
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [territoryFilter, setTerritoryFilter] = useState('');
  const [customerTypeFilter, setCustomerTypeFilter] = useState('');

  // --- MODAL STATES ---
  const [selectedLead, setSelectedLead] = useState(null);

  // 1. Follow-up Modal State
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [followUpFormData, setFollowUpFormData] = useState({
    outreachType: 'Call',
    followUpStatus: 'Interested',
    outcome: 'Success',
    followUpDate: new Date().toISOString().split('T')[0],
    followUpTime: '10:30 AM',
    nextFollowUpDate: '',
    nextFollowUpTime: '',
    title: '',
    description: '',
    remarks: ''
  });

  // 2. Demo Modal State
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoFormData, setDemoFormData] = useState({
    demoType: 'Customer Site',
    demoDate: new Date().toISOString().split('T')[0],
    demoTime: '02:00 PM',
    meetingLink: '',
    demoStatus: 'Scheduled',
    feedback: '',
    remarks: ''
  });

  // 3. Drop Lead Modal State
  const [isDropModalOpen, setIsDropModalOpen] = useState(false);
  const [dropFormData, setDropFormData] = useState({
    closureReason: 'Not Interested',
    closureRemarks: ''
  });

  // --- FILTERED DATA ---
  const filteredLeads = useMemo(() => {
    return (leads || []).filter((lead) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchId = lead.leadId && lead.leadId.toLowerCase().includes(q);
        const matchCustomer = lead.customerName && lead.customerName.toLowerCase().includes(q);
        const matchPerson = lead.contactPerson && lead.contactPerson.toLowerCase().includes(q);
        const matchMobile = lead.mobile && lead.mobile.includes(q);
        const matchEmail = lead.email && lead.email.toLowerCase().includes(q);

        if (!matchId && !matchCustomer && !matchPerson && !matchMobile && !matchEmail) {
          return false;
        }
      }

      if (statusFilter && lead.leadStatus !== statusFilter) return false;
      if (territoryFilter && lead.territory !== territoryFilter) return false;
      if (customerTypeFilter && lead.customerType !== customerTypeFilter) return false;

      return true;
    });
  }, [leads, searchQuery, statusFilter, territoryFilter, customerTypeFilter]);

  // --- MODAL OPEN HANDLERS ---
  const handleOpenFollowUpModal = (lead) => {
    setSelectedLead(lead);
    setFollowUpFormData({
      outreachType: 'Call',
      followUpStatus: 'Interested',
      outcome: 'Success',
      followUpDate: new Date().toISOString().split('T')[0],
      followUpTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      nextFollowUpDate: '',
      nextFollowUpTime: '',
      title: 'Sales Follow-up Interaction',
      description: `Follow-up discussion with ${lead.contactPerson} regarding ${lead.product}.`,
      remarks: ''
    });
    setIsFollowUpModalOpen(true);
  };

  const handleOpenDemoModal = (lead) => {
    if (lead.leadStatus !== 'In Progress') {
      toast.warning('Schedule Demo option is enabled ONLY when Lead Status === "In Progress".');
      return;
    }
    setSelectedLead(lead);
    const existingDemo = (demos || []).find((d) => d.leadId === lead.leadId);
    if (existingDemo) {
      setDemoFormData({
        demoType: existingDemo.demoType || 'Customer Site',
        demoDate: existingDemo.demoDate || new Date().toISOString().split('T')[0],
        demoTime: existingDemo.demoTime || '02:00 PM',
        meetingLink: existingDemo.meetingLink || '',
        demoStatus: existingDemo.demoStatus || 'Scheduled',
        feedback: existingDemo.feedback || '',
        remarks: existingDemo.remarks || ''
      });
    } else {
      setDemoFormData({
        demoType: 'Customer Site',
        demoDate: new Date().toISOString().split('T')[0],
        demoTime: '02:00 PM',
        meetingLink: '',
        demoStatus: 'Scheduled',
        feedback: '',
        remarks: ''
      });
    }
    setIsDemoModalOpen(true);
  };

  const handleOpenDropModal = (lead) => {
    setSelectedLead(lead);
    setDropFormData({
      closureReason: 'Not Interested',
      closureRemarks: ''
    });
    setIsDropModalOpen(true);
  };

  // --- SUBMIT WORKFLOW HANDLERS ---
  // 1. Submit Follow-up (Advances Open -> In Progress)
  const handleSubmitFollowUp = (e) => {
    if (e) e.preventDefault();
    if (!selectedLead) return;

    const newFollowUp = {
      id: Date.now(),
      leadId: selectedLead.leadId,
      outreachType: followUpFormData.outreachType,
      followUpStatus: followUpFormData.followUpStatus,
      outcome: followUpFormData.outcome,
      followUpDate: followUpFormData.followUpDate,
      followUpTime: followUpFormData.followUpTime,
      nextFollowUpDate: followUpFormData.nextFollowUpDate,
      nextFollowUpTime: followUpFormData.nextFollowUpTime,
      title: followUpFormData.title,
      description: followUpFormData.description,
      remarks: followUpFormData.remarks,
      assignedEmployeeName: selectedLead.assignedEmployeeName
    };

    if (setFollowUps) {
      setFollowUps((prev) => [newFollowUp, ...(prev || [])]);
    }

    // AUTOMATIC LEAD STATUS ENGINE: Open -> In Progress upon first follow-up logged
    if (selectedLead.leadStatus === 'Open' && setLeads) {
      setLeads((prev) =>
        prev.map((l) =>
          l.leadId === selectedLead.leadId
            ? {
                ...l,
                leadStatus: 'In Progress',
                lastActivityDate: followUpFormData.followUpDate,
                nextFollowUpDate: followUpFormData.nextFollowUpDate,
                nextFollowUpTime: followUpFormData.nextFollowUpTime
              }
            : l
        )
      );
      toast.success(`Follow-up saved! Lead status automatically updated to 'In Progress'.`);
    } else {
      if (setLeads) {
        setLeads((prev) =>
          prev.map((l) =>
            l.leadId === selectedLead.leadId
              ? {
                  ...l,
                  lastActivityDate: followUpFormData.followUpDate,
                  nextFollowUpDate: followUpFormData.nextFollowUpDate,
                  nextFollowUpTime: followUpFormData.nextFollowUpTime
                }
              : l
          )
        );
      }
      toast.success('Follow-up logged successfully.');
    }

    setIsFollowUpModalOpen(false);
  };

  // 2. Submit Schedule Demo
  const handleSubmitDemo = (e) => {
    if (e) e.preventDefault();
    if (!selectedLead) return;

    const existingIndex = (demos || []).findIndex((d) => d.leadId === selectedLead.leadId);
    const demoRecord = {
      id: existingIndex >= 0 ? demos[existingIndex].id : Date.now(),
      leadId: selectedLead.leadId,
      customerName: selectedLead.customerName,
      demoType: demoFormData.demoType,
      demoDate: demoFormData.demoDate,
      demoTime: demoFormData.demoTime,
      assignedEmployeeId: selectedLead.assignedEmployeeId,
      assignedEmployeeName: selectedLead.assignedEmployeeName,
      meetingLink: demoFormData.meetingLink,
      demoStatus: demoFormData.demoStatus,
      feedback: demoFormData.feedback,
      remarks: demoFormData.remarks
    };

    if (setDemos) {
      if (existingIndex >= 0) {
        setDemos((prev) => prev.map((d, i) => (i === existingIndex ? demoRecord : d)));
      } else {
        setDemos((prev) => [demoRecord, ...(prev || [])]);
      }
    }

    toast.success(`Product demonstration details updated for ${selectedLead.leadId}.`);
    setIsDemoModalOpen(false);
  };

  // 3. Submit Drop Lead (Terminal status)
  const handleSubmitDropLead = (e) => {
    if (e) e.preventDefault();
    if (!selectedLead) return;

    if (!dropFormData.closureReason || !dropFormData.closureRemarks.trim()) {
      toast.error('Closure Reason and Closure Remarks are required.');
      return;
    }

    if (setLeads) {
      setLeads((prev) =>
        prev.map((l) =>
          l.leadId === selectedLead.leadId
            ? {
                ...l,
                leadStatus: 'Drop',
                closureReason: dropFormData.closureReason,
                closureRemarks: dropFormData.closureRemarks.trim(),
                lastActivityDate: new Date().toISOString().split('T')[0]
              }
            : l
        )
      );
    }

    toast.error(`Lead ${selectedLead.leadId} has been dropped.`);
    setIsDropModalOpen(false);
  };

  // 4. Reopen Dropped Lead -> Create New Lead
  const handleCreateNewLeadFromDropped = (droppedLead) => {
    const newLeadId = getNextLeadId(leads);
    const newLead = {
      ...droppedLead,
      id: Date.now(),
      leadId: newLeadId,
      originalLeadId: droppedLead.leadId,
      reopenedLeadId: null,
      leadStatus: 'Open',
      closureReason: '',
      closureRemarks: '',
      leadCreatedDate: new Date().toISOString().split('T')[0],
      lastActivityDate: new Date().toISOString().split('T')[0],
      nextFollowUpDate: '',
      nextFollowUpTime: ''
    };

    if (setLeads) {
      setLeads((prev) => [
        newLead,
        ...(prev || []).map((l) =>
          l.leadId === droppedLead.leadId ? { ...l, reopenedLeadId: newLeadId } : l
        )
      ]);
    }

    toast.success(`New Lead ${newLeadId} created referencing dropped Lead ${droppedLead.leadId}!`);
    navigate(`/leads/${newLeadId}/edit`);
  };

  // --- COLUMNS CONFIGURATION (26 COLUMNS) ---
  const columns = [
    {
      key: 'leadId',
      title: 'LEAD ID',
      sortable: true,
      render: (val) => <span className="badge bg-secondary font-monospace">{val}</span>
    },
    {
      key: 'enquiryId',
      title: 'ENQUIRY ID',
      sortable: true,
      render: (val) =>
        val && val !== '—' ? (
          <span className="badge bg-info text-dark font-monospace">{val}</span>
        ) : (
          <span className="small text-muted">—</span>
        )
    },
    {
      key: 'customerName',
      title: 'CUSTOMER NAME',
      sortable: true,
      render: (val) => <span className="fw-bold text-dark">{val}</span>
    },
    {
      key: 'contactPerson',
      title: 'CONTACT PERSON',
      sortable: true,
      render: (val) => <span className="small text-dark">{val}</span>
    },
    {
      key: 'mobile',
      title: 'MOBILE',
      sortable: true,
      render: (val) => <span className="font-monospace small text-dark">{val}</span>
    },
    {
      key: 'email',
      title: 'EMAIL',
      sortable: true,
      render: (val) => <span className="small text-muted">{val || '—'}</span>
    },
    {
      key: 'customerType',
      title: 'CUSTOMER TYPE',
      sortable: true,
      render: (val) => <span className="badge bg-light text-dark border">{val}</span>
    },
    {
      key: 'hospitalInstitution',
      title: 'HOSPITAL / INSTITUTION',
      sortable: true,
      render: (val) => <span className="small text-truncate d-inline-block" style={{ maxWidth: '140px' }}>{val || '—'}</span>
    },
    {
      key: 'territory',
      title: 'TERRITORY',
      sortable: true,
      render: (val) => <span className="small text-dark">{val}</span>
    },
    {
      key: 'district',
      title: 'DISTRICT',
      sortable: true,
      render: (val) => <span className="small text-muted">{val || '—'}</span>
    },
    {
      key: 'city',
      title: 'CITY',
      sortable: true,
      render: (val) => <span className="small text-muted">{val || '—'}</span>
    },
    {
      key: 'productCategory',
      title: 'PRODUCT CATEGORY',
      sortable: true,
      render: (val) => <span className="small text-dark">{val}</span>
    },
    {
      key: 'product',
      title: 'PRODUCT',
      sortable: true,
      render: (val) => <span className="small fw-bold text-primary">{val}</span>
    },
    {
      key: 'serviceInterested',
      title: 'SERVICE INTERESTED',
      sortable: true,
      render: (val) => <span className="small text-muted">{val || '—'}</span>
    },
    {
      key: 'budget',
      title: 'BUDGET',
      sortable: true,
      render: (val) =>
        val ? (
          <span className="small fw-bold text-dark">₹ {Number(val).toLocaleString('en-IN')}</span>
        ) : (
          <span className="small text-muted">—</span>
        )
    },
    {
      key: 'expectedPurchaseTimeframe',
      title: 'TIMEFRAME',
      sortable: true,
      render: (val) => <span className="small text-muted">{val || '—'}</span>
    },
    {
      key: 'department',
      title: 'DEPARTMENT',
      sortable: true,
      render: (val) => <span className="small text-dark">{val || 'Sales Team'}</span>
    },
    {
      key: 'assignedEmployeeName',
      title: 'ASSIGNED EMPLOYEE',
      sortable: true,
      render: (val) => <span className="small fw-bold text-dark">{val || 'Unassigned'}</span>
    },
    {
      key: 'leadStatus',
      title: 'LEAD STATUS',
      sortable: true,
      render: (val) => {
        const cls = val.toLowerCase().replace(' ', '-');
        return <span className={`lead-status-badge ${cls}`}>{val}</span>;
      }
    },
    {
      key: 'lastActivityDate',
      title: 'LAST FOLLOW-UP',
      sortable: true,
      render: (val) => <span className="small text-muted">{val || '—'}</span>
    },
    {
      key: 'nextFollowUpDate',
      title: 'NEXT FOLLOW-UP',
      sortable: true,
      render: (val, row) =>
        val ? (
          <span className="small text-primary font-monospace">
            {val} {row.nextFollowUpTime ? `(${row.nextFollowUpTime})` : ''}
          </span>
        ) : (
          <span className="small text-muted">—</span>
        )
    },
    {
      key: 'follows',
      title: 'FOLLOWS',
      sortable: false,
      render: (_, row) => {
        const leadFups = (followUps || []).filter((f) => f.leadId === row.leadId);
        return (
          <div className="d-flex align-items-center gap-1">
            <button
              type="button"
              className="lead-btn-follows"
              title="Add Follow-up Activity Page"
              onClick={() => navigate(`/leads/${row.leadId}/add-follow-up`)}
              disabled={row.leadStatus === 'Drop'}
            >
              <PhoneCall size={16} />
              
            </button>
            
          </div>
        );
      }
    },
    {
      key: 'scheduleDemo',
      title: 'SCHEDULE DEMO',
      sortable: false,
      align: 'center',
      render: (_, row) => {
        return (
          <button
            type="button"
            className="lead-btn-demo px-2 py-1"
            title="Schedule & View Product Demo Page"
            onClick={() => navigate(`/leads/${row.leadId}/demo`)}
          >
            <Video size={16} />
          </button>
        );
      }
    },
    {
      key: 'pi',
      title: 'PI',
      sortable: false,
      align: 'center',
      render: (_, row) => {
        const isEnabled = row.leadStatus === 'High Confirm';
        return (
          <button
            type="button"
            className="lead-btn-pi px-2 py-1"
            title={isEnabled ? 'Go to Proforma Invoice' : 'PI enabled ONLY when status is High Confirm'}
            onClick={() => {
              if (isEnabled) {
                navigate(`/leads/${row.leadId}/pi`);
              } else {
                toast.warning('PI enabled ONLY when status is High Confirm');
              }
            }}
            disabled={!isEnabled}
          >
            <FileText size={16} />
          </button>
        );
      }
    }
  ];

  // Actions Column Renderer (View, Edit, Drop Lead, Create New Lead for Dropped / View Reopened Lead)
  const tableActions = (row) => (
    <div className="category-actions-container">
      <button
        type="button"
        className="category-action-btn view-btn"
        title="View Lead"
        onClick={() => navigate(`/leads/${row.leadId}/view`)}
      >
        <Eye size={15} color="#2563EB" />
      </button>

      {row.leadStatus !== 'Drop' && (
        <button
          type="button"
          className="category-action-btn edit-btn"
          title="Edit Lead"
          onClick={() => navigate(`/leads/${row.leadId}/edit`)}
        >
          <Pencil size={15} color="#16A34A" />
        </button>
      )}

      {row.leadStatus !== 'Drop' ? (
        <button
          type="button"
          className="lead-btn-drop ms-1"
          title="Drop Lead"
          onClick={() => handleOpenDropModal(row)}
        >
          <AlertTriangle size={12} />
          <span>Drop</span>
        </button>
      ) : row.reopenedLeadId ? (
        <button
          type="button"
          className="lead-btn-reopen-view ms-1"
          title={`View newly created Lead ${row.reopenedLeadId}`}
          onClick={() => navigate(`/leads/${row.reopenedLeadId}/view`)}
        >
          <Eye size={12} />
          <span>View Lead ({row.reopenedLeadId})</span>
        </button>
      ) : (
        <button
          type="button"
          className="lead-btn-reopen ms-1"
          title="Create New Lead from Dropped"
          onClick={() => handleCreateNewLeadFromDropped(row)}
        >
          <RotateCcw size={16} />
        
        </button>
      )}
    </div>
  );

  return (
    <div className="category-master-page lead-management-page container-fluid px-0 px-md-1">
      <Helmet>
        <title>Lead Management Register | Sonocare CRM</title>
        <meta name="description" content="Manage sales leads and operational lifecycle in Sonocare CRM." />
      </Helmet>
      <ToastContainer />

      {/* TOP HEADER */}
      <div className="category-page-header">
        <div className="category-page-title-group">
          <UserCheck size={28} style={{ color: '#2E3192' }} />
          <h1 className="category-page-title">Lead Management Register</h1>
        </div>

        <button
          type="button"
          className="category-add-btn"
          onClick={() => navigate('/leads/add')}
        >
          <Plus size={18} />
          <span>Add New Lead</span>
        </button>
      </div>

      {/* MAIN CARD CONTAINER */}
      <div className="category-card">
        <div className="category-card-header pb-3 border-bottom">
          <h2 className="category-card-title">Lead Master Register List</h2>
          <div className="category-search-wrapper">
            <Search size={16} className="category-search-icon" />
            <input
              type="text"
              className="category-search-input"
              placeholder="Search Lead ID, Customer, Contact, Mobile, Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* FILTERS TOOLBAR */}
        <div className="p-3 bg-light border-bottom">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-auto d-flex align-items-center text-muted small me-1">
              <Filter size={15} className="me-1" />
              <span className="fw-semibold">Filters:</span>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Lead Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="High Confirm">High Confirm</option>
                <option value="Won">Won</option>
                <option value="Drop">Drop</option>
              </select>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={territoryFilter}
                onChange={(e) => setTerritoryFilter(e.target.value)}
              >
                <option value="">All Territories</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Kerala">Kerala</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
              </select>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={customerTypeFilter}
                onChange={(e) => setCustomerTypeFilter(e.target.value)}
              >
                <option value="">All Customer Types</option>
                <option value="Hospital">Hospital</option>
                <option value="Diagnostic Lab">Diagnostic Lab</option>
                <option value="Clinic">Clinic</option>
              </select>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="category-table-wrapper">
          <Table
            columns={columns}
            data={filteredLeads}
            showSerialNumber={true}
            serialNumberHeader="S.NO"
            actions={tableActions}
            actionHeader="ACTIONS"
            actionWidth="160px"
            emptyMessage="No lead records found"
            emptyIcon={<UserCheck size={40} className="text-muted d-block mx-auto mb-2" />}
            paginated={true}
            pageSizeOptions={[25, 50, 100]}
            defaultPageSize={25}
            tableClassName="category-custom-table"
            headerClassName=""
            bordered={false}
            striped={false}
            hover={true}
            minWidth="1850px"
          />
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* 1. ADD FOLLOW-UP MODAL                                           */}
      {/* ---------------------------------------------------------------- */}
      <Modal
        show={isFollowUpModalOpen}
        onHide={() => setIsFollowUpModalOpen(false)}
        title="Add Follow-up Activity"
        size="lg"
        centered={true}
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            <Button variant="outline-secondary" onClick={() => setIsFollowUpModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmitFollowUp} style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}>
              Save Follow-up
            </Button>
          </div>
        }
      >
        {selectedLead && (
          <form onSubmit={handleSubmitFollowUp}>
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <InputField label="Lead ID" value={selectedLead.leadId} disabled={true} />
              </div>
              <div className="col-12 col-md-4">
                <InputField label="Customer Name" value={selectedLead.customerName} disabled={true} />
              </div>
              <div className="col-12 col-md-4">
                <InputField label="Assigned Employee" value={selectedLead.assignedEmployeeName} disabled={true} />
              </div>

              <div className="col-12 col-md-4">
                <Dropdown
                  label="Outreach Type "
                  options={outreachTypeOptions}
                  value={followUpFormData.outreachType}
                  onChange={(e) => setFollowUpFormData((prev) => ({ ...prev, outreachType: e.target.value }))}
                />
              </div>

              <div className="col-12 col-md-4">
                <Dropdown
                  label="Follow-up Status "
                  options={followUpStatusOptions}
                  value={followUpFormData.followUpStatus}
                  onChange={(e) => setFollowUpFormData((prev) => ({ ...prev, followUpStatus: e.target.value }))}
                />
              </div>

              <div className="col-12 col-md-4">
                <Dropdown
                  label="Outcome "
                  options={outcomeOptions}
                  value={followUpFormData.outcome}
                  onChange={(e) => setFollowUpFormData((prev) => ({ ...prev, outcome: e.target.value }))}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Follow-up Date "
                  type="date"
                  value={followUpFormData.followUpDate}
                  onChange={(e) => setFollowUpFormData((prev) => ({ ...prev, followUpDate: e.target.value }))}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Follow-up Time "
                  type="text"
                  placeholder="e.g. 10:30 AM"
                  value={followUpFormData.followUpTime}
                  onChange={(e) => setFollowUpFormData((prev) => ({ ...prev, followUpTime: e.target.value }))}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Next Follow-up Date "
                  type="date"
                  value={followUpFormData.nextFollowUpDate}
                  onChange={(e) => setFollowUpFormData((prev) => ({ ...prev, nextFollowUpDate: e.target.value }))}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Next Follow-up Time "
                  type="text"
                  placeholder="e.g. 02:00 PM"
                  value={followUpFormData.nextFollowUpTime}
                  onChange={(e) => setFollowUpFormData((prev) => ({ ...prev, nextFollowUpTime: e.target.value }))}
                />
              </div>

              <div className="col-12">
                <InputField
                  label="Interaction Title "
                  placeholder="e.g. Technical Scanner Spec Review"
                  value={followUpFormData.title}
                  onChange={(e) => setFollowUpFormData((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="col-12">
                <InputField
                  label="Description / Discussion Notes "
                  type="textarea"
                  rows={2}
                  placeholder="Enter detailed conversation details..."
                  value={followUpFormData.description}
                  onChange={(e) => setFollowUpFormData((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="col-12">
                <InputField
                  label="Remarks"
                  type="textarea"
                  rows={2}
                  placeholder="Additional remarks..."
                  value={followUpFormData.remarks}
                  onChange={(e) => setFollowUpFormData((prev) => ({ ...prev, remarks: e.target.value }))}
                />
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* ---------------------------------------------------------------- */}
      {/* 2. SCHEDULE / VIEW DEMO MODAL                                    */}
      {/* ---------------------------------------------------------------- */}
      <Modal
        show={isDemoModalOpen}
        onHide={() => setIsDemoModalOpen(false)}
        title="Schedule / Update Product Demonstration"
        size="md"
        centered={true}
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            <Button variant="outline-secondary" onClick={() => setIsDemoModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmitDemo} style={{ backgroundColor: '#0284c7', borderColor: '#0284c7' }}>
              Save Demo Details
            </Button>
          </div>
        }
      >
        {selectedLead && (
          <form onSubmit={handleSubmitDemo}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <InputField label="Lead ID" value={selectedLead.leadId} disabled={true} />
              </div>
              <div className="col-12 col-md-6">
                <InputField label="Customer Name" value={selectedLead.customerName} disabled={true} />
              </div>

              <div className="col-12 col-md-6">
                <Dropdown
                  label="Demo Type "
                  options={demoTypeOptions}
                  value={demoFormData.demoType}
                  onChange={(e) => setDemoFormData((prev) => ({ ...prev, demoType: e.target.value }))}
                />
              </div>

              <div className="col-12 col-md-6">
                <Dropdown
                  label="Demo Status "
                  options={demoStatusOptions}
                  value={demoFormData.demoStatus}
                  onChange={(e) => setDemoFormData((prev) => ({ ...prev, demoStatus: e.target.value }))}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Demo Date "
                  type="date"
                  value={demoFormData.demoDate}
                  onChange={(e) => setDemoFormData((prev) => ({ ...prev, demoDate: e.target.value }))}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Demo Time "
                  type="text"
                  placeholder="e.g. 02:30 PM"
                  value={demoFormData.demoTime}
                  onChange={(e) => setDemoFormData((prev) => ({ ...prev, demoTime: e.target.value }))}
                />
              </div>

              {demoFormData.demoType === 'Online' && (
                <div className="col-12">
                  <InputField
                    label="Online Meeting Link "
                    placeholder="e.g. https://meet.google.com/abc-defg-hij"
                    value={demoFormData.meetingLink}
                    onChange={(e) => setDemoFormData((prev) => ({ ...prev, meetingLink: e.target.value }))}
                  />
                </div>
              )}

              <div className="col-12">
                <InputField
                  label="Customer Feedback"
                  type="textarea"
                  rows={2}
                  placeholder="Customer feedback during/after demo..."
                  value={demoFormData.feedback}
                  onChange={(e) => setDemoFormData((prev) => ({ ...prev, feedback: e.target.value }))}
                />
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* ---------------------------------------------------------------- */}
      {/* 4. DROP LEAD MODAL                                               */}
      {/* ---------------------------------------------------------------- */}
      <Modal
        show={isDropModalOpen}
        onHide={() => setIsDropModalOpen(false)}
        title="Drop Lead Confirmation"
        size="md"
        centered={true}
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            <Button variant="outline-secondary" onClick={() => setIsDropModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleSubmitDropLead}>
              Confirm Drop Lead
            </Button>
          </div>
        }
      >
        {selectedLead && (
          <form onSubmit={handleSubmitDropLead}>
            <div className="alert alert-danger py-2 px-3 mb-3 small">
              <strong>Warning:</strong> Dropping a lead is a terminal action.
            </div>

            <div className="row g-3">
              <div className="col-12">
                <InputField label="Lead ID" value={selectedLead.leadId} disabled={true} />
              </div>
              <div className="col-12">
                <Dropdown
                  label="Closure Reason "
                  options={closureReasonOptions}
                  value={dropFormData.closureReason}
                  onChange={(e) => setDropFormData((prev) => ({ ...prev, closureReason: e.target.value }))}
                />
              </div>
              <div className="col-12">
                <InputField
                  label="Closure Remarks "
                  type="textarea"
                  rows={3}
                  placeholder="Enter specific reasons for dropping lead..."
                  value={dropFormData.closureRemarks}
                  onChange={(e) => setDropFormData((prev) => ({ ...prev, closureRemarks: e.target.value }))}
                />
              </div>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Lead;
