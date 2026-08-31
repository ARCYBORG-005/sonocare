import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Table from '../../components/Table';
import { InputField, Dropdown } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import {
  Wrench,
  ArrowLeft,
  UserCheck,
  Clock,
  Save,
  FileText,
  Users,
  Check,
  AlertTriangle,
  Sparkles,
  Award,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Mail,
  User,
  MapPin,
  Briefcase
} from 'lucide-react';
import { initialMockTickets } from './mockTicketData';
import { addBusinessHours, PRIORITY_SLA_TARGETS } from './slaEngine';
import { findBestMatchingEngineer, MASTER_ENGINEERS_LIST, calculateEngineerWorkloads } from './autoAssignEngine';
import '../../styles/Category.css';
import '../../styles/Product.css';
import '../../styles/Lead.css';

/**
 * Helper function to format current date and time in local timezone (YYYY-MM-DDTHH:mm)
 */
const getFormattedNowLocal = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Helper function to sanitize date-time string into HTML5 datetime-local compatible format (YYYY-MM-DDTHH:mm)
 */
const sanitizeDateTimeLocal = (dtStr) => {
  if (!dtStr) return getFormattedNowLocal();
  let formatted = String(dtStr).trim().replace(' ', 'T');
  if (formatted.length > 16) formatted = formatted.slice(0, 16);
  return formatted;
};

/**
 * AssignTicket Component
 * Workspace page for Ticket Assignment with editable Expected Work Start Date/Time picker & SLA resolution calculator.
 * Route: /service/operations/:id/assign
 */
const AssignTicket = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Locate target ticket from localStorage or mock
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

  // Workload map for availability & active ticket assignment count
  const engineerWorkloads = useMemo(() => {
    let list = [...initialMockTickets];
    try {
      const stored = JSON.parse(localStorage.getItem('app_service_tickets') || '[]');
      if (stored.length > 0) list = stored;
    } catch (e) {
      console.error(e);
    }
    return calculateEngineerWorkloads(list);
  }, []);

  // SECTION 1 & 3 FORM STATE (2 fields per row)
  const [formState, setFormState] = useState({
    ticketId: '',
    customerName: '',
    serviceType: 'CAMC',
    equipmentName: '',
    serialNumber: '',
    territory: '',
    priority: 'Critical',
    channel: 'Portal',
    issueSummary: '',
    assignedCoordinator: 'Karthik Raja (Support Coordinator)',
    department: 'Support Department',
    workStartDateTime: getFormattedNowLocal(),
    calculatedWorkEndDateTime: '',
    workRemarks: ''
  });

  // Candidate Selection State (Section 2)
  const [selectedTerritoryFilter, setSelectedTerritoryFilter] = useState('');
  const [selectedCandidateName, setSelectedCandidateName] = useState('Rajesh Sharma');

  // Candidate Card Data (holds auto-filled details & active ticket count before clicking Add Employee)
  const [cardData, setCardData] = useState({
    id: null,
    name: 'Rajesh Sharma',
    mobile: '9840112233',
    email: 'rajesh.sharma@sonocare.com',
    experience: 8,
    isSenior: true,
    territory: 'Chennai, Tamil Nadu',
    activeTicketsCount: 1,
    availabilityStatus: 'Available Today (1 Active Ticket Assigned)'
  });

  // Table of Assigned Employees
  const [assignedEmployeesList, setAssignedEmployeesList] = useState([]);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);

  // Auto Assign Rationale state
  const [autoAssignRationale, setAutoAssignRationale] = useState(null);

  // Sync initial state when targetTicket loads
  useEffect(() => {
    if (targetTicket) {
      const p = targetTicket.priority || 'Critical';
      const startTime = sanitizeDateTimeLocal(targetTicket.workStartDateTime);
      const config = PRIORITY_SLA_TARGETS[p] || PRIORITY_SLA_TARGETS.Critical;
      const calcEnd = sanitizeDateTimeLocal(addBusinessHours(startTime, config.resolutionBusinessHours));

      const initialTerritory = targetTicket.territory || 'Chennai, Tamil Nadu';
      setSelectedTerritoryFilter(initialTerritory);

      const coordName = initialTerritory.includes('Chennai')
        ? 'Karthik Raja (Chennai Coord)'
        : initialTerritory.includes('Bengaluru')
        ? 'Suresh Kumar (Bengaluru Coord)'
        : initialTerritory.includes('Hyderabad')
        ? 'Venkatesh Rao (Hyderabad Coord)'
        : 'Praveen Sharma (Delhi Coord)';

      setFormState({
        ticketId: targetTicket.ticketId,
        customerName: targetTicket.customerName,
        serviceType: targetTicket.type || 'CAMC',
        equipmentName: targetTicket.productName || 'Sonoscape Diagnostic System',
        serialNumber: targetTicket.serialNumber || 'SN-P20-2026-4412',
        territory: initialTerritory,
        priority: p,
        channel: targetTicket.channel || 'Portal',
        issueSummary: targetTicket.issueSummary || 'Inspect transducer probe acoustic lens and power supply board.',
        assignedCoordinator: targetTicket.assignedCoordinator || coordName,
        department: 'Support Department',
        workStartDateTime: startTime,
        calculatedWorkEndDateTime: calcEnd,
        workRemarks: ''
      });

      // Populate initial candidate card
      const defaultEngName = targetTicket.assignedEngineer || 'Rajesh Sharma';
      const found = MASTER_ENGINEERS_LIST.find((e) => e.name === defaultEngName) || MASTER_ENGINEERS_LIST[0];
      const count = engineerWorkloads[found.name] || 0;
      const initialCandidateObj = {
        id: Date.now(),
        name: found.name,
        mobile: found.mobile,
        email: found.email,
        experience: found.experience,
        isSenior: found.isSenior,
        territory: found.territory,
        activeTicketsCount: count,
        availabilityStatus: count < 3 ? `Available Today (${count} Active Tickets Assigned)` : `Busy (${count} Active Tickets Assigned)`
      };

      setSelectedCandidateName(found.name);
      setCardData(initialCandidateObj);

      // Populate assigned employees list
      const initialEngNames = Array.isArray(targetTicket.supportEngineers) && targetTicket.supportEngineers.length > 0
        ? targetTicket.supportEngineers
        : [defaultEngName];

      const initialList = initialEngNames.map((engName, idx) => {
        const engObj = MASTER_ENGINEERS_LIST.find((e) => e.name === engName) || {
          name: engName,
          mobile: '9840112233',
          email: `${engName.toLowerCase().replace(/\s+/g, '.')}@sonocare.com`,
          experience: 5,
          isSenior: true,
          territory: initialTerritory
        };
        const engLoad = engineerWorkloads[engName] || 0;
        return {
          id: Date.now() + idx,
          name: engObj.name,
          mobile: engObj.mobile,
          email: engObj.email,
          experience: engObj.experience,
          isSenior: engObj.isSenior,
          territory: engObj.territory,
          activeTicketsCount: engLoad,
          availabilityStatus: engLoad < 3 ? `Available Today (${engLoad} Active Tickets Assigned)` : `Busy (${engLoad} Active Tickets Assigned)`
        };
      });

      setAssignedEmployeesList(initialList);
    }
  }, [targetTicket, engineerWorkloads]);

  // Recalculate SLA Resolution Time whenever Expected Start Date/Time or Priority changes
  const handleStartOrPriorityChange = (newStartTime, newPriority) => {
    const p = newPriority !== null && newPriority !== undefined ? newPriority : formState.priority;
    const sTime = newStartTime !== null && newStartTime !== undefined ? newStartTime : formState.workStartDateTime;
    
    let calcEnd = formState.calculatedWorkEndDateTime;
    if (sTime) {
      const config = PRIORITY_SLA_TARGETS[p] || PRIORITY_SLA_TARGETS.Critical;
      calcEnd = sanitizeDateTimeLocal(addBusinessHours(sTime, config.resolutionBusinessHours));
    }

    setFormState((prev) => ({
      ...prev,
      priority: p,
      workStartDateTime: sTime,
      calculatedWorkEndDateTime: calcEnd
    }));
  };

  // Filtered Master Engineers List based on Territory & Department
  const filteredEngineers = useMemo(() => {
    let list = MASTER_ENGINEERS_LIST;
    if (selectedTerritoryFilter) {
      const city = selectedTerritoryFilter.split(',')[0].trim().toLowerCase();
      list = list.filter((eng) => {
        const engCity = eng.territory.toLowerCase();
        return engCity.includes(city) || city.includes(engCity.split(',')[0].trim().toLowerCase());
      });
    }
    return list.length > 0 ? list : MASTER_ENGINEERS_LIST;
  }, [selectedTerritoryFilter]);

  // Update candidate card details when employee is selected
  const handleCandidateSelect = (candidateName) => {
    setSelectedCandidateName(candidateName);
    const found = MASTER_ENGINEERS_LIST.find((e) => e.name === candidateName);
    if (found) {
      const count = engineerWorkloads[found.name] || 0;
      setCardData({
        id: editingEmployeeId || null,
        name: found.name,
        mobile: found.mobile,
        email: found.email,
        experience: found.experience,
        isSenior: found.isSenior,
        territory: found.territory,
        activeTicketsCount: count,
        availabilityStatus: count < 3 ? `Available Today (${count} Active Tickets Assigned)` : `Busy (${count} Active Tickets Assigned)`
      });
    }
  };

  // ADD / UPDATE EMPLOYEE CANDIDATE TO ASSIGNED TABLE VIEW
  const handleAddEmployeeToTable = () => {
    if (!cardData.name) {
      toast.error('Please select an employee candidate first!');
      return;
    }

    if (editingEmployeeId) {
      setAssignedEmployeesList((prev) =>
        prev.map((emp) => (emp.id === editingEmployeeId ? { ...cardData, id: editingEmployeeId } : emp))
      );
      toast.success(`Updated employee details for ${cardData.name}!`);
      setEditingEmployeeId(null);
    } else {
      const exists = assignedEmployeesList.some((emp) => emp.name === cardData.name);
      if (exists) {
        toast.warning(`${cardData.name} is already added to the assigned employees table!`);
        return;
      }

      const newRecord = {
        ...cardData,
        id: Date.now()
      };
      setAssignedEmployeesList((prev) => [...prev, newRecord]);
      toast.success(`Added ${cardData.name} to assigned employees table!`);
    }

    // Reset card inputs
    setSelectedCandidateName('');
    setCardData({
      id: null,
      name: '',
      mobile: '',
      email: '',
      experience: 0,
      isSenior: false,
      territory: '',
      activeTicketsCount: 0,
      availabilityStatus: ''
    });
  };

  // EDIT EMPLOYEE FROM TABLE VIEW
  const handleEditEmployeeFromTable = (emp) => {
    setEditingEmployeeId(emp.id);
    setSelectedCandidateName(emp.name);
    setCardData({ ...emp });
    toast.info(`Editing ${emp.name}. Click 'Update Employee' to save changes.`);
  };

  // DELETE EMPLOYEE FROM TABLE VIEW
  const handleDeleteEmployeeFromTable = (empId, empName) => {
    setAssignedEmployeesList((prev) => prev.filter((emp) => emp.id !== empId));
    toast.info(`Removed ${empName} from assigned employees list.`);
    if (editingEmployeeId === empId) {
      setEditingEmployeeId(null);
    }
  };

  // 1-CLICK AUTO ASSIGN TRIGGER HANDLER
  const handleAutoAssign = () => {
    let list = [...initialMockTickets];
    try {
      const stored = JSON.parse(localStorage.getItem('app_service_tickets') || '[]');
      if (stored.length > 0) list = stored;
    } catch (e) {
      console.error(e);
    }

    const result = findBestMatchingEngineer(targetTicket, list);
    const selected = result.selectedEngineer;
    const count = result.workloads[selected.name] || 0;

    const autoRecord = {
      id: Date.now(),
      name: selected.name,
      mobile: selected.mobile,
      email: selected.email,
      experience: selected.experience,
      isSenior: selected.isSenior,
      territory: selected.territory,
      activeTicketsCount: count,
      availabilityStatus: count < 3 ? `Available Today (${count} Active Tickets Assigned)` : `Busy (${count} Active Tickets Assigned)`
    };

    setAssignedEmployeesList([autoRecord]);
    setSelectedCandidateName(selected.name);
    setCardData(autoRecord);
    setAutoAssignRationale(result);
    toast.success(`Auto-Assigned to ${selected.name} (${selected.experience} yrs exp, Senior: ${selected.isSenior ? 'Yes' : 'No'}, Active Tickets: ${count})!`);
  };

  // SUBMIT / SAVE ASSIGNMENT HANDLER
  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    if (assignedEmployeesList.length === 0) {
      toast.error('Please add at least one employee candidate to the assigned table before saving!');
      return;
    }

    const assignedNamesArray = assignedEmployeesList.map((emp) => emp.name);
    const assignedEngineerStr = assignedNamesArray.join(', ');

    try {
      let list = [...initialMockTickets];
      const stored = JSON.parse(localStorage.getItem('app_service_tickets') || '[]');
      if (stored.length > 0) list = stored;

      const updatedList = list.map((item) =>
        item.ticketId === targetTicket.ticketId
          ? {
              ...item,
              status: 'Assigned',
              priority: formState.priority,
              assignedEngineer: assignedEngineerStr,
              supportEngineers: assignedNamesArray,
              assignedCoordinator: formState.assignedCoordinator,
              workStartDateTime: formState.workStartDateTime,
              calculatedWorkEndDateTime: formState.calculatedWorkEndDateTime,
              enteredWorkEndDateTime: formState.calculatedWorkEndDateTime,
              lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' ')
            }
          : item
      );

      localStorage.setItem('app_service_tickets', JSON.stringify(updatedList));
    } catch (err) {
      console.error(err);
    }

    toast.success(`Ticket ${targetTicket?.ticketId} successfully assigned to ${assignedEngineerStr}! Status updated to Assigned.`);

    setTimeout(() => {
      navigate('/service/operations');
    }, 1000);
  };

  // Table Columns Definition for Assigned Employees Table View
  const assignedTableColumns = [
    {
      key: 'name',
      title: 'EMPLOYEE NAME',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="fw-bold text-dark d-block">{val}</span>
          <span className="small text-muted font-monospace">{row.territory}</span>
        </div>
      )
    },
    {
      key: 'mobile',
      title: 'CONTACT DETAILS (PHONE & EMAIL)',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="fw-medium text-dark d-block font-monospace" style={{ fontSize: '12px' }}>{val}</span>
          <span className="small text-primary font-monospace" style={{ fontSize: '11px' }}>{row.email}</span>
        </div>
      )
    },
    {
      key: 'experience',
      title: 'EXPERIENCE & SENIORITY',
      sortable: true,
      align: 'center',
      render: (val, row) => (
        <span className={`badge ${row.isSenior ? 'bg-primary text-white' : 'bg-light text-dark border'}`}>
          {val} Yrs Exp {row.isSenior ? '(Senior)' : ''}
        </span>
      )
    },
    {
      key: 'activeTicketsCount',
      title: 'ACTIVE TICKET COUNT',
      sortable: true,
      align: 'center',
      render: (val) => (
        <span className="badge bg-purple text-white font-monospace" style={{ backgroundColor: '#9333EA' }}>
          {val || 0} Active Ticket{val === 1 ? '' : 's'}
        </span>
      )
    },
    {
      key: 'availabilityStatus',
      title: 'AVAILABILITY STATUS',
      sortable: true,
      align: 'center',
      render: (val) => {
        const isAvail = (val || '').includes('Available');
        return (
          <span className={`badge ${isAvail ? 'bg-success bg-opacity-10 text-success border border-success' : 'bg-warning text-dark'}`}>
            {val}
          </span>
        );
      }
    }
  ];

  // Table Actions Renderer (Edit & Delete Icons)
  const tableActions = (row) => (
    <div className="d-flex align-items-center justify-content-center gap-2">
      <button
        type="button"
        className="btn btn-sm btn-outline-primary p-1"
        title="Edit Employee Details in Card View"
        onClick={() => handleEditEmployeeFromTable(row)}
      >
        <Edit2 size={14} />
      </button>
      <button
        type="button"
        className="btn btn-sm btn-outline-danger p-1"
        title="Delete Employee from Table"
        onClick={() => handleDeleteEmployeeFromTable(row.id, row.name)}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );

  const priorityTargets = PRIORITY_SLA_TARGETS[formState.priority] || PRIORITY_SLA_TARGETS.Critical;

  return (
    <div className="order-fulfilment-page container-fluid px-0 px-md-2 py-2">
      <Helmet>
        <title>Assign Ticket & SLA Matrix | Sonocare CRM</title>
        <meta name="description" content="Assign Ticket & SLA Matrix in Sonocare CRM." />
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
            <UserCheck size={26} color="#2E3192" />
            <div>
              <h2 className="fs-5 fw-bold mb-0 text-dark">
                Assign Service Ticket — {targetTicket?.ticketId}
              </h2>
              <span className="small text-muted font-monospace">
                Customer: {targetTicket?.customerName} | Territory: {targetTicket?.territory}
              </span>
            </div>
          </div>
        </div>

        {/* 1-CLICK AUTO ASSIGNMENT BUTTON */}
       
      </div>

      <form onSubmit={handleSubmit}>
        <div className="d-flex flex-column gap-4 mb-4">
          
          {/* SECTION 1: TICKET REFERENCE & EQUIPMENT SPECIFICATIONS (INPUT BOXES, 2 FIELDS PER ROW) */}
          <div className="category-card shadow-sm border bg-white" style={{ borderRadius: '10px' }}>
            <div className="section-card-title-bar">
              <FileText size={18} color="#2E3192" />
              <span>1. Ticket Reference & Equipment Specifications</span>
            </div>
            <div className="p-3">
              <div className="row g-3">
                {/* Row 1: 2 Input Fields */}
                <div className="col-12 col-md-6">
                  <InputField
                    label="Ticket ID / Record Reference *"
                    value={formState.ticketId}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Customer / Hospital Name *"
                    value={formState.customerName}
                    disabled={true}
                  />
                </div>

                {/* Row 2: 2 Input Fields */}
                <div className="col-12 col-md-6">
                  <InputField
                    label="Service Type *"
                    value={formState.serviceType}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Equipment / Product Name *"
                    value={formState.equipmentName}
                    disabled={true}
                  />
                </div>

                {/* Row 3: 2 Input Fields */}
                <div className="col-12 col-md-6">
                  <InputField
                    label="Serial Number *"
                    value={formState.serialNumber}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Territory / Location *"
                    value={formState.territory}
                    disabled={true}
                  />
                </div>

                {/* Row 4: 2 Input Fields */}
                <div className="col-12 col-md-6">
                  <InputField
                    label="Priority SLA Tier *"
                    value={formState.priority}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Intake Channel "
                    value={formState.channel}
                    disabled={true}
                  />
                </div>

                {/* Row 5: Issue Summary Input Box */}
                <div className="col-12">
                  <label className="form-label small fw-semibold text-dark mb-1">Issue Summary </label>
                  <textarea
                    className="form-control font-monospace"
                    rows={2}
                    value={formState.issueSummary}
                    disabled={true}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: SUPPORT DEPARTMENT EMPLOYEE ASSIGNMENT */}
          <div className="category-card shadow-sm border bg-white" style={{ borderRadius: '10px' }}>
            <div className="section-card-title-bar d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <Users size={18} color="#2E3192" />
                <span>2. Support Department Employee Assignment</span>
              </div>
            </div>

            <div className="p-3 d-flex flex-column gap-3">
              
              {/* RATIONALE BREAKDOWN IF AUTO-ASSIGNED */}
              {autoAssignRationale && (
                <div className="p-3 bg-light border border-warning rounded">
                  <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
                    <Award size={18} className="text-warning" />
                    <span>Auto-Assignment Rationale</span>
                  </h6>
                  <ul className="mb-0 small font-monospace ps-3">
                    {autoAssignRationale.rationaleSteps.map((step, idx) => (
                      <li key={idx} className="mb-1">{step}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* DEPARTMENT & COORDINATOR (2 FIELDS PER ROW) */}
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <Dropdown
                    label="Department *"
                    options={['Support Department', 'Service Operations', 'Biomedical Engineering']}
                    value={formState.department}
                    onChange={(e) => setFormState({ ...formState, department: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Assigned Coordinator Name (Territory Based) *"
                    value={formState.assignedCoordinator}
                    onChange={(e) => setFormState({ ...formState, assignedCoordinator: e.target.value })}
                  />
                </div>
              </div>

              {/* CANDIDATE SELECTION & AUTO-FILLED EXPERIENCE, ACTIVE TICKET COUNT & CONTACTS (2 FIELDS PER ROW) */}
              <div className="p-3 bg-light rounded border">
                <h6 className="fw-bold text-dark mb-3">Employee Details & Candidate Selection Card</h6>
                <div className="row g-3">
                  {/* Row 1: Employee Name Dropdown & Experience (Auto-filled) */}
                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold text-dark mb-1">
                      Select Employee Name (Filtered by Territory & Dept) *
                    </label>
                    <select
                      className="form-select form-select-sm fw-bold text-primary"
                      value={selectedCandidateName}
                      onChange={(e) => handleCandidateSelect(e.target.value)}
                    >
                      <option value="">-- Choose Candidate --</option>
                      {filteredEngineers.map((eng, idx) => {
                        const engCount = engineerWorkloads[eng.name] || 0;
                        return (
                          <option key={idx} value={eng.name}>
                            {eng.name} ({eng.experience} Yrs Exp | {engCount} Active Ticket{engCount === 1 ? '' : 's'} Assigned)
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="col-12 col-md-6">
                    <InputField
                      label="Experience (Auto-filled Years) *"
                      value={cardData.experience ? `${cardData.experience} Years ${cardData.isSenior ? '(Senior Engineer)' : ''}` : ''}
                      disabled={true}
                    />
                  </div>

                  {/* Row 2: Active Ticket Assignment Count & Phone Number */}
                  <div className="col-12 col-md-6">
                    <InputField
                      label="Active Ticket Assignment Count (Auto-calculated) *"
                      value={cardData.activeTicketsCount !== undefined ? `${cardData.activeTicketsCount} Active Ticket${cardData.activeTicketsCount === 1 ? '' : 's'} Assigned` : ''}
                      disabled={true}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <InputField
                      label="Employee Phone Number *"
                      value={cardData.mobile || ''}
                      onChange={(e) => setCardData({ ...cardData, mobile: e.target.value })}
                    />
                  </div>

                  {/* Row 3: Employee Email ID & Availability Badge */}
                  <div className="col-12 col-md-6">
                    <InputField
                      label="Employee Email ID *"
                      value={cardData.email || ''}
                      onChange={(e) => setCardData({ ...cardData, email: e.target.value })}
                    />
                  </div>
                  <div className="col-12 col-md-6 d-flex flex-column justify-content-center">
                    <label className="form-label small fw-semibold text-dark mb-1">Availability Status</label>
                    <div>
                      <span className={`badge ${cardData.availabilityStatus.includes('Available') ? 'bg-success bg-opacity-10 text-success border border-success' : 'bg-warning text-dark'}`} style={{ fontSize: '12px', padding: '6px 12px' }}>
                        {cardData.availabilityStatus || 'Select Candidate'}
                      </span>
                    </div>
                  </div>

                  {/* Add Employee Button Footer */}
                  <div className="col-12 d-flex justify-content-end pt-2 border-top">
                    <button
                      type="button"
                      className="btn btn-primary fw-bold px-4 d-inline-flex align-items-center gap-2 shadow-sm"
                      onClick={handleAddEmployeeToTable}
                    >
                      <Plus size={18} />
                      <span>{editingEmployeeId ? 'Update Employee' : 'Add Employee'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* TABLE VIEW OF ASSIGNED EMPLOYEES (WITH EDIT & DELETE ICONS) */}
              <div className="mt-2">
                <h6 className="small fw-bold text-dark mb-2 d-flex align-items-center gap-2">
                  <UserCheck size={16} className="text-success" />
                  <span>Assigned Employees Table View ({assignedEmployeesList.length}):</span>
                </h6>
                <div className="category-table-wrapper">
                  <Table
                    columns={assignedTableColumns}
                    data={assignedEmployeesList}
                    showSerialNumber={true}
                    serialNumberHeader="S.No"
                    actions={tableActions}
                    actionHeader="ACTIONS"
                    actionWidth="100px"
                    emptyMessage="No employees added to the assigned table yet. Select an employee candidate and click 'Add Employee'."
                    paginated={false}
                    tableClassName="category-custom-table"
                    bordered={false}
                    striped={false}
                    hover={true}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 3: EXPECTED WORK START DATE & TIME & SLA RESOLUTION CALCULATOR (2 FIELDS PER ROW) */}
          <div className="category-card shadow-sm border bg-white" style={{ borderRadius: '10px' }}>
            <div className="section-card-title-bar">
              <Clock size={18} color="#2E3192" />
              <span>3. Expected Work Start Date & Time & Business Hours SLA Resolution Calculator</span>
            </div>

            <div className="p-3 d-flex flex-column gap-3">
              <div className="row g-3">
                {/* Row 1: Priority Tier & Expected Work Start Date/Time Manual Entry */}
                <div className="col-12 col-md-6">
                  <Dropdown
                    label="Ticket Priority SLA Tier *"
                    options={['Critical', 'High', 'Medium', 'Low']}
                    value={formState.priority}
                    onChange={(e) => handleStartOrPriorityChange(null, e.target.value)}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <InputField
                    label="Expected Work Start Date & Time "
                    type="datetime-local"
                    value={formState.workStartDateTime}
                    onChange={(e) => handleStartOrPriorityChange(e.target.value, null)}
                  />
                </div>

                {/* Row 2: Calculated Expected Resolution Date/Time & Remarks */}
                <div className="col-12 col-md-6">
                  <InputField
                    label="Calculated Expected Resolution Date & Time (Mon-Sat 9AM-6PM) "
                    type="datetime-local"
                    value={formState.calculatedWorkEndDateTime}
                    disabled={true}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <InputField
                    label="Work Remarks & Assignment Notes"
                    value={formState.workRemarks}
                    onChange={(e) => setFormState({ ...formState, workRemarks: e.target.value })}
                  />
                </div>
              </div>

              {/* CALCULATED PREVIEW HIGHLIGHT BOX */}
              <div className="p-3  d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div>
                  <span className="small text-muted d-block">Automatic SLA Business Hours Target:</span>
                  <strong className="text-primary font-monospace fs-6">
                    {priorityTargets.resolutionBusinessHours} Business Hours ({formState.priority} Priority)
                  </strong>
                </div>
                <div className="text-end">
                  <span className="small text-muted d-block">Calculated Expected Resolution Target:</span>
                  <strong className="text-success font-monospace fs-6">
                    {formState.calculatedWorkEndDateTime ? formState.calculatedWorkEndDateTime.replace('T', ' ') : 'Select valid start time'}
                  </strong>
                </div>
              </div>

              {/* BOTTOM CARD FOOTER */}
              <div className="d-flex gap-2 justify-content-end border-top pt-3 mt-2">
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
                  <span>Save Assignment</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      </form>
    </div>
  );
};

export default AssignTicket;
