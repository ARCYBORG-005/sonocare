import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Button from '../../components/Button';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { InputField, Dropdown } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import {
  ArrowLeft,
  FileText,
  Building2,
  Package,
  ShieldCheck,
  Lock,
  Plus,
  Trash2,
  Pencil,
  CreditCard,
  Check,
  Tag,
  Eye,
  GitFork,
  CheckCircle2,
  XCircle,
  Save,
  X,
  Layers
} from 'lucide-react';
import '../../styles/Category.css';
import '../../styles/Lead.css';

const defaultCategories = [
  'Medical & Diagnostic Scanners',
  'Tooling & Accessories',
  'Machinery & Equipment',
  'Electrical & Automation',
  'General Healthcare Supplies'
];

const PIPage = ({
  leads = [],
  setLeads,
  pis = [],
  setPIs,
  products = [],
  enquiries = []
}) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  // Determine if viewing main PI Register Table Page (/proforma-invoice) or PI Form Page (/leads/:id/pi)
  const isRegisterPage = location.pathname === '/proforma-invoice';

  // Parse query string for mode or versionFrom
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const queryPIId = queryParams.get('piId');
  const queryMode = queryParams.get('mode');

  // Selected Lead State
  const [selectedLeadId, setSelectedLeadId] = useState(id || '');
  useEffect(() => {
    if (id) {
      setSelectedLeadId(id);
    }
  }, [id]);

  // Find target lead by selectedLeadId
  const lead = useMemo(() => {
    if (id) {
      return (leads || []).find((l) => l.leadId === id || String(l.id) === String(id));
    }
    if (selectedLeadId) {
      return (leads || []).find((l) => l.leadId === selectedLeadId || String(l.id) === String(selectedLeadId));
    }
    return (leads || []).find((l) => l.leadStatus === 'High Confirm') || leads[0] || null;
  }, [leads, id, selectedLeadId]);

  // High Confirm Leads list for selector dropdown
  const highConfirmLeads = useMemo(() => {
    return (leads || []).filter((l) => l.leadStatus === 'High Confirm');
  }, [leads]);

  // Target PI Record (if editing, viewing, or versioning)
  const targetPIRecord = useMemo(() => {
    if (queryPIId) {
      return (pis || []).find((p) => String(p.id) === String(queryPIId) || p.piNumber === queryPIId);
    }
    if (lead) {
      const match = (pis || []).filter((p) => p.leadId === lead.leadId);
      if (match.length > 0) {
        return match.sort((a, b) => Number(b.versionNumber || 1) - Number(a.versionNumber || 1))[0];
      }
    }
    return null;
  }, [pis, queryPIId, lead]);

  // Linked Enquiry ID
  const enquiryId = useMemo(() => {
    if (lead && lead.enquiryId) return lead.enquiryId;
    const matchedEnq = (enquiries || []).find((e) => e.customerName === lead?.customerName);
    return matchedEnq ? matchedEnq.enquiryId || matchedEnq.id : 'ENQ-2026-081';
  }, [lead, enquiries]);

  // Category Options
  const categoryOptions = useMemo(() => {
    const cats = new Set(defaultCategories);
    (products || []).forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [products]);

  // Main Form / PI Header State
  const [piData, setPIData] = useState({
    piNumber: targetPIRecord
      ? queryMode === 'version'
        ? `PI-2026-${String(Math.floor(1000 + Math.random() * 9000))}`
        : targetPIRecord.piNumber
      : `PI-2026-${String(Math.floor(1000 + Math.random() * 9000))}`,
    piDate: targetPIRecord ? targetPIRecord.piDate || targetPIRecord.generatedDate : new Date().toISOString().split('T')[0],
    versionNumber: targetPIRecord
      ? queryMode === 'version'
        ? Number(targetPIRecord.versionNumber || 1) + 1
        : Number(targetPIRecord.versionNumber || 1)
      : 1,
    deliveryAddress: targetPIRecord ? targetPIRecord.deliveryAddress : lead ? lead.address || lead.hospitalInstitution || '' : '',
    paymentTerms: targetPIRecord ? targetPIRecord.paymentTerms : '50% Advance with Purchase Order, 50% before Dispatch',
    deliveryTerms: targetPIRecord ? targetPIRecord.deliveryTerms : '2 to 3 Weeks from receipt of confirmed Purchase Order',
    termsConditions: targetPIRecord ? targetPIRecord.termsConditions : '1. Prices are inclusive of standard 1-year warranty.\n2. Installation & clinical training included.\n3. Taxes as applicable at time of dispatch.',
    isSent: targetPIRecord ? Boolean(targetPIRecord.isSent || targetPIRecord.isSentToCustomer) : false,
    approvalStatus: targetPIRecord ? targetPIRecord.approvalStatus || 'Auto-Approved' : 'Auto-Approved',
    approvedByRole: targetPIRecord ? targetPIRecord.approvedByRole || 'Sales Manager' : 'Sales Manager',
    approvedPersonName: targetPIRecord ? targetPIRecord.approvedPersonName || (lead ? lead.assignedEmployeeName || 'Rajesh Kumar' : 'Rajesh Kumar') : (lead ? lead.assignedEmployeeName || 'Rajesh Kumar' : 'Rajesh Kumar'),
    approvedAt: targetPIRecord ? targetPIRecord.approvedAt || '' : '',
    piStatus: targetPIRecord ? targetPIRecord.piStatus || 'Accepted' : 'Accepted',
    serviceType: targetPIRecord ? targetPIRecord.serviceType || 'One Time + AMC' : 'One Time + AMC',
    subscriptionType: targetPIRecord ? targetPIRecord.subscriptionType || 'Monthly' : 'Monthly',
    pricing_model: targetPIRecord ? targetPIRecord.pricing_model || (targetPIRecord.serviceType === 'Subscription' ? 'subscription' : 'one_time') : 'one_time'
  });

  // Add Product Selector Form Inputs
  const [selectedCategory, setSelectedCategory] = useState('Medical & Diagnostic Scanners');
  const [selectedProductName, setSelectedProductName] = useState('');
  const [qtyInput, setQtyInput] = useState('1');
  const [unitPriceInput, setUnitPriceInput] = useState('4500000');
  const [gstInput, setGstInput] = useState('18');
  const [discountInput, setDiscountInput] = useState('0');

  // Edit State & Delete Modal State inside Section 3
  const [editingProductIndex, setEditingProductIndex] = useState(null);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Products filtered by selected Category
  const filteredProducts = useMemo(() => {
    const matched = (products || []).filter((p) => p.category === selectedCategory);
    if (matched.length > 0) {
      return matched.map((p) => p.productName);
    }
    return (products || []).map((p) => p.productName);
  }, [products, selectedCategory]);

  // Auto-set product name when category changes
  useEffect(() => {
    if (filteredProducts.length > 0) {
      setSelectedProductName(filteredProducts[0]);
    } else {
      setSelectedProductName(lead ? lead.product || 'Sonocare Premium 4D Ultrasound Workstation' : '');
    }
  }, [selectedCategory, filteredProducts, lead]);

  // Auto-lookup GST rate and Price from Product Master when product or pricing model changes
  useEffect(() => {
    if (selectedProductName) {
      const matchedProd = (products || []).find((p) => p.productName === selectedProductName);
      if (matchedProd) {
        const prodGst = matchedProd.gstPercent || matchedProd.gstRate || matchedProd.gst || 18;
        setGstInput(String(prodGst));

        if (piData?.serviceType === 'Subscription') {
          let price = 0;
          switch (piData?.subscriptionType) {
            case 'Monthly':
              price = matchedProd.subscriptionMonthlyPrice || matchedProd.purchasePrice / 10 || 45000;
              break;
            case 'Quarterly':
              price = matchedProd.subscriptionQuarterlyPrice || matchedProd.purchasePrice / 3 || 125000;
              break;
            case 'Half Yearly':
              price = matchedProd.subscriptionHalfYearlyPrice || matchedProd.purchasePrice / 2 || 240000;
              break;
            case 'Yearly':
              price = matchedProd.subscriptionYearlyPrice || matchedProd.purchasePrice || 450000;
              break;
            default:
              price = matchedProd.subscriptionMonthlyPrice || 45000;
          }
          setUnitPriceInput(String(price));
        } else if (matchedProd.purchasePrice) {
          setUnitPriceInput(String(matchedProd.purchasePrice));
        }
      }
    }
  }, [selectedProductName, products, piData?.serviceType, piData?.subscriptionType]);

  // Initial Line Items setup
  const initialLineItems = useMemo(() => {
    if (targetPIRecord && targetPIRecord.lineItems && targetPIRecord.lineItems.length > 0) {
      return JSON.parse(JSON.stringify(targetPIRecord.lineItems));
    }
    if (lead) {
      const unitPrice = Number(lead.budget) || 4500000;
      const matchedProd = (products || []).find((p) => p.productName === (lead.product || 'Sonocare Premium 4D Ultrasound Workstation'));
      const initialGst = matchedProd ? matchedProd.gstPercent || matchedProd.gstRate || matchedProd.gst || 18 : 18;
      return [
        {
          id: 1,
          category: lead.productCategory || 'Medical & Diagnostic Scanners',
          productName: lead.product || 'Sonocare Premium 4D Ultrasound Workstation',
          quantity: 1,
          unitPrice: unitPrice,
          gstPercent: initialGst,
          discount: 0,
          lineTotal: unitPrice
        }
      ];
    }
    return [];
  }, [lead, targetPIRecord, products]);

  // Line items state
  const [lineItems, setLineItems] = useState(initialLineItems);
  useEffect(() => {
    if (initialLineItems.length > 0) {
      setLineItems(initialLineItems);
    }
  }, [initialLineItems]);

  // Sync piData when targetPIRecord or queryMode changes
  useEffect(() => {
    if (targetPIRecord) {
      const isVersionMode = queryMode === 'version';
      const verNum = isVersionMode ? Number(targetPIRecord.versionNumber || 1) + 1 : Number(targetPIRecord.versionNumber || 1);
      const rootBase = targetPIRecord.rootPINumber || (targetPIRecord.piNumber ? targetPIRecord.piNumber.split('-V')[0] : 'PI-2026-003');

      setPIData({
        piNumber: isVersionMode ? `${rootBase}-V${verNum}` : targetPIRecord.piNumber,
        piDate: new Date().toISOString().split('T')[0],
        versionNumber: verNum,
        deliveryAddress: targetPIRecord.deliveryAddress || (lead ? lead.address || '' : ''),
        paymentTerms: targetPIRecord.paymentTerms || '50% Advance with Purchase Order, 50% before Dispatch',
        deliveryTerms: targetPIRecord.deliveryTerms || '2 to 3 Weeks from receipt of confirmed Purchase Order',
        termsConditions: targetPIRecord.termsConditions || '1. Prices are inclusive of standard 1-year warranty.',
        isSent: isVersionMode ? false : Boolean(targetPIRecord.isSent),
        approvalStatus: targetPIRecord.approvalStatus || 'Auto-Approved',
        approvedByRole: targetPIRecord.approvedByRole || 'Sales Manager',
        approvedPersonName: targetPIRecord.approvedPersonName || (lead ? lead.assignedEmployeeName || 'Rajesh Kumar' : 'Rajesh Kumar'),
        approvedAt: targetPIRecord.approvedAt || '',
        piStatus: targetPIRecord.piStatus || 'Accepted',
        serviceType: targetPIRecord.serviceType || 'One Time + AMC',
        subscriptionType: targetPIRecord.subscriptionType || 'Monthly',
        pricing_model: targetPIRecord.pricing_model || (targetPIRecord.serviceType === 'Subscription' ? 'subscription' : 'one_time')
      });
      setLineItems(JSON.parse(JSON.stringify(targetPIRecord.lineItems || [])));
    }
  }, [targetPIRecord, queryMode, lead]);

  // Determine Inter-state vs Intra-state Tax (Company State: Tamil Nadu)
  const customerTerritory = (lead ? lead.territory || lead.state || '' : '') || (targetPIRecord ? targetPIRecord.territory || '' : '') || 'Tamil Nadu';
  const COMPANY_STATE = 'Tamil Nadu';
  const isInterState = customerTerritory.trim().toLowerCase() !== COMPANY_STATE.toLowerCase();

  // Calculate Subtotal, Tax (CGST/SGST vs IGST per line item GST rate), and Total Order Value
  const { subtotal, discountTotal, taxCGST, taxSGST, taxIGST, totalTax, totalOrderValue, isInterStateTax } = useMemo(() => {
    let sub = 0;
    let disc = 0;
    let cgstSum = 0;
    let sgstSum = 0;
    let igstSum = 0;

    (lineItems || []).forEach((item) => {
      const q = Number(item.quantity) || 1;
      const price = Number(item.unitPrice) || 0;
      const d = Number(item.discount) || 0;
      const itemNet = Math.max(0, q * price - d);
      sub += q * price;
      disc += d;

      const gstPct = Number(item.gstPercent) || 18;
      const itemTax = itemNet * (gstPct / 100);

      if (isInterState) {
        igstSum += itemTax;
      } else {
        cgstSum += itemTax / 2;
        sgstSum += itemTax / 2;
      }
    });

    const netSubtotal = Math.max(0, sub - disc);
    const totalTaxVal = Math.round(isInterState ? igstSum : (cgstSum + sgstSum));
    const grandTotal = Math.round(netSubtotal + totalTaxVal);

    return {
      subtotal: netSubtotal,
      discountTotal: disc,
      taxCGST: Math.round(cgstSum),
      taxSGST: Math.round(sgstSum),
      taxIGST: Math.round(igstSum),
      totalTax: totalTaxVal,
      totalOrderValue: grandTotal,
      isInterStateTax: isInterState
    };
  }, [lineItems, isInterState]);

  // Determine Approval Requirement from Total Order Value automatically
  const approvalGate = useMemo(() => {
    if (totalOrderValue < 5000000) {
      return {
        level: 'None',
        description: 'Below ₹50 Lakhs — No Approval Required',
        requiredRole: 'Sales Manager',
        requiresApproval: false
      };
    } else if (totalOrderValue >= 5000000 && totalOrderValue <= 10000000) {
      return {
        level: 'Level 1',
        description: '₹50 Lakhs – ₹1 Crore — Level 1 Approval Required (Sales Manager / Territory Head)',
        requiredRole: 'Sales Manager / Territory Head',
        requiresApproval: true
      };
    } else {
      return {
        level: 'Level 2',
        description: 'Above ₹1 Crore — Level 2 Approval Required (Business Head)',
        requiredRole: 'Business Head',
        requiresApproval: true
      };
    }
  }, [totalOrderValue]);

  // Section 3: Add / Update Product Button Handler
  const handleAddOrUpdateProductToPI = (e) => {
    if (e) e.preventDefault();

    const pName = (
      selectedProductName ||
      (filteredProducts && filteredProducts[0]) ||
      (lead ? lead.product : '') ||
      'Sonocare Premium 4D Ultrasound Workstation'
    ).trim();

    const pCat = selectedCategory || 'Medical & Diagnostic Scanners';
    const qty = Number(qtyInput) || 1;
    const price = Number(unitPriceInput) || 0;
    const disc = Number(discountInput) || 0;
    const gstP = Number(gstInput) || 18;

    const itemData = {
      id: editingProductIndex !== null ? lineItems[editingProductIndex]?.id || Date.now() : Date.now(),
      category: pCat,
      productName: pName,
      quantity: qty,
      unitPrice: price,
      gstPercent: gstP,
      discount: disc,
      lineTotal: Math.max(0, qty * price - disc)
    };

    if (editingProductIndex !== null) {
      setLineItems((prev) =>
        prev.map((item, idx) => (idx === editingProductIndex ? itemData : item))
      );
      toast.success(`Product "${pName}" updated in table view!`);
      setEditingProductIndex(null);
    } else {
      setLineItems((prev) => [...prev, itemData]);
      toast.success(`Product "${pName}" added to table view!`);
    }
  };

  // Edit item in Section 3 Table
  const handleEditProduct = (index) => {
    const item = lineItems[index];
    if (item) {
      setSelectedCategory(item.category || 'Medical & Diagnostic Scanners');
      setSelectedProductName(item.productName || '');
      setQtyInput(String(item.quantity || 1));
      setUnitPriceInput(String(item.unitPrice || 0));
      setGstInput(String(item.gstPercent || 18));
      setDiscountInput(String(item.discount || 0));
      setEditingProductIndex(index);
      toast.info(`Editing product item #${index + 1}: ${item.productName}`);
    }
  };

  // Open Delete Confirmation Modal
  const promptDeleteProduct = (index) => {
    setDeleteConfirmIndex(index);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete Handler
  const handleConfirmDelete = () => {
    if (deleteConfirmIndex !== null) {
      const itemToDelete = lineItems[deleteConfirmIndex];
      setLineItems((prev) => prev.filter((_, idx) => idx !== deleteConfirmIndex));
      if (editingProductIndex === deleteConfirmIndex) {
        setEditingProductIndex(null);
      }
      toast.error(`Product "${itemToDelete?.productName || 'item'}" deleted from table.`);
      setDeleteConfirmIndex(null);
      setIsDeleteModalOpen(false);
    }
  };

  // --- SAVE DETAILS BUTTON HANDLER ---
  const handleSavePIDetails = (e) => {
    if (e) e.preventDefault();

    if (!lead) {
      toast.error('Please select a valid Lead record.');
      return;
    }

    const isVersionMode = queryMode === 'version';
    const rootBase = targetPIRecord ? (targetPIRecord.rootPINumber || targetPIRecord.piNumber.split('-V')[0]) : piData.piNumber.split('-V')[0];
    const versionNum = piData.versionNumber || 1;
    const finalPINumber = isVersionMode
      ? `${rootBase}-V${versionNum}`
      : (targetPIRecord ? targetPIRecord.piNumber : `${rootBase}-V${versionNum}`);

    const newPIRecord = {
      id: isVersionMode || !targetPIRecord ? Date.now() : targetPIRecord.id,
      leadId: lead.leadId,
      enquiryId: enquiryId,
      rootPINumber: rootBase,
      piNumber: finalPINumber,
      piDate: piData.piDate,
      versionNumber: versionNum,
      customerName: lead.customerName,
      contactPerson: lead.contactPerson,
      mobile: lead.mobile,
      email: lead.email,
      territory: lead.territory || 'Tamil Nadu',
      billingAddress: lead.address || lead.hospitalInstitution || '',
      deliveryAddress: piData.deliveryAddress,
      serviceType: piData.serviceType || 'One Time + AMC',
      subscriptionType: piData.subscriptionType || 'Monthly',
      pricing_model: piData.serviceType === 'Subscription' ? 'subscription' : 'one_time',
      lineItems: [...lineItems],
      subtotal,
      discountTotal,
      taxCGST,
      taxSGST,
      taxIGST,
      totalTax,
      totalOrderValue,
      approvalLevel: approvalGate.level,
      approvalStatus: piData.approvalStatus || 'Approved',
      approvedByRole: piData.approvedByRole || 'Sales Manager',
      approvedPersonName: piData.approvedPersonName || 'Rajesh Kumar',
      approvedAt: new Date().toLocaleString(),
      paymentTerms: piData.paymentTerms,
      deliveryTerms: piData.deliveryTerms,
      termsConditions: piData.termsConditions,
      isSent: true,
      isSentToCustomer: true,
      piStatus: piData.piStatus || 'Accepted'
    };

    if (setPIs) {
      if (isVersionMode || !targetPIRecord) {
        setPIs((prev) => [newPIRecord, ...(prev || [])]);
        toast.success(` Saved new version ${finalPINumber} (Version ${versionNum})! Data moved to Proforma Invoice register table.`);
      } else {
        setPIs((prev) => prev.map((p) => (p.id === targetPIRecord.id ? newPIRecord : p)));
        toast.success(`Proforma Invoice ${finalPINumber} saved! Data moved to Proforma Invoice register table.`);
      }
    }

    setTimeout(() => {
      navigate('/proforma-invoice');
    }, 800);
  };

  // --- VERSION BUTTON CLICKED IN TABLE VIEW ---
  const handleVersionButtonClick = (sourcePI) => {
    if (!sourcePI) return;

    const matchedLead = (leads || []).find((l) => l.leadId === sourcePI.leadId);
    const targetLeadId = matchedLead ? matchedLead.leadId : sourcePI.leadId;

    navigate(`/leads/${targetLeadId}/pi?piId=${sourcePI.id}&mode=version`);
    toast.info(`Redirected to PI details page. Details pre-filled for Version ${Number(sourcePI.versionNumber || 1) + 1}. Click 'Save Details' to create record.`);
  };

  // --- VIEW BUTTON CLICKED IN TABLE VIEW ---
  const handleViewButtonClick = (sourcePI) => {
    if (!sourcePI) return;
    const matchedLead = (leads || []).find((l) => l.leadId === sourcePI.leadId);
    const targetLeadId = matchedLead ? matchedLead.leadId : sourcePI.leadId;
    navigate(`/leads/${targetLeadId}/pi?piId=${sourcePI.id}&mode=view`);
  };

  // --- STATUS BUTTON HANDLERS (Approve = Accepted, Reject = Rejected) ---
  const handleSetStatus = (newStatus) => {
    setPIData((prev) => ({ ...prev, piStatus: newStatus }));
    toast.info(`PI Status set to '${newStatus}'. Click 'Save Details' to update table.`);
  };

  // --- PROFORMA INVOICE REGISTER TABLE COLUMNS ---
  const piRegisterColumns = [
    {
      key: 'piNumber',
      title: 'PID (PI NUMBER)',
      sortable: true,
      render: (val) => <span className="fw-bold font-monospace text-primary">{val}</span>
    },
    {
      key: 'versionNumber',
      title: 'VERSION',
      sortable: true,
      align: 'center',
      render: (val) => <span className="badge bg-secondary font-monospace fs-6 px-3 py-1">Version {val || 1}</span>
    },
    {
      key: 'leadId',
      title: 'LEAD ID',
      sortable: true,
      render: (val) => <span className="badge bg-light text-dark border font-monospace">{val}</span>
    },
    {
      key: 'customerName',
      title: 'CUSTOMER NAME',
      sortable: true,
      render: (val) => <span className="fw-bold text-dark">{val}</span>
    },
    {
      key: 'territory',
      title: 'TERRITORY',
      sortable: true,
      render: (val, row) => {
        const leadObj = (leads || []).find((l) => l.leadId === row.leadId);
        return <span className="small text-muted">{row.territory || (leadObj ? leadObj.territory : 'Tamil Nadu')}</span>;
      }
    },
    {
      key: 'piStatus',
      title: 'STATUS',
      sortable: true,
      align: 'center',
      render: (val) => {
        const isAccepted = val === 'Accepted';
        return (
          <span className={`badge ${isAccepted ? 'bg-success' : 'bg-danger'} px-3 py-2 fs-6 fw-bold`}>
            {isAccepted ? 'Accepted' : 'Rejected'}
          </span>
        );
      }
    }
  ];

  // Actions Column Renderer for PI Register Table
  const piRegisterActions = (row) => (
    <div className="category-actions-container">
      <button
        type="button"
        className="category-action-btn view-btn"
        title="View Proforma Invoice Details"
        onClick={() => handleViewButtonClick(row)}
      >
        <Eye size={16} color="#2E3192" />
      </button>
      <button
        type="button"
        className="category-action-btn edit-btn"
        title={`Click Version: Redirects to PI page with details pre-filled to create Version ${(row.versionNumber || 1) + 1}`}
        onClick={() => handleVersionButtonClick(row)}
      >
        <GitFork size={16} color="#059669" />
      </button>
    </div>
  );

  // Section 3 Table Columns Setup
  const piTableColumns = useMemo(() => {
    const isSubscription = piData?.serviceType === 'Subscription';
    return [
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
        render: (val) => <span className="fw-bold text-dark">{val}</span>
      },
      {
        key: 'quantity',
        title: isSubscription ? 'NO. OF CYCLES' : 'QTY',
        sortable: true,
        align: 'center',
        render: (val) => <span className="fw-bold">{val || 1}</span>
      },
      {
        key: 'unitPrice',
        title: isSubscription ? '1 CYCLE PRICE (₹)' : 'UNIT PRICE (₹)',
        sortable: true,
        align: 'right',
        render: (val) => <span className="font-monospace">₹{Number(val).toLocaleString()}</span>
      },
      {
        key: 'gstPercent',
        title: 'GST (%)',
        sortable: true,
        align: 'center',
        render: (val) => <span>{val || 18}%</span>
      },
      {
        key: 'discount',
        title: 'DISCOUNT (₹)',
        sortable: true,
        align: 'right',
        render: (val) => <span className="font-monospace text-success">₹{Number(val || 0).toLocaleString()}</span>
      },
      {
        key: 'lineTotal',
        title: 'LINE TOTAL (₹)',
        sortable: true,
        align: 'right',
        render: (val) => <span className="fw-bold text-dark font-monospace">₹{Number(val || 0).toLocaleString()}</span>
      }
    ];
  }, [piData.serviceType]);

  // Actions Column Renderer for Section 3 Table
  const piTableActions = (row, index) => (
    <div className="category-actions-container">
      <button
        type="button"
        className="category-action-btn edit-btn"
        title="Edit Product Item"
        onClick={() => handleEditProduct(index)}
      >
        <Pencil size={15} color="#2E3192" />
      </button>
      <button
        type="button"
        className="category-action-btn delete-btn"
        title="Delete Product Item"
        onClick={() => promptDeleteProduct(index)}
      >
        <Trash2 size={15} color="#DC2626" />
      </button>
    </div>
  );



  // ------------------------------------------------------------------
  // VIEW 2: PROFORMA INVOICE FORM & DETAILS WORKSPACE PAGE (/leads/:id/pi)
  // ------------------------------------------------------------------
  return (
    <div className="category-master-page lead-management-page container-fluid px-0 px-md-2 py-2">
      <Helmet>
        <title>{`Proforma Invoice Form — ${lead ? lead.customerName : 'Workspace'}`} | Sonocare CRM</title>
        <meta name="description" content="Proforma Invoice commercial details, approval gate, and order confirmation workflow in Sonocare CRM." />
      </Helmet>
      <ToastContainer />

      {/* HEADER SECTION */}
      <div className="category-page-header mb-3">
        <div className="category-page-title-group">
          <button
            type="button"
            className="btn btn-sm btn-light border me-2 shadow-sm d-inline-flex align-items-center"
            onClick={() => navigate('/proforma-invoice')}
            title="Back to Proforma Invoice Register"
          >
            <ArrowLeft size={18} className="me-1" />
            <span className="d-none d-sm-inline">Back to PI Menu</span>
          </button>
          <FileText size={28} style={{ color: '#2E3192' }} />
          <div>
            <h1 className="category-page-title mb-0">Proforma Invoice (PI) & Commercial Management</h1>
            <span className="small text-muted">
              {lead ? `${lead.customerName} (${lead.leadId})` : 'PI Details'} | Linked Enquiry: <strong className="text-dark font-monospace">{enquiryId}</strong>
            </span>
          </div>
        </div>

        {lead && (
          <div className="d-flex align-items-center gap-2">
            <span className={`lead-status-badge ${lead.leadStatus.toLowerCase().replace(' ', '-')}`}>
              Lead Status: {lead.leadStatus}
            </span>
            <span className={`badge ${piData.piStatus === 'Accepted' ? 'bg-success' : 'bg-danger'} px-3 py-2 fs-6`}>
              Status: {piData.piStatus}
            </span>
          </div>
        )}
      </div>

      {/* 1. HEADER / REFERENCE & VERSION CONTROL (2 COLUMNS PER ROW IN DESKTOP) */}
      <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
        <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <FileText size={20} color="#2E3192" />
            <h5 className="mb-0 fw-bold text-dark fs-6">1. PI REFERENCE DETAILS & VERSION CONTROL</h5>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-secondary font-monospace px-3 py-1 fs-6">
              Version {piData.versionNumber || 1}
            </span>
            {queryMode === 'version' && (
              <span className="badge bg-info text-white px-3 py-1">
                Creating New Version {piData.versionNumber}
              </span>
            )}
          </div>
        </div>
        <div className="card-body p-3 p-md-4">
          <div className="row g-3">
            {/* ROW 1: 2 COLUMNS */}
            <div className="col-12 col-md-6">
              <InputField
                label="PID / PI Number "
                value={piData.piNumber}
                disabled={queryMode === 'view'}
                onChange={(e) => setPIData((prev) => ({ ...prev, piNumber: e.target.value }))}
              />
            </div>
            <div className="col-12 col-md-6">
              <InputField
                label="PI Date "
                type="date"
                value={piData.piDate}
                disabled={queryMode === 'view'}
                onChange={(e) => setPIData((prev) => ({ ...prev, piDate: e.target.value }))}
              />
            </div>

            {/* ROW 2: 2 COLUMNS */}
            <div className="col-12 col-md-6">
              <InputField
                label="Version Number"
                value={`Version ${piData.versionNumber}`}
                disabled={true}
              />
            </div>
            <div className="col-12 col-md-6">
              <InputField
                label="Lead ID (Auto-filled)"
                value={lead ? lead.leadId : selectedLeadId || '—'}
                disabled={true}
              />
            </div>

            {/* ROW 3: 2 COLUMNS */}
            <div className="col-12 col-md-6">
              <InputField
                label="Enquiry ID (Auto-filled)"
                value={enquiryId}
                disabled={true}
              />
            </div>
            <div className="col-12 col-md-6">
              <InputField
                label="Territory (Auto-filled)"
                value={lead ? lead.territory || 'Tamil Nadu' : 'Tamil Nadu'}
                disabled={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. CUSTOMER DETAILS & DELIVERY ADDRESS (2 COLUMNS PER ROW IN DESKTOP) */}
      <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
        <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
          <Building2 size={20} color="#2E3192" />
          <h5 className="mb-0 fw-bold text-dark fs-6">2. CUSTOMER DETAILS & DELIVERY ADDRESS</h5>
        </div>
        <div className="card-body p-3 p-md-4">
          <div className="row g-3">
            {/* ROW 1: 2 COLUMNS */}
            <div className="col-12 col-md-6">
              <InputField label="Customer / Company Name" value={lead ? lead.customerName : '—'} disabled={true} />
            </div>
            <div className="col-12 col-md-6">
              <InputField label="Contact Person" value={lead ? lead.contactPerson : '—'} disabled={true} />
            </div>

            {/* ROW 2: 2 COLUMNS */}
            <div className="col-12 col-md-6">
              <InputField label="Mobile Number" value={lead ? lead.mobile : '—'} disabled={true} />
            </div>
            <div className="col-12 col-md-6">
              <InputField label="Email Address" value={lead ? lead.email || '—' : '—'} disabled={true} />
            </div>

            {/* ROW 3: 2 COLUMNS (BILLING & DELIVERY ADDRESS MANUAL ENTRY) */}
            <div className="col-12 col-md-6">
              <InputField
                label="Billing Address (Auto-filled)"
                type="textarea"
                rows={2}
                value={lead ? lead.address || lead.hospitalInstitution || '—' : '—'}
                disabled={true}
              />
            </div>
            <div className="col-12 col-md-6">
              <InputField
                label="Delivery Address (Manual Entry)"
                type="textarea"
                rows={2}
                placeholder="Enter delivery site address if different..."
                value={piData.deliveryAddress}
                disabled={queryMode === 'view'}
                onChange={(e) => setPIData((prev) => ({ ...prev, deliveryAddress: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. PRODUCT DETAILS SECTION WITH ADD PRODUCT FORM & TABLE VIEW */}
      <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
        <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <Package size={20} color="#2E3192" />
            <h5 className="mb-0 fw-bold text-dark fs-6">3. PRODUCT DETAILS & COMMERCIAL LINE ITEMS</h5>
          </div>
          {piData.serviceType === 'Subscription' && (
            <span className="badge bg-purple text-white px-3 py-1 fs-6" style={{ backgroundColor: '#7C3AED' }}>
              Subscription Model: {piData.subscriptionType}
            </span>
          )}
        </div>
        <div className="card-body p-3 p-md-4">

          {/* PI LEVEL SERVICE TYPE & SUBSCRIPTION TYPE SELECTION */}
          <div className="p-3 mb-4 rounded border bg-white shadow-sm">
            <div className="row g-3 align-items-center">
              <div className="col-12 col-md-6">
                <Dropdown
                  label="Service Type (Deal Pricing Model) "
                  options={['One Time + AMC', 'Subscription']}
                  value={piData.serviceType || 'One Time + AMC'}
                  disabled={queryMode === 'view'}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPIData((prev) => ({
                      ...prev,
                      serviceType: val,
                      pricing_model: val === 'Subscription' ? 'subscription' : 'one_time'
                    }));
                  }}
                />
              </div>

              {piData.serviceType === 'Subscription' && (
                <div className="col-12 col-md-6">
                  <Dropdown
                    label="Subscription Type (Billing Frequency) *"
                    options={['Monthly', 'Quarterly', 'Half Yearly', 'Yearly']}
                    value={piData.subscriptionType || 'Monthly'}
                    disabled={queryMode === 'view'}
                    onChange={(e) => setPIData((prev) => ({ ...prev, subscriptionType: e.target.value }))}
                  />
                </div>
              )}
            </div>
          </div>

          {/* PRODUCT SELECTION FORM: Category, Product, Qty/Cycles, Price/CyclePrice, GST, Discount */}
          {queryMode !== 'view' && (
            <div className="p-3 mb-4 rounded border bg-light">
              <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2">
                  <Tag size={18} color="#2E3192" />
                  <h6 className="mb-0 fw-bold text-dark fs-6">
                    {editingProductIndex !== null
                      ? `Update Product Item #${editingProductIndex + 1}`
                      : 'Add Product to Proforma Invoice'}
                  </h6>
                </div>
                {editingProductIndex !== null && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setEditingProductIndex(null)}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <div className="row g-3 align-items-end">
                {/* ROW 1: CATEGORY & PRODUCT NAME (2 COLUMNS IN DESKTOP) */}
                <div className="col-12 col-md-6">
                  <Dropdown
                    label="Product Category *"
                    options={categoryOptions}
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <Dropdown
                    label="Product Name "
                    options={filteredProducts.length > 0 ? filteredProducts : ['Select Product']}
                    value={selectedProductName}
                    onChange={(e) => setSelectedProductName(e.target.value)}
                  />
                </div>

                {/* ROW 2: QTY / CYCLES & UNIT / CYCLE PRICE (2 COLUMNS IN DESKTOP) */}
                <div className="col-12 col-md-6">
                  <InputField
                    label={piData.serviceType === 'Subscription' ? 'Number of Cycles (Upfront Cycles Billed) *' : 'Quantity (Qty) *'}
                    type="number"
                    min="1"
                    value={qtyInput}
                    onChange={(e) => setQtyInput(e.target.value)}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label={piData.serviceType === 'Subscription' ? '1 Cycle Price (₹) *' : 'Unit Price (₹) *'}
                    type="number"
                    value={unitPriceInput}
                    onChange={(e) => setUnitPriceInput(e.target.value)}
                  />
                </div>

                {/* ROW 3: GST (%) & DISCOUNT AMOUNT (₹) (2 COLUMNS IN DESKTOP) */}
                <div className="col-12 col-md-6">
                  <InputField
                    label="GST Rate (%) (From Product Master)"
                    type="number"
                    value={gstInput}
                    onChange={(e) => setGstInput(e.target.value)}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Discount Amount (₹)"
                    type="number"
                    value={discountInput}
                    onChange={(e) => setDiscountInput(e.target.value)}
                  />
                </div>

                {/* DYNAMIC FORM BUTTON: "+ Add Product" or "Update Product" */}
                <div className="col-12 d-flex justify-content-end mt-3 gap-2">
                  {editingProductIndex !== null && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-3 fw-bold"
                      onClick={() => setEditingProductIndex(null)}
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-primary px-4 fw-bold d-inline-flex align-items-center gap-1 shadow-sm"
                    style={{ backgroundColor: '#2E3192', borderColor: '#2E3192', minWidth: '170px' }}
                    onClick={handleAddOrUpdateProductToPI}
                  >
                    {editingProductIndex !== null ? (
                      <>
                        <Check size={18} />
                        <span>Update Product</span>
                      </>
                    ) : (
                      <>
                        <Plus size={18} />
                        <span>Add Product</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TABLE VIEW OF ADDED PRODUCTS (MATCHING LEAD PAGE REUSABLE TABLE COMPONENT & DESIGN) */}
          <div className="category-card shadow-sm border mb-4" style={{ borderRadius: '10px' }}>
            <div className="category-card-header pb-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
              <h2 className="category-card-title mb-0">Commercial Line Items Table ({lineItems.length})</h2>
              <span className="small text-muted">
                {lead ? lead.leadId : ''}
              </span>
            </div>

            <div className="category-table-wrapper">
              <Table
                columns={piTableColumns}
                data={lineItems}
                showSerialNumber={true}
                serialNumberHeader="S.NO"
                actions={queryMode !== 'view' ? piTableActions : undefined}
                actionHeader="ACTIONS"
                actionWidth="100px"
                emptyMessage="No products added to table view yet. Select Category & Product above and click 'Add Product'."
                emptyIcon={<Package size={40} className="text-muted d-block mx-auto mb-2 opacity-50" />}
                paginated={false}
                tableClassName="category-custom-table"
                headerClassName=""
                bordered={false}
                striped={false}
                hover={true}
                minWidth="900px"
              />
            </div>
          </div>

          {/* SINGLE HORIZONTAL ROW TOTALS BREAKDOWN (SUBTOTAL, DISCOUNT, CGST/SGST vs IGST, TOTAL VALUE) */}
          <div className="p-3 bg-light rounded border">
            <div className="row g-2 align-items-center text-center text-md-start">
              <div className="col-12 col-sm-6 col-md-2 border-end-md">
                <span className="small text-muted fw-semibold d-block">Subtotal:</span>
                <span className="fw-bold font-monospace fs-6 text-dark">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="col-12 col-sm-6 col-md-2 border-end-md">
                <span className="small text-muted fw-semibold d-block">Discount Total:</span>
                <span className="fw-bold font-monospace fs-6 text-success">₹{discountTotal.toLocaleString()}</span>
              </div>

              {isInterStateTax ? (
                <div className="col-12 col-sm-6 col-md-3 border-end-md">
                  <span className="small text-muted fw-semibold d-block">IGST (Inter-state):</span>
                  <span className="fw-bold font-monospace fs-6 text-dark">₹{taxIGST.toLocaleString()}</span>
                </div>
              ) : (
                <>
                  <div className="col-12 col-sm-6 col-md-2 border-end-md">
                    <span className="small text-muted fw-semibold d-block">CGST (Intra-state):</span>
                    <span className="fw-bold font-monospace fs-6 text-dark">₹{taxCGST.toLocaleString()}</span>
                  </div>
                  <div className="col-12 col-sm-6 col-md-2 border-end-md">
                    <span className="small text-muted fw-semibold d-block">SGST (Intra-state):</span>
                    <span className="fw-bold font-monospace fs-6 text-dark">₹{taxSGST.toLocaleString()}</span>
                  </div>
                </>
              )}

              <div className={`col-12 ${isInterStateTax ? 'col-md-5' : 'col-md-4'} text-md-end`}>
                {piData.serviceType === 'Subscription' ? (
                  <>
                    <span className="small text-muted fw-semibold d-block">
                      Amount per {lineItems.length > 0 ? (lineItems[0].quantity || 1) : (qtyInput || 1)} cycle(s) — {piData.subscriptionType} billing:
                    </span>
                    <span className="fw-bold text-primary font-monospace fs-5">
                      ₹{totalOrderValue.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="small text-muted fw-semibold d-block">Total Order Value:</span>
                    <span className="fw-bold text-primary font-monospace fs-5">
                      ₹{totalOrderValue.toLocaleString()}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. AUTOMATIC COMMERCIAL APPROVAL GATE & APPROVE/REJECT STATUS BUTTONS */}
      <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
        <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <ShieldCheck size={20} color="#2E3192" />
            <h5 className="mb-0 fw-bold text-dark fs-6">4. AUTOMATIC COMMERCIAL APPROVAL GATE & STATUS</h5>
          </div>

          {/* APPROVE / REJECT STATUS BUTTONS IN SECTION 4 (ONLY SHOW WHEN NOT IN VIEW MODE) */}
          {queryMode !== 'view' && (
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className={`btn btn-sm ${piData.piStatus === 'Accepted' ? 'btn-success fw-bold shadow-sm' : 'btn-outline-success'}`}
                onClick={() => handleSetStatus('Accepted')}
              >
                <CheckCircle2 size={16} className="me-1" /> Approve (Accepted)
              </button>
              <button
                type="button"
                className={`btn btn-sm ${piData.piStatus === 'Rejected' ? 'btn-danger fw-bold shadow-sm' : 'btn-outline-danger'}`}
                onClick={() => handleSetStatus('Rejected')}
              >
                <XCircle size={16} className="me-1" /> Reject (Rejected)
              </button>
            </div>
          )}
        </div>
        <div className="card-body p-3 p-md-4">


          <div className="row g-3">
            {/* ROW 1: 2 COLUMNS */}
            <div className="col-12 col-md-6">
              <InputField label="Territory (Auto-filled)" value={lead ? lead.territory || 'Tamil Nadu' : 'Tamil Nadu'} disabled={true} />
            </div>
            <div className="col-12 col-md-6">
              <InputField label="Approval Level" value={approvalGate.level} disabled={true} />
            </div>

            {/* ROW 2: 2 COLUMNS */}
            <div className="col-12 col-md-6">
              <InputField
                label="Approved By (Role / Designation)"
                value={piData.approvedByRole || approvalGate.requiredRole}
                disabled={true}
              />
            </div>
            <div className="col-12 col-md-6">
              <InputField
                label="Approved Person Name"
                value={piData.approvedPersonName || (lead ? lead.assignedEmployeeName || 'Rajesh Kumar' : 'Rajesh Kumar')}
                disabled={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. PAYMENT & DELIVERY TERMS (2 COLUMNS PER ROW IN DESKTOP + MANUAL ENTRY) */}
      <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
        <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
          <CreditCard size={20} color="#2E3192" />
          <h5 className="mb-0 fw-bold text-dark fs-6">5. PAYMENT & DELIVERY TERMS (MANUAL ENTRY)</h5>
        </div>
        <div className="card-body p-3 p-md-4">
          <div className="row g-3">
            {/* ROW 1: 2 COLUMNS */}
            <div className="col-12 col-md-6">
              <InputField
                label="Payment Terms "
                type="textarea"
                rows={3}
                placeholder="Enter custom payment terms..."
                value={piData.paymentTerms}
                disabled={queryMode === 'view'}
                onChange={(e) => setPIData((prev) => ({ ...prev, paymentTerms: e.target.value }))}
              />
            </div>

            <div className="col-12 col-md-6">
              <InputField
                label="Delivery Terms (Manual Entry)"
                type="textarea"
                rows={3}
                placeholder="Enter custom delivery terms..."
                value={piData.deliveryTerms}
                disabled={queryMode === 'view'}
                onChange={(e) => setPIData((prev) => ({ ...prev, deliveryTerms: e.target.value }))}
              />
            </div>

            {/* ROW 2: FULL WIDTH TERMS & CONDITIONS */}
            <div className="col-12">
              <InputField
                label="Terms & Conditions"
                type="textarea"
                rows={3}
                value={piData.termsConditions}
                disabled={queryMode === 'view'}
                onChange={(e) => setPIData((prev) => ({ ...prev, termsConditions: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 6. PI ACTION TOOLBAR (SAVE DETAILS & CANCEL BUTTONS) */}
      <div className="card shadow-sm border-0 mb-4 p-3 bg-white border" style={{ borderRadius: '10px' }}>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>

          </div>

          {/* SAVE DETAILS & CANCEL BUTTONS (RIGHT CORNER: FIRST SAVE THEN CANCEL) */}
          <div className="d-flex justify-content-end align-items-center gap-2 ms-auto">
            {queryMode !== 'view' && (
              <Button
                type="button"
                variant="primary"
                style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
                className="px-4 fw-bold fs-6"
                onClick={handleSavePIDetails}
              >
                <Save size={18} className="me-1" /> Save Details
              </Button>
            )}

            <Button
              type="button"
              variant="outline-secondary"
              className="px-4 fw-bold"
              onClick={() => navigate('/proforma-invoice')}
            >
              <X size={18} className="me-1" /> Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* DELETE CONFIRMATION POPUP MODAL */}
      <Modal
        show={isDeleteModalOpen}
        onHide={() => setIsDeleteModalOpen(false)}
        title="Confirm Product Deletion"
        size="md"
      >
        <div className="text-center py-3">
          <div
            className="mx-auto mb-3 d-flex align-items-center justify-content-center bg-danger bg-opacity-10 text-danger rounded-circle"
            style={{ width: '60px', height: '60px' }}
          >
            <Trash2 size={28} />
          </div>
          <h5 className="fw-bold text-dark mb-2">Delete Product Item?</h5>
          <p className="text-muted mb-4 small px-3">
            Are you sure you want to delete{' '}
            <strong className="text-dark">
              {deleteConfirmIndex !== null && lineItems[deleteConfirmIndex]
                ? lineItems[deleteConfirmIndex].productName
                : 'this product item'}
            </strong>{' '}
            from the Proforma Invoice? The total commercial values will be recalculated.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Button
              variant="outline-secondary"
              className="px-4"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="px-4"
              onClick={handleConfirmDelete}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PIPage;
