import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { InputField, Dropdown } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import {
  Wrench,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  PauseCircle,
  RotateCcw,
  Send,
  AlertTriangle,
  UserCheck,
  Building2,
  Phone,
  Mail,
  ShieldCheck,
  FileText,
  Users,
  Code,
  Package,
  FileSpreadsheet,
  Check,
  X,
  PenTool,
  Globe,
  MessageSquare,
  UserPlus
} from 'lucide-react';
import { initialMockTickets } from './mockTicketData';
import { getSlaStatus, getSlaCountdownDetails } from './slaEngine';
import '../../styles/Category.css';
import '../../styles/Product.css';
import '../../styles/Lead.css';
import '../AMC/AMCManagement.css';

/**
 * Helper function to format current date and time in local timezone (YYYY-MM-DD HH:mm)
 */
const getFormattedNow = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

/**
 * TicketServiceOperations Component
 * Service Operations workspace page with strict status set.
 */
const TicketServiceOperations = () => {
  const navigate = useNavigate();

  // Tickets Dataset sync with localStorage app_service_tickets
  const [tickets, setTickets] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('app_service_tickets') || '[]');
      if (stored.length > 0) return stored;
    } catch (err) {
      console.error(err);
    }
    return [...initialMockTickets];
  });

  // Sync with localStorage
  const saveTicketsToStorage = (newList) => {
    setTickets(newList);
    try {
      localStorage.setItem('app_service_tickets', JSON.stringify(newList));
    } catch (err) {
      console.error(err);
    }
  };

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [escalationFilter, setEscalationFilter] = useState('');

  // Filtered List
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        t.ticketId.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.productName.toLowerCase().includes(q) ||
        (t.serialNumber && t.serialNumber.toLowerCase().includes(q));

      const matchesStatus = !statusFilter || t.status === statusFilter || (statusFilter === 'Open' && t.status === 'New');
      const matchesPriority = !priorityFilter || t.priority === priorityFilter;
      const matchesServiceType = !serviceTypeFilter || (t.type || 'SAMC') === serviceTypeFilter;
      const matchesChannel = !channelFilter || (t.channel || 'Portal') === channelFilter;
      const matchesEscalation = !escalationFilter || (t.requiresDeveloperSupport ? 'Developer' : t.requiresTeamLeadSupport ? 'Team Lead' : 'Support') === escalationFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesServiceType && matchesChannel && matchesEscalation;
    });
  }, [tickets, searchQuery, statusFilter, priorityFilter, serviceTypeFilter, channelFilter, escalationFilter]);

  // Modal State Triggers
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activeModalType, setActiveModalType] = useState(null); // 'waiting' | 'onhold' | 'resolved' | 'reopened' | 'escalate' | 'quotation' | null

  // FORM 1: WAITING FOR CUSTOMER OR PARTS FORM STATE
  const [waitingForm, setWaitingForm] = useState({
    waitingCategory: 'Tool / Spare Part',
    toolName: 'OEM Probe High Voltage Board Assembly',
    toolDescription: 'Transducer board assembly model P20-HV-2026',
    estimatedCost: 8500,
    isAmcCovered: false,
    expectedToolArrivalDateTime: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16),
    toolRemarks: 'Express courier dispatched from central biomedical warehouse.',
    customerAvailableDateTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    customerRemarks: 'Hospital cardiology OT available post 2:00 PM.',
    replacementEmployeeName: 'Suresh Reddy',
    expectedResumeDateTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16)
  });

  // FORM 2: ON HOLD FORM STATE
  const [onHoldForm, setOnHoldForm] = useState({
    reasonForHold: 'Hospital Site Power Voltage Mismatch',
    expectedResumeDateTime: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16),
    remarks: 'Waiting for hospital electrical team to stabilize 230V clean line.'
  });

  // FORM 3: RESOLVED FORM STATE WITH DIGITAL SIGNATURE / OTP SIGN-OFF
  const [resolvedForm, setResolvedForm] = useState({
    supportSerialNo: 'SUP-ENG-01',
    solutionDescription: 'Replaced main HV board assembly, tested probe in B/M/Color Doppler modes. All parameters calibrated within factory specifications.',
    workCompletionDateTime: getFormattedNow(),
    customerRemarks: 'Service engineer resolved problem quickly. System working perfectly.',
    customerOtp: '582910',
    isOtpVerified: true,
    signMode: 'otp',
    customerSignName: 'Dr. Rajesh Kumar'
  });

  // FORM 4: REOPENED (AFTER 7 DAYS MANUAL OPERATION) FORM STATE
  const [reopenedForm, setReopenedForm] = useState({
    supportSerialNo: 'SUP-ENG-01',
    reopenReason: 'Intermittent signal distortion recurred after 7 days of continuous usage. Manual reopen triggered.',
    assignedEmployee: 'Rajesh Sharma',
    workStartDateTime: getFormattedNow(),
    expectedCompletionDateTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16)
  });

  // Quotation State for non-covered parts > ₹5,000
  const [quotationDetails, setQuotationDetails] = useState(null);

  // Trigger Technical Escalation Navigation
  const openEscalationModal = (row) => {
    navigate(`/service/operations/${encodeURIComponent(row.ticketId)}/escalate`);
  };

  // Status Change Selector Handler - SELECTING ASSIGNED OPENS ASSIGN PAGE
  const handleTableStatusChange = (row, newStatus) => {
    const cur = row.status;
    setSelectedTicket(row);

    if (newStatus === 'Assigned') {
      navigate(`/service/operations/${encodeURIComponent(row.ticketId)}/assign`);
    } else if (newStatus.includes('Waiting')) {
      navigate(`/service/operations/${encodeURIComponent(row.ticketId)}/waiting`);
    } else if (newStatus === 'On Hold') {
      setActiveModalType('onhold');
    } else if (newStatus === 'Resolved') {
      setResolvedForm((prev) => ({
        ...prev,
        customerSignName: row.contactPerson || row.customerName
      }));
      setActiveModalType('resolved');
    } else if (newStatus.includes('Reopened')) {
      setActiveModalType('reopened');
    } else {
      const nowStr = getFormattedNow();
      let newPausedMinutes = row.totalPausedMinutes || 0;
      if ((cur.includes('Waiting') || cur === 'On Hold') && row.pausedAt) {
        const pausedMs = Date.now() - new Date(row.pausedAt).getTime();
        newPausedMinutes += Math.max(1, Math.floor(pausedMs / (1000 * 60)));
      }

      const updatedList = tickets.map((t) =>
        t.ticketId === row.ticketId
          ? {
              ...t,
              status: newStatus,
              lastUpdated: nowStr,
              pausedAt: (newStatus.includes('Waiting') || newStatus === 'On Hold') ? new Date().toISOString() : null,
              totalPausedMinutes: newPausedMinutes
            }
          : t
      );
      saveTicketsToStorage(updatedList);
      toast.success(`Ticket ${row.ticketId} status updated to ${newStatus}!`);
    }
  };

  // SAVE WAITING FOR CUSTOMER OR PARTS
  const handleSaveWaiting = (e) => {
    if (e) e.preventDefault();
    if (!selectedTicket) return;

    const isAmcCovered = selectedTicket.type === 'CAMC' || selectedTicket.type === 'SAMC' || waitingForm.isAmcCovered;
    const partCost = Number(waitingForm.estimatedCost) || 0;
    const nowStr = getFormattedNow();

    if (!isAmcCovered && partCost > 5000 && waitingForm.waitingCategory === 'Tool / Spare Part') {
      const gst = Math.round(partCost * 0.18);
      const totalAmount = partCost + gst;

      const quotData = {
        ticketId: selectedTicket.ticketId,
        customerName: selectedTicket.customerName,
        partName: waitingForm.toolName,
        partDescription: waitingForm.toolDescription,
        subtotal: partCost,
        gstAmount: gst,
        totalAmount: totalAmount,
        isAmcCovered: false,
        quotationStatus: 'Pending Customer Approval'
      };

      setQuotationDetails(quotData);
      setActiveModalType('quotation');

      const updatedList = tickets.map((t) =>
        t.ticketId === selectedTicket.ticketId
          ? {
              ...t,
              status: 'Pending Quotation Approval',
              lastUpdated: nowStr,
              pausedAt: new Date().toISOString(),
              partsList: [
                ...(t.partsList || []),
                {
                  id: Date.now(),
                  partName: waitingForm.toolName,
                  cost: partCost,
                  isAmcCovered: false,
                  quotationRequired: true,
                  quotationStatus: 'Pending Quotation Approval'
                }
              ]
            }
          : t
      );
      saveTicketsToStorage(updatedList);
      toast.warning(`Part cost ₹${partCost.toLocaleString('en-IN')} exceeds ₹5,000 for Non-AMC ticket! Quotation generated.`);
      return;
    }

    const targetStatus = 'Waiting for Customer/Parts';

    const updatedList = tickets.map((t) =>
      t.ticketId === selectedTicket.ticketId
        ? {
            ...t,
            status: targetStatus,
            lastUpdated: nowStr,
            pausedAt: new Date().toISOString(),
            waitingData: waitingForm,
            partsList: [
              ...(t.partsList || []),
              {
                id: Date.now(),
                partName: waitingForm.toolName,
                cost: isAmcCovered ? 0 : partCost,
                isAmcCovered: isAmcCovered,
                quotationRequired: false,
                quotationStatus: isAmcCovered ? 'Covered under AMC (₹0)' : `Approved (₹${partCost.toLocaleString('en-IN')})`
              }
            ]
          }
        : t
    );
    saveTicketsToStorage(updatedList);
    toast.info(`Ticket ${selectedTicket.ticketId} status updated to ${targetStatus} (SLA Clock Paused).`);
    setActiveModalType(null);
  };

  // APPROVE QUOTATION ACTION
  const handleApproveQuotation = () => {
    if (!selectedTicket) return;
    const nowStr = getFormattedNow();

    const updatedList = tickets.map((t) =>
      t.ticketId === selectedTicket.ticketId
        ? {
            ...t,
            status: 'Waiting for Customer/Parts',
            lastUpdated: nowStr,
            pausedAt: t.pausedAt || new Date().toISOString(),
            partsList: (t.partsList || []).map((p) => ({
              ...p,
              quotationStatus: 'Approved by Customer'
            }))
          }
        : t
    );
    saveTicketsToStorage(updatedList);
    toast.success(`Quotation for Ticket ${selectedTicket.ticketId} APPROVED! Parts order dispatched.`);
    setActiveModalType(null);
  };

  // SAVE ON HOLD
  const handleSaveOnHold = (e) => {
    if (e) e.preventDefault();
    if (!selectedTicket) return;
    const nowStr = getFormattedNow();

    const updatedList = tickets.map((t) =>
      t.ticketId === selectedTicket.ticketId
        ? {
            ...t,
            status: 'On Hold',
            lastUpdated: nowStr,
            pausedAt: new Date().toISOString(),
            onHoldData: onHoldForm
          }
        : t
    );
    saveTicketsToStorage(updatedList);
    toast.info(`Ticket ${selectedTicket.ticketId} placed ON HOLD (SLA Clock Paused).`);
    setActiveModalType(null);
  };

  // SAVE RESOLVED
  const handleSaveResolved = (e) => {
    if (e) e.preventDefault();
    if (!selectedTicket) return;

    if (!resolvedForm.solutionDescription.trim()) {
      toast.error('Resolution Notes / Solution Description is MANDATORY before completing ticket!');
      return;
    }

    if (resolvedForm.signMode === 'otp' && (!resolvedForm.customerOtp || resolvedForm.customerOtp.length < 6)) {
      toast.error('Please enter valid 6-digit Customer OTP for sign-off!');
      return;
    }

    const nowStr = getFormattedNow();
    let newPausedMinutes = selectedTicket.totalPausedMinutes || 0;
    if ((selectedTicket.status.includes('Waiting') || selectedTicket.status === 'On Hold') && selectedTicket.pausedAt) {
      const pausedMs = Date.now() - new Date(selectedTicket.pausedAt).getTime();
      newPausedMinutes += Math.max(1, Math.floor(pausedMs / (1000 * 60)));
    }

    const updatedList = tickets.map((t) =>
      t.ticketId === selectedTicket.ticketId
        ? {
            ...t,
            status: 'Resolved',
            lastUpdated: nowStr,
            enteredWorkEndDateTime: getFormattedNow(),
            pausedAt: null,
            totalPausedMinutes: newPausedMinutes,
            resolutionNotes: resolvedForm.solutionDescription,
            customerOtpVerified: true,
            feedback: '5 Stars - Excellent',
            feedbackRating: 5,
            resolvedData: resolvedForm
          }
        : t
    );
    saveTicketsToStorage(updatedList);
    toast.success(`Ticket ${selectedTicket.ticketId} RESOLVED! Customer sign-off recorded.`);
    setActiveModalType(null);
  };

  // SAVE REOPENED
  const handleSaveReopened = (e) => {
    if (e) e.preventDefault();
    if (!selectedTicket) return;
    const nowStr = getFormattedNow();

    const updatedList = tickets.map((t) =>
      t.ticketId === selectedTicket.ticketId
        ? {
            ...t,
            status: 'Reopened (after 7 days)',
            lastUpdated: nowStr,
            reopenedData: reopenedForm
          }
        : t
    );
    saveTicketsToStorage(updatedList);
    toast.warning(`Ticket ${selectedTicket.ticketId} REOPENED (Manual Operation after 7 days) for re-inspection by ${reopenedForm.assignedEmployee}!`);
    setActiveModalType(null);
  };

  // TABLE COLUMNS DEFINITION
  const columns = [
    // COLUMN 1: Ticket ID
    {
      key: 'ticketId',
      title: 'TICKET ID',
      sortable: true,
      render: (val) => <span className="font-monospace fw-bold text-primary">{val}</span>
    },
    // COLUMN 2: Customer/Company
    {
      key: 'customerName',
      title: 'CUSTOMER / COMPANY',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="fw-semibold text-dark d-block">{val}</span>
          <span className="small text-muted font-monospace">{row.territory}</span>
        </div>
      )
    },
    // COLUMN 3: Equipment/Product
    {
      key: 'productName',
      title: 'EQUIPMENT / PRODUCT',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="fw-medium text-dark d-block" style={{ fontSize: '12px' }}>{val}</span>
          <span className="badge bg-light text-secondary border font-monospace" style={{ fontSize: '11px' }}>
            SN: {row.serialNumber || 'SN-P20-2026-4412'}
          </span>
        </div>
      )
    },
    // COLUMN 4: Service Type (SAMC / CAMC / Subscription STRICTLY)
    {
      key: 'type',
      title: 'SERVICE TYPE',
      sortable: true,
      align: 'center',
      render: (val) => {
        const type = (val === 'Subscription' || val === 'CAMC' || val === 'SAMC') ? val : 'SAMC';
        const isCamc = type === 'CAMC';
        const isSamc = type === 'SAMC';
        const isSub = type === 'Subscription';
        const cls = isCamc
          ? 'badge bg-primary text-white'
          : isSamc
          ? 'badge bg-info text-dark'
          : 'badge text-white';
        return (
          <span
            className={`px-2 py-1 fw-bold ${cls}`}
            style={{ backgroundColor: isSub ? '#9333EA' : undefined }}
          >
            {type}
          </span>
        );
      }
    },
    // COLUMN 5: Channel
    {
      key: 'channel',
      title: 'CHANNEL',
      sortable: true,
      align: 'center',
      render: (val) => {
        const channel = val || 'Portal';
        const isPortal = channel === 'Portal';
        const isPhone = channel === 'Phone';
        const cls = isPortal
          ? 'badge bg-primary bg-opacity-10 text-primary border border-primary'
          : isPhone
          ? 'badge bg-success bg-opacity-10 text-success border border-success'
          : 'badge bg-info bg-opacity-10 text-info border border-info';
        return <span className={`px-2 py-1 ${cls}`}>{channel}</span>;
      }
    },
    // COLUMN 6: Priority
    {
      key: 'priority',
      title: 'PRIORITY',
      sortable: true,
      align: 'center',
      render: (val) => {
        const isCrit = val === 'Critical';
        const isHigh = val === 'High';
        const cls = isCrit
          ? 'badge bg-danger text-white'
          : isHigh
          ? 'badge bg-warning text-dark'
          : 'badge bg-light text-dark border';
        return <span className={`px-2 py-1 fw-bold ${cls}`}>{val || 'Medium'}</span>;
      }
    },
    // COLUMN 7: Status (STRICT STATUSES INCLUDING 'Waiting for Customer/Parts')
    {
      key: 'status',
      title: 'STATUS',
      sortable: true,
      align: 'center',
      render: (val, row) => {
        const statusColors = {
          New: '#3B82F6',
          Open: '#3B82F6',
          Assigned: '#6366F1',
          'In Progress': '#F59E0B',
          'Waiting for Customer/Parts': '#FB923C',
          'Pending Quotation Approval': '#9333EA',
          'On Hold': '#9CA3AF',
          Resolved: '#14B8A6',
          Closed: '#22C55E',
          Reopened: '#EF4444',
          'Reopened (after 7 days)': '#EF4444'
        };

        const displayVal = (val === 'Waiting for Parts' || val === 'Waiting for Customer') ? 'Waiting for Customer/Parts' : (val === 'New' ? 'Open' : val);
        const color = statusColors[val] || statusColors[displayVal] || '#3B82F6';
        const isDarkText = color === '#FDBA74' || color === '#F59E0B';

        return (
          <div className="d-flex align-items-center justify-content-center">
            <select
              className={`form-select form-select-sm fw-bold shadow-xs ${isDarkText ? 'text-dark' : 'text-white'}`}
              style={{
                backgroundColor: color,
                borderColor: color,
                borderRadius: '6px',
                fontSize: '11px',
                padding: '4px 8px',
                cursor: 'pointer',
                minWidth: '175px'
              }}
              value={displayVal}
              onChange={(e) => handleTableStatusChange(row, e.target.value)}
            >
              <option value="Open" style={{ backgroundColor: '#ffffff', color: '#000' }}>Open</option>
              <option value="Assigned" style={{ backgroundColor: '#ffffff', color: '#000' }}>Assigned</option>
              <option value="In Progress" style={{ backgroundColor: '#ffffff', color: '#000' }}>In Progress</option>
              <option value="Waiting for Customer/Parts" style={{ backgroundColor: '#ffffff', color: '#000' }}>Waiting for Customer/Parts</option>
              <option value="On Hold" style={{ backgroundColor: '#ffffff', color: '#000' }}>On Hold</option>
              <option value="Resolved" style={{ backgroundColor: '#ffffff', color: '#000' }}>Resolved</option>
              <option value="Closed" style={{ backgroundColor: '#ffffff', color: '#000' }}>Closed</option>
              <option value="Reopened (after 7 days)" style={{ backgroundColor: '#ffffff', color: '#000' }}>Reopened (after 7 days)</option>
            </select>
          </div>
        );
      }
    },
    // COLUMN 8: Assigned To (ONLY COORDINATOR NAME AS REQUESTED)
    {
      key: 'assignedCoordinator',
      title: 'ASSIGNED TO',
      sortable: true,
      render: (val, row) => (
        <div className="d-flex align-items-center justify-content-between">
          <span className="fw-semibold text-dark d-block" style={{ fontSize: '12px' }}>
            {val || row.assignedCoordinator || 'Karthik Raja'}
          </span>
        </div>
      )
    },
    // COLUMN 9: SLA Resolution Countdown
    {
      key: 'slaResolution',
      title: 'SLA RESOLUTION COUNTDOWN',
      sortable: true,
      align: 'center',
      render: (_, row) => {
        const countdowns = getSlaCountdownDetails(row);
        return (
          <span className={countdowns.resolution.cls}>
            {countdowns.resolution.label}
          </span>
        );
      }
    },
    // COLUMN 10: Created Date/Time
    {
      key: 'dateCreated',
      title: 'CREATED DATE/TIME',
      sortable: true,
      align: 'center',
      render: (val) => <span className="font-monospace small text-muted">{val}</span>
    },
    // COLUMN 11: Escalation Level
    {
      key: 'escalationLevel',
      title: 'ESCALATION LEVEL',
      sortable: true,
      align: 'center',
      render: (_, row) => {
        const isDev = row.requiresDeveloperSupport || row.escalationLevel === 'Developer';
        const isLead = row.requiresTeamLeadSupport || row.escalationLevel === 'Team Lead';

        if (isDev) {
          return <span className="badge bg-danger text-white fw-bold px-2 py-1">Developer</span>;
        }
        if (isLead) {
          return <span className="badge bg-warning text-dark fw-bold px-2 py-1">Team Lead</span>;
        }
        return <span className="badge bg-light text-muted border px-2 py-1">Support</span>;
      }
    },
    // COLUMN 12: Last Updated
    {
      key: 'lastUpdated',
      title: 'LAST UPDATED',
      sortable: true,
      align: 'center',
      render: (val, row) => (
        <span className="font-monospace small text-dark fw-semibold">
          {val || row.dateCreated || getFormattedNow()}
        </span>
      )
    }
  ];

  // Table Actions Renderer
  const tableActions = (row) => (
    <div className="category-actions-container d-flex align-items-center gap-1">
      <button
        type="button"
        className="category-action-btn delete-btn"
        title="3-Tier Technical Escalation (Team Lead & Developer Support)"
        onClick={() => openEscalationModal(row)}
      >
        <ShieldCheck size={15} color="#DC2626" />
      </button>

     
    </div>
  );

  return (
    <div className="category-master-page amc-management-page container-fluid px-0 px-md-2 py-2">
      <Helmet>
        <title>Ticket Service Operations | Sonocare CRM</title>
        <meta name="description" content="Ticket Service Operations Register in Sonocare CRM." />
      </Helmet>
      <ToastContainer />

      {/* HEADER SECTION */}
      <div className="category-page-header mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="category-page-title-group">
          <Wrench size={28} className="text-primary" />
          <div>
            <h1 className="category-page-title mb-0">Ticket Service Operations Register</h1>
            <span className="small text-muted">Selecting 'Assigned' Opens Dedicated Assign Ticket Workspace Page</span>
          </div>
        </div>

       
      </div>

      {/* MAIN CARD CONTAINER */}
      <div className="category-card shadow-sm border mb-4" style={{ borderRadius: '10px' }}>
        <div className="category-card-header pb-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
          <h2 className="category-card-title mb-0">SERVICE TICKETS ({filteredTickets.length})</h2>

          <div className="category-search-wrapper">
            <Search size={16} className="category-search-icon" />
            <input
              type="text"
              className="category-search-input"
              placeholder="Search Ticket ID, Customer, Product, Serial..."
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

            <div className="col-12 col-sm-4 col-md-2">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Waiting for Customer/Parts">Waiting for Customer/Parts</option>
                <option value="On Hold">On Hold</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
                <option value="Reopened (after 7 days)">Reopened (after 7 days)</option>
              </select>
            </div>

            <div className="col-12 col-sm-4 col-md-2">
              <select
                className="form-select form-select-sm"
                value={serviceTypeFilter}
                onChange={(e) => setServiceTypeFilter(e.target.value)}
              >
                <option value="">All Service Types</option>
                <option value="SAMC">SAMC</option>
                <option value="CAMC">CAMC</option>
                <option value="Subscription">Subscription</option>
              </select>
            </div>

            <div className="col-12 col-sm-4 col-md-2">
              <select
                className="form-select form-select-sm"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="col-12 col-sm-4 col-md-2">
              <select
                className="form-select form-select-sm"
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
              >
                <option value="">All Channels</option>
                <option value="Portal">Portal</option>
                <option value="Phone">Phone</option>
                <option value="Email">Email</option>
              </select>
            </div>

            <div className="col-12 col-sm-4 col-md-2">
              <select
                className="form-select form-select-sm"
                value={escalationFilter}
                onChange={(e) => setEscalationFilter(e.target.value)}
              >
                <option value="">All Escalations</option>
                <option value="Support">Support</option>
                <option value="Team Lead">Team Lead</option>
                <option value="Developer">Developer</option>
              </select>
            </div>

            {(statusFilter || priorityFilter || serviceTypeFilter || channelFilter || escalationFilter || searchQuery) && (
              <div className="col-12 col-md-auto ms-auto">
                <button
                  type="button"
                  className="btn btn-sm btn-link text-decoration-none text-danger p-0 fw-semibold"
                  onClick={() => {
                    setStatusFilter('');
                    setPriorityFilter('');
                    setServiceTypeFilter('');
                    setChannelFilter('');
                    setEscalationFilter('');
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
            data={filteredTickets}
            showSerialNumber={true}
            serialNumberHeader="S.NO"
            actions={tableActions}
            actionHeader="ACTIONS"
            actionWidth="100px"
            emptyMessage="No Service Operations tickets found."
            paginated={true}
            pageSizeOptions={[10, 25, 50]}
            defaultPageSize={10}
            tableClassName="category-custom-table"
            bordered={false}
            striped={false}
            hover={true}
            minWidth="1750px"
          />
        </div>
      </div>

      {/* POPUP 1: WAITING FOR CUSTOMER OR PARTS MODAL */}
      <Modal
        isOpen={activeModalType === 'waiting'}
        onClose={() => setActiveModalType(null)}
        title={`Waiting Specification & Parts Commercials — ${selectedTicket?.ticketId}`}
        size="lg"
      >
        <form onSubmit={handleSaveWaiting} className="p-2">
          <div className="row g-3">
            <div className="col-12">
              <Dropdown
                label="Waiting Sub-Category *"
                options={['Tool / Spare Part', 'Customer Availability', 'Support Employee']}
                value={waitingForm.waitingCategory}
                onChange={(e) => setWaitingForm({ ...waitingForm, waitingCategory: e.target.value })}
              />
            </div>

            {waitingForm.waitingCategory === 'Tool / Spare Part' && (
              <>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Tool / Spare Part Name *"
                    value={waitingForm.toolName}
                    onChange={(e) => setWaitingForm({ ...waitingForm, toolName: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Estimated Cost (₹ INR) *"
                    type="number"
                    value={waitingForm.estimatedCost}
                    onChange={(e) => setWaitingForm({ ...waitingForm, estimatedCost: e.target.value })}
                  />
                </div>

                <div className="col-12 bg-light p-2 rounded border">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="amcCoverageCheck"
                      checked={waitingForm.isAmcCovered}
                      onChange={(e) => setWaitingForm({ ...waitingForm, isAmcCovered: e.target.checked })}
                    />
                    <label className="form-check-label fw-bold text-primary ms-1" htmlFor="amcCoverageCheck">
                      Covered under Active AMC (CAMC/SAMC) — Free Replacement (₹0)
                    </label>
                  </div>
                  {!waitingForm.isAmcCovered && Number(waitingForm.estimatedCost) > 5000 && (
                    <div className="small text-danger fw-bold mt-1 d-flex align-items-center gap-1">
                      <AlertTriangle size={14} />
                      <span>Part cost ₹{Number(waitingForm.estimatedCost).toLocaleString('en-IN')} exceeds ₹5,000 threshold. Will generate formal quotation for customer approval!</span>
                    </div>
                  )}
                </div>

                <div className="col-12 col-md-6">
                  <InputField
                    label="Expected Arrival Date & Time *"
                    type="datetime-local"
                    value={waitingForm.expectedToolArrivalDateTime}
                    onChange={(e) => setWaitingForm({ ...waitingForm, expectedToolArrivalDateTime: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Tool / Component Description *"
                    value={waitingForm.toolDescription}
                    onChange={(e) => setWaitingForm({ ...waitingForm, toolDescription: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold text-dark mb-1">Dispatch Remarks</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={waitingForm.toolRemarks}
                    onChange={(e) => setWaitingForm({ ...waitingForm, toolRemarks: e.target.value })}
                  />
                </div>
              </>
            )}

            {waitingForm.waitingCategory === 'Customer Availability' && (
              <>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Customer Availability Date & Time *"
                    type="datetime-local"
                    value={waitingForm.customerAvailableDateTime}
                    onChange={(e) => setWaitingForm({ ...waitingForm, customerAvailableDateTime: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Hospital OT / Site Access Remarks"
                    value={waitingForm.customerRemarks}
                    onChange={(e) => setWaitingForm({ ...waitingForm, customerRemarks: e.target.value })}
                  />
                </div>
              </>
            )}

            {waitingForm.waitingCategory === 'Support Employee' && (
              <>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Replacement Employee Name *"
                    value={waitingForm.replacementEmployeeName}
                    onChange={(e) => setWaitingForm({ ...waitingForm, replacementEmployeeName: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Expected Date & Time to Resume *"
                    type="datetime-local"
                    value={waitingForm.expectedResumeDateTime}
                    onChange={(e) => setWaitingForm({ ...waitingForm, expectedResumeDateTime: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>

          <div className="d-flex gap-2 justify-content-end border-top pt-3 mt-3">
            <button
              type="button"
              className="btn btn-outline-secondary px-4 fw-semibold"
              onClick={() => setActiveModalType(null)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-warning px-5 fw-bold text-dark shadow-sm"
            >
              Save & Pause SLA Clock
            </button>
          </div>
        </form>
      </Modal>

      {/* POPUP 1B: FORMAL QUOTATION PREVIEW MODAL (>₹5,000 NON-AMC PARTS) */}
      <Modal
        isOpen={activeModalType === 'quotation'}
        onClose={() => setActiveModalType(null)}
        title={`Commercial Parts Quotation — ${quotationDetails?.ticketId}`}
        size="lg"
      >
        <div className="p-3">
          <div className="alert alert-warning p-3 mb-3 d-flex align-items-center gap-2">
            <AlertTriangle size={22} className="text-warning flex-shrink-0" />
            <div>
              <strong className="d-block">Quotation Threshold Exceeded (&gt;₹5,000 Rule)</strong>
              <span className="small">This part is not covered under AMC and cost exceeds ₹5,000. Approval is required before dispatching parts.</span>
            </div>
          </div>

          <div className="border rounded p-3 bg-white mb-3">
            <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
              <div>
                <h6 className="fw-bold text-dark mb-0">SONOCARE MEDICAL SYSTEMS</h6>
                <span className="small text-muted font-monospace">Official Spare Parts Quotation</span>
              </div>
              <span className="badge bg-purple text-white px-3 py-2 fw-bold" style={{ backgroundColor: '#9333EA' }}>
                PENDING APPROVAL
              </span>
            </div>

            <div className="row g-2 mb-3 small font-monospace">
              <div className="col-6">
                <span className="text-muted d-block">Customer:</span>
                <span className="fw-bold text-dark">{quotationDetails?.customerName}</span>
              </div>
              <div className="col-6 text-end">
                <span className="text-muted d-block">Date:</span>
                <span className="fw-bold text-dark">{new Date().toLocaleDateString('en-IN')}</span>
              </div>
            </div>

            <table className="table table-bordered table-sm small mb-3">
              <thead className="bg-light">
                <tr>
                  <th>Item Description</th>
                  <th className="text-center">AMC Coverage</th>
                  <th className="text-end">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>{quotationDetails?.partName}</strong>
                    <div className="small text-muted">{quotationDetails?.partDescription}</div>
                  </td>
                  <td className="text-center">
                    <span className="badge bg-danger text-white">Non-Covered</span>
                  </td>
                  <td className="text-end font-monospace fw-bold">
                    ₹{quotationDetails?.subtotal?.toLocaleString('en-IN')}
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} className="text-end fw-semibold">GST (18%):</td>
                  <td className="text-end font-monospace">₹{quotationDetails?.gstAmount?.toLocaleString('en-IN')}</td>
                </tr>
                <tr className="table-active fw-bold fs-6">
                  <td colSpan={2} className="text-end">Total Payable Amount:</td>
                  <td className="text-end text-primary font-monospace">
                    ₹{quotationDetails?.totalAmount?.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="d-flex gap-2 justify-content-end border-top pt-3">
            <button
              type="button"
              className="btn btn-outline-secondary px-4 fw-semibold"
              onClick={() => setActiveModalType(null)}
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-success px-5 fw-bold shadow-sm d-inline-flex align-items-center gap-2"
              onClick={handleApproveQuotation}
            >
              <Check size={18} />
              <span>Approve Quotation & Dispatch Part</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* POPUP 2: SIMPLIFIED ON HOLD MODAL */}
      <Modal
        isOpen={activeModalType === 'onhold'}
        onClose={() => setActiveModalType(null)}
        title={`Place Ticket On Hold — ${selectedTicket?.ticketId}`}
        size="md"
      >
        <form onSubmit={handleSaveOnHold} className="p-2">
          <div className="row g-3">
            <div className="col-12">
              <InputField
                label="Reason for Hold *"
                value={onHoldForm.reasonForHold}
                onChange={(e) => setOnHoldForm({ ...onHoldForm, reasonForHold: e.target.value })}
              />
            </div>
            <div className="col-12">
              <InputField
                label="Expected Resume Date & Time *"
                type="datetime-local"
                value={onHoldForm.expectedResumeDateTime}
                onChange={(e) => setOnHoldForm({ ...onHoldForm, expectedResumeDateTime: e.target.value })}
              />
            </div>
            <div className="col-12">
              <label className="form-label small fw-semibold text-dark mb-1">Remarks & Site Instructions</label>
              <textarea
                className="form-control"
                rows={2}
                value={onHoldForm.remarks}
                onChange={(e) => setOnHoldForm({ ...onHoldForm, remarks: e.target.value })}
              />
            </div>
          </div>

          <div className="d-flex gap-2 justify-content-end border-top pt-3 mt-3">
            <button
              type="button"
              className="btn btn-outline-secondary px-4 fw-semibold"
              onClick={() => setActiveModalType(null)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-warning px-5 fw-bold shadow-sm text-dark"
            >
              Confirm On Hold 
            </button>
          </div>
        </form>
      </Modal>

      {/* POPUP 3: RESOLVED & CUSTOMER SIGN-OFF MODAL */}
      <Modal
        isOpen={activeModalType === 'resolved'}
        onClose={() => setActiveModalType(null)}
        title={`Resolve Service Ticket & Sign-off — ${selectedTicket?.ticketId}`}
        size="lg"
      >
        <form onSubmit={handleSaveResolved} className="p-2">
          <div className="row g-3 mb-3">
            {/* ROW 1: TICKET ID & CUSTOMER NAME INPUT FIELDS */}
            <div className="col-12 col-md-6">
              <InputField
                label="Ticket ID Reference"
                value={selectedTicket?.ticketId || 'TCK-2026-002'}
                disabled={true}
              />
            </div>
            <div className="col-12 col-md-6">
              <InputField
                label="Customer / Hospital Name"
                value={selectedTicket?.customerName || 'Fortis Multi-Specialty Hospital'}
                disabled={true}
              />
            </div>

            {/* ROW 2: CONTRACT TYPE & EQUIPMENT INPUT FIELDS */}
            <div className="col-12 col-md-6">
              <InputField
                label="Service Contract Type"
                value={selectedTicket?.type || 'Breakdown Repair'}
                disabled={true}
              />
            </div>
            <div className="col-12 col-md-6">
              <InputField
                label="Equipment Details & Serial Number"
                value={`${selectedTicket?.productName || 'Sonoscape X5 Portable Ultrasound System'} (SN: ${selectedTicket?.serialNumber || 'SN-X5-2026-881'})`}
                disabled={true}
              />
            </div>

            {/* ROW 3: WORK COMPLETION DATETIME & CUSTOMER OTP */}
            <div className="col-12 col-md-6">
              <InputField
                label="Work Completion Date & Time *"
                type="datetime-local"
                value={resolvedForm.workCompletionDateTime}
                onChange={(e) => setResolvedForm({ ...resolvedForm, workCompletionDateTime: e.target.value })}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold text-dark mb-1">Customer Mobile OTP Verification *</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control font-monospace fw-bold"
                  placeholder="Enter 6-digit OTP"
                  value={resolvedForm.customerOtp}
                  onChange={(e) => setResolvedForm({ ...resolvedForm, customerOtp: e.target.value })}
                />
                <button
                  type="button"
                  className="btn btn-outline-primary d-inline-flex align-items-center gap-1"
                  onClick={() => toast.info(`OTP 582910 sent to customer mobile (${selectedTicket?.mobile || '9845012345'})!`)}
                >
                  <Send size={14} />
                  <span>Send OTP</span>
                </button>
              </div>
              <span className="small text-muted font-monospace"> Test OTP: <strong>582910</strong></span>
            </div>

            {/* ROW 4: SOLUTION DESCRIPTION */}
            <div className="col-12">
              <label className="form-label small fw-semibold text-dark mb-1">
                Solution Description & Technical Resolution Summary *
              </label>
              <textarea
                className="form-control font-monospace"
                rows={3}
                placeholder="Enter mandatory technical work done details..."
                value={resolvedForm.solutionDescription}
                onChange={(e) => setResolvedForm({ ...resolvedForm, solutionDescription: e.target.value })}
              />
            </div>
          </div>

          <div className="d-flex gap-2 justify-content-end border-top pt-3 mt-3">
            <button
              type="button"
              className="btn btn-outline-secondary px-4 fw-semibold"
              onClick={() => setActiveModalType(null)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-success px-5 fw-bold shadow-sm d-inline-flex align-items-center gap-2"
            >
              <CheckCircle2 size={18} />
              <span>Confirm </span>
            </button>
          </div>
        </form>
      </Modal>

      {/* POPUP 4: REOPENED MODAL */}
      <Modal
        isOpen={activeModalType === 'reopened'}
        onClose={() => setActiveModalType(null)}
        title={` Reopened Ticket (After 7 Days) — ${selectedTicket?.ticketId}`}
        size="lg"
      >
        <form onSubmit={handleSaveReopened} className="p-2">
          <div className="row g-3 mb-3">
            {/* ROW 1: TICKET ID & COORDINATOR NAME */}
            <div className="col-12 col-md-6">
              <InputField
                label="Ticket ID Reference"
                value={selectedTicket?.ticketId || 'TCK-2026-002'}
                disabled={true}
              />
            </div>
            <div className="col-12 col-md-6">
              <InputField
                label="Coordinator Name"
                value={selectedTicket?.coordinatorName || 'Priya Sharma (Territory Coordinator)'}
                disabled={true}
              />
            </div>

            {/* ROW 2: PRODUCT DETAILS & SERVICE DETAILS */}
            <div className="col-12 col-md-6">
              <InputField
                label="Product Details & Serial Number"
                value={`${selectedTicket?.productName || 'Sonoscape X5 Portable Ultrasound System'} (SN: ${selectedTicket?.serialNumber || 'SN-X5-2026-881'})`}
                disabled={true}
              />
            </div>
            <div className="col-12 col-md-6">
              <InputField
                label="Service Details / Contract Type"
                value={selectedTicket?.type || 'Breakdown Repair'}
                disabled={true}
              />
            </div>

            {/* ROW 3: ASSIGNED EMPLOYEE & REOPEN WORK START DATETIME */}
            <div className="col-12 col-md-6">
              <Dropdown
                label="Assigned Employee / Engineer *"
                options={['Rajesh Sharma', 'Amit Patel', 'Vikram Singh', 'Suresh Reddy']}
                value={reopenedForm.assignedEmployee}
                onChange={(e) => setReopenedForm({ ...reopenedForm, assignedEmployee: e.target.value })}
              />
            </div>
            <div className="col-12 col-md-6">
              <InputField
                label="Reopen Work Start Date & Time *"
                type="datetime-local"
                value={reopenedForm.workStartDateTime}
                onChange={(e) => setReopenedForm({ ...reopenedForm, workStartDateTime: e.target.value })}
              />
            </div>

            {/* ROW 4: REASON FOR REOPENING */}
            <div className="col-12">
              <label className="form-label small fw-semibold text-dark mb-1">
                Reason for Reopening (After 7 Days) *
              </label>
              <textarea
                className="form-control font-monospace"
                rows={2}
                placeholder="State why customer requested manual reopen after 7 days..."
                value={reopenedForm.reopenReason}
                onChange={(e) => setReopenedForm({ ...reopenedForm, reopenReason: e.target.value })}
              />
            </div>

            {/* ROW 5: EXPECTED RESOLUTION DATETIME */}
            <div className="col-12 col-md-6">
              <InputField
                label="Expected Resolution Completion Date & Time *"
                type="datetime-local"
                value={reopenedForm.expectedCompletionDateTime}
                onChange={(e) => setReopenedForm({ ...reopenedForm, expectedCompletionDateTime: e.target.value })}
              />
            </div>
          </div>

          <div className="d-flex gap-2 justify-content-end border-top pt-3 mt-3">
            <button
              type="button"
              className="btn btn-outline-secondary px-4 fw-semibold"
              onClick={() => setActiveModalType(null)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-danger px-5 fw-bold shadow-sm d-inline-flex align-items-center gap-2"
            >
              <RotateCcw size={18} />
              <span>Confirm  Reopening </span>
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default TicketServiceOperations;
