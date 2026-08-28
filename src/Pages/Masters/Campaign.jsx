import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { Helmet } from 'react-helmet-async';
import { InputField, Dropdown } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import { Megaphone, Plus, Eye, Pencil, Trash2, BarChart2, Search, Filter, Users } from 'lucide-react';
import '../../styles/Category.css';
import '../../styles/Product.css';
import '../../styles/Category.css';
import '../../styles/Product.css';
import {
  mockStateData,
  mockDepartmentData,
  initialMockEmployees
} from './mockEmployees';
import {
  mockDistrictMasterData,
  mockCityMasterData
} from './mockCustomers';

// Mock Campaign Types for Dropdowns
const mockCampaignTypes = [
  'Medical Conference',
  'WhatsApp Outreach',
  'Email Newsletter',
  'Telemarketing',
  'Exhibition / Event',
  'Social Media'
];

// Initial Mock Dataset for Campaign Master
const initialCampaigns = [
  {
    id: 1,
    campaignId: 'CMP-001',
    campaignType: 'Medical Conference',
    campaignName: 'National Radiology Expo 2026',
    territory: 'Tamil Nadu',
    district: 'Chennai',
    city: 'Chennai',
    department: 'Sales',
    owner: 'John Smith (EMP001)',
    startDate: '2026-03-01',
    endDate: '2026-03-05',
    status: 'Active',
    description: 'B2B promotion of Sonocare HD Ultrasound diagnostic systems at Chennai Trade Centre.',
    associatedEvent: 'Indian Radiology Association Conference (IRIA 2026)',
    totalContacts: '250',
    successfulContacts: '180',
    failedContacts: '20',
    inquiriesCreated: '45'
  },
  {
    id: 2,
    campaignId: 'CMP-002',
    campaignType: 'WhatsApp Outreach',
    campaignName: 'Q1 Diagnostic Scanner Promo',
    territory: 'Tamil Nadu',
    district: 'Coimbatore',
    city: 'Coimbatore',
    department: 'Production',
    owner: 'Priya Sharma (EMP002)',
    startDate: '2026-02-10',
    endDate: '2026-02-28',
    status: 'Active',
    description: 'Direct WhatsApp broadcasting to diagnostic center directors across Tamil Nadu.',
    associatedEvent: 'N/A',
    totalContacts: '500',
    successfulContacts: '420',
    failedContacts: '30',
    inquiriesCreated: '85'
  },
  {
    id: 3,
    campaignId: 'CMP-003',
    campaignType: 'Email Newsletter',
    campaignName: 'Cardiology Scanner Launch',
    territory: 'Kerala',
    district: 'Ernakulam',
    city: 'Kochi',
    department: 'Support',
    owner: 'Rajesh Kumar (EMP003)',
    startDate: '2026-01-15',
    endDate: '2026-01-31',
    status: 'Inactive',
    description: 'Email campaign introducing Sonocare Echo 4D Color Doppler to cardiologists.',
    associatedEvent: 'Cardicon South India 2026',
    totalContacts: '350',
    successfulContacts: '290',
    failedContacts: '40',
    inquiriesCreated: '62'
  },
  {
    id: 4,
    campaignId: 'CMP-004',
    campaignType: 'Telemarketing',
    campaignName: 'Hospital AMC Renewal Drive',
    territory: 'Tamil Nadu',
    district: 'Madurai',
    city: 'Madurai',
    department: 'Sales',
    owner: 'Karthik Raja (EMP005)',
    startDate: '2026-02-01',
    endDate: '2026-03-15',
    status: 'Active',
    description: 'Phone calls to existing healthcare clients for Annual Maintenance Contract renewals.',
    associatedEvent: 'N/A',
    totalContacts: '150',
    successfulContacts: '110',
    failedContacts: '15',
    inquiriesCreated: '35'
  },
  {
    id: 5,
    campaignId: 'CMP-005',
    campaignType: 'Exhibition / Event',
    campaignName: 'Medica South Asia Summit',
    territory: 'Tamil Nadu',
    district: 'Chennai',
    city: 'Chennai',
    department: 'Sales',
    owner: 'John Smith (EMP001)',
    startDate: '2026-04-10',
    endDate: '2026-04-12',
    status: 'Active',
    description: 'Live product demonstration of Portable Diagnostic Scanners.',
    associatedEvent: 'Medica Asia Expo Bengaluru',
    totalContacts: '400',
    successfulContacts: '310',
    failedContacts: '50',
    inquiriesCreated: '90'
  }
];

const Campaign = () => {
  const navigate = useNavigate();

  // --- LOCAL MOCK STATE ---
  const [campaigns, setCampaigns] = useState(initialCampaigns);

  // --- FILTER STATES ---
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // --- MODAL STATES ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);

  // --- SELECTED CAMPAIGN & FORM STATES ---
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    campaignId: '',
    campaignType: 'Medical Conference',
    campaignName: '',
    territory: '',
    district: '',
    city: '',
    department: '',
    owner: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Active',
    associatedEvent: '',
    description: ''
  });

  // Cascading Location & Filtered Owner Logic
  const availableDistricts = useMemo(() => {
    if (!formData.territory) return [];
    return mockDistrictMasterData[formData.territory] || [];
  }, [formData.territory]);

  const availableCities = useMemo(() => {
    if (!formData.district) return [];
    return mockCityMasterData[formData.district] || [];
  }, [formData.district]);

  // Strict 3-Condition Owner Filtering: Employee.state === selectedTerritory AND Employee.department === selectedDepartment AND Employee.status === 'Active'
  const availableEmployees = useMemo(() => {
    if (!formData.territory || !formData.department) return [];
    return initialMockEmployees.filter(
      (emp) =>
        (emp.state === formData.territory || emp.territory === formData.territory) &&
        emp.department === formData.department &&
        emp.status === 'Active'
    );
  }, [formData.territory, formData.department]);

  const ownerOptions = useMemo(() => {
    return availableEmployees.map((emp) => `${emp.employeeName} (${emp.employeeId})`);
  }, [availableEmployees]);

  // Form State for Performance Tracker
  const [performanceData, setPerformanceData] = useState({
    totalContacts: '',
    successfulContacts: '',
    failedContacts: '',
    inquiriesCreated: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // Auto-generate next Campaign ID (CMP-006...)
  const nextCampaignId = useMemo(() => {
    if (!campaigns || campaigns.length === 0) return 'CMP-001';
    const nums = campaigns
      .map((c) => parseInt((c.campaignId || '').replace('CMP-', ''), 10))
      .filter(Boolean);
    const maxNum = nums.length > 0 ? Math.max(...nums) : 0;
    return `CMP-${String(maxNum + 1).padStart(3, '0')}`;
  }, [campaigns]);

  // --- FILTERED DATA ---
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((camp) => {
      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchId = camp.campaignId && camp.campaignId.toLowerCase().includes(q);
        const matchName = camp.campaignName && camp.campaignName.toLowerCase().includes(q);
        const matchOwner = camp.owner && camp.owner.toLowerCase().includes(q);
        const matchDesc = camp.description && camp.description.toLowerCase().includes(q);
        const matchEvent = camp.associatedEvent && camp.associatedEvent.toLowerCase().includes(q);

        if (!matchId && !matchName && !matchOwner && !matchDesc && !matchEvent) {
          return false;
        }
      }

      // Type Filter
      if (typeFilter && camp.campaignType !== typeFilter) {
        return false;
      }

      // Status Filter
      if (statusFilter && camp.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [campaigns, searchQuery, typeFilter, statusFilter]);

  // --- FORM CHANGE HANDLERS ---
  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'territory') {
        updated.district = '';
        updated.city = '';
        updated.owner = '';
      } else if (field === 'district') {
        updated.city = '';
      } else if (field === 'department') {
        updated.owner = '';
      }
      return updated;
    });

    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handlePerformanceChange = (field, value) => {
    setPerformanceData((prev) => ({ ...prev, [field]: value }));
  };

  // --- ADD CAMPAIGN HANDLERS ---
  const handleOpenAddModal = () => {
    setFormData({
      campaignId: nextCampaignId,
      campaignType: 'Medical Conference',
      campaignName: '',
      territory: '',
      district: '',
      city: '',
      department: '',
      owner: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Active',
      associatedEvent: '',
      description: ''
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleSaveAddCampaign = () => {
    if (!formData.campaignName.trim()) {
      setFormErrors({ campaignName: 'Campaign Name is required' });
      return;
    }

    const newCampaign = {
      id: Date.now(),
      campaignId: formData.campaignId || nextCampaignId,
      campaignType: formData.campaignType || 'Medical Conference',
      campaignName: formData.campaignName.trim(),
      territory: formData.territory || '',
      district: formData.district || '',
      city: formData.city || '',
      department: formData.department || '',
      owner: formData.owner || '—',
      startDate: formData.startDate || new Date().toISOString().split('T')[0],
      endDate: formData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: formData.status || 'Active',
      associatedEvent: formData.associatedEvent ? formData.associatedEvent.trim() : 'N/A',
      description: formData.description ? formData.description.trim() : '',
      totalContacts: '0',
      successfulContacts: '0',
      failedContacts: '0',
      inquiriesCreated: '0'
    };

    setCampaigns((prev) => [newCampaign, ...prev]);
    setIsAddModalOpen(false);
    toast.success('Campaign added successfully');
  };

  // --- EDIT CAMPAIGN HANDLERS ---
  const handleOpenEditModal = (camp) => {
    setSelectedCampaign(camp);
    setFormData({
      campaignId: camp.campaignId,
      campaignType: camp.campaignType || 'Medical Conference',
      campaignName: camp.campaignName || '',
      territory: camp.territory || '',
      district: camp.district || '',
      city: camp.city || '',
      department: camp.department || '',
      owner: camp.owner || '',
      startDate: camp.startDate || '',
      endDate: camp.endDate || '',
      status: camp.status || 'Active',
      associatedEvent: camp.associatedEvent || '',
      description: camp.description || ''
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleSaveEditCampaign = () => {
    if (!formData.campaignName.trim()) {
      setFormErrors({ campaignName: 'Campaign Name is required' });
      return;
    }

    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === selectedCampaign.id || c.campaignId === formData.campaignId
          ? {
              ...c,
              campaignType: formData.campaignType,
              campaignName: formData.campaignName.trim(),
              territory: formData.territory,
              district: formData.district,
              city: formData.city,
              department: formData.department,
              owner: formData.owner,
              startDate: formData.startDate,
              endDate: formData.endDate,
              status: formData.status,
              associatedEvent: formData.associatedEvent ? formData.associatedEvent.trim() : 'N/A',
              description: formData.description ? formData.description.trim() : ''
            }
          : c
      )
    );

    setIsEditModalOpen(false);
    setSelectedCampaign(null);
    toast.success('Campaign updated successfully');
  };

  // --- VIEW CAMPAIGN HANDLER ---
  const handleOpenViewModal = (camp) => {
    setSelectedCampaign(camp);
    setFormData({
      campaignId: camp.campaignId,
      campaignType: camp.campaignType || '—',
      campaignName: camp.campaignName || '—',
      territory: camp.territory || '—',
      district: camp.district || '—',
      city: camp.city || '—',
      department: camp.department || '—',
      owner: camp.owner || '—',
      startDate: camp.startDate || '—',
      endDate: camp.endDate || '—',
      status: camp.status || 'Active',
      associatedEvent: camp.associatedEvent || 'N/A',
      description: camp.description || '—'
    });
    setIsViewModalOpen(true);
  };

  // --- DELETE CAMPAIGN HANDLERS ---
  const handleOpenDeleteModal = (camp) => {
    setSelectedCampaign(camp);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedCampaign) return;
    setCampaigns((prev) => prev.filter((c) => c.id !== selectedCampaign.id));
    setIsDeleteModalOpen(false);
    setSelectedCampaign(null);
    toast.success('Campaign deleted successfully');
  };

  // --- PERFORMANCE TRACKER HANDLERS ---
  const handleOpenPerformanceModal = (camp) => {
    setSelectedCampaign(camp);
    setPerformanceData({
      totalContacts: camp.totalContacts || '0',
      successfulContacts: camp.successfulContacts || '0',
      failedContacts: camp.failedContacts || '0',
      inquiriesCreated: camp.inquiriesCreated || '0'
    });
    setIsPerformanceModalOpen(true);
  };

  const handleSavePerformance = () => {
    if (!selectedCampaign) return;
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === selectedCampaign.id
          ? {
              ...c,
              totalContacts: performanceData.totalContacts || '0',
              successfulContacts: performanceData.successfulContacts || '0',
              failedContacts: performanceData.failedContacts || '0',
              inquiriesCreated: performanceData.inquiriesCreated || '0'
            }
          : c
      )
    );

    setIsPerformanceModalOpen(false);
    setSelectedCampaign(null);
    toast.success('Campaign performance updated successfully');
  };

  // --- IN-TABLE STATUS CHANGE HANDLER ---
  const handleStatusChange = (campaignId, newStatus) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.campaignId === campaignId ? { ...c, status: newStatus } : c))
    );
    toast.success('Campaign updated successfully');
  };

  // --- TABLE COLUMNS CONFIGURATION (11 COLUMNS) ---
  const columns = [
    {
      key: 'campaignId',
      title: 'CAMPAIGN ID',
      sortable: true,
      render: (val) => <span className="badge bg-secondary font-monospace">{val}</span>
    },
    {
      key: 'campaignType',
      title: 'CAMPAIGN TYPE',
      sortable: true,
      render: (val) => <span className="badge bg-info text-dark font-monospace">{val}</span>
    },
    {
      key: 'campaignName',
      title: 'CAMPAIGN NAME',
      sortable: true,
      render: (val) => <span className="fw-bold text-dark">{val}</span>
    },
    {
      key: 'startDate',
      title: 'START DATE',
      sortable: true,
      render: (val) => <span className="small text-dark">{val}</span>
    },
    {
      key: 'endDate',
      title: 'END DATE',
      sortable: true,
      render: (val) => <span className="small text-dark">{val}</span>
    },
    {
      key: 'owner',
      title: 'OWNER',
      sortable: true,
      render: (val) => <span className="text-dark">{val}</span>
    },
    {
      key: 'status',
      title: 'STATUS',
      sortable: true,
      align: 'center',
      render: (val, row) => (
        <select
          className={`table-status-select ${row.status === 'Active' ? 'active' : 'inactive'}`}
          value={row.status || 'Active'}
          onChange={(e) => handleStatusChange(row.campaignId, e.target.value)}
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      )
    },
    {
      key: 'description',
      title: 'DESCRIPTION',
      sortable: false,
      render: (val) => (
        <span className="small text-muted text-truncate d-inline-block" style={{ maxWidth: '180px' }} title={val}>
          {val || '—'}
        </span>
      )
    },
    {
      key: 'associatedEvent',
      title: 'ASSOCIATED CONFERENCE/EVENT',
      sortable: true,
      render: (val) => <span className="small text-dark">{val || 'N/A'}</span>
    }
  ];

  // Table Action Buttons (View, Edit, Delete, Performance Tracker)
  const tableActions = (row) => (
    <div className="category-actions-container">
      <button
        type="button"
        className="category-action-btn view-btn"
        title="View Campaign"
        aria-label={`View ${row.campaignName}`}
        onClick={() => handleOpenViewModal(row)}
      >
        <Eye size={15} color="#2563EB" />
      </button>

      <button
        type="button"
        className="category-action-btn edit-btn"
        title="Edit Campaign"
        aria-label={`Edit ${row.campaignName}`}
        onClick={() => handleOpenEditModal(row)}
      >
        <Pencil size={15} color="#16A34A" />
      </button>

      <button
        type="button"
        className="category-action-btn delete-btn"
        title="Delete Campaign"
        aria-label={`Delete ${row.campaignName}`}
        onClick={() => handleOpenDeleteModal(row)}
      >
        <Trash2 size={15} color="#DC2626" />
      </button>

      <button
        type="button"
        className="category-action-btn view-btn"
        title="Performance Tracker"
        aria-label={`Performance Tracker for ${row.campaignName}`}
        onClick={() => handleOpenPerformanceModal(row)}
      >
        <BarChart2 size={15} color="#2E3192" />
      </button>
    </div>
  );

  return (
    <div className="product-master-page container-fluid px-0 px-md-1">
      <Helmet>
        <title>Campaign Master | Sonocare CRM</title>
        <meta name="description" content="Manage marketing campaigns and performance tracking in Sonocare CRM." />
      </Helmet>
      <ToastContainer />

      {/* 1. TOP HEADER SECTION */}
      <div className="category-page-header">
        <div className="category-page-title-group">
          <Megaphone size={28} style={{ color: '#2E3192' }} />
          <h1 className="category-page-title">Campaign Master</h1>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button
            type="button"
            className="category-add-btn"
            style={{ backgroundColor: '#ffffff', color: '#2563eb', borderColor: '#2563eb' }}
            onClick={() => navigate('/masters/campaign-contacts')}
          >
            <Users size={18} />
            <span>Manage Campaign Contacts</span>
          </button>

          <button
            type="button"
            className="category-add-btn"
            onClick={handleOpenAddModal}
          >
            <Plus size={18} />
            <span>Add Campaign</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN CARD CONTAINER */}
      <div className="category-card">
        {/* Card Header & Search / Filters */}
        <div className="category-card-header pb-3 border-bottom">
          <h2 className="category-card-title">Campaign Register List</h2>

          {/* Search Box */}
          <div className="category-search-wrapper">
            <Search size={16} className="category-search-icon" />
            <input
              type="text"
              className="category-search-input"
              placeholder="Search by Campaign ID, Name, Owner, Event..."
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

            {/* Campaign Type Filter */}
            <div className="col-12 col-sm-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Campaign Types</option>
                {mockCampaignTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="col-12 col-sm-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {(typeFilter || statusFilter || searchQuery) && (
              <div className="col-12 col-md-auto ms-auto">
                <button
                  type="button"
                  className="btn btn-sm btn-link text-decoration-none text-danger p-0 fw-semibold"
                  onClick={() => {
                    setTypeFilter('');
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

        {/* Table Container */}
        <div className="category-table-wrapper">
          <Table
            columns={columns}
            data={filteredCampaigns}
            showSerialNumber={true}
            serialNumberHeader="S.No"
            actions={tableActions}
            actionHeader="ACTIONS"
            actionWidth="150px"
            emptyMessage="No campaign records found"
            emptyIcon="bi-megaphone"
            paginated={true}
            pageSizeOptions={[10, 25, 50]}
            defaultPageSize={10}
            tableClassName="category-custom-table"
            headerClassName=""
            bordered={false}
            striped={false}
            hover={true}
            minWidth="1200px"
          />
        </div>
      </div>

      {/* 3. ADD CAMPAIGN MODAL */}
      <Modal
        show={isAddModalOpen}
        onHide={() => setIsAddModalOpen(false)}
        title="Add Campaign"
        size="md"
        centered={true}
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            <Button
              variant="outline-secondary"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
              onClick={handleSaveAddCampaign}
            >
              Add Campaign
            </Button>
          </div>
        }
      >
        <div className="py-2">
          <div className="row g-3">
            <div className="col-12">
              <InputField
                label="Campaign ID"
                value={formData.campaignId}
                disabled={true}
              />
            </div>

            <div className="col-12">
              <Dropdown
                label="Campaign Type"
                options={mockCampaignTypes}
                value={formData.campaignType}
                onChange={(e) => handleInputChange('campaignType', e.target.value)}
              />
            </div>

            <div className="col-12">
              <InputField
                label="Campaign Name *"
                placeholder="e.g. Q1 Diagnostic Scanner Promo"
                required={true}
                value={formData.campaignName}
                onChange={(e) => handleInputChange('campaignName', e.target.value)}
                error={formErrors.campaignName}
              />
            </div>

            {/* Territory, District & City Dropdowns */}
            <div className="col-12 col-md-6">
              <Dropdown
                label="Territory"
                options={mockStateData}
                value={formData.territory}
                onChange={(e) => handleInputChange('territory', e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6">
              <Dropdown
                label="District"
                options={availableDistricts}
                value={formData.district}
                disabled={!formData.territory}
                onChange={(e) => handleInputChange('district', e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6">
              <Dropdown
                label="City"
                options={availableCities}
                value={formData.city}
                disabled={!formData.district}
                onChange={(e) => handleInputChange('city', e.target.value)}
              />
            </div>

            {/* Department Dropdown */}
            <div className="col-12 col-md-6">
              <Dropdown
                label="Department"
                options={mockDepartmentData}
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
              />
            </div>

            {/* Strict Filtered Owner (Employee) Dropdown: Territory === Selected AND Department === Selected */}
            <div className="col-12">
              <Dropdown
                label="Owner (Employee)"
                options={ownerOptions}
                value={formData.owner}
                disabled={!formData.territory || !formData.department || ownerOptions.length === 0}
                onChange={(e) => handleInputChange('owner', e.target.value)}
                placeholder={
                  !formData.territory || !formData.department
                    ? 'Select Territory and Department first'
                    : ownerOptions.length === 0
                    ? 'No employees in selected Territory & Department'
                    : 'Select Owner'
                }
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
              />
            </div>

            <div className="col-12">
              <Dropdown
                label="Status"
                options={['Active', 'Inactive']}
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              />
            </div>

            <div className="col-12">
              <InputField
                label="Associated Conference/Event"
                placeholder="e.g. Indian Radiology Association Conference (IRIA 2026)"
                value={formData.associatedEvent}
                onChange={(e) => handleInputChange('associatedEvent', e.target.value)}
              />
            </div>

            <div className="col-12">
              <InputField
                label="Description"
                type="textarea"
                rows={3}
                placeholder="Enter campaign description..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* 4. EDIT CAMPAIGN MODAL */}
      <Modal
        show={isEditModalOpen}
        onHide={() => setIsEditModalOpen(false)}
        title="Edit Campaign"
        size="md"
        centered={true}
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            <Button
              variant="outline-secondary"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
              onClick={handleSaveEditCampaign}
            >
              Update Campaign
            </Button>
          </div>
        }
      >
        <div className="py-2">
          <div className="row g-3">
            <div className="col-12">
              <InputField
                label="Campaign ID"
                value={formData.campaignId}
                disabled={true}
              />
            </div>

            <div className="col-12">
              <Dropdown
                label="Campaign Type"
                options={mockCampaignTypes}
                value={formData.campaignType}
                onChange={(e) => handleInputChange('campaignType', e.target.value)}
              />
            </div>

            <div className="col-12">
              <InputField
                label="Campaign Name *"
                placeholder="Campaign Name"
                required={true}
                value={formData.campaignName}
                onChange={(e) => handleInputChange('campaignName', e.target.value)}
                error={formErrors.campaignName}
              />
            </div>

            {/* Territory, District & City Dropdowns */}
            <div className="col-12 col-md-6">
              <Dropdown
                label="Territory"
                options={mockStateData}
                value={formData.territory}
                onChange={(e) => handleInputChange('territory', e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6">
              <Dropdown
                label="District"
                options={availableDistricts}
                value={formData.district}
                disabled={!formData.territory}
                onChange={(e) => handleInputChange('district', e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6">
              <Dropdown
                label="City"
                options={availableCities}
                value={formData.city}
                disabled={!formData.district}
                onChange={(e) => handleInputChange('city', e.target.value)}
              />
            </div>

            {/* Department Dropdown */}
            <div className="col-12 col-md-6">
              <Dropdown
                label="Department"
                options={mockDepartmentData}
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
              />
            </div>

            {/* Strict Filtered Owner (Employee) Dropdown */}
            <div className="col-12">
              <Dropdown
                label="Owner (Employee)"
                options={ownerOptions}
                value={formData.owner}
                disabled={!formData.territory || !formData.department || ownerOptions.length === 0}
                onChange={(e) => handleInputChange('owner', e.target.value)}
                placeholder={
                  !formData.territory || !formData.department
                    ? 'Select Territory and Department first'
                    : ownerOptions.length === 0
                    ? 'No employees in selected Territory & Department'
                    : 'Select Owner'
                }
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
              />
            </div>

            <div className="col-12">
              <Dropdown
                label="Status"
                options={['Active', 'Inactive']}
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              />
            </div>

            <div className="col-12">
              <InputField
                label="Associated Conference/Event"
                placeholder="e.g. Indian Radiology Association Conference (IRIA 2026)"
                value={formData.associatedEvent}
                onChange={(e) => handleInputChange('associatedEvent', e.target.value)}
              />
            </div>

            <div className="col-12">
              <InputField
                label="Description"
                type="textarea"
                rows={3}
                placeholder="Enter campaign description..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* 5. VIEW CAMPAIGN MODAL */}
      <Modal
        show={isViewModalOpen}
        onHide={() => setIsViewModalOpen(false)}
        title={`View Campaign (${formData.campaignId})`}
        size="md"
        centered={true}
        footer={
          <div className="d-flex justify-content-end w-100">
            <Button
              variant="outline-secondary"
              onClick={() => setIsViewModalOpen(false)}
            >
              Close
            </Button>
          </div>
        }
      >
        <div className="py-2">
          <div className="row g-3">
            <div className="col-12">
              <InputField
                label="Campaign ID"
                value={formData.campaignId}
                disabled={true}
              />
            </div>

            <div className="col-12">
              <InputField
                label="Campaign Type"
                value={formData.campaignType}
                disabled={true}
              />
            </div>

            <div className="col-12">
              <InputField
                label="Campaign Name"
                value={formData.campaignName}
                disabled={true}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="Territory"
                value={formData.territory || '—'}
                disabled={true}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="District"
                value={formData.district || '—'}
                disabled={true}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="City"
                value={formData.city || '—'}
                disabled={true}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="Department"
                value={formData.department || '—'}
                disabled={true}
              />
            </div>

            <div className="col-12">
              <InputField
                label="Owner (Employee)"
                value={formData.owner || '—'}
                disabled={true}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="Start Date"
                value={formData.startDate}
                disabled={true}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="End Date"
                value={formData.endDate}
                disabled={true}
              />
            </div>

            <div className="col-12">
              <InputField
                label="Status"
                value={formData.status}
                disabled={true}
              />
            </div>

            <div className="col-12">
              <InputField
                label="Associated Conference/Event"
                value={formData.associatedEvent}
                disabled={true}
              />
            </div>

            <div className="col-12">
              <InputField
                label="Description"
                type="textarea"
                rows={3}
                value={formData.description}
                disabled={true}
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* 6. DELETE CAMPAIGN CONFIRMATION MODAL */}
      <Modal
        show={isDeleteModalOpen}
        onHide={() => setIsDeleteModalOpen(false)}
        title="Delete Campaign"
        size="md"
        centered={true}
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            <Button
              variant="outline-secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </div>
        }
      >
        {selectedCampaign && (
          <div className="py-2">
            <p className="text-dark fs-6 mb-0">
              Are you sure you want to delete the campaign "{selectedCampaign.campaignName}"?
            </p>
          </div>
        )}
      </Modal>

      {/* 7. PERFORMANCE TRACKER MODAL (4 INPUT FIELDS) */}
      <Modal
        show={isPerformanceModalOpen}
        onHide={() => setIsPerformanceModalOpen(false)}
        title="Performance Tracker"
        size="md"
        centered={true}
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            <Button
              variant="outline-secondary"
              onClick={() => setIsPerformanceModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
              onClick={handleSavePerformance}
            >
              Save
            </Button>
          </div>
        }
      >
        <div className="py-2">
          {selectedCampaign && (
            <div className="alert alert-light border mb-3 text-dark small">
              Campaign: <strong>{selectedCampaign.campaignId}</strong> - {selectedCampaign.campaignName}
            </div>
          )}
          <div className="row g-3">
            <div className="col-12">
              <InputField
                label="Total No. of Contacts"
                type="number"
                placeholder="e.g. 500"
                value={performanceData.totalContacts}
                onChange={(e) => handlePerformanceChange('totalContacts', e.target.value)}
              />
            </div>

            <div className="col-12">
              <InputField
                label="Successful Contacts"
                type="number"
                placeholder="e.g. 420"
                value={performanceData.successfulContacts}
                onChange={(e) => handlePerformanceChange('successfulContacts', e.target.value)}
              />
            </div>

            <div className="col-12">
              <InputField
                label="Failed Contacts"
                type="number"
                placeholder="e.g. 30"
                value={performanceData.failedContacts}
                onChange={(e) => handlePerformanceChange('failedContacts', e.target.value)}
              />
            </div>

            <div className="col-12">
              <InputField
                label="Inquiries Created"
                type="number"
                placeholder="e.g. 85"
                value={performanceData.inquiriesCreated}
                onChange={(e) => handlePerformanceChange('inquiriesCreated', e.target.value)}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Campaign;
