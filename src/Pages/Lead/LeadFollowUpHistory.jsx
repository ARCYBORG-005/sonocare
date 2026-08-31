import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Table from '../../components/Table';
import Button from '../../components/Button';
import { InputField, Dropdown } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import {
  ArrowLeft,
  Clock,
  Plus,
  Search,
  Filter,
  PhoneCall,
  UserCheck,
  Building2,
  Calendar,
  User,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import '../../styles/Category.css';
import '../../styles/Lead.css';
import {
  initialMockLeads,
  initialMockFollowUps
} from './mockLead';

const outreachTypeOptions = ['Call', 'Email', 'WhatsApp', 'SMS', 'Meeting', 'Other'];
const followUpStatusOptions = ['Interested', 'Not Interested'];
const outcomeOptions = ['Success', 'Failure', 'In Progress', 'Completed', 'Drop'];

const LeadFollowUpHistory = ({
  leads = initialMockLeads,
  followUps = initialMockFollowUps,
  setFollowUps,
  setLeads
}) => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Target lead if :id route parameter is provided
  const targetLead = useMemo(() => {
    if (!id) return (leads || [])[0] || null;
    return (leads || []).find((l) => l.leadId === id || String(l.id) === String(id)) || (leads || [])[0] || null;
  }, [leads, id]);

  const [selectedLeadForAdd, setSelectedLeadForAdd] = useState(targetLead);

  // --- FORM STATE ---
  const [addFormData, setAddFormData] = useState({
    outreachType: 'Call',
    followUpStatus: 'Interested',
    outcome: 'Success',
    followUpDate: new Date().toISOString().split('T')[0],
    followUpTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    nextFollowUpDate: '',
    nextFollowUpTime: '',
    title: 'Sales Follow-up Interaction',
    description: targetLead ? `Follow-up discussion with ${targetLead.contactPerson} regarding ${targetLead.product}.` : '',
    remarks: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // --- FILTER STATES ---
  const [searchQuery, setSearchQuery] = useState('');
  const [outreachTypeFilter, setOutreachTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('');

  // Filtered follow-ups dataset
  const filteredFollowUps = useMemo(() => {
    return (followUps || [])
      .filter((fup) => {
        // If specific lead ID param present, filter strictly for that lead
        if (targetLead && id && fup.leadId !== targetLead.leadId) {
          return false;
        }

        // Search Query Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchLeadId = fup.leadId && fup.leadId.toLowerCase().includes(q);
          const matchTitle = fup.title && fup.title.toLowerCase().includes(q);
          const matchDesc = fup.description && fup.description.toLowerCase().includes(q);
          const matchRemarks = fup.remarks && fup.remarks.toLowerCase().includes(q);
          const matchEmp = fup.assignedEmployeeName && fup.assignedEmployeeName.toLowerCase().includes(q);

          // Find lead details to match customer/contact name if available
          const leadMatch = (leads || []).find((l) => l.leadId === fup.leadId);
          const matchCustomer = leadMatch && leadMatch.customerName.toLowerCase().includes(q);
          const matchContact = leadMatch && leadMatch.contactPerson.toLowerCase().includes(q);

          if (!matchLeadId && !matchTitle && !matchDesc && !matchRemarks && !matchEmp && !matchCustomer && !matchContact) {
            return false;
          }
        }

        if (outreachTypeFilter && fup.outreachType !== outreachTypeFilter) return false;
        if (statusFilter && fup.followUpStatus !== statusFilter) return false;
        if (outcomeFilter && fup.outcome !== outcomeFilter) return false;

        return true;
      })
      .sort((a, b) => new Date(b.followUpDate) - new Date(a.followUpDate));
  }, [followUps, targetLead, id, searchQuery, outreachTypeFilter, statusFilter, outcomeFilter, leads]);

  // Form input handler
  const handleInputChange = (field, value) => {
    setAddFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Submit new follow-up handler
  const handleAddSubmit = (e) => {
    if (e) e.preventDefault();
    const activeLead = selectedLeadForAdd || targetLead;
    if (!activeLead) {
      toast.error('Please select a valid Lead record.');
      return;
    }

    if (!addFormData.title.trim()) {
      setFormErrors((prev) => ({ ...prev, title: 'Activity Title is required' }));
      toast.error('Please provide an Activity Title.');
      return;
    }

    const newFollowUp = {
      id: Date.now(),
      leadId: activeLead.leadId,
      outreachType: addFormData.outreachType,
      followUpStatus: addFormData.followUpStatus,
      outcome: addFormData.outcome,
      followUpDate: addFormData.followUpDate,
      followUpTime: addFormData.followUpTime,
      nextFollowUpDate: addFormData.nextFollowUpDate,
      nextFollowUpTime: addFormData.nextFollowUpTime,
      title: addFormData.title.trim(),
      description: addFormData.description.trim(),
      remarks: addFormData.remarks.trim(),
      assignedEmployeeName: activeLead.assignedEmployeeName || 'Sales Executive'
    };

    // Update follow-up logs state
    if (setFollowUps) {
      setFollowUps((prev) => [newFollowUp, ...(prev || [])]);
    }

    // Auto Lead Status update: Open -> In Progress upon first follow-up logged
    if (activeLead.leadStatus === 'Open' && setLeads) {
      setLeads((prev) =>
        prev.map((l) =>
          l.leadId === activeLead.leadId
            ? {
              ...l,
              leadStatus: 'In Progress',
              lastActivityDate: addFormData.followUpDate,
              nextFollowUpDate: addFormData.nextFollowUpDate,
              nextFollowUpTime: addFormData.nextFollowUpTime
            }
            : l
        )
      );
      toast.success(`Follow-up logged! Lead status updated to 'In Progress' and added to table below.`);
    } else {
      if (setLeads) {
        setLeads((prev) =>
          prev.map((l) =>
            l.leadId === activeLead.leadId
              ? {
                ...l,
                lastActivityDate: addFormData.followUpDate,
                nextFollowUpDate: addFormData.nextFollowUpDate,
                nextFollowUpTime: addFormData.nextFollowUpTime
              }
              : l
          )
        );
      }
      toast.success(`Follow-up log saved and added to the table below!`);
    }

    // Reset form for next entry
    setAddFormData({
      outreachType: 'Call',
      followUpStatus: 'Interested',
      outcome: 'Success',
      followUpDate: new Date().toISOString().split('T')[0],
      followUpTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      nextFollowUpDate: '',
      nextFollowUpTime: '',
      title: 'Sales Follow-up Interaction',
      description: activeLead ? `Follow-up discussion with ${activeLead.contactPerson} regarding ${activeLead.product}.` : '',
      remarks: ''
    });
  };

  // Table Columns Setup
  const columns = [
    {
      key: 'leadId',
      title: 'LEAD ID',
      sortable: true,
      render: (val) => (
        <button
          type="button"
          className="btn btn-link p-0 text-decoration-none fw-bold font-monospace small"
          onClick={() => navigate(`/leads/${val}/view`)}
          title="View Lead Details"
        >
          {val}
        </button>
      )
    },
    {
      key: 'customerName',
      title: 'CUSTOMER NAME',
      sortable: true,
      render: (_, row) => {
        const lead = (leads || []).find((l) => l.leadId === row.leadId);
        return (
          <div>
            <div className="fw-bold text-dark">{lead ? lead.customerName : '—'}</div>
            <div className="small text-muted">{lead ? lead.contactPerson : ''}</div>
          </div>
        );
      }
    },
    {
      key: 'outreachType',
      title: 'OUTREACH TYPE',
      sortable: true,
      align: 'center',
      render: (val) => <span className="badge bg-secondary">{val}</span>
    },
    {
      key: 'followUpDate',
      title: 'FOLLOW-UP DATE & TIME',
      sortable: true,
      render: (val, row) => (
        <div className="small">
          <div className="fw-semibold text-dark">{val}</div>
          <div className="text-muted font-monospace">{row.followUpTime || '—'}</div>
        </div>
      )
    },
    {
      key: 'nextFollowUpDate',
      title: 'NEXT FOLLOW-UP',
      sortable: true,
      render: (val, row) =>
        val ? (
          <div className="small">
            <div className="fw-semibold text-primary font-monospace">{val}</div>
            <div className="text-muted font-monospace">{row.nextFollowUpTime || ''}</div>
          </div>
        ) : (
          <span className="small text-muted">—</span>
        )
    },
    {
      key: 'title',
      title: 'ACTIVITY TITLE & DESCRIPTION',
      sortable: false,
      render: (val, row) => (
        <div style={{ maxWidth: '280px' }}>
          <div className="fw-semibold text-dark small mb-1">{val || 'Follow-up Activity'}</div>
          <p className="text-muted small mb-0 text-truncate" style={{ whiteSpace: 'normal', fontSize: '0.825rem' }}>
            {row.description}
          </p>
        </div>
      )
    },
    {
      key: 'followUpStatus',
      title: 'STATUS',
      sortable: true,
      align: 'center',
      render: (val) => (
        <span className={`badge ${val === 'Interested' ? 'bg-success' : 'bg-secondary'}`}>
          {val}
        </span>
      )
    },
    {
      key: 'outcome',
      title: 'OUTCOME',
      sortable: true,
      align: 'center',
      render: (val) => {
        let badgeBg = 'bg-info text-dark';
        if (val === 'Success') badgeBg = 'bg-success';
        if (val === 'Failure' || val === 'Drop') badgeBg = 'bg-danger';
        return <span className={`badge ${badgeBg}`}>{val}</span>;
      }
    },
    {
      key: 'remarks',
      title: 'REMARKS',
      sortable: false,
      render: (val) => <span className="small text-muted">{val || '—'}</span>
    },
    {
      key: 'assignedEmployeeName',
      title: 'EXECUTIVE',
      sortable: true,
      render: (val) => <span className="small fw-semibold text-dark">{val || 'Sales Executive'}</span>
    }
  ];

  const activeLead = selectedLeadForAdd || targetLead;

  return (
    <div className="category-master-page lead-management-page container-fluid px-0 px-md-1">
      <Helmet>
        <title>
          {activeLead
            ? `Lead Follow-up Page — ${activeLead.customerName} (${activeLead.leadId}) | Sonocare CRM`
            : 'Lead Follow-up Register & Activity Log | Sonocare CRM'}
        </title>
        <meta name="description" content="Add follow-up activity logs and view history table in Sonocare CRM." />
      </Helmet>
      <ToastContainer />

      {/* 1. TOP HEADER & BREADCRUMB */}
      <div className="category-page-header mb-3">
        <div className="category-page-title-group">
          <button
            type="button"
            className="btn btn-sm btn-light border me-2"
            onClick={() => navigate('/leads')}
            title="Back to Leads"
          >
            <ArrowLeft size={18} />
          </button>
          <PhoneCall size={28} style={{ color: '#2E3192' }} />
          <div>
            <h1 className="category-page-title mb-0">
              {activeLead
                ? `Lead Follow-up — ${activeLead.customerName} (${activeLead.leadId})`
                : 'Lead Follow-up Activity & History Register'}
            </h1>
            <span className="small text-muted">
              {activeLead
                ? `Contact: ${activeLead.contactPerson} (${activeLead.mobile}) | Product: ${activeLead.product}`
                : 'Add new follow-up logs and view full activity history table on the same page'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. INLINE ADD FOLLOW-UP LOG FORM (ALWAYS VISIBLE) */}
      <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
        <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <Clock size={20} color="#2E3192" />
            <h5 className="mb-0 fw-bold text-dark fs-6">LOG NEW FOLLOW-UP ACTIVITY</h5>
          </div>
          <span className="badge bg-primary">Add New Log</span>
        </div>

        <div className="card-body p-4">
          <form onSubmit={handleAddSubmit} noValidate>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label small fw-bold text-dark mb-1">Select Lead Record </label>
                <select
                  className="form-select form-select-sm"
                  value={activeLead ? activeLead.leadId : ''}
                  onChange={(e) => {
                    const matched = (leads || []).find((l) => l.leadId === e.target.value);
                    setSelectedLeadForAdd(matched || null);
                  }}
                >
                  {(leads || []).map((l) => (
                    <option key={l.leadId} value={l.leadId}>
                      {l.leadId} — {l.customerName} ({l.contactPerson}) — Status: {l.leadStatus}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Assigned Executive"
                  value={activeLead ? activeLead.assignedEmployeeName : 'Sales Executive'}
                  disabled={true}
                />
              </div>

              <div className="col-12 col-md-6">
                <Dropdown
                  label="Outreach Type "
                  options={outreachTypeOptions}
                  value={addFormData.outreachType}
                  onChange={(e) => handleInputChange('outreachType', e.target.value)}
                />
              </div>

              <div className="col-12 col-md-6">
                <Dropdown
                  label="Follow-up Status "
                  options={followUpStatusOptions}
                  value={addFormData.followUpStatus}
                  onChange={(e) => handleInputChange('followUpStatus', e.target.value)}
                />
              </div>

              <div className="col-12 col-md-6">
                <Dropdown
                  label="Outcome "
                  options={outcomeOptions}
                  value={addFormData.outcome}
                  onChange={(e) => handleInputChange('outcome', e.target.value)}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Follow-up Date "
                  type="date"
                  value={addFormData.followUpDate}
                  onChange={(e) => handleInputChange('followUpDate', e.target.value)}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Follow-up Time"
                  type="text"
                  placeholder="e.g. 10:30 AM"
                  value={addFormData.followUpTime}
                  onChange={(e) => handleInputChange('followUpTime', e.target.value)}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Next Follow-up Date"
                  type="date"
                  value={addFormData.nextFollowUpDate}
                  onChange={(e) => handleInputChange('nextFollowUpDate', e.target.value)}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Next Follow-up Time"
                  type="text"
                  placeholder="e.g. 02:30 PM"
                  value={addFormData.nextFollowUpTime}
                  onChange={(e) => handleInputChange('nextFollowUpTime', e.target.value)}
                />
              </div>

              <div className="col-12">
                <InputField
                  label="Activity Title "
                  placeholder="e.g. Discussed pricing quotation & scheduled demo"
                  value={addFormData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  error={formErrors.title}
                />
              </div>

              <div className="col-12">
                <InputField
                  label="Interaction Description"
                  type="textarea"
                  rows={2}
                  placeholder="Detailed summary of discussion with customer..."
                  value={addFormData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>

              <div className="col-12">
                <InputField
                  label="Remarks "
                  placeholder="e.g. Send updated brochure before Friday"
                  value={addFormData.remarks}
                  onChange={(e) => handleInputChange('remarks', e.target.value)}
                />
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
              <Button
                type="submit"
                variant="primary"
                style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
                className="px-4"
              >
                <Plus size={16} className="me-1" />Add Log
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* 3. FOLLOW-UP HISTORY REGISTER TABLE (BOTTOM SECTION ON SAME PAGE) */}
      <div className="category-card shadow-sm border-0" style={{ borderRadius: '10px' }}>
        {/* Search Header */}
        <div className="category-card-header pb-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h2 className="category-card-title mb-0">
            {activeLead
              ? `Follow-up Logs History for ${activeLead.leadId} (${filteredFollowUps.length} Records)`
              : `All Lead Follow-up History (${filteredFollowUps.length} Records)`}
          </h2>

          <div className="category-search-wrapper">
            <Search size={16} className="category-search-icon" />
            <input
              type="text"
              className="category-search-input"
              placeholder="Search Lead ID, Customer, Title, Notes, Remarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="p-3 bg-light border-bottom">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-auto d-flex align-items-center text-muted small me-1">
              <Filter size={15} className="me-1" />
              <span className="fw-semibold">Filters:</span>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={outreachTypeFilter}
                onChange={(e) => setOutreachTypeFilter(e.target.value)}
              >
                <option value="">All Outreach Types</option>
                {outreachTypeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Follow-up Statuses</option>
                {followUpStatusOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={outcomeFilter}
                onChange={(e) => setOutcomeFilter(e.target.value)}
              >
                <option value="">All Outcomes</option>
                {outcomeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* FULL PAGE TABLE VIEW */}
        <div className="category-table-wrapper" style={{ overflowX: 'auto' }}>
          <Table
            columns={columns}
            data={filteredFollowUps}
            showSerialNumber={true}
            serialNumberHeader="S.NO"
            emptyMessage="No follow-up activity history found."
            emptyIcon={<Clock size={40} className="text-muted d-block mx-auto mb-2" />}
            paginated={true}
            pageSizeOptions={[25, 50, 100]}
            defaultPageSize={25}
            tableClassName="category-custom-table"
            headerClassName=""
            bordered={false}
            striped={false}
            hover={true}
            minWidth="1400px"
          />
        </div>
      </div>
    </div>
  );
};

export default LeadFollowUpHistory;
