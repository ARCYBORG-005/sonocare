import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { Helmet } from 'react-helmet-async';
import { InputField, Dropdown } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import {
  HelpCircle,
  Plus,
  Download,
  Eye,
  Pencil,
  Trash2,
  Search,
  Filter,
  ArrowRightCircle,
  CheckCircle2,
  AlertTriangle,
  Building2,
  MapPin,
  Share2,
  ShieldAlert,
  Package,
  Clock
} from 'lucide-react';
import '../../styles/Enquiry.css';
import {
  initialMockEnquiries,
  allocateEnquiryEmployee,
  checkDuplicateEnquiry,
  calculateActiveEnquiryCountForEmployee,
  evaluateEnquiryStaleAndDropStatus
} from './mockEnquiry';
import {
  mockStateData,
  mockDepartmentData,
  initialMockEmployees
} from './mockEmployees';
import { mockDistrictMasterData, mockCityMasterData } from './mockCustomers';
import { initialMockProducts } from './mockProducts';

// Customer Types
const mockCustomerTypes = ['Hospital', 'Diagnostic Center', 'Clinic', 'Other'];

// Enquiry Sources
const mockSources = [
  'Referral',
  'Campaign',
  'Conference/Event',
  'Website',
  'Walk-in',
  'Phone',
  'Other'
];

// Priorities
const mockPriorities = ['Normal', 'Premium'];

// Product Categories
const mockProductCategories = [
  'Medical & Diagnostic Scanners',
  'Machinery & Equipment',
  'Tooling & Accessories',
  'Electrical & Automation'
];

// Expected Timeframes
const mockTimeframes = [
  'Immediate',
  'Within 1 Month',
  '1–3 Months',
  '3–6 Months',
  '6–12 Months',
  'More than 12 Months'
];

// Mock Campaigns List for Lookup
const mockCampaignsList = [
  { id: 'CMP-001', name: 'National Radiology Expo 2026' },
  { id: 'CMP-002', name: 'Cardiology Seminar - South Zone' },
  { id: 'CMP-003', name: 'Diagnostic Equipment Roadshow' }
];

import { getNextLeadId } from '../Lead/mockLead';

const Enquiry = ({ enquiries: propEnquiries, setEnquiries: propSetEnquiries, leads = [], setLeads }) => {
  const navigate = useNavigate();

  // --- MASTER STATES ---
  const [localEnquiries, setLocalEnquiries] = useState(initialMockEnquiries);
  const enquiries = propEnquiries || localEnquiries;
  const setEnquiries = propSetEnquiries || setLocalEnquiries;
  const [employees] = useState(initialMockEmployees);

  // --- FILTER STATES ---
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [territoryFilter, setTerritoryFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // --- MODAL STATES ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);

  // --- SELECTED ROW & DUPLICATE TRACKER ---
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [duplicateMatch, setDuplicateMatch] = useState(null);
  const [pendingSubmitData, setPendingSubmitData] = useState(null);

  // Auto-generate next Enquiry ID
  const nextEnquiryId = useMemo(() => {
    if (!enquiries || enquiries.length === 0) return 'ENQ-001';
    const nums = enquiries
      .map((e) => parseInt((e.enquiryId || '').replace('ENQ-', ''), 10))
      .filter(Boolean);
    const maxNum = nums.length > 0 ? Math.max(...nums) : 0;
    return `ENQ-${String(maxNum + 1).padStart(3, '0')}`;
  }, [enquiries]);

  // --- STALE (30+ DAYS) & AUTO-DROP (90+ DAYS) EFFECT ---
  useEffect(() => {
    let staleCount = 0;
    const updated = (enquiries || []).map((enq) => {
      const evaluated = evaluateEnquiryStaleAndDropStatus(enq);
      if (evaluated.status === 'Stale' && enq.status !== 'Stale') {
        staleCount++;
      }
      return evaluated;
    });

    const isChanged = updated.some((u, i) => u.status !== enquiries[i]?.status);
    if (isChanged) {
      setEnquiries(updated);
      if (staleCount > 0) {
        toast.warning(`Manager Alert: ${staleCount} active enquiry/enquiries marked as Stale due to 30+ days of inactivity.`);
      }
    }
  }, []);

  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    enquiryId: nextEnquiryId,
    customerName: '',
    contactPerson: '',
    customerType: 'Hospital',
    otherCustomerType: '',
    hospitalInstitution: '',
    mobile: '',
    email: '',
    state: 'Tamil Nadu', // Territory
    district: 'Chennai',
    city: 'Chennai',
    pincode: '',
    address: '',
    source: 'Website',
    sourceDetails: '',
    campaignId: '',
    campaignContactId: '',
    conferenceName: '',
    referralName: '',
    referralOrg: '',
    referralEmail: '',
    referralMobile: '',
    referralTerritory: '',
    priority: 'Normal',
    department: 'Telecaller Team',
    productCategory: 'Medical & Diagnostic Scanners',
    product: 'Sonocare HD Cardiac Probe Transducer',
    serviceInterested: 'One-Time Purchase',
    subscriptionFrequency: 'Monthly',
    expectedTimeframe: '1–3 Months',
    budget: '',
    remarks: '',
    status: 'Pending',
    assignedEmployeeId: 'UNASSIGNED',
    assignedEmployeeName: 'Unassigned'
  });

  const [formErrors, setFormErrors] = useState({});

  // --- CASCADING DISTRICT & CITY OPTIONS ---
  const availableDistricts = useMemo(() => {
    if (!formData.state) return [];
    return mockDistrictMasterData[formData.state] || [formData.state];
  }, [formData.state]);

  const availableCities = useMemo(() => {
    if (!formData.district) return [];
    return mockCityMasterData[formData.district] || [formData.district];
  }, [formData.district]);

  // --- CASCADING PRODUCTS OPTIONS ---
  const availableProducts = useMemo(() => {
    if (!formData.productCategory) return [];
    const filtered = initialMockProducts.filter((p) => p.category === formData.productCategory);
    return filtered.length > 0 ? filtered.map((p) => p.productName) : ['General Equipment'];
  }, [formData.productCategory]);

  // --- AUTOMATIC EMPLOYEE ASSIGNMENT ---
  useEffect(() => {
    if (isAddModalOpen || isEditModalOpen) {
      const currentTerritory = formData.territory || formData.state;
      const allocation = allocateEnquiryEmployee(
        currentTerritory,
        formData.department,
        formData.priority,
        formData.source,
        employees,
        enquiries,
        formData.district,
        formData.city
      );

      setFormData((prev) => ({
        ...prev,
        assignedEmployeeId: allocation.assignedEmployeeId,
        assignedEmployeeName: allocation.assignedEmployeeName
      }));
    }
  }, [formData.territory, formData.state, formData.district, formData.city, formData.department, formData.priority, formData.source, isAddModalOpen, isEditModalOpen, employees, enquiries]);

  // Handle Form Inputs
  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };

      // Cascading Territory -> District -> City
      if (field === 'state' || field === 'territory') {
        next.state = value;
        next.territory = value;
        const dists = mockDistrictMasterData[value] || [value];
        next.district = dists[0] || '';
        const cities = mockCityMasterData[next.district] || [next.district];
        next.city = cities[0] || '';
      } else if (field === 'district') {
        const cities = mockCityMasterData[value] || [value];
        next.city = cities[0] || '';
      }

      // Cascading Product Category -> Product
      if (field === 'productCategory') {
        const prods = initialMockProducts.filter((p) => p.category === value);
        next.product = prods.length > 0 ? prods[0].productName : 'General Equipment';
      }

      return next;
    });

    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // --- FILTERED ENQUIRIES DATASET ---
  const filteredEnquiries = useMemo(() => {
    return (enquiries || []).filter((enq) => {
      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchId = enq.enquiryId && enq.enquiryId.toLowerCase().includes(q);
        const matchName = enq.customerName && enq.customerName.toLowerCase().includes(q);
        const matchContact = enq.contactPerson && enq.contactPerson.toLowerCase().includes(q);
        const matchMobile = enq.mobile && enq.mobile.includes(q);
        const matchCity = enq.city && enq.city.toLowerCase().includes(q);
        const matchProduct = enq.product && enq.product.toLowerCase().includes(q);

        if (!matchId && !matchName && !matchContact && !matchMobile && !matchCity && !matchProduct) {
          return false;
        }
      }

      // Department Filter
      if (departmentFilter && enq.department !== departmentFilter) return false;

      // Territory Filter
      if (territoryFilter && enq.territory !== territoryFilter && enq.state !== territoryFilter) return false;

      // Source Filter
      if (sourceFilter && enq.source !== sourceFilter) return false;

      // Priority Filter
      if (priorityFilter && enq.priority !== priorityFilter) return false;

      // Status Filter
      if (statusFilter && enq.status !== statusFilter) return false;

      return true;
    });
  }, [enquiries, searchQuery, departmentFilter, territoryFilter, sourceFilter, priorityFilter, statusFilter]);

  // --- VALIDATE FORM ---
  const validateForm = () => {
    const errors = {};
    if (!formData.customerName.trim()) errors.customerName = 'Customer Name is required';
    if (!formData.contactPerson.trim()) errors.contactPerson = 'Contact Person is required';

    // Mobile validation: required, 10 digits
    const trimmedMobile = formData.mobile.trim();
    if (!trimmedMobile) {
      errors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(trimmedMobile)) {
      errors.mobile = 'Mobile number must be exactly 10 digits (e.g. 9840112233)';
    }

    // Email validation: required, valid email format
    const trimmedEmail = formData.email.trim();
    if (!trimmedEmail) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Invalid email address format (e.g. contact@apollo.com)';
    }

    if (!formData.customerType) errors.customerType = 'Customer Type is required';
    if (formData.customerType === 'Other' && !formData.otherCustomerType.trim()) {
      errors.otherCustomerType = 'Description is required when Customer Type is Other';
    }
    if (!formData.state) errors.state = 'Territory/State is required';
    if (!formData.productCategory) errors.productCategory = 'Product Category is required';
    if (!formData.source) errors.source = 'Enquiry Source is required';
    if (!formData.priority) errors.priority = 'Priority is required';

    if (formData.source === 'Referral' && !formData.referralName.trim()) {
      errors.referralName = 'Referral Name is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // --- ADD ENQUIRY SUBMIT & DUP CHECK ---
  const handleOpenAddModal = () => {
    navigate('/masters/enquiries/add');
  };

  const handleAddSubmit = (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix validation errors before submitting.');
      return;
    }

    // SRS Duplicate Check (Email + Mobile within 6 months)
    const duplicate = checkDuplicateEnquiry(formData.email, formData.mobile, enquiries);
    if (duplicate) {
      setDuplicateMatch(duplicate);
      setPendingSubmitData(formData);
      setIsDuplicateModalOpen(true);
      return;
    }

    executeCreateEnquiry(formData);
  };

  const executeCreateEnquiry = (data) => {
    const newEnq = {
      id: Date.now(),
      ...data,
      enquiryId: nextEnquiryId,
      territory: data.state,
      enquiryDate: new Date().toISOString().split('T')[0],
      lastActivityDate: new Date().toISOString().split('T')[0],
      daysSinceLastActivity: 0,
      isConvertedToLead: false,
      leadConvertedDate: null
    };

    setEnquiries((prev) => [newEnq, ...(prev || [])]);
    setIsAddModalOpen(false);
    toast.success(`Enquiry ${newEnq.enquiryId} created and auto-assigned successfully.`);
  };

  // SRS Duplicate Confirmation: Update existing record
  const handleConfirmDuplicateUpdate = () => {
    if (!duplicateMatch || !pendingSubmitData) return;

    setEnquiries((prev) =>
      prev.map((enq) =>
        enq.enquiryId === duplicateMatch.enquiryId
          ? {
            ...enq,
            customerName: pendingSubmitData.customerName,
            contactPerson: pendingSubmitData.contactPerson,
            customerType: pendingSubmitData.customerType,
            hospitalInstitution: pendingSubmitData.hospitalInstitution,
            state: pendingSubmitData.state,
            district: pendingSubmitData.district,
            city: pendingSubmitData.city,
            productCategory: pendingSubmitData.productCategory,
            product: pendingSubmitData.product,
            serviceInterested: pendingSubmitData.serviceInterested,
            expectedTimeframe: pendingSubmitData.expectedTimeframe,
            budget: pendingSubmitData.budget,
            remarks: pendingSubmitData.remarks,
            lastActivityDate: new Date().toISOString().split('T')[0],
            daysSinceLastActivity: 0
          }
          : enq
      )
    );

    setIsDuplicateModalOpen(false);
    setIsAddModalOpen(false);
    setDuplicateMatch(null);
    setPendingSubmitData(null);
    toast.info(`Existing enquiry ${duplicateMatch.enquiryId} updated with latest interaction.`);
  };

  // --- EDIT ENQUIRY SUBMIT ---
  const handleOpenEditModal = (enq) => {
    navigate(`/masters/enquiries/${enq.enquiryId}/edit`);
  };

  // --- VIEW ENQUIRY MODAL ---
  const handleOpenViewModal = (enq) => {
    navigate(`/masters/enquiries/${enq.enquiryId}/view`);
  };

  const handleEditSubmit = (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix validation errors before submitting.');
      return;
    }

    setEnquiries((prev) =>
      prev.map((enq) =>
        enq.enquiryId === formData.enquiryId || enq.id === selectedEnquiry.id
          ? {
            ...enq,
            ...formData,
            territory: formData.state,
            lastActivityDate: new Date().toISOString().split('T')[0],
            daysSinceLastActivity: 0
          }
          : enq
      )
    );

    setIsEditModalOpen(false);
    toast.success(`Enquiry ${formData.enquiryId} updated successfully.`);
  };

  // --- DELETE ENQUIRY MODAL ---
  const handleOpenDeleteModal = (enq) => {
    setSelectedEnquiry(enq);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedEnquiry) return;
    setEnquiries((prev) => prev.filter((item) => item.id !== selectedEnquiry.id && item.enquiryId !== selectedEnquiry.enquiryId));
    setIsDeleteModalOpen(false);
    toast.success(`Enquiry ${selectedEnquiry.enquiryId} deleted.`);
  };

  // --- CONVERT TO LEAD WORKFLOW ---
  const handleOpenConvertModal = (enq) => {
    setSelectedEnquiry(enq);

    // Verify qualification criteria
    const hasContact = enq.customerName && enq.contactPerson && enq.mobile;
    const hasProduct = enq.productCategory && enq.product;
    const hasBudget = enq.budget !== undefined && enq.budget !== null && enq.budget !== '';
    const hasTimeframe = enq.expectedTimeframe;

    if (!hasContact || !hasProduct || !hasBudget || !hasTimeframe) {
      toast.error(
        'Lead Conversion Blocked: Complete Contact Info, Product Interest, Budget, and Timeframe before converting.'
      );
      return;
    }

    setIsConvertModalOpen(true);
  };

  const handleConfirmConvertToLead = () => {
    if (!selectedEnquiry) return;

    setEnquiries((prev) =>
      prev.map((enq) =>
        enq.enquiryId === selectedEnquiry.enquiryId
          ? {
              ...enq,
              status: 'Converted to Lead',
              isConvertedToLead: true,
              leadConvertedDate: new Date().toISOString().split('T')[0]
            }
          : enq
      )
    );

    const newLeadId = getNextLeadId(leads);
    const newLead = {
      id: Date.now(),
      leadId: newLeadId,
      enquiryId: selectedEnquiry.enquiryId,
      customerName: selectedEnquiry.customerName,
      contactPerson: selectedEnquiry.contactPerson,
      customerType: selectedEnquiry.customerType || 'Hospital',
      otherCustomerType: selectedEnquiry.otherCustomerType || '',
      hospitalInstitution: selectedEnquiry.hospitalInstitution || selectedEnquiry.customerName,
      mobile: selectedEnquiry.mobile,
      email: selectedEnquiry.email,
      territory: selectedEnquiry.territory || selectedEnquiry.state,
      district: selectedEnquiry.district || '',
      city: selectedEnquiry.city || '',
      pincode: selectedEnquiry.pincode || '',
      address: selectedEnquiry.address || '',
      productCategory: selectedEnquiry.productCategory,
      product: selectedEnquiry.product,
      serviceInterested: selectedEnquiry.serviceInterested || 'One-Time Purchase',
      expectedPurchaseTimeframe: selectedEnquiry.expectedTimeframe || '1–3 Months',
      budget: selectedEnquiry.budget || '4500000',
      source: selectedEnquiry.source || 'Enquiry',
      sourceDetails: `Converted from Enquiry ${selectedEnquiry.enquiryId}`,
      assignedEmployeeId: selectedEnquiry.assignedEmployeeId,
      assignedEmployeeName: selectedEnquiry.assignedEmployeeName,
      department: selectedEnquiry.department || 'Sales Team',
      leadStatus: 'Open',
      leadCreatedDate: new Date().toISOString().split('T')[0],
      lastActivityDate: new Date().toISOString().split('T')[0],
      nextFollowUpDate: '',
      nextFollowUpTime: '',
      closureReason: '',
      closureRemarks: '',
      originalLeadId: null
    };

    if (setLeads) {
      setLeads((prev) => [newLead, ...(prev || [])]);
    }

    setIsConvertModalOpen(false);
    toast.success(`Enquiry ${selectedEnquiry.enquiryId} successfully converted into Lead ${newLeadId}.`);

    setTimeout(() => {
      navigate('/leads');
    }, 1000);
  };

  // --- EXPORT TO CSV / EXCEL ---
  const handleExportCSV = () => {
    const headers = [
      'Enquiry ID',
      'Customer Name',
      'Contact Person',
      'Mobile',
      'Customer Type',
      'Source',
      'Priority',
      'Territory',
      'District',
      'City',
      'Product Category',
      'Product',
      'Service Interested',
      'Enquiry Date',
      'Department',
      'Assigned Employee',
      'Status'
    ];

    const rows = filteredEnquiries.map((enq) => [
      enq.enquiryId,
      `"${enq.customerName}"`,
      `"${enq.contactPerson}"`,
      enq.mobile,
      enq.customerType,
      enq.source,
      enq.priority,
      enq.territory || enq.state,
      enq.district,
      enq.city,
      `"${enq.productCategory}"`,
      `"${enq.product}"`,
      enq.serviceInterested,
      enq.enquiryDate,
      enq.department,
      `"${enq.assignedEmployeeName}"`,
      enq.status
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Enquiry_Master_Export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Enquiry list exported to CSV/Excel.');
  };

  // --- TABLE COLUMNS CONFIGURATION (21 COLUMNS) ---
  const columns = [
    {
      key: 'enquiryId',
      title: 'ENQUIRY ID',
      sortable: true,
      render: (val) => <span className="badge bg-secondary font-monospace">{val}</span>
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
      render: (val) => <span className="text-dark small">{val}</span>
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
      render: (val) => <span className="small text-dark">{val || '—'}</span>
    },
    {
      key: 'customerType',
      title: 'CUSTOMER TYPE',
      sortable: true,
      render: (val) => <span className="badge bg-light text-dark border">{val}</span>
    },
    {
      key: 'source',
      title: 'SOURCE',
      sortable: true,
      render: (val) => <span className="small text-muted fw-semibold">{val}</span>
    },
    {
      key: 'sourceDetails',
      title: 'SOURCE DETAILS',
      sortable: true,
      render: (val) => <span className="small text-muted">{val || '—'}</span>
    },
    {
      key: 'priority',
      title: 'PRIORITY',
      sortable: true,
      align: 'center',
      render: (val) => (
        <span className={`enquiry-priority-badge ${val === 'Premium' ? 'premium' : 'normal'}`}>
          {val}
        </span>
      )
    },
    {
      key: 'territory',
      title: 'TERRITORY',
      sortable: true,
      render: (val, row) => <span className="small text-dark">{val || row.state || '—'}</span>
    },
    {
      key: 'district',
      title: 'DISTRICT',
      sortable: true,
      render: (val) => <span className="small text-dark">{val || '—'}</span>
    },
    {
      key: 'city',
      title: 'CITY',
      sortable: true,
      render: (val) => <span className="small text-dark">{val || '—'}</span>
    },
    {
      key: 'productCategory',
      title: 'PRODUCT CATEGORY',
      sortable: true,
      render: (val) => <span className="small text-dark">{val || '—'}</span>
    },
    {
      key: 'product',
      title: 'PRODUCT',
      sortable: true,
      render: (val) => <span className="small fw-semibold text-primary">{val || '—'}</span>
    },
    {
      key: 'serviceInterested',
      title: 'SERVICE INTERESTED',
      sortable: true,
      render: (val) => <span className="small text-dark">{val || '—'}</span>
    },
    {
      key: 'enquiryDate',
      title: 'ENQUIRY DATE',
      sortable: true,
      render: (val) => <span className="small text-muted">{val || '—'}</span>
    },
    {
      key: 'lastActivityDate',
      title: 'LAST ACTIVITY DATE',
      sortable: true,
      render: (val) => <span className="small text-muted">{val || '—'}</span>
    },
    {
      key: 'department',
      title: 'DEPARTMENT',
      sortable: true,
      render: (val) => <span className="small text-dark">{val || '—'}</span>
    },
    {
      key: 'assignedEmployeeName',
      title: 'ASSIGNED EMPLOYEE',
      sortable: true,
      render: (val) => <span className="small fw-bold text-dark">{val || 'Unassigned'}</span>
    },
    {
      key: 'activeWorkloadImpact',
      title: 'ACTIVE WORKLOAD IMPACT',
      sortable: true,
      align: 'center',
      render: (_, row) => {
        const isActiveImpact =
          ['Pending', 'Approved', 'In Progress', 'Active'].includes(row.status) && !row.isConvertedToLead;
        return (
          <span className={`badge ${isActiveImpact ? 'bg-success-subtle text-success border border-success' : 'bg-secondary-subtle text-secondary border'}`}>
            {isActiveImpact ? 'Yes' : 'No'}
          </span>
        );
      }
    },
    {
      key: 'status',
      title: 'STATUS',
      sortable: true,
      align: 'center',
      render: (val) => {
        let statusClass = 'pending';
        if (val === 'Approved') statusClass = 'approved';
        if (val === 'Rejected') statusClass = 'rejected';
        if (val === 'Stale') statusClass = 'stale';
        if (val === 'Drop') statusClass = 'rejected';
        if (val === 'Converted to Lead') statusClass = 'converted';

        return <span className={`enquiry-status-badge ${statusClass}`}>{val}</span>;
      }
    }
  ];

  // Actions renderer (View, Edit, Convert to Lead, Delete)
  const tableActions = (row) => (
    <div className="category-actions-container">
      <button
        type="button"
        className="category-action-btn view-btn"
        title="View Enquiry Details"
        onClick={() => handleOpenViewModal(row)}
      >
        <Eye size={15} color="#2563EB" />
      </button>

      <button
        type="button"
        className="category-action-btn edit-btn"
        title="Edit Enquiry"
        onClick={() => handleOpenEditModal(row)}
        disabled={row.isConvertedToLead}
      >
        <Pencil size={15} color={row.isConvertedToLead ? '#cbd5e1' : '#16A34A'} />
      </button>

      <button
        type="button"
        className="enquiry-convert-btn"
        title="Convert Enquiry to Lead"
        onClick={() => handleOpenConvertModal(row)}
        disabled={row.isConvertedToLead}
      >
        <ArrowRightCircle size={14} />
        <span>{row.isConvertedToLead ? 'Converted' : 'Convert'}</span>
      </button>

      <button
        type="button"
        className="category-action-btn delete-btn"
        title="Delete Enquiry"
        onClick={() => handleOpenDeleteModal(row)}
      >
        <Trash2 size={15} color="#DC2626" />
      </button>
    </div>
  );

  return (
    <div className="enquiry-master-page container-fluid px-0 px-md-1">
      <Helmet>
        <title>Enquiry Master | Sonocare CRM</title>
        <meta name="description" content="Manage customer business enquiries, auto-assignment, and lead conversions." />
      </Helmet>
      <ToastContainer />

      {/* 1. TOP HEADER SECTION */}
      <div className="category-page-header">
        <div className="category-page-title-group">
          <HelpCircle size={28} style={{ color: '#2E3192' }} />
          <h1 className="category-page-title">Enquiry Master</h1>
        </div>

        <div className="enquiry-header-actions">
          <button
            type="button"
            className="enquiry-action-btn export-btn"
            onClick={handleExportCSV}
          >
            <Download size={18} />
            <span>Export Excel</span>
          </button>

          <button
            type="button"
            className="enquiry-action-btn add-btn"
            onClick={handleOpenAddModal}
          >
            <Plus size={18} />
            <span>Add Enquiry</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN CARD CONTAINER */}
      <div className="category-card">
        {/* Card Header & Search */}
        <div className="category-card-header pb-3 border-bottom">
          <h2 className="category-card-title">Customer Enquiries Register</h2>

          <div className="category-search-wrapper">
            <Search size={16} className="category-search-icon" />
            <input
              type="text"
              className="category-search-input"
              placeholder="Search by Enquiry ID, Customer Name, Mobile, Product..."
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

            {/* Department Filter */}
            <div className="col-12 col-sm-6 col-md-2">
              <select
                className="form-select form-select-sm"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="">All Departments</option>
                {mockDepartmentData.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Territory Filter */}
            <div className="col-12 col-sm-6 col-md-2">
              <select
                className="form-select form-select-sm"
                value={territoryFilter}
                onChange={(e) => setTerritoryFilter(e.target.value)}
              >
                <option value="">All Territories</option>
                {mockStateData.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Source Filter */}
            <div className="col-12 col-sm-6 col-md-2">
              <select
                className="form-select form-select-sm"
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
              >
                <option value="">All Sources</option>
                {mockSources.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div className="col-12 col-sm-6 col-md-2">
              <select
                className="form-select form-select-sm"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="">All Priorities</option>
                {mockPriorities.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="col-12 col-sm-6 col-md-2">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Stale">Stale</option>
                <option value="Converted to Lead">Converted to Lead</option>
              </select>
            </div>

            {(departmentFilter || territoryFilter || sourceFilter || priorityFilter || statusFilter || searchQuery) && (
              <div className="col-12 col-md-auto ms-auto">
                <button
                  type="button"
                  className="btn btn-sm btn-link text-decoration-none text-danger p-0 fw-semibold"
                  onClick={() => {
                    setDepartmentFilter('');
                    setTerritoryFilter('');
                    setSourceFilter('');
                    setPriorityFilter('');
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
            data={filteredEnquiries}
            showSerialNumber={true}
            serialNumberHeader="S.No"
            actions={tableActions}
            actionHeader="ACTIONS"
            actionWidth="210px"
            emptyMessage="No enquiry records found"
            emptyIcon="bi-question-circle"
            paginated={true}
            pageSizeOptions={[10, 25, 50]}
            defaultPageSize={10}
            tableClassName="category-custom-table"
            bordered={false}
            hover={true}
            minWidth="1650px"
          />
        </div>
      </div>

      {/* 3. ADD / EDIT ENQUIRY MODAL (6 SECTIONS) */}
      <Modal
        show={isAddModalOpen || isEditModalOpen}
        onHide={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isAddModalOpen ? 'Add New Enquiry' : `Edit Enquiry (${formData.enquiryId})`}
        size="lg"
        centered={true}
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            <Button
              variant="outline-secondary"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={isAddModalOpen ? handleAddSubmit : handleEditSubmit}
              style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
            >
              {isAddModalOpen ? 'Save & Assign Enquiry' : 'Update Enquiry'}
            </Button>
          </div>
        }
      >
        <form onSubmit={isAddModalOpen ? handleAddSubmit : handleEditSubmit} noValidate>
          {/* SECTION 1 — CONTACT / CUSTOMER */}
          <div className="enquiry-form-section-header">
            <Building2 size={18} />
            <span>SECTION 1 — CONTACT / CUSTOMER</span>
          </div>
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6">
              <InputField
                label="Enquiry ID (Read-only)"
                value={formData.enquiryId}
                disabled={true}
              />
            </div>
            <div className="col-12 col-md-6">
              <InputField
                label="Customer Name *"
                placeholder="e.g. Apollo Hospitals"
                required={true}
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                error={formErrors.customerName}
              />
            </div>
            <div className="col-12 col-md-6">
              <InputField
                label="Contact Person "
                placeholder="e.g. Dr. Ramesh Sundaram"
                required={true}
                value={formData.contactPerson}
                onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                error={formErrors.contactPerson}
              />
            </div>
            <div className="col-12 col-md-6">
              <Dropdown
                label="Customer Type "
                options={mockCustomerTypes}
                value={formData.customerType}
                onChange={(e) => handleInputChange('customerType', e.target.value)}
              />
            </div>
            {formData.customerType === 'Other' && (
              <div className="col-12 col-md-6">
                <InputField
                  label="Other Customer Type "
                  placeholder="Specify customer type..."
                  required={true}
                  value={formData.otherCustomerType}
                  onChange={(e) => handleInputChange('otherCustomerType', e.target.value)}
                  error={formErrors.otherCustomerType}
                />
              </div>
            )}
            <div className="col-12 col-md-6">
              <InputField
                label="Hospital / Institution"
                placeholder="Hospital / Diagnostic center name..."
                value={formData.hospitalInstitution}
                onChange={(e) => handleInputChange('hospitalInstitution', e.target.value)}
              />
            </div>
            <div className="col-12 col-md-6">
              <InputField
                label="Mobile "
                placeholder="e.g. 9840112233"
                required={true}
                value={formData.mobile}
                onChange={(e) => handleInputChange('mobile', e.target.value)}
                error={formErrors.mobile}
              />
            </div>
            <div className="col-12 col-md-6">
              <InputField
                label="Email "
                type="email"
                placeholder="e.g. contact@apollo.com"
                required={true}
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={formErrors.email}
              />
            </div>
          </div>

          {/* SECTION 2 — LOCATION */}
          <div className="enquiry-form-section-header">
            <MapPin size={18} />
            <span>SECTION 2 — LOCATION</span>
          </div>
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-4">
              <Dropdown
                label="Territory (State) "
                options={mockStateData}
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
              />
            </div>
            <div className="col-12 col-md-4">
              <Dropdown
                label="District "
                options={availableDistricts}
                value={formData.district}
                onChange={(e) => handleInputChange('district', e.target.value)}
              />
            </div>
            <div className="col-12 col-md-4">
              <Dropdown
                label="City "
                options={availableCities}
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
              />
            </div>
            <div className="col-12 col-md-4">
              <InputField
                label="Pincode "
                placeholder="e.g. 600006"
                value={formData.pincode}
                onChange={(e) => handleInputChange('pincode', e.target.value)}
              />
            </div>
            <div className="col-12 col-md-8">
              <InputField
                label="Address "
                type="textarea"
                rows={1}
                placeholder="Complete street address..."
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>
          </div>

          {/* SECTION 3 — ENQUIRY SOURCE */}
          <div className="enquiry-form-section-header">
            <Share2 size={18} />
            <span>SECTION 3 — ENQUIRY SOURCE</span>
          </div>
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6">
              <Dropdown
                label="Source "
                options={mockSources}
                value={formData.source}
                onChange={(e) => handleInputChange('source', e.target.value)}
              />
            </div>
            <div className="col-12 col-md-6">
              <InputField
                label="Source Details"
                type="textarea"
                rows={1}
                placeholder="Additional source details..."
                value={formData.sourceDetails}
                onChange={(e) => handleInputChange('sourceDetails', e.target.value)}
              />
            </div>

            {/* Conditional Referral Fields */}
            {formData.source === 'Referral' && (
              <>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Referral Name "
                    placeholder="e.g. Dr. Swaminathan"
                    required={true}
                    value={formData.referralName}
                    onChange={(e) => handleInputChange('referralName', e.target.value)}
                    error={formErrors.referralName}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Referral Organization"
                    placeholder="e.g. Kovai Medical Center"
                    value={formData.referralOrg}
                    onChange={(e) => handleInputChange('referralOrg', e.target.value)}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Referral Mobile"
                    placeholder="e.g. 9790123456"
                    value={formData.referralMobile}
                    onChange={(e) => handleInputChange('referralMobile', e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Conditional Campaign Selection */}
            {formData.source === 'Campaign' && (
              <div className="col-12 col-md-6">
                <Dropdown
                  label="Select Campaign "
                  options={mockCampaignsList.map((c) => `${c.id} — ${c.name}`)}
                  value={formData.campaignId ? `${formData.campaignId} — ${mockCampaignsList.find(c => c.id === formData.campaignId)?.name || ''}` : `${mockCampaignsList[0].id} — ${mockCampaignsList[0].name}`}
                  onChange={(e) => {
                    const cid = e.target.value.split(' — ')[0];
                    handleInputChange('campaignId', cid);
                  }}
                />
              </div>
            )}

            {/* Conditional Conference Selection */}
            {formData.source === 'Conference/Event' && (
              <div className="col-12 col-md-6">
                <InputField
                  label="Conference / Event Name "
                  placeholder="e.g. South India Healthcare Expo 2026"
                  value={formData.conferenceName}
                  onChange={(e) => handleInputChange('conferenceName', e.target.value)}
                />
              </div>
            )}
          </div>

          {/* SECTION 4 — PRIORITY & AUTO-ASSIGNMENT */}
          <div className="enquiry-form-section-header">
            <ShieldAlert size={18} />
            <span>SECTION 4 — PRIORITY & AUTO-ASSIGNMENT ENGINE</span>
          </div>
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-4">
              <Dropdown
              label="Priority "
                options={mockPriorities}
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
              />
            </div>
            <div className="col-12 col-md-4">
              <Dropdown
                label="Target Department "
                options={mockDepartmentData}
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
              />
            </div>
            <div className="col-12 col-md-4">
              <InputField
                label="Assigned Employee (Auto-Determined)"
                value={formData.assignedEmployeeName}
                disabled={true}
              />
            </div>
          </div>

          {/* SECTION 5 — PRODUCT INTEREST */}
          <div className="enquiry-form-section-header">
            <Package size={18} />
            <span>SECTION 5 — PRODUCT INTEREST</span>
          </div>
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6">
              <Dropdown
                label="Product Category "
                options={mockProductCategories}
                value={formData.productCategory}
                onChange={(e) => handleInputChange('productCategory', e.target.value)}
              />
            </div>
            <div className="col-12 col-md-6">
              <Dropdown
                label="Product"
                options={availableProducts}
                value={formData.product}
                onChange={(e) => handleInputChange('product', e.target.value)}
              />
            </div>
            <div className="col-12 col-md-6">
              <Dropdown
                label="Service Interested"
                options={['One-Time Purchase', 'Subscription']}
                value={formData.serviceInterested}
                onChange={(e) => handleInputChange('serviceInterested', e.target.value)}
              />
            </div>
            {formData.serviceInterested === 'Subscription' && (
              <div className="col-12 col-md-6">
                <Dropdown
                  label="Subscription Frequency"
                  options={['Monthly', 'Half-Yearly', 'Yearly']}
                  value={formData.subscriptionFrequency}
                  onChange={(e) => handleInputChange('subscriptionFrequency', e.target.value)}
                />
              </div>
            )}
          </div>

          {/* SECTION 6 — PURCHASE INFORMATION */}
          <div className="enquiry-form-section-header">
            <Clock size={18} />
            <span>SECTION 6 — PURCHASE INFORMATION</span>
          </div>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <Dropdown
                label="Expected Purchase Timeframe"
                options={mockTimeframes}
                value={formData.expectedTimeframe}
                onChange={(e) => handleInputChange('expectedTimeframe', e.target.value)}
              />
            </div>
            <div className="col-12 col-md-6">
              <InputField
                label="Budget (₹)"
                type="number"
                placeholder="e.g. 1250000"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
              />
            </div>
            <div className="col-12">
              <InputField
                label="Remarks / Notes"
                type="textarea"
                rows={2}
                placeholder="Enter customer specific requirements or notes..."
                value={formData.remarks}
                onChange={(e) => handleInputChange('remarks', e.target.value)}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* 4. VIEW ENQUIRY MODAL */}
      <Modal
        show={isViewModalOpen}
        onHide={() => setIsViewModalOpen(false)}
        title={selectedEnquiry ? `Enquiry Details (${selectedEnquiry.enquiryId})` : 'View Enquiry'}
        size="lg"
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
        {selectedEnquiry && (
          <div className="py-2">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <InputField label="Enquiry ID" value={selectedEnquiry.enquiryId} disabled={true} />
              </div>
              <div className="col-12 col-md-6">
                <InputField label="Customer Name" value={selectedEnquiry.customerName} disabled={true} />
              </div>
              <div className="col-12 col-md-6">
                <InputField label="Contact Person" value={selectedEnquiry.contactPerson} disabled={true} />
              </div>
              <div className="col-12 col-md-6">
                <InputField label="Mobile" value={selectedEnquiry.mobile} disabled={true} />
              </div>
              <div className="col-12 col-md-6">
                <InputField label="Email" value={selectedEnquiry.email || '—'} disabled={true} />
              </div>
              <div className="col-12 col-md-6">
                <InputField label="Customer Type" value={selectedEnquiry.customerType} disabled={true} />
              </div>
              <div className="col-12 col-md-4">
                <InputField label="Territory" value={selectedEnquiry.territory || selectedEnquiry.state} disabled={true} />
              </div>
              <div className="col-12 col-md-4">
                <InputField label="District" value={selectedEnquiry.district || '—'} disabled={true} />
              </div>
              <div className="col-12 col-md-4">
                <InputField label="City" value={selectedEnquiry.city || '—'} disabled={true} />
              </div>
              <div className="col-12 col-md-4">
                <InputField label="Source" value={selectedEnquiry.source} disabled={true} />
              </div>
              <div className="col-12 col-md-4">
                <InputField label="Priority" value={selectedEnquiry.priority} disabled={true} />
              </div>
              <div className="col-12 col-md-4">
                <InputField label="Assigned Employee" value={selectedEnquiry.assignedEmployeeName} disabled={true} />
              </div>
              <div className="col-12 col-md-6">
                <InputField label="Product Category" value={selectedEnquiry.productCategory} disabled={true} />
              </div>
              <div className="col-12 col-md-6">
                <InputField label="Product" value={selectedEnquiry.product} disabled={true} />
              </div>
              <div className="col-12 col-md-6">
                <InputField label="Service Interested" value={selectedEnquiry.serviceInterested} disabled={true} />
              </div>
              <div className="col-12 col-md-6">
                <InputField label="Expected Timeframe" value={selectedEnquiry.expectedTimeframe} disabled={true} />
              </div>
              <div className="col-12 col-md-6">
                <InputField label="Budget (₹)" value={selectedEnquiry.budget ? `₹ ${selectedEnquiry.budget}` : '—'} disabled={true} />
              </div>
              <div className="col-12 col-md-6">
                <InputField label="Status" value={selectedEnquiry.status} disabled={true} />
              </div>
              <div className="col-12">
                <InputField label="Remarks" type="textarea" rows={2} value={selectedEnquiry.remarks || '—'} disabled={true} />
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 5. DUPLICATE WARNING MODAL */}
      <Modal
        show={isDuplicateModalOpen}
        onHide={() => setIsDuplicateModalOpen(false)}
        title="Possible Duplicate Enquiry"
        size="md"
        centered={true}
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            <Button
              variant="outline-secondary"
              onClick={() => setIsDuplicateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="info"
              onClick={() => {
                setIsDuplicateModalOpen(false);
                if (duplicateMatch) navigate(`/masters/enquiries/${duplicateMatch.enquiryId}/view`);
              }}
            >
              Open Existing Enquiry
            </Button>
            <Button
              variant="warning"
              onClick={() => {
                if (pendingSubmitData) executeCreateEnquiry(pendingSubmitData);
              }}
            >
              Continue Anyway
            </Button>
          </div>
        }
      >
        {duplicateMatch && (
          <div className="py-2">
            <div className="d-flex align-items-center gap-2 text-warning mb-3">
              <AlertTriangle size={24} />
              <h6 className="mb-0 fw-bold text-dark">Matching Contact Record Found</h6>
            </div>
            <p className="small text-muted mb-3">
              An existing enquiry (<strong>{duplicateMatch.enquiryId}</strong>) with matching Mobile (
              <strong>{duplicateMatch.mobile}</strong>) or Email (<strong>{duplicateMatch.email}</strong>) was created within the last 6 months (
              {duplicateMatch.enquiryDate}).
            </p>
            <div className="p-3 bg-light rounded border small text-dark mb-3">
              <div><strong>Enquiry ID:</strong> {duplicateMatch.enquiryId}</div>
              <div><strong>Customer Name:</strong> {duplicateMatch.customerName}</div>
              <div><strong>Contact Person:</strong> {duplicateMatch.contactPerson}</div>
              <div><strong>Mobile:</strong> {duplicateMatch.mobile}</div>
              <div><strong>Email:</strong> {duplicateMatch.email}</div>
              <div><strong>Enquiry Date:</strong> {duplicateMatch.enquiryDate}</div>
              <div><strong>Assigned Employee:</strong> {duplicateMatch.assignedEmployeeName}</div>
              <div><strong>Status:</strong> {duplicateMatch.status}</div>
            </div>
            <p className="small text-dark mb-0 fw-semibold">
              Please choose whether to cancel, view the existing enquiry, or continue saving a new record anyway.
            </p>
          </div>
        )}
      </Modal>

      {/* 6. CONVERT TO LEAD MODAL */}
      <Modal
        show={isConvertModalOpen}
        onHide={() => setIsConvertModalOpen(false)}
        title="Convert Enquiry to Lead"
        size="md"
        centered={true}
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            <Button
              variant="outline-secondary"
              onClick={() => setIsConvertModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleConfirmConvertToLead}
            >
              Convert to Lead
            </Button>
          </div>
        }
      >
        {selectedEnquiry && (
          <div className="py-2">
            <div className="d-flex align-items-center gap-2 text-success mb-3">
              <CheckCircle2 size={24} />
              <h6 className="mb-0 fw-bold text-dark">Confirm Lead Conversion</h6>
            </div>
            <p className="text-dark small mb-3">
              Are you sure you want to convert Enquiry <strong>{selectedEnquiry.enquiryId}</strong> (
              {selectedEnquiry.customerName}) into an active Lead?
            </p>
            <div className="p-3 bg-light rounded border small text-dark mb-0">
              <div><strong>Product Interest:</strong> {selectedEnquiry.productCategory} — {selectedEnquiry.product}</div>
              <div><strong>Target Timeframe:</strong> {selectedEnquiry.expectedTimeframe}</div>
              <div><strong>Disclosed Budget:</strong> ₹ {selectedEnquiry.budget || 'N/A'}</div>
            </div>
          </div>
        )}
      </Modal>

      {/* 7. DELETE CONFIRMATION MODAL */}
      <Modal
        show={isDeleteModalOpen}
        onHide={() => setIsDeleteModalOpen(false)}
        title="Delete Enquiry"
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
        {selectedEnquiry && (
          <div className="py-2">
            <p className="text-dark fs-6 mb-0">
              Are you sure you want to delete Enquiry "{selectedEnquiry.enquiryId}"?
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Enquiry;
