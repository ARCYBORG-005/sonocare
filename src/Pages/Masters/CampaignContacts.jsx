import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { Helmet } from 'react-helmet-async';
import { InputField, Dropdown } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import { Users, Plus, Upload, Download, Eye, Pencil, Trash2, Search, Filter, PhoneCall } from 'lucide-react';
import '../../styles/CampaignContacts.css';
import { initialMockCampaignContacts } from './mockCampaignContacts';
import { mockStateData } from './mockEmployees';
import { mockDistrictMasterData, mockCityMasterData } from './mockCustomers';

// Mock Customer Types
const mockCustomerTypes = ['Hospital', 'Diagnostic Lab', 'Clinic', 'Other'];

// Mock Campaigns for Lookup / Dropdowns
const mockCampaignList = [
  { campaignId: 'CMP-001', campaignName: 'National Radiology Expo 2026' },
  { campaignId: 'CMP-002', campaignName: 'Q1 Diagnostic Scanner Promo' },
  { campaignId: 'CMP-003', campaignName: 'Cardiology Scanner Launch' },
  { campaignId: 'CMP-004', campaignName: 'Hospital AMC Renewal Drive' },
  { campaignId: 'CMP-005', campaignName: 'Medica South Asia Summit' }
];

const CampaignContacts = () => {
  const navigate = useNavigate();
  // --- LOCAL MOCK STATE ---
  const [contacts, setContacts] = useState(initialMockCampaignContacts);

  // --- FILTER STATES ---
  const [searchQuery, setSearchQuery] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('');
  const [customerTypeFilter, setCustomerTypeFilter] = useState('');
  const [territoryFilter, setTerritoryFilter] = useState('');

  // --- MODAL STATES ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // --- SELECTED CONTACT & FORM STATES ---
  const [selectedContact, setSelectedContact] = useState(null);
  const [importCampaignId, setImportCampaignId] = useState('CMP-001');

  // File Input Ref for Excel/CSV Import
  const fileInputRef = useRef(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    contactId: '',
    campaignId: 'CMP-001',
    contactName: '',
    customerType: 'Hospital',
    otherCustomerType: '',
    email: '',
    mobile: '',
    institution: '',
    speciality: '',
    territory: '',
    district: '',
    city: '',
    pincode: '',
    address: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // Cascading Location Logic
  const availableDistricts = useMemo(() => {
    if (!formData.territory) return [];
    return mockDistrictMasterData[formData.territory] || [];
  }, [formData.territory]);

  const availableCities = useMemo(() => {
    if (!formData.district) return [];
    return mockCityMasterData[formData.district] || [];
  }, [formData.district]);

  // Auto-generate next Campaign Contact ID (CC-008...)
  const nextContactId = useMemo(() => {
    if (!contacts || contacts.length === 0) return 'CC-001';
    const nums = contacts
      .map((c) => parseInt((c.contactId || '').replace('CC-', ''), 10))
      .filter(Boolean);
    const maxNum = nums.length > 0 ? Math.max(...nums) : 0;
    return `CC-${String(maxNum + 1).padStart(3, '0')}`;
  }, [contacts]);

  // --- FILTERED DATA ---
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchId = c.contactId && c.contactId.toLowerCase().includes(q);
        const matchCampId = c.campaignId && c.campaignId.toLowerCase().includes(q);
        const matchName = c.contactName && c.contactName.toLowerCase().includes(q);
        const matchMobile = c.mobile && c.mobile.includes(q);
        const matchEmail = c.email && c.email.toLowerCase().includes(q);
        const matchInst = c.institution && c.institution.toLowerCase().includes(q);

        if (!matchId && !matchCampId && !matchName && !matchMobile && !matchEmail && !matchInst) {
          return false;
        }
      }

      // Campaign Filter
      if (campaignFilter && c.campaignId !== campaignFilter) {
        return false;
      }

      // Customer Type Filter
      if (customerTypeFilter && c.customerType !== customerTypeFilter) {
        return false;
      }

      // Territory Filter
      if (territoryFilter && c.territory !== territoryFilter) {
        return false;
      }

      return true;
    });
  }, [contacts, searchQuery, campaignFilter, customerTypeFilter, territoryFilter]);

  // --- FORM CHANGE HANDLERS ---
  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'customerType' && value !== 'Other') {
        updated.otherCustomerType = '';
      }
      if (field === 'territory') {
        updated.district = '';
        updated.city = '';
      } else if (field === 'district') {
        updated.city = '';
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

  // --- ADD CONTACT HANDLERS ---
  const handleOpenAddModal = () => {
    setFormData({
      contactId: nextContactId,
      campaignId: campaignFilter || 'CMP-001',
      contactName: '',
      customerType: 'Hospital',
      otherCustomerType: '',
      email: '',
      mobile: '',
      institution: '',
      speciality: '',
      territory: '',
      district: '',
      city: '',
      pincode: '',
      address: ''
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleSaveAddContact = () => {
    const errors = {};
    if (!formData.campaignId) errors.campaignId = 'Campaign ID is required';
    if (!formData.contactName.trim()) errors.contactName = 'Contact Name is required';
    if (!formData.customerType) errors.customerType = 'Customer Type is required';
    if (formData.customerType === 'Other' && !formData.otherCustomerType.trim()) {
      errors.otherCustomerType = 'Please specify Other Customer Type';
    }
    if (!formData.mobile.trim()) {
      errors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile.trim())) {
      errors.mobile = 'Mobile number must be exactly 10 digits';
    }
    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email.trim())) {
      errors.email = 'Invalid email address';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const trimmedEmail = formData.email.trim().toLowerCase();
    const trimmedMobile = formData.mobile.trim();
    const targetCampaignId = formData.campaignId;

    // Check SRS Duplicate Rule: Email + Mobile + Campaign ID
    const existingIndex = contacts.findIndex(
      (c) =>
        c.campaignId === targetCampaignId &&
        c.mobile === trimmedMobile &&
        (trimmedEmail === '' || (c.email || '').toLowerCase() === trimmedEmail)
    );

    if (existingIndex !== -1) {
      // UPDATE Existing Record
      setContacts((prev) => {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          contactName: formData.contactName.trim(),
          customerType: formData.customerType,
          otherCustomerType: formData.customerType === 'Other' ? formData.otherCustomerType.trim() : '',
          email: formData.email.trim(),
          institution: formData.institution ? formData.institution.trim() : '',
          speciality: formData.speciality ? formData.speciality.trim() : '',
          territory: formData.territory || '',
          district: formData.district || '',
          city: formData.city || '',
          pincode: formData.pincode ? formData.pincode.trim() : '',
          address: formData.address ? formData.address.trim() : ''
        };
        return updated;
      });
      toast.info(`Duplicate contact detected in ${targetCampaignId}. Existing record updated successfully.`);
    } else {
      // CREATE New Record
      const newContact = {
        id: Date.now(),
        contactId: formData.contactId || nextContactId,
        campaignId: targetCampaignId,
        contactName: formData.contactName.trim(),
        customerType: formData.customerType,
        otherCustomerType: formData.customerType === 'Other' ? formData.otherCustomerType.trim() : '',
        email: formData.email.trim(),
        mobile: trimmedMobile,
        institution: formData.institution ? formData.institution.trim() : '',
        speciality: formData.speciality ? formData.speciality.trim() : '',
        territory: formData.territory || '',
        district: formData.district || '',
        city: formData.city || '',
        pincode: formData.pincode ? formData.pincode.trim() : '',
        address: formData.address ? formData.address.trim() : ''
      };
      setContacts((prev) => [newContact, ...prev]);
      toast.success('Campaign contact added successfully');
    }

    setIsAddModalOpen(false);
  };

  // --- EDIT CONTACT HANDLERS ---
  const handleOpenEditModal = (contact) => {
    setSelectedContact(contact);
    setFormData({
      contactId: contact.contactId,
      campaignId: contact.campaignId,
      contactName: contact.contactName || '',
      customerType: contact.customerType || 'Hospital',
      otherCustomerType: contact.otherCustomerType || '',
      email: contact.email || '',
      mobile: contact.mobile || '',
      institution: contact.institution || '',
      speciality: contact.speciality || '',
      territory: contact.territory || '',
      district: contact.district || '',
      city: contact.city || '',
      pincode: contact.pincode || '',
      address: contact.address || ''
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleSaveEditContact = () => {
    const errors = {};
    if (!formData.contactName.trim()) errors.contactName = 'Contact Name is required';
    if (!formData.customerType) errors.customerType = 'Customer Type is required';
    if (formData.customerType === 'Other' && !formData.otherCustomerType.trim()) {
      errors.otherCustomerType = 'Please specify Other Customer Type';
    }
    if (!formData.mobile.trim()) {
      errors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile.trim())) {
      errors.mobile = 'Mobile number must be exactly 10 digits';
    }
    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email.trim())) {
      errors.email = 'Invalid email address';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const trimmedEmail = formData.email.trim().toLowerCase();
    const trimmedMobile = formData.mobile.trim();
    const targetCampaignId = formData.campaignId;

    // Check SRS Duplicate Rule (Exclude current editing contact)
    const duplicateExists = contacts.some(
      (c) =>
        c.contactId !== formData.contactId &&
        c.campaignId === targetCampaignId &&
        c.mobile === trimmedMobile &&
        (trimmedEmail === '' || (c.email || '').toLowerCase() === trimmedEmail)
    );

    if (duplicateExists) {
      setFormErrors({ mobile: `Another contact with this Email & Mobile already exists in ${targetCampaignId}` });
      return;
    }

    setContacts((prev) =>
      prev.map((c) =>
        c.contactId === formData.contactId
          ? {
              ...c,
              contactName: formData.contactName.trim(),
              customerType: formData.customerType,
              otherCustomerType: formData.customerType === 'Other' ? formData.otherCustomerType.trim() : '',
              email: formData.email.trim(),
              mobile: trimmedMobile,
              institution: formData.institution ? formData.institution.trim() : '',
              speciality: formData.speciality ? formData.speciality.trim() : '',
              territory: formData.territory || '',
              district: formData.district || '',
              city: formData.city || '',
              pincode: formData.pincode ? formData.pincode.trim() : '',
              address: formData.address ? formData.address.trim() : ''
            }
          : c
      )
    );

    setIsEditModalOpen(false);
    setSelectedContact(null);
    toast.success('Campaign contact updated successfully');
  };

  // --- VIEW CONTACT HANDLER ---
  const handleOpenViewModal = (contact) => {
    setSelectedContact(contact);
    setFormData({
      contactId: contact.contactId,
      campaignId: contact.campaignId,
      contactName: contact.contactName || '—',
      customerType: contact.customerType || '—',
      otherCustomerType: contact.otherCustomerType || '—',
      email: contact.email || '—',
      mobile: contact.mobile || '—',
      institution: contact.institution || '—',
      speciality: contact.speciality || '—',
      territory: contact.territory || '—',
      district: contact.district || '—',
      city: contact.city || '—',
      pincode: contact.pincode || '—',
      address: contact.address || '—'
    });
    setIsViewModalOpen(true);
  };

  // --- DELETE CONTACT HANDLERS ---
  const handleOpenDeleteModal = (contact) => {
    setSelectedContact(contact);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedContact) return;
    setContacts((prev) => prev.filter((c) => c.contactId !== selectedContact.contactId));
    setIsDeleteModalOpen(false);
    setSelectedContact(null);
    toast.success('Campaign contact deleted successfully');
  };

  // --- DOWNLOAD CSV TEMPLATE ---
  const handleDownloadTemplate = () => {
    const headers = [
      'Contact Name',
      'Customer Type',
      'Other Customer Type',
      'Email',
      'Mobile',
      'Hospital / Institution',
      'Speciality',
      'Territory',
      'District',
      'City',
      'Pincode',
      'Address'
    ];

    const sampleRow = [
      'Dr. Anandan K',
      'Hospital',
      '',
      'anandan@cityhospital.com',
      '9840998877',
      'City Care Hospital',
      'Cardiology',
      'Tamil Nadu',
      'Chennai',
      'Chennai',
      '600004',
      'Mylapore, Chennai'
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), sampleRow.map((field) => `"${field}"`).join(',')].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Campaign_Contacts_Import_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Excel/CSV Import Template downloaded');
  };

  // --- EXCEL / CSV BULK IMPORT HANDLERS ---
  const handleOpenImportModal = () => {
    setImportCampaignId(campaignFilter || 'CMP-001');
    setIsImportModalOpen(true);
  };

  const handleTriggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target.result;
      parseAndImportCSV(content, importCampaignId);
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const parseAndImportCSV = (csvText, targetCampaignId) => {
    const lines = csvText.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
    if (lines.length <= 1) {
      toast.error('CSV file is empty or missing data rows');
      return;
    }

    let newCount = 0;
    let updateCount = 0;
    let failedCount = 0;

    let currentMaxId = contacts.reduce((max, c) => {
      const num = parseInt((c.contactId || '').replace('CC-', ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);

    const updatedContactsList = [...contacts];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Basic CSV split considering quotes
      const cells = line.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/).map((cell) => cell.replace(/^"|"$/g, '').trim());

      const [
        contactName,
        customerType,
        otherCustomerType,
        email,
        mobile,
        institution,
        speciality,
        territory,
        district,
        city,
        pincode,
        address
      ] = cells;

      // Validation
      if (!contactName || !mobile || !customerType) {
        failedCount++;
        continue;
      }

      const trimmedMobile = mobile.replace(/\D/g, '');
      if (trimmedMobile.length !== 10) {
        failedCount++;
        continue;
      }

      const validCustType = mockCustomerTypes.includes(customerType) ? customerType : 'Hospital';
      const trimmedEmail = (email || '').toLowerCase().trim();

      // SRS Duplicate Logic: Match Email + Mobile + Campaign ID
      const existingIdx = updatedContactsList.findIndex(
        (c) =>
          c.campaignId === targetCampaignId &&
          c.mobile === trimmedMobile &&
          (trimmedEmail === '' || (c.email || '').toLowerCase() === trimmedEmail)
      );

      if (existingIdx !== -1) {
        // UPDATE Existing Record
        updatedContactsList[existingIdx] = {
          ...updatedContactsList[existingIdx],
          contactName: contactName.trim(),
          customerType: validCustType,
          otherCustomerType: validCustType === 'Other' ? (otherCustomerType || '').trim() : '',
          email: trimmedEmail,
          institution: (institution || '').trim(),
          speciality: (speciality || '').trim(),
          territory: (territory || '').trim(),
          district: (district || '').trim(),
          city: (city || '').trim(),
          pincode: (pincode || '').trim(),
          address: (address || '').trim()
        };
        updateCount++;
      } else {
        // CREATE New Record
        currentMaxId++;
        const newContact = {
          id: Date.now() + Math.random(),
          contactId: `CC-${String(currentMaxId).padStart(3, '0')}`,
          campaignId: targetCampaignId,
          contactName: contactName.trim(),
          customerType: validCustType,
          otherCustomerType: validCustType === 'Other' ? (otherCustomerType || '').trim() : '',
          email: trimmedEmail,
          mobile: trimmedMobile,
          institution: (institution || '').trim(),
          speciality: (speciality || '').trim(),
          territory: (territory || '').trim(),
          district: (district || '').trim(),
          city: (city || '').trim(),
          pincode: (pincode || '').trim(),
          address: (address || '').trim()
        };
        updatedContactsList.unshift(newContact);
        newCount++;
      }
    }

    setContacts(updatedContactsList);
    setIsImportModalOpen(false);

    toast.success(
      `Import Summary: Total Rows: ${lines.length - 1} | New: ${newCount} | Updated/Duplicates: ${updateCount} | Failed: ${failedCount}`
    );
  };

  // --- TABLE COLUMNS CONFIGURATION (14 COLUMNS) ---
  const columns = [
    {
      key: 'contactId',
      title: 'CAMPAIGN CONTACT ID',
      sortable: true,
      render: (val) => <span className="badge bg-secondary font-monospace">{val}</span>
    },
    {
      key: 'campaignId',
      title: 'CAMPAIGN ID',
      sortable: true,
      render: (val) => <span className="badge bg-info text-dark font-monospace">{val}</span>
    },
    {
      key: 'contactName',
      title: 'CONTACT NAME',
      sortable: true,
      render: (val) => <span className="fw-bold text-dark">{val}</span>
    },
    {
      key: 'customerType',
      title: 'CUSTOMER TYPE',
      sortable: true,
      render: (val, row) => (
        <span className="badge bg-light text-dark border">
          {val === 'Other' && row.otherCustomerType ? `Other (${row.otherCustomerType})` : val}
        </span>
      )
    },
    {
      key: 'mobile',
      title: 'MOBILE',
      sortable: true,
      render: (val) => <span className="small text-dark font-monospace">{val}</span>
    },
    {
      key: 'email',
      title: 'EMAIL',
      sortable: true,
      render: (val) => <span className="small text-muted">{val || '—'}</span>
    },
    {
      key: 'institution',
      title: 'HOSPITAL / INSTITUTION',
      sortable: true,
      render: (val) => (
        <span className="small text-dark text-truncate d-inline-block" style={{ maxWidth: '160px' }} title={val}>
          {val || '—'}
        </span>
      )
    },
    {
      key: 'speciality',
      title: 'SPECIALITY',
      sortable: true,
      render: (val) => <span className="small text-dark">{val || '—'}</span>
    },
    {
      key: 'territory',
      title: 'TERRITORY',
      sortable: true,
      render: (val) => <span className="small text-dark">{val || '—'}</span>
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
      key: 'pincode',
      title: 'PINCODE',
      sortable: true,
      render: (val) => <span className="small text-muted">{val || '—'}</span>
    }
  ];

  // Table Actions (View, Edit, Log Outreach, Delete)
  const tableActions = (row) => (
    <div className="category-actions-container">
      <button
        type="button"
        className="category-action-btn view-btn"
        title="View Contact"
        aria-label={`View ${row.contactName}`}
        onClick={() => handleOpenViewModal(row)}
      >
        <Eye size={15} color="#2563EB" />
      </button>

      <button
        type="button"
        className="category-action-btn edit-btn"
        title="Edit Contact"
        aria-label={`Edit ${row.contactName}`}
        onClick={() => handleOpenEditModal(row)}
      >
        <Pencil size={15} color="#16A34A" />
      </button>

      

      <button
        type="button"
        className="category-action-btn delete-btn ms-1"
        title="Delete Contact"
        aria-label={`Delete ${row.contactName}`}
        onClick={() => handleOpenDeleteModal(row)}
      >
        <Trash2 size={15} color="#DC2626" />
      </button>
    </div>
  );

  return (
    <div className="campaign-contacts-page container-fluid px-0 px-md-1">
      <Helmet>
        <title>Campaign Contacts | Sonocare CRM</title>
        <meta name="description" content="Manage campaign contacts, manual entry, and Excel/CSV bulk import in Sonocare CRM." />
      </Helmet>
      <ToastContainer />

      {/* Hidden File Input for CSV Upload */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".csv,.txt"
        onChange={handleFileUpload}
      />

      {/* 1. TOP HEADER SECTION */}
      <div className="category-page-header">
        <div className="category-page-title-group">
          <Users size={28} style={{ color: '#2E3192' }} />
          <h1 className="category-page-title">Campaign Contacts</h1>
        </div>

        <div className="campaign-contacts-header-actions">
          <button
            type="button"
            className="campaign-contacts-action-btn add-btn"
            onClick={handleOpenAddModal}
          >
            <Plus size={18} />
            <span> Add Contact</span>
          </button>

          <button
            type="button"
            className="campaign-contacts-action-btn import-btn"
            onClick={handleOpenImportModal}
          >
            <Upload size={16} />
            <span>Import Excel/CSV</span>
          </button>

          <button
            type="button"
            className="campaign-contacts-action-btn template-btn"
            onClick={handleDownloadTemplate}
          >
            <Download size={16} />
            <span>Download Template</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN CARD CONTAINER */}
      <div className="category-card">
        {/* Card Header & Search / Filters */}
        <div className="category-card-header pb-3 border-bottom">
          <h2 className="category-card-title">Campaign Contacts Register</h2>

          {/* Search Box */}
          <div className="category-search-wrapper">
            <Search size={16} className="category-search-icon" />
            <input
              type="text"
              className="category-search-input"
              placeholder="Search Contact ID, Name, Mobile, Email..."
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

            {/* Campaign ID Filter */}
            <div className="col-12 col-sm-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={campaignFilter}
                onChange={(e) => setCampaignFilter(e.target.value)}
              >
                <option value="">All Campaigns</option>
                {mockCampaignList.map((c) => (
                  <option key={c.campaignId} value={c.campaignId}>
                    {c.campaignId} ({c.campaignName})
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Type Filter */}
            <div className="col-12 col-sm-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={customerTypeFilter}
                onChange={(e) => setCustomerTypeFilter(e.target.value)}
              >
                <option value="">All Customer Types</option>
                {mockCustomerTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Territory Filter */}
            <div className="col-12 col-sm-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={territoryFilter}
                onChange={(e) => setTerritoryFilter(e.target.value)}
              >
                <option value="">All Territories</option>
                {mockStateData.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {(campaignFilter || customerTypeFilter || territoryFilter || searchQuery) && (
              <div className="col-12 col-md-auto ms-auto">
                <button
                  type="button"
                  className="btn btn-sm btn-link text-decoration-none text-danger p-0 fw-semibold"
                  onClick={() => {
                    setCampaignFilter('');
                    setCustomerTypeFilter('');
                    setTerritoryFilter('');
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
            data={filteredContacts}
            showSerialNumber={true}
            serialNumberHeader="S.No"
            actions={tableActions}
            actionHeader="ACTIONS"
            actionWidth="130px"
            emptyMessage="No campaign contacts found"
            emptyIcon="bi-person-badge"
            paginated={true}
            pageSizeOptions={[10, 25, 50]}
            defaultPageSize={10}
            tableClassName="category-custom-table"
            bordered={false}
            striped={false}
            hover={true}
            minWidth="1400px"
          />
        </div>
      </div>

      {/* 3. ADD CONTACT MODAL */}
      <Modal
        show={isAddModalOpen}
        onHide={() => setIsAddModalOpen(false)}
        title="Add Campaign Contact"
        size="lg"
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
              onClick={handleSaveAddContact}
            >
              Save Contact
            </Button>
          </div>
        }
      >
        <div className="py-2">
          {/* SECTION 1 — CONTACT DETAILS */}
          <div className="campaign-contacts-form-section-title">
            SECTION 1 — CONTACT DETAILS
          </div>
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6">
              <Dropdown
                label="Campaign ID *"
                options={mockCampaignList.map((c) => c.campaignId)}
                value={formData.campaignId}
                onChange={(e) => handleInputChange('campaignId', e.target.value)}
                error={formErrors.campaignId}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="Contact Name *"
                placeholder="e.g. Dr. Arunkumar V"
                required={true}
                value={formData.contactName}
                onChange={(e) => handleInputChange('contactName', e.target.value)}
                error={formErrors.contactName}
              />
            </div>

            <div className="col-12 col-md-6">
              <Dropdown
                label="Customer Type *"
                options={mockCustomerTypes}
                value={formData.customerType}
                onChange={(e) => handleInputChange('customerType', e.target.value)}
                error={formErrors.customerType}
              />
            </div>

            {/* Display ONLY when Customer Type = Other */}
            {formData.customerType === 'Other' && (
              <div className="col-12 col-md-6">
                <InputField
                  label="Other Customer Type *"
                  placeholder="e.g. Research Center / Medical College"
                  required={true}
                  value={formData.otherCustomerType}
                  onChange={(e) => handleInputChange('otherCustomerType', e.target.value)}
                  error={formErrors.otherCustomerType}
                />
              </div>
            )}

            <div className="col-12 col-md-6">
              <InputField
                label="Mobile *"
                placeholder="10-digit mobile number"
                required={true}
                value={formData.mobile}
                onChange={(e) => handleInputChange('mobile', e.target.value)}
                error={formErrors.mobile}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="Email"
                type="email"
                placeholder="e.g. doctor@hospital.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={formErrors.email}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="Hospital / Institution"
                placeholder="e.g. Apollo Speciality Hospital"
                value={formData.institution}
                onChange={(e) => handleInputChange('institution', e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="Speciality"
                placeholder="e.g. Radiology / Cardiology"
                value={formData.speciality}
                onChange={(e) => handleInputChange('speciality', e.target.value)}
              />
            </div>
          </div>

          {/* SECTION 2 — LOCATION */}
          <div className="campaign-contacts-form-section-title">
            SECTION 2 — LOCATION
          </div>
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <Dropdown
                label="Territory"
                options={mockStateData}
                value={formData.territory}
                onChange={(e) => handleInputChange('territory', e.target.value)}
              />
            </div>

            <div className="col-12 col-md-4">
              <Dropdown
                label="District"
                options={availableDistricts}
                value={formData.district}
                disabled={!formData.territory}
                onChange={(e) => handleInputChange('district', e.target.value)}
              />
            </div>

            <div className="col-12 col-md-4">
              <Dropdown
                label="City"
                options={availableCities}
                value={formData.city}
                disabled={!formData.district}
                onChange={(e) => handleInputChange('city', e.target.value)}
              />
            </div>

            <div className="col-12 col-md-4">
              <InputField
                label="Pincode"
                placeholder="e.g. 600006"
                value={formData.pincode}
                onChange={(e) => handleInputChange('pincode', e.target.value)}
              />
            </div>

            <div className="col-12 col-md-8">
              <InputField
                label="Address"
                type="textarea"
                rows={2}
                placeholder="Street address / landmark..."
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* 4. EDIT CONTACT MODAL */}
      <Modal
        show={isEditModalOpen}
        onHide={() => setIsEditModalOpen(false)}
        title="Edit Campaign Contact"
        size="lg"
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
              onClick={handleSaveEditContact}
            >
              Update Contact
            </Button>
          </div>
        }
      >
        <div className="py-2">
          {/* SECTION 1 — CONTACT DETAILS */}
          <div className="campaign-contacts-form-section-title">
            SECTION 1 — CONTACT DETAILS
          </div>
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6">
              <InputField
                label="Campaign Contact ID"
                value={formData.contactId}
                disabled={true}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="Campaign ID"
                value={formData.campaignId}
                disabled={true}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="Contact Name *"
                placeholder="Contact Name"
                required={true}
                value={formData.contactName}
                onChange={(e) => handleInputChange('contactName', e.target.value)}
                error={formErrors.contactName}
              />
            </div>

            <div className="col-12 col-md-6">
              <Dropdown
                label="Customer Type *"
                options={mockCustomerTypes}
                value={formData.customerType}
                onChange={(e) => handleInputChange('customerType', e.target.value)}
                error={formErrors.customerType}
              />
            </div>

            {formData.customerType === 'Other' && (
              <div className="col-12 col-md-6">
                <InputField
                  label="Other Customer Type *"
                  placeholder="Specify Other Type"
                  required={true}
                  value={formData.otherCustomerType}
                  onChange={(e) => handleInputChange('otherCustomerType', e.target.value)}
                  error={formErrors.otherCustomerType}
                />
              </div>
            )}

            <div className="col-12 col-md-6">
              <InputField
                label="Mobile *"
                placeholder="10-digit mobile"
                required={true}
                value={formData.mobile}
                onChange={(e) => handleInputChange('mobile', e.target.value)}
                error={formErrors.mobile}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={formErrors.email}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="Hospital / Institution"
                value={formData.institution}
                onChange={(e) => handleInputChange('institution', e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="Speciality"
                value={formData.speciality}
                onChange={(e) => handleInputChange('speciality', e.target.value)}
              />
            </div>
          </div>

          {/* SECTION 2 — LOCATION */}
          <div className="campaign-contacts-form-section-title">
            SECTION 2 — LOCATION
          </div>
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <Dropdown
                label="Territory"
                options={mockStateData}
                value={formData.territory}
                onChange={(e) => handleInputChange('territory', e.target.value)}
              />
            </div>

            <div className="col-12 col-md-4">
              <Dropdown
                label="District"
                options={availableDistricts}
                value={formData.district}
                disabled={!formData.territory}
                onChange={(e) => handleInputChange('district', e.target.value)}
              />
            </div>

            <div className="col-12 col-md-4">
              <Dropdown
                label="City"
                options={availableCities}
                value={formData.city}
                disabled={!formData.district}
                onChange={(e) => handleInputChange('city', e.target.value)}
              />
            </div>

            <div className="col-12 col-md-4">
              <InputField
                label="Pincode"
                value={formData.pincode}
                onChange={(e) => handleInputChange('pincode', e.target.value)}
              />
            </div>

            <div className="col-12 col-md-8">
              <InputField
                label="Address"
                type="textarea"
                rows={2}
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* 5. VIEW CONTACT MODAL */}
      <Modal
        show={isViewModalOpen}
        onHide={() => setIsViewModalOpen(false)}
        title="View Campaign Contact"
        size="lg"
        centered={true}
        footer={
          <Button
            variant="outline-secondary"
            onClick={() => setIsViewModalOpen(false)}
          >
            Close
          </Button>
        }
      >
        <div className="py-2">
          <div className="campaign-contacts-form-section-title">
            SECTION 1 — CONTACT DETAILS
          </div>
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6">
              <InputField label="Campaign Contact ID" value={formData.contactId} disabled={true} />
            </div>
            <div className="col-12 col-md-6">
              <InputField label="Campaign ID" value={formData.campaignId} disabled={true} />
            </div>
            <div className="col-12 col-md-6">
              <InputField label="Contact Name" value={formData.contactName} disabled={true} />
            </div>
            <div className="col-12 col-md-6">
              <InputField label="Customer Type" value={formData.customerType} disabled={true} />
            </div>
            {formData.customerType === 'Other' && (
              <div className="col-12 col-md-6">
                <InputField label="Other Customer Type" value={formData.otherCustomerType} disabled={true} />
              </div>
            )}
            <div className="col-12 col-md-6">
              <InputField label="Mobile" value={formData.mobile} disabled={true} />
            </div>
            <div className="col-12 col-md-6">
              <InputField label="Email" value={formData.email} disabled={true} />
            </div>
            <div className="col-12 col-md-6">
              <InputField label="Hospital / Institution" value={formData.institution} disabled={true} />
            </div>
            <div className="col-12 col-md-6">
              <InputField label="Speciality" value={formData.speciality} disabled={true} />
            </div>
          </div>

          <div className="campaign-contacts-form-section-title">
            SECTION 2 — LOCATION
          </div>
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <InputField label="Territory" value={formData.territory} disabled={true} />
            </div>
            <div className="col-12 col-md-4">
              <InputField label="District" value={formData.district} disabled={true} />
            </div>
            <div className="col-12 col-md-4">
              <InputField label="City" value={formData.city} disabled={true} />
            </div>
            <div className="col-12 col-md-4">
              <InputField label="Pincode" value={formData.pincode} disabled={true} />
            </div>
            <div className="col-12 col-md-8">
              <InputField label="Address" type="textarea" rows={2} value={formData.address} disabled={true} />
            </div>
          </div>
        </div>
      </Modal>

      {/* 6. DELETE CONFIRMATION MODAL */}
      <Modal
        show={isDeleteModalOpen}
        onHide={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
        size="sm"
        centered={true}
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            <Button variant="outline-secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Delete Contact
            </Button>
          </div>
        }
      >
        <div className="py-2 text-center">
          <p className="mb-1 text-dark">
            Are you sure you want to delete contact <strong>{selectedContact?.contactName}</strong>?
          </p>
          <p className="text-muted small mb-0">Contact ID: {selectedContact?.contactId}</p>
        </div>
      </Modal>

      {/* 7. PRE-IMPORT CAMPAIGN SELECTION MODAL */}
      <Modal
        show={isImportModalOpen}
        onHide={() => setIsImportModalOpen(false)}
        title="Import Excel / CSV Contacts"
        size="md"
        centered={true}
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            <Button variant="outline-secondary" onClick={() => setIsImportModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              style={{ backgroundColor: '#059669', borderColor: '#059669' }}
              onClick={handleTriggerFileInput}
            >
              Select CSV File & Import
            </Button>
          </div>
        }
      >
        <div className="py-2">
          <p className="small text-muted mb-3">
            Select the target <strong>Campaign ID</strong>. All imported contact rows will be automatically linked to this campaign. Duplicate contacts (matching Email + Mobile within the same Campaign) will update existing records.
          </p>

          <div className="mb-3">
            <Dropdown
              label="Select Target Campaign ID *"
              options={mockCampaignList.map((c) => c.campaignId)}
              value={importCampaignId}
              onChange={(e) => setImportCampaignId(e.target.value)}
            />
          </div>

          <div className="p-3 bg-light border rounded small">
            <div className="fw-bold mb-1 text-dark">Template Header Requirements (12 Fields):</div>
            <div className="text-muted font-monospace" style={{ fontSize: '0.75rem' }}>
              Contact Name, Customer Type, Other Customer Type, Email, Mobile, Hospital / Institution, Speciality, Territory, District, City, Pincode, Address
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CampaignContacts;
