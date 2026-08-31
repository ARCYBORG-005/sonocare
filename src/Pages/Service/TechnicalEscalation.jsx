import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Table from '../../components/Table';
import { InputField, Dropdown } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import {
  ShieldCheck,
  ArrowLeft,
  Users,
  Code,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import { initialMockTickets } from './mockTicketData';
import '../../styles/Category.css';
import '../../styles/Product.css';
import '../../styles/Lead.css';

/**
 * TechnicalEscalation Component
 * Dedicated workspace page for 3-Tier Technical Support Escalations.
 * Route: /service/operations/:id/escalate
 */
const TechnicalEscalation = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Locate target ticket
  const targetTicket = useMemo(() => {
    let list = [...initialMockTickets];
    try {
      const stored = JSON.parse(localStorage.getItem('app_service_tickets') || '[]');
      if (stored.length > 0) list = stored;
    } catch (e) {
      console.error(e);
    }
    const decoded = decodeURIComponent(id || '');
    return (
      list.find((t) => t.ticketId === decoded || t.id === decoded) ||
      list[0]
    );
  }, [id]);

  // Form State
  const [formState, setFormState] = useState({
    level1Engineers: 'Rajesh Sharma, Amit Patel',
    level1Notes: 'Support engineers tested probe and identified complex firmware communication timeout.',
    requiresTeamLeadSupport: 'Yes',
    teamLeadName: 'Suresh Reddy (Lead)',
    teamLeadMobile: '9740556677',
    teamLeadEmail: 'suresh.reddy@sonocare.com',
    teamLeadCompletedDateTime: new Date().toISOString().slice(0, 16),
    teamLeadRemarks: 'Reviewed display board assembly and escalated for firmware patch.',
    requiresDeveloperSupport: 'Yes',
    developerList: [
      {
        id: 1,
        name: 'Rohan Deshmukh (Firmware Dev)',
        mobile: '9811002233',
        email: 'rohan.dev@sonocare.com',
        completedDateTime: new Date().toISOString().slice(0, 16),
        remarks: 'Firmware patch v4.2.1 compiled and flashed onto scanner EEPROM.'
      }
    ]
  });

  // Current developer form state for adding new developer
  const [newDev, setNewDev] = useState({
    name: '',
    mobile: '',
    email: '',
    completedDateTime: new Date().toISOString().slice(0, 16),
    remarks: ''
  });

  useEffect(() => {
    if (targetTicket) {
      const initialDevs = Array.isArray(targetTicket.developerList) && targetTicket.developerList.length > 0
        ? targetTicket.developerList
        : [
            {
              id: 1,
              name: 'Rohan Deshmukh (Firmware Dev)',
              mobile: '9811002233',
              email: 'rohan.dev@sonocare.com',
              completedDateTime: new Date().toISOString().slice(0, 16),
              remarks: 'Firmware patch v4.2.1 compiled and flashed onto scanner EEPROM.'
            }
          ];

      setFormState({
        level1Engineers: targetTicket.assignedEngineer || 'Rajesh Sharma',
        level1Notes: targetTicket.issueSummary || 'Field engineers performed hardware inspection.',
        requiresTeamLeadSupport: targetTicket.requiresTeamLeadSupport ? 'Yes' : 'Yes',
        teamLeadName: targetTicket.teamLeadName || 'Suresh Reddy (Lead)',
        teamLeadMobile: targetTicket.teamLeadMobile || '9740556677',
        teamLeadEmail: targetTicket.teamLeadEmail || 'suresh.reddy@sonocare.com',
        teamLeadCompletedDateTime: targetTicket.teamLeadCompletionDateTime || new Date().toISOString().slice(0, 16),
        teamLeadRemarks: targetTicket.teamLeadRemarks || 'Reviewed display board assembly and escalated for firmware patch.',
        requiresDeveloperSupport: targetTicket.requiresDeveloperSupport ? 'Yes' : 'Yes',
        developerList: initialDevs
      });
    }
  }, [targetTicket]);

  // Add Developer to list
  const handleAddDeveloper = () => {
    if (!newDev.name.trim()) {
      toast.error('Please enter Developer Employee Name!');
      return;
    }

    const createdDev = {
      id: Date.now(),
      name: newDev.name.trim(),
      mobile: newDev.mobile.trim() || '9811002233',
      email: newDev.email.trim() || `${newDev.name.toLowerCase().replace(/\s+/g, '.')}@sonocare.com`,
      completedDateTime: newDev.completedDateTime || new Date().toISOString().slice(0, 16),
      remarks: newDev.remarks.trim() || 'Firmware patch compiled and flashed.'
    };

    setFormState((prev) => ({
      ...prev,
      developerList: [...prev.developerList, createdDev]
    }));

    setNewDev({
      name: '',
      mobile: '',
      email: '',
      completedDateTime: new Date().toISOString().slice(0, 16),
      remarks: ''
    });

    toast.success(`Developer "${createdDev.name}" added to list!`);
  };

  // Delete Developer from list
  const handleDeleteDeveloper = (devId) => {
    setFormState((prev) => ({
      ...prev,
      developerList: prev.developerList.filter((d) => d.id !== devId && d.name !== devId)
    }));
    toast.info('Developer removed from list.');
  };

  // Submit Handler
  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    try {
      let list = [...initialMockTickets];
      const stored = JSON.parse(localStorage.getItem('app_service_tickets') || '[]');
      if (stored.length > 0) list = stored;

      const updatedList = list.map((item) =>
        item.ticketId === targetTicket.ticketId
          ? {
              ...item,
              requiresTeamLeadSupport: formState.requiresTeamLeadSupport === 'Yes',
              teamLeadName: formState.teamLeadName,
              teamLeadMobile: formState.teamLeadMobile,
              teamLeadEmail: formState.teamLeadEmail,
              teamLeadCompletionDateTime: formState.teamLeadCompletedDateTime,
              teamLeadRemarks: formState.teamLeadRemarks,
              requiresDeveloperSupport: formState.requiresDeveloperSupport === 'Yes',
              developerCount: formState.developerList.length,
              developerList: formState.developerList
            }
          : item
      );

      localStorage.setItem('app_service_tickets', JSON.stringify(updatedList));
    } catch (err) {
      console.error(err);
    }

    toast.success(`Technical Escalation logs saved for Ticket ${targetTicket?.ticketId}!`);
    setTimeout(() => {
      navigate('/service/operations');
    }, 1200);
  };

  // Table Columns Definition matching Role Master Design
  const developerColumns = [
    {
      key: 'name',
      title: 'DEVELOPER NAME',
      sortable: true,
      render: (val) => <span className="fw-bold text-dark">{val}</span>
    },
    {
      key: 'mobile',
      title: 'MOBILE NUMBER',
      sortable: true,
      render: (val) => <span className="badge bg-light text-secondary border font-monospace">{val}</span>
    },
    {
      key: 'email',
      title: 'EMAIL ID',
      sortable: true,
      render: (val) => <span className="font-monospace text-primary">{val}</span>
    },
    {
      key: 'completedDateTime',
      title: 'COMPLETED DATETIME',
      sortable: true,
      render: (val) => <span className="font-monospace small text-dark">{val}</span>
    },
    {
      key: 'remarks',
      title: 'CODE PATCH REMARKS',
      sortable: true,
      render: (val) => <span className="category-desc-text font-monospace">{val || '—'}</span>
    }
  ];

  // Developer Table Actions
  const developerActions = (row) => (
    <div className="category-actions-container">
      <button
        type="button"
        className="category-action-btn delete-btn"
        title="Remove Developer"
        onClick={() => handleDeleteDeveloper(row.id || row.name)}
      >
        <Trash2 size={15} color="#DC2626" />
      </button>
    </div>
  );

  return (
    <div className="order-fulfilment-page container-fluid px-0 px-md-2 py-2">
      <Helmet>
        <title>3-Tier Technical Escalation | Sonocare CRM</title>
        <meta name="description" content="3-Tier Technical Support Escalation in Sonocare CRM." />
      </Helmet>
      <ToastContainer />

      {/* HEADER BAR */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 py-1">
        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary p-1"
            onClick={() => navigate('/service/operations')}
            title="Back to Service Operations Register"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="d-flex align-items-center gap-2">
            <ShieldCheck size={26} color="#DC2626" />
            <div>
              <h2 className="fs-5 fw-bold mb-0 text-dark">
                3-Tier Technical Support Escalations — {targetTicket?.ticketId}
              </h2>
              <span className="small text-muted font-monospace">
                Customer: {targetTicket?.customerName} | Territory: {targetTicket?.territory}
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="d-flex flex-column gap-4 mb-4">
          
          {/* LEVEL 1: SUPPORT FIELD ENGINEERS (READ-ONLY REFERENCE) */}
          <div className="category-card shadow-sm border bg-white" style={{ borderRadius: '10px' }}>
            <div className="section-card-title-bar">
              <Users size={18} color="#2E3192" />
              <span>Level 1: Support Field Engineers</span>
            </div>
            <div className="p-3">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <InputField
                    label="Assigned Field Engineers"
                    value={formState.level1Engineers}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Initial Inspection & Diagnostic Summary"
                    value={formState.level1Notes}
                    disabled={true}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* LEVEL 2: TEAM LEAD ESCALATION */}
          <div className="category-card shadow-sm border bg-white" style={{ borderRadius: '10px' }}>
            <div className="section-card-title-bar d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <UserCheck size={18} color="#D97706" />
                <span>Level 2: Team Lead Escalation</span>
              </div>
              <div className="d-flex align-items-center gap-3 pe-3">
                <div className="form-check form-check-inline mb-0">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="tl_req"
                    id="tl_no"
                    value="No"
                    checked={formState.requiresTeamLeadSupport === 'No'}
                    onChange={(e) => setFormState({ ...formState, requiresTeamLeadSupport: e.target.value })}
                  />
                  <label className="form-check-label fw-semibold" htmlFor="tl_no">Not Required</label>
                </div>
                <div className="form-check form-check-inline mb-0">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="tl_req"
                    id="tl_yes"
                    value="Yes"
                    checked={formState.requiresTeamLeadSupport === 'Yes'}
                    onChange={(e) => setFormState({ ...formState, requiresTeamLeadSupport: e.target.value })}
                  />
                  <label className="form-check-label fw-bold text-warning" htmlFor="tl_yes">Escalate to Team Lead</label>
                </div>
              </div>
            </div>

            {formState.requiresTeamLeadSupport === 'Yes' && (
              <div className="p-3">
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <Dropdown
                      label="Assigned Team Lead *"
                      options={['Suresh Reddy (Lead)', 'Anil Kapoor (Lead)']}
                      value={formState.teamLeadName}
                      onChange={(e) => setFormState({ ...formState, teamLeadName: e.target.value })}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <InputField
                      label="Team Lead Mobile Number"
                      value={formState.teamLeadMobile}
                      onChange={(e) => setFormState({ ...formState, teamLeadMobile: e.target.value })}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <InputField
                      label="Team Lead Email ID"
                      value={formState.teamLeadEmail}
                      onChange={(e) => setFormState({ ...formState, teamLeadEmail: e.target.value })}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <InputField
                      label="Lead Work Completion Date & Time"
                      type="datetime-local"
                      value={formState.teamLeadCompletedDateTime}
                      onChange={(e) => setFormState({ ...formState, teamLeadCompletedDateTime: e.target.value })}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold text-dark mb-1">
                      Team Lead Resolution Remarks & Escalation Notes
                    </label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={formState.teamLeadRemarks}
                      onChange={(e) => setFormState({ ...formState, teamLeadRemarks: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* LEVEL 3: DEVELOPER TEAM ESCALATION (MULTIPLE DEVELOPER MANAGEMENT) */}
          <div className="category-card shadow-sm border bg-white" style={{ borderRadius: '10px' }}>
            <div className="section-card-title-bar d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <Code size={18} color="#DC2626" />
                <span>Level 3: Developer Team Escalation</span>
              </div>
              <div className="d-flex align-items-center gap-3 pe-3">
                <div className="form-check form-check-inline mb-0">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="dev_req"
                    id="dev_no"
                    value="No"
                    checked={formState.requiresDeveloperSupport === 'No'}
                    onChange={(e) => setFormState({ ...formState, requiresDeveloperSupport: e.target.value })}
                  />
                  <label className="form-check-label fw-semibold" htmlFor="dev_no">Not Required</label>
                </div>
                <div className="form-check form-check-inline mb-0">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="dev_req"
                    id="dev_yes"
                    value="Yes"
                    checked={formState.requiresDeveloperSupport === 'Yes'}
                    onChange={(e) => setFormState({ ...formState, requiresDeveloperSupport: e.target.value })}
                  />
                  <label className="form-check-label fw-bold text-danger" htmlFor="dev_yes">Escalate to Developer Team</label>
                </div>
              </div>
            </div>

            {formState.requiresDeveloperSupport === 'Yes' && (
              <div className="p-3 d-flex flex-column gap-4">
                
                {/* ADD DEVELOPER ENTRY FORM */}
                <div className="p-3 bg-light rounded border">
                  <h6 className="small fw-bold text-dark mb-3">Add Developer Engineer:</h6>
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <InputField
                        label="Developer Employee Name *"
                        placeholder="e.g. Rohan Deshmukh (Firmware Dev)"
                        value={newDev.name}
                        onChange={(e) => setNewDev({ ...newDev, name: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <InputField
                        label="Mobile Number"
                        placeholder="e.g. 9811002233"
                        value={newDev.mobile}
                        onChange={(e) => setNewDev({ ...newDev, mobile: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <InputField
                        label="Email ID"
                        placeholder="e.g. rohan.dev@sonocare.com"
                        value={newDev.email}
                        onChange={(e) => setNewDev({ ...newDev, email: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <InputField
                        label="Work Completed Date & Time"
                        type="datetime-local"
                        value={newDev.completedDateTime}
                        onChange={(e) => setNewDev({ ...newDev, completedDateTime: e.target.value })}
                      />
                    </div>
                    <div className="col-12">
                      <InputField
                        label="Firmware / Code Patch Remarks"
                        placeholder="State technical patch or EEPROM update code details..."
                        value={newDev.remarks}
                        onChange={(e) => setNewDev({ ...newDev, remarks: e.target.value })}
                      />
                    </div>
                    <div className="col-12 d-flex justify-content-end">
                      <button
                        type="button"
                        className="btn btn-sm btn-primary px-3 fw-bold d-inline-flex align-items-center gap-1"
                        style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
                        onClick={handleAddDeveloper}
                      >
                        <Plus size={16} />
                        <span>Add Developer to Register</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* DEVELOPERS REGISTER TABLE (ROLE MASTER DESIGN) */}
                <div>
                  <h6 className="small fw-bold text-dark mb-2">Assigned Developers Register:</h6>
                  <div className="category-table-wrapper">
                    <Table
                      columns={developerColumns}
                      data={formState.developerList}
                      showSerialNumber={true}
                      serialNumberHeader="S.No"
                      actions={developerActions}
                      actionHeader="ACTIONS"
                      actionWidth="90px"
                      emptyMessage="No developer engineers added yet."
                      paginated={false}
                      tableClassName="category-custom-table"
                      bordered={false}
                      striped={false}
                      hover={true}
                    />
                  </div>
                </div>

              </div>
            )}

            {/* CARD BOTTOM FOOTER */}
            <div className="d-flex gap-2 justify-content-end border-top p-3 bg-white">
              <button
                type="button"
                className="btn btn-outline-secondary px-4 fw-semibold"
                onClick={() => navigate('/service/operations')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary px-5 fw-bold shadow-sm d-inline-flex align-items-center gap-2"
                style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
              >
                <Save size={18} />
                <span>Save Escalation Logs</span>
              </button>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
};

export default TechnicalEscalation;
