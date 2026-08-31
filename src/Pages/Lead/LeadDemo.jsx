import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { InputField, Dropdown } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import {
  ArrowLeft,
  Video,
  Plus,
  Search,
  Filter,
  Building2,
  Tag,
  MapPin,
  UserCheck,
  CheckCircle2,
  Clock,
  Eye,
  Pencil,
  Trash2,
  PackagePlus,
  Package
} from 'lucide-react';
import '../../styles/Category.css';
import '../../styles/Lead.css';
import {
  initialMockLeads,
  initialMockDemos     
} from './mockLead';
import { initialMockProducts } from '../Masters/mockProducts';

const territoryOptions = ['Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Maharashtra', 'Other'];
const departmentOptions = ['Sales Team', 'Biomedical Engineering', 'Radiology Dept', 'Customer Support', 'Technical Services'];
const demoTypeOptions = ['Customer Site', 'Medialogic Site', 'Online'];
const demoStatusOptions = ['Scheduled', 'Rescheduled', 'Completed', 'Cancelled'];
const outcomeOptions = ['Interested', 'Not Interested', 'In Progress'];

const defaultCategories = [
  'Medical & Diagnostic Scanners',
  'Tooling & Accessories',
  'Machinery & Equipment',
  'Electrical & Automation',
  'General Healthcare Supplies'
];

const LeadDemo = ({
  leads = initialMockLeads,
  setLeads,
  demos = initialMockDemos,
  setDemos,
  employees = [],
  products = initialMockProducts
}) => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Selected Lead logic
  const targetLead = useMemo(() => {
    if (!id) return (leads || [])[0] || null;
    return (leads || []).find((l) => l.leadId === id || String(l.id) === String(id)) || (leads || [])[0] || null;
  }, [leads, id]);

  const [selectedLead, setSelectedLead] = useState(targetLead);

  // Sync selectedLead when targetLead changes via URL param
  useEffect(() => {
    if (targetLead) {
      setSelectedLead(targetLead);
    }
  }, [targetLead]);

  // Product List state (from mock products master)
  const [productList, setProductList] = useState(products || []);
  useEffect(() => {
    if (products && products.length > 0) {
      setProductList(products);
    }
  }, [products]);

  // Derive unique categories from product list
  const categoryOptions = useMemo(() => {
    const cats = new Set(defaultCategories);
    (productList || []).forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [productList]);

  // Employee Name Options
  const employeeOptions = useMemo(() => {
    if (!employees || employees.length === 0) {
      return ['Rajesh Kumar', 'Priya Sharma', 'Anand Verma', 'Karthik Subramanian', 'Unassigned'];
    }
    return employees.map((e) => e.name || e.employeeName || e.employeeId);
  }, [employees]);

  // Selected Products Table inside Form (Section 2)
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [editingProductIndex, setEditingProductIndex] = useState(null);

  // Product Selector Inputs
  const [currentCategory, setCurrentCategory] = useState('Medical & Diagnostic Scanners');
  const [currentProductName, setCurrentProductName] = useState('');

  // Products filtered by selected Category
  const filteredProductOptions = useMemo(() => {
    const matched = (productList || []).filter((p) => p.category === currentCategory);
    if (matched.length > 0) {
      return matched.map((p) => p.productName);
    }
    return (productList || []).map((p) => p.productName);
  }, [productList, currentCategory]);

  // Auto-set first product when category changes
  useEffect(() => {
    if (filteredProductOptions.length > 0) {
      setCurrentProductName(filteredProductOptions[0]);
    } else {
      setCurrentProductName('');
    }
  }, [currentCategory, filteredProductOptions]);

  // Main Form State
  const [formData, setFormData] = useState({
    location: '',
    territory: 'Tamil Nadu',
    city: '',
    district: '',
    department: 'Sales Team',
    assignedEmployeeName: 'Rajesh Kumar',
    demoType: 'Customer Site',
    demoStatus: 'Scheduled',
    outcome: 'Interested',
    highConfirm: 'No',
    demoDate: new Date().toISOString().split('T')[0],
    demoTime: '02:30 PM',
    meetingLink: '',
    remarks: '',
    feedback: ''
  });

  // Populate Form Data whenever selectedLead changes
  useEffect(() => {
    if (selectedLead) {
      setFormData((prev) => ({
        ...prev,
        location: selectedLead.address || selectedLead.hospitalInstitution || selectedLead.customerName || '',
        territory: selectedLead.territory || 'Tamil Nadu',
        city: selectedLead.city || '',
        district: selectedLead.district || '',
        department: selectedLead.department || 'Sales Team',
        assignedEmployeeName: selectedLead.assignedEmployeeName || 'Rajesh Kumar',
        highConfirm: selectedLead.leadStatus === 'High Confirm' ? 'Yes' : 'No'
      }));

      // Initialize selected products list with lead's product if not set
      if (selectedLead.productCategory && selectedLead.product) {
        setSelectedProducts([
          {
            id: Date.now(),
            category: selectedLead.productCategory,
            productName: selectedLead.product
          }
        ]);
      } else {
        setSelectedProducts([]);
      }
    }
  }, [selectedLead]);

  const [formErrors, setFormErrors] = useState({});

  // Filter & Search states for Table View
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('');
  const [editingDemoId, setEditingDemoId] = useState(null);

  // Modal View State for Demo Record
  const [viewDemoRecord, setViewDemoRecord] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Form Input Change Handler
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  // Section 2: Handler to Add Product into Inline Table View
  const handleAddProductToTable = (e) => {
    if (e) e.preventDefault();
    if (!currentProductName.trim()) {
      toast.error('Please select a valid product.');
      return;
    }

    if (editingProductIndex !== null) {
      // Update existing item in Section 2 Table
      setSelectedProducts((prev) =>
        prev.map((item, idx) =>
          idx === editingProductIndex
            ? { ...item, category: currentCategory, productName: currentProductName.trim() }
            : item
        )
      );
      toast.success(`Product "${currentProductName}" updated in table!`);
      setEditingProductIndex(null);
    } else {
      // Check duplicate
      const isDuplicate = selectedProducts.some(
        (p) => p.category === currentCategory && p.productName === currentProductName.trim()
      );
      if (isDuplicate) {
        toast.warning('This product is already added to the table below.');
        return;
      }

      // Add new product item to Section 2 Table
      const newItem = {
        id: Date.now(),
        category: currentCategory,
        productName: currentProductName.trim()
      };

      setSelectedProducts((prev) => [...prev, newItem]);
      toast.success(`Product "${currentProductName}" added to table view below!`);
    }
  };

  // Edit item in Section 2 Product Table
  const handleEditSection2Product = (index) => {
    const item = selectedProducts[index];
    if (item) {
      setCurrentCategory(item.category);
      setCurrentProductName(item.productName);
      setEditingProductIndex(index);
      toast.info(`Editing product item #${index + 1}`);
    }
  };

  // Delete item from Section 2 Product Table
  const handleDeleteSection2Product = (index) => {
    setSelectedProducts((prev) => prev.filter((_, idx) => idx !== index));
    if (editingProductIndex === index) {
      setEditingProductIndex(null);
    }
    toast.error('Product item removed from table.');
  };

  // Validate Main Form
  const validateForm = () => {
    const errors = {};
    if (!selectedLead) errors.lead = 'Please select a valid Lead';
    if (!formData.demoDate) errors.demoDate = 'Demo Date is required';
    if (!formData.demoStatus) errors.demoStatus = 'Demo Status is required';
    if (!formData.outcome) errors.outcome = 'Outcome is required';
    if (selectedProducts.length === 0) {
      errors.products = 'Please add at least one product to the Selected Products Table in Section 2.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler: Add / Update Demo Record
  const handleSubmitDemo = (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix validation errors and ensure at least one product is added to the table.');
      return;
    }

    const demoRecord = {
      id: editingDemoId || Date.now(),
      leadId: selectedLead.leadId,
      customerName: selectedLead.customerName,
      contactPerson: selectedLead.contactPerson,
      mobile: selectedLead.mobile,
      location: formData.location.trim(),
      territory: formData.territory,
      city: formData.city.trim(),
      district: formData.district.trim(),
      department: formData.department,
      assignedEmployeeName: formData.assignedEmployeeName,
      productsList: [...selectedProducts],
      demoType: formData.demoType,
      demoDate: formData.demoDate,
      demoTime: formData.demoTime,
      meetingLink: formData.meetingLink.trim(),
      demoStatus: formData.demoStatus,
      outcome: formData.outcome,
      highConfirm: formData.highConfirm || 'No',
      remarks: formData.remarks.trim(),
      feedback: formData.feedback.trim()
    };

    if (setDemos) {
      setDemos((prev) => {
        const existingIdx = (prev || []).findIndex((d) => d.id === demoRecord.id);
        if (existingIdx >= 0) {
          return prev.map((d, i) => (i === existingIdx ? demoRecord : d));
        } else {
          return [demoRecord, ...(prev || [])];
        }
      });
    }

    // Lead Status Update Logic based on High Confirm Radio Value
    if (setLeads && selectedLead) {
      if (formData.highConfirm === 'Yes') {
        // High Confirm = Yes: Update linked Lead's status to 'High Confirm'
        setLeads((prev) =>
          prev.map((l) =>
            l.leadId === selectedLead.leadId
              ? { ...l, leadStatus: 'High Confirm', lastActivityDate: formData.demoDate }
              : l
          )
        );
        toast.success(`Lead ${selectedLead.leadId} status updated to 'High Confirm'! PI generation is now enabled.`);
      } else {
        // High Confirm = No: Keep Lead status as 'In Progress' if it was Open, do not set High Confirm
        if (selectedLead.leadStatus === 'Open') {
          setLeads((prev) =>
            prev.map((l) =>
              l.leadId === selectedLead.leadId
                ? { ...l, leadStatus: 'In Progress', lastActivityDate: formData.demoDate }
                : l
            )
          );
        }
      }
    }

    if (editingDemoId) {
      toast.success(`Demo record for Lead ${selectedLead.leadId} updated!`);
      setEditingDemoId(null);
    } else {
      toast.success(`New Demo entry saved for ${selectedLead.customerName} (${selectedLead.leadId})!`);
    }

    // Clear notes & remarks for next entry
    setFormData((prev) => ({
      ...prev,
      remarks: '',
      feedback: '',
      meetingLink: ''
    }));
  };

  // Populate form for editing existing demo record
  const handleEditDemo = (demo) => {
    setEditingDemoId(demo.id);
    const matchedLead = (leads || []).find((l) => l.leadId === demo.leadId);
    if (matchedLead) setSelectedLead(matchedLead);

    setFormData({
      location: demo.location || '',
      territory: demo.territory || 'Tamil Nadu',
      city: demo.city || '',
      district: demo.district || '',
      department: demo.department || 'Sales Team',
      assignedEmployeeName: demo.assignedEmployeeName || 'Rajesh Kumar',
      demoType: demo.demoType || 'Customer Site',
      demoStatus: demo.demoStatus || 'Scheduled',
      outcome: demo.outcome || 'Interested',
      highConfirm: demo.highConfirm || 'No',
      demoDate: demo.demoDate || new Date().toISOString().split('T')[0],
      demoTime: demo.demoTime || '02:30 PM',
      meetingLink: demo.meetingLink || '',
      remarks: demo.remarks || '',
      feedback: demo.feedback || ''
    });

    if (demo.productsList && demo.productsList.length > 0) {
      setSelectedProducts(demo.productsList);
    } else if (demo.product) {
      setSelectedProducts([
        {
          id: Date.now(),
          category: demo.productCategory || 'Medical & Diagnostic Scanners',
          productName: demo.product
        }
      ]);
    } else {
      setSelectedProducts([]);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.info(`Editing Demo Record #${demo.id} for Lead ${demo.leadId}`);
  };

  // Delete Demo Handler
  const handleDeleteDemo = (id) => {
    if (setDemos) {
      setDemos((prev) => (prev || []).filter((d) => d.id !== id));
      toast.error('Demo record deleted.');
    }
  };

  // Filtered Demos for Section 4 Main Table View
  const filteredDemos = useMemo(() => {
    return (demos || []).filter((demo) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchId = demo.leadId && demo.leadId.toLowerCase().includes(q);
        const matchCustomer = demo.customerName && demo.customerName.toLowerCase().includes(q);
        const matchTerritory = demo.territory && demo.territory.toLowerCase().includes(q);
        const matchCity = demo.city && demo.city.toLowerCase().includes(q);
        const matchProds =
          (demo.productsList || []).some((p) => p.productName && p.productName.toLowerCase().includes(q)) ||
          (demo.product && demo.product.toLowerCase().includes(q));

        if (!matchId && !matchCustomer && !matchTerritory && !matchCity && !matchProds) {
          return false;
        }
      }

      if (statusFilter && demo.demoStatus !== statusFilter) return false;
      if (outcomeFilter && demo.outcome !== outcomeFilter) return false;
      return true;
    });
  }, [demos, searchQuery, statusFilter, outcomeFilter]);

  // Status Badge Styling Utility
  const renderStatusBadge = (status) => {
    let cls = 'bg-info text-dark fw-bold';
    if (status === 'Completed') cls = 'bg-success text-white fw-bold';
    else if (status === 'Rescheduled') cls = 'bg-warning text-dark fw-bold';
    else if (status === 'Cancelled') cls = 'bg-secondary text-white';
    else if (status === 'Scheduled') cls = 'bg-primary text-white fw-semibold';

    return <span className={`badge ${cls} px-2 py-1`}>{status || 'Scheduled'}</span>;
  };

  // Outcome Badge Styling Utility
  const renderOutcomeBadge = (outcome) => {
    let cls = 'bg-success text-white fw-bold';
    if (outcome === 'Not Interested') cls = 'bg-danger text-white fw-bold';
    else if (outcome === 'In Progress') cls = 'bg-warning text-dark fw-bold';
    else if (outcome === 'Interested') cls = 'bg-success text-white fw-bold';

    return <span className={`badge ${cls} px-2 py-1`}>{outcome || 'Interested'}</span>;
  };

  // Section 2 Product Table Columns Configuration (Matching Register Table UI)
  const section2Columns = [
    {
      key: 'category',
      title: 'PRODUCT CATEGORY',
      sortable: true,
      render: (val) => <span className="badge bg-light text-dark border">{val || '—'}</span>
    },
    {
      key: 'productName',
      title: 'PRODUCT NAME',
      sortable: true,
      render: (val) => <span className="fw-bold text-primary">{val}</span>
    }
  ];

  // Section 2 Product Table Actions Renderer (Matching Register Table UI)
  const section2Actions = (row, index) => (
    <div className="category-actions-container">
      <button
        type="button"
        className="category-action-btn edit-btn"
        title="Edit Product Item"
        onClick={() => handleEditSection2Product(index)}
      >
        <Pencil size={15} color="#16A34A" />
      </button>

      <button
        type="button"
        className="category-action-btn delete-btn"
        title="Delete Product Item"
        onClick={() => handleDeleteSection2Product(index)}
      >
        <Trash2 size={15} color="#DC2626" />
      </button>
    </div>
  );

  // Main Section 4 Table Columns Setup
  const columns = [
    {
      key: 'leadId',
      title: 'LEAD ID',
      sortable: true,
      render: (val) => <span className="badge bg-secondary font-monospace">{val}</span>
    },
    {
      key: 'customerName',
      title: 'CUSTOMER NAME',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="fw-bold text-dark d-block">{val}</span>
          <span className="small text-muted">{row.contactPerson} ({row.mobile})</span>
        </div>
      )
    },
    {
      key: 'location',
      title: 'LOCATION',
      sortable: true,
      render: (val) => <span className="small text-dark text-truncate d-inline-block" style={{ maxWidth: '130px' }}>{val || '—'}</span>
    },
    {
      key: 'territory',
      title: 'TERRITORY',
      sortable: true,
      render: (val) => <span className="small text-dark">{val || '—'}</span>
    },
    {
      key: 'city',
      title: 'CITY',
      sortable: true,
      render: (val) => <span className="small text-muted">{val || '—'}</span>
    },
    {
      key: 'district',
      title: 'DISTRICT',
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
      key: 'productsList',
      title: 'PRODUCTS SCHEDULED',
      sortable: false,
      render: (_, row) => {
        const list = row.productsList && row.productsList.length > 0
          ? row.productsList
          : [{ category: row.productCategory, productName: row.product }];

        return (
          <div className="d-flex flex-column gap-1" style={{ minWidth: '180px' }}>
            {list.map((p, i) => (
              <div key={i} className="d-flex align-items-center gap-1">
                <span className="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle font-monospace text-wrap text-start">
                  {p.productName || '—'}
                </span>
                {p.category && (
                  <span className="small text-muted" style={{ fontSize: '0.7rem' }}>
                    ({p.category})
                  </span>
                )}
              </div>
            ))}
          </div>
        );
      }
    },
    {
      key: 'demoType',
      title: 'DEMO TYPE',
      sortable: true,
      render: (val) => <span className="badge bg-light text-dark border">{val}</span>
    },
    {
      key: 'demoDate',
      title: 'DEMO DATE & TIME',
      sortable: true,
      render: (val, row) => (
        <span className="small text-dark font-monospace fw-semibold">
          {val} {row.demoTime ? `(${row.demoTime})` : ''}
        </span>
      )
    },
    {
      key: 'demoStatus',
      title: 'DEMO STATUS',
      sortable: true,
      align: 'center',
      render: (val) => renderStatusBadge(val)
    },
    {
      key: 'outcome',
      title: 'OUTCOME',
      sortable: true,
      align: 'center',
      render: (val) => renderOutcomeBadge(val)
    },
    {
      key: 'highConfirm',
      title: 'HIGH CONFIRM',
      sortable: true,
      align: 'center',
      render: (val) => (
        <span className={`badge ${val === 'Yes' ? 'bg-success text-white' : 'bg-secondary text-white'}`}>
          {val || 'No'}
        </span>
      )
    },
    {
      key: 'remarks',
      title: 'REMARKS',
      sortable: false,
      render: (val) => <span className="small text-muted text-truncate d-inline-block" style={{ maxWidth: '140px' }}>{val || '—'}</span>
    }
  ];

  // Actions Column Renderer for Section 4 Main Table
  const tableActions = (row) => (
    <div className="category-actions-container">
      

      <button
        type="button"
        className="category-action-btn edit-btn"
        title="Edit Demo Details"
        onClick={() => handleEditDemo(row)}
      >
        <Pencil size={15} color="#16A34A" />
      </button>

      <button
        type="button"
        className="category-action-btn delete-btn"
        title="Delete Demo Record"
        onClick={() => handleDeleteDemo(row.id)}
      >
        <Trash2 size={15} color="#DC2626" />
      </button>
    </div>
  );

  return (
    <div className="category-master-page lead-management-page container-fluid px-0 px-md-2 py-2">
      <Helmet>
        <title>
          {selectedLead
            ? `Schedule Lead Demo — ${selectedLead.customerName} (${selectedLead.leadId}) | Sonocare CRM`
            : 'Lead Product Demonstration Management | Sonocare CRM'}
        </title>
        <meta name="description" content="Manage sales lead demonstrations, product categories, territory location details and tracking in Sonocare CRM." />
      </Helmet>
      <ToastContainer />

      {/* HEADER SECTION */}
      <div className="category-page-header mb-3">
        <div className="category-page-title-group">
          <button
            type="button"
            className="btn btn-sm btn-light border me-2 shadow-sm d-inline-flex align-items-center"
            onClick={() => navigate('/leads')}
            title="Back to Leads Register"
          >
            <ArrowLeft size={18} className="me-1" />
            <span className="d-none d-sm-inline"></span>
          </button>
          <Video size={28} style={{ color: '#2E3192' }} />
          <div>
            <h1 className="category-page-title mb-0">Lead Product Demonstration Management</h1>
            <span className="small text-muted">
              {selectedLead
                ? `Track Demo ${selectedLead.customerName} (${selectedLead.leadId})`
                : ''}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmitDemo} noValidate>
        {/* SECTION 1 — LEAD & LOCATION / TERRITORY DETAILS */}
        <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
          <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
            <MapPin size={20} color="#2E3192" />
            <h5 className="mb-0 fw-bold text-dark fs-6">SECTION 1 — LEAD RECORD, LOCATION & TERRITORY DETAILS</h5>
          </div>
          <div className="card-body p-3 p-md-4">
            <div className="row g-3">
              <div className="col-12 col-md-6 col-lg-6 pe-md-3 mb-2">
                {id && selectedLead ? (
                  <div>
                    <InputField
                      label="Lead Record (Auto-filled) "
                      value={`${selectedLead.leadId} — ${selectedLead.customerName}`}
                      disabled={true}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="form-label small fw-bold text-dark mb-1">Select Lead Record </label>
                    <select
                      className="form-select"
                      value={selectedLead ? selectedLead.leadId : ''}
                      onChange={(e) => {
                        const matched = (leads || []).find((l) => l.leadId === e.target.value);
                        if (matched) setSelectedLead(matched);
                      }}
                    >
                      {(leads || []).map((l) => (
                        <option key={l.leadId} value={l.leadId}>
                          {l.leadId} — {l.customerName} ({l.contactPerson}) — Status: {l.leadStatus}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {selectedLead && (
                <>
                  <div className="col-12 col-md-6 col-lg-6 ps-md-3 mb-2">
                    <InputField
                      label="Location / Address"
                      placeholder="e.g. Greams Lane, Thousand Lights"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                    />
                  </div>

                  <div className="col-12 col-md-6 col-lg-6">
                    <Dropdown
                      label="Territory "
                      options={territoryOptions}
                      value={formData.territory}
                      onChange={(e) => handleInputChange('territory', e.target.value)}
                    />
                  </div>

                  <div className="col-12 col-md-6 col-lg-6">
                    <InputField
                      label="City"
                      placeholder="e.g. Chennai"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                    />
                  </div>

                  <div className="col-12 col-md-6 col-lg-6">
                    <InputField
                      label="District"
                      placeholder="e.g. Chennai"
                      value={formData.district}
                      onChange={(e) => handleInputChange('district', e.target.value)}
                    />
                  </div>

                  <div className="col-12 col-md-6 col-lg-6">
                    <Dropdown
                      label="Department "
                      options={departmentOptions}
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                    />
                  </div>

                  <div className="col-12 col-md-6 col-lg-6">
                    <Dropdown
                      label="Assigned Employee "
                      options={employeeOptions}
                      value={formData.assignedEmployeeName}
                      onChange={(e) => handleInputChange('assignedEmployeeName', e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2 — PRODUCT CATEGORY & PRODUCT SELECTION WITH HEADER ADD PRODUCT BUTTON */}
        <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
          <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div className="d-flex align-items-center gap-2">
              <Tag size={20} color="#2E3192" />
              <h5 className="mb-0 fw-bold text-dark fs-6">PRODUCT DETAILS</h5>
            </div>
            
            {/* ADD PRODUCT BUTTON AT RIGHT CORNER OF SECTION TITLE HEADER */}
            <button
              type="button"
              className="btn btn-primary px-4 py-2 fw-bold d-inline-flex align-items-center justify-content-center gap-1 shadow-sm"
              style={{ backgroundColor: '#2E3192', borderColor: '#2E3192', minWidth: '170px' }}
              onClick={handleAddProductToTable}
            >
              <Plus size={18} />
              <span>{editingProductIndex !== null ? 'Update Product' : 'Add Product'}</span>
            </button>
          </div>
          <div className="card-body p-3 p-md-4">
            {/* PRODUCT SELECTOR DROPDOWNS */}
            <div className="row g-3 align-items-end mb-4">
              <div className="col-12 col-md-6">
                <Dropdown
                  label="Product Category "
                  options={categoryOptions}
                  value={currentCategory}
                  onChange={(e) => setCurrentCategory(e.target.value)}
                />
              </div>

              <div className="col-12 col-md-6">
                <Dropdown
                  label="Product Name "
                  options={filteredProductOptions.length > 0 ? filteredProductOptions : ['Select Product']}
                  value={currentProductName}
                  onChange={(e) => setCurrentProductName(e.target.value)}
                />
              </div>
            </div>

            {formErrors.products && (
              <div className="alert alert-danger py-2 px-3 mb-3 small" role="alert">
                {formErrors.products}
              </div>
            )}

            {/* SECTION 2 INLINE TABLE VIEW MATCHING REGISTER TABLE UI */}
            <div className="category-card shadow-sm border mt-3" style={{ borderRadius: '10px' }}>
              <div className="category-card-header pb-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
                <h2 className="category-card-title mb-0">Selected Products Table ({selectedProducts.length})</h2>
                <span className="small text-muted">
                  {selectedLead ? selectedLead.leadId : ''}
                </span>
              </div>

              <div className="category-table-wrapper">
                <Table
                  columns={section2Columns}
                  data={selectedProducts}
                  showSerialNumber={true}
                  serialNumberHeader="S.NO"
                  actions={section2Actions}
                  actionHeader="ACTIONS"
                  actionWidth="110px"
                  emptyMessage="No products added yet. Select Category & Product above and click 'Add Product'."
                  emptyIcon={<Package size={40} className="text-muted d-block mx-auto mb-2 opacity-50" />}
                  paginated={false}
                  tableClassName="category-custom-table"
                  headerClassName=""
                  bordered={false}
                  striped={false}
                  hover={true}
                  minWidth="500px"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3 — DEMO DETAILS, STATUS, OUTCOME & HIGH CONFIRM */}
        <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
          <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
            <Video size={20} color="#2E3192" />
            <h5 className="mb-0 fw-bold text-dark fs-6">DEMO DETAILS</h5>
          </div>
          <div className="card-body p-3 p-md-4">
            <div className="row g-3">
              <div className="col-12 col-md-6 col-lg-6">
                <Dropdown
                  label="Demo Type "
                  options={demoTypeOptions}
                  value={formData.demoType}
                  onChange={(e) => handleInputChange('demoType', e.target.value)}
                />
              </div>

              <div className="col-12 col-md-6 col-lg-6">
                <Dropdown
                  label="Demo Status "
                  options={demoStatusOptions}
                  value={formData.demoStatus}
                  onChange={(e) => handleInputChange('demoStatus', e.target.value)}
                  error={formErrors.demoStatus}
                />
              </div>

              <div className="col-12 col-md-6 col-lg-6">
                <Dropdown
                  label="Outcome "
                  options={outcomeOptions}
                  value={formData.outcome}
                  onChange={(e) => handleInputChange('outcome', e.target.value)}
                  error={formErrors.outcome}
                />
              </div>

              

              <div className="col-12 col-md-6 col-lg-6">
                <InputField
                  label="Demo Date "
                  type="date"
                  value={formData.demoDate}
                  onChange={(e) => handleInputChange('demoDate', e.target.value)}
                  error={formErrors.demoDate}
                />
              </div>

              <div className="col-12 col-md-6 col-lg-6">
                <InputField
                  label="Demo Time"
                  type="text"
                  placeholder="e.g. 02:30 PM"
                  value={formData.demoTime}
                  onChange={(e) => handleInputChange('demoTime', e.target.value)}
                />
              </div>

              {formData.demoType === 'Online' && (
                <div className="col-12 col-md-6 col-lg-6">
                  <InputField
                    label="Online Meeting Link"
                    placeholder="e.g. https://meet.google.com/abc-defg-hij"
                    value={formData.meetingLink}
                    onChange={(e) => handleInputChange('meetingLink', e.target.value)}
                  />
                </div>
              )}

              <div className="col-12 col-md-6">
                <InputField
                  label="Remarks"
                  type="textarea"
                  rows={3}
                  placeholder="Enter demo location notes, executive preparation remarks..."
                  value={formData.remarks}
                  onChange={(e) => handleInputChange('remarks', e.target.value)}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Customer Feedback"
                  type="textarea"
                  rows={3}
                  placeholder="Customer feedback during/after product demonstration..."
                  value={formData.feedback}
                  onChange={(e) => handleInputChange('feedback', e.target.value)}
                />
              </div>
              {/* HIGH CONFIRM YES / NO RADIO FIELD */}
              <div className="col-12 col-md-6 col-lg-6">
                <label className="form-label small fw-bold text-dark mb-1">High Confirm</label>
                <div className="d-flex align-items-center gap-4 mt-2">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="highConfirm"
                      id="highConfirmYes"
                      value="Yes"
                      checked={formData.highConfirm === 'Yes'}
                      onChange={(e) => handleInputChange('highConfirm', e.target.value)}
                    />
                    <label className="form-check-label fw-bold text-success" htmlFor="highConfirmYes">
                      Yes
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="highConfirm"
                      id="highConfirmNo"
                      value="No"
                      checked={formData.highConfirm === 'No' || !formData.highConfirm}
                      onChange={(e) => handleInputChange('highConfirm', e.target.value)}
                    />
                    <label className="form-check-label text-dark" htmlFor="highConfirmNo">
                      No
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ACTION BUTTON */}
        <div className="d-flex justify-content-end gap-2 mb-4">
          <Button
            type="button"
            variant="outline-secondary"
            onClick={() => navigate('/leads')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
            className="px-4 fw-bold"
          >
            <Plus size={18} className="me-1" />
            {editingDemoId ? 'Update Demo Schedule' : 'Schedule Demo'}
          </Button>
        </div>
      </form>

      {/* ---------------------------------------------------------------- */}
      {/* SECTION 4 — LIVE TABLE VIEW OF ALL DEMO RECORDS                   */}
      {/* ---------------------------------------------------------------- */}
      <div className="category-card shadow-sm mt-4">
        <div className="category-card-header pb-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div>
            <h2 className="category-card-title mb-0">Demo Records</h2>
          </div>

          <div className="category-search-wrapper" style={{ maxWidth: '340px' }}>
            <Search size={16} className="category-search-icon" />
            <input
              type="text"
              className="category-search-input"
              placeholder="Search by Lead ID, Customer, Territory, Product..."
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
              <span className="fw-semibold">Filter:</span>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Demo Statuses</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Rescheduled">Rescheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={outcomeFilter}
                onChange={(e) => setOutcomeFilter(e.target.value)}
              >
                <option value="">All Outcomes</option>
                <option value="Interested">Interested</option>
                <option value="Not Interested">Not Interested</option>
                <option value="In Progress">In Progress</option>
              </select>
            </div>
          </div>
        </div>

        {/* TABLE WRAPPER */}
        <div className="category-table-wrapper">
          <Table
            columns={columns}
            data={filteredDemos}
            showSerialNumber={true}
            serialNumberHeader="S.NO"
            actions={tableActions}
            actionHeader="ACTIONS"
            actionWidth="130px"
            emptyMessage="No demonstration records found"
            emptyIcon={<Video size={40} className="text-muted d-block mx-auto mb-2" />}
            paginated={true}
            pageSizeOptions={[10, 25, 50]}
            defaultPageSize={10}
            tableClassName="category-custom-table"
            headerClassName=""
            bordered={false}
            striped={false}
            hover={true}
            minWidth="1850px"
          />
        </div>
      </div>

      {/* VIEW DEMO DETAIL MODAL */}
      <Modal
        show={isViewModalOpen}
        onHide={() => setIsViewModalOpen(false)}
        title="View Demonstration Record Details"
        size="lg"
        centered={true}
        footer={
          <div className="d-flex justify-content-end w-100">
            <Button variant="outline-secondary" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        {viewDemoRecord && (
          <div className="py-2">
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label className="small text-muted fw-semibold">Lead ID</label>
                <div className="fw-bold font-monospace text-dark">{viewDemoRecord.leadId}</div>
              </div>
              <div className="col-12 col-md-4">
                <label className="small text-muted fw-semibold">Customer Name</label>
                <div className="fw-bold text-dark">{viewDemoRecord.customerName}</div>
              </div>
              <div className="col-12 col-md-4">
                <label className="small text-muted fw-semibold">Demo Status</label>
                <div>{renderStatusBadge(viewDemoRecord.demoStatus)}</div>
              </div>
              <div className="col-12 col-md-4">
                <label className="small text-muted fw-semibold">Outcome</label>
                <div>{renderOutcomeBadge(viewDemoRecord.outcome)}</div>
              </div>
              <div className="col-12 col-md-4">
                <label className="small text-muted fw-semibold">High Confirm</label>
                <div>
                  <span className={`badge ${viewDemoRecord.highConfirm === 'Yes' ? 'bg-success text-white' : 'bg-secondary text-white'}`}>
                    {viewDemoRecord.highConfirm || 'No'}
                  </span>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <label className="small text-muted fw-semibold">Territory / Location</label>
                <div className="text-dark">{viewDemoRecord.territory || '—'} ({viewDemoRecord.city || '—'})</div>
              </div>
              <div className="col-12 col-md-4">
                <label className="small text-muted fw-semibold">District</label>
                <div className="text-dark">{viewDemoRecord.district || '—'}</div>
              </div>
              <div className="col-12 col-md-4">
                <label className="small text-muted fw-semibold">Department & Executive</label>
                <div className="text-dark">{viewDemoRecord.department} — {viewDemoRecord.assignedEmployeeName}</div>
              </div>
              <div className="col-12 col-md-4">
                <label className="small text-muted fw-semibold">Demo Type & Date</label>
                <div className="text-dark">{viewDemoRecord.demoType} — {viewDemoRecord.demoDate} ({viewDemoRecord.demoTime})</div>
              </div>

              {/* LIST OF PRODUCTS SCHEDULED */}
              <div className="col-12">
                <label className="small text-muted fw-semibold">Products Scheduled for Demo</label>
                <div className="p-2 bg-light rounded border">
                  {(viewDemoRecord.productsList && viewDemoRecord.productsList.length > 0
                    ? viewDemoRecord.productsList
                    : [{ category: viewDemoRecord.productCategory, productName: viewDemoRecord.product }]
                  ).map((p, idx) => (
                    <div key={idx} className="d-flex align-items-center gap-2 py-1 border-bottom last-border-0">
                      <span className="fw-bold text-primary">{idx + 1}. {p.productName}</span>
                      {p.category && <span className="badge bg-secondary">{p.category}</span>}
                    </div>
                  ))}
                </div>
              </div>

              {viewDemoRecord.meetingLink && (
                <div className="col-12">
                  <label className="small text-muted fw-semibold">Meeting Link</label>
                  <div>
                    <a href={viewDemoRecord.meetingLink} target="_blank" rel="noopener noreferrer" className="text-primary text-break small">
                      {viewDemoRecord.meetingLink}
                    </a>
                  </div>
                </div>
              )}
              <div className="col-12">
                <label className="small text-muted fw-semibold">Remarks</label>
                <div className="p-2 bg-light rounded text-dark small">{viewDemoRecord.remarks || 'No remarks entered.'}</div>
              </div>
              <div className="col-12">
                <label className="small text-muted fw-semibold">Customer Feedback</label>
                <div className="p-2 bg-light rounded text-dark small">{viewDemoRecord.feedback || 'No customer feedback recorded yet.'}</div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LeadDemo;
