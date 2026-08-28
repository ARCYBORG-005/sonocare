import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Table from '../../components/Table';
import { toast, ToastContainer } from '../../components/Toast';
import {
  PackageCheck,
  Package,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  Receipt,
  Wrench,
  CreditCard,
  Wallet,
  Plus,
  FileText
} from 'lucide-react';
import { initialMockFulfilments } from './mockOrderFulfilment';
import '../../styles/Category.css';
import '../../styles/Product.css';
import '../../styles/Lead.css';
import './OrderFulfilment.css';

/**
 * OrderFulfilment Component
 * Main Order Fulfilment Register table view.
 * Displays all confirmed orders with Kit Status, Payment Status, Installation Status,
 * and Kit Generation action button.
 */
const OrderFulfilment = ({ pis = [], setPIs, leads = [] }) => {
  const navigate = useNavigate();

  // Combine initial mock fulfilments with confirmed PIs dynamically
  const initialData = useMemo(() => {
    const combined = [...initialMockFulfilments];
    
    // Add any confirmed PI from global state if not already in initial mock
    (pis || []).forEach((pi) => {
      if (pi.orderConfirmationStatus === 'Order Confirmed' || pi.piStatus === 'Accepted') {
        const exists = combined.some((f) => f.piNumber === pi.piNumber);
        if (!exists) {
          combined.push({
            id: `FUL-${pi.id}`,
            fulfilmentId: `FUL-2026-${String(combined.length + 1).padStart(3, '0')}`,
            piId: pi.id,
            piNumber: pi.piNumber,
            versionNumber: pi.versionNumber || 1,
            leadId: pi.leadId,
            customerName: pi.customerName,
            contactPerson: pi.contactPerson || 'Purchasing Head',
            mobile: pi.mobile || '9842155667',
            email: pi.email || 'purchase@hospital.org',
            billingAddress: pi.billingAddress || pi.address || '',
            deliveryAddress: pi.deliveryAddress || pi.address || '',
            productSummary: pi.lineItems && pi.lineItems.length > 0 
              ? `${pi.lineItems[0].productName} (Qty: ${pi.lineItems[0].quantity})` 
              : 'Medical Ultrasound Scanner System',
            totalOrderValue: pi.totalOrderValue || 11800000,
            fieldEmployee: pi.orderConfirmationData?.fieldExecEmployee || '—',
            kitStatus: 'Pending',
            paymentStatus: pi.orderConfirmationData?.paymentDone === 'Yes' ? 'Partial' : 'Pending',
            paidAmount: pi.orderConfirmationData?.paidAmount || 0,
            installationStatus: 'Pending',
            invoiceStatus: 'Generated & Locked',
            overallStatus: 'Pending',
            createdDate: new Date().toISOString().split('T')[0],
            kits: []
          });
        }
      }
    });

    return combined;
  }, [pis]);

  const [fulfilments, setFulfilments] = useState(initialData);
  const [searchQuery, setSearchQuery] = useState('');
  const [kitStatusFilter, setKitStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');

  // Filtered dataset
  const filteredFulfilments = useMemo(() => {
    return fulfilments.filter((item) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const mFul = item.fulfilmentId && item.fulfilmentId.toLowerCase().includes(q);
        const mPi = item.piNumber && item.piNumber.toLowerCase().includes(q);
        const mCust = item.customerName && item.customerName.toLowerCase().includes(q);
        const mLead = item.leadId && item.leadId.toLowerCase().includes(q);
        const mProd = item.productSummary && item.productSummary.toLowerCase().includes(q);
        if (!mFul && !mPi && !mCust && !mLead && !mProd) return false;
      }

      // 2. Kit Status Filter
      if (kitStatusFilter && kitStatusFilter !== 'All') {
        if (item.kitStatus !== kitStatusFilter) return false;
      }

      // 3. Payment Status Filter
      if (paymentStatusFilter && paymentStatusFilter !== 'All') {
        if (item.paymentStatus !== paymentStatusFilter) return false;
      }

      return true;
    });
  }, [fulfilments, searchQuery, kitStatusFilter, paymentStatusFilter]);

  // Navigate to Kit Generation Page
  const handleOpenKitGeneration = (row) => {
    // Pass PI number or ID to Kit Generation route
    const encodedPI = encodeURIComponent(row.piNumber);
    navigate(`/order-fulfilment/${encodedPI}/kit`);
  };

  // Navigate to Tax Invoice & E-Way Bill Page
  const handleOpenTaxInvoice = (row) => {
    const encodedPI = encodeURIComponent(row.piNumber);
    navigate(`/order-fulfilment/${encodedPI}/tax-invoice`);
  };

  // Navigate to Installation Task Assignment Page
  const handleOpenInstallationTask = (row) => {
    const encodedPI = encodeURIComponent(row.piNumber);
    navigate(`/order-fulfilment/${encodedPI}/installation`);
  };

  // Navigate to Transaction History Workspace Page
  const handleOpenTransactionHistory = (row) => {
    const encodedPI = encodeURIComponent(row.piNumber);
    navigate(`/order-fulfilment/${encodedPI}/transactions`);
  };



  // Status Change Handlers inside table
  const handleKitStatusChange = (id, newStatus) => {
    setFulfilments((prev) =>
      prev.map((f) => (f.id === id ? { ...f, kitStatus: newStatus } : f))
    );
    toast.success(`Kit Status updated to ${newStatus}`);
  };

  // --- TABLE COLUMNS CONFIGURATION ---
  const columns = [
    {
      key: 'fulfilmentId',
      title: 'FULFILMENT ID',
      sortable: true,
      render: (val) => <span className="badge bg-secondary font-monospace">{val}</span>
    },
    {
      key: 'piNumber',
      title: 'PI NUMBER',
      sortable: true,
      render: (val) => <span className="fw-bold font-monospace text-primary">{val}</span>
    },
    {
      key: 'versionNumber',
      title: 'PI VERSION',
      sortable: true,
      align: 'center',
      render: (val) => <span className="badge bg-secondary font-monospace">Version {val || 1}</span>
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
      key: 'fieldEmployee',
      title: 'FIELD EMPLOYEE',
      sortable: true,
      render: (val) => (
        <span className="fw-semibold text-dark d-inline-flex align-items-center gap-1">
          <span className="badge bg-light text-secondary border font-monospace me-1" style={{ fontSize: '11px' }}>FE</span>
          {val || '—'}
        </span>
      )
    },
    {
      key: 'productSummary',
      title: 'PRODUCT',
      sortable: true,
      render: (val) => <span className="small text-muted">{val || '—'}</span>
    },
    {
      key: 'totalOrderValue',
      title: 'ORDER VALUE (₹)',
      sortable: true,
      align: 'right',
      render: (val) => <span className="fw-bold font-monospace text-dark">₹{Number(val || 0).toLocaleString()}</span>
    },
    {
      key: 'kitStatus',
      title: 'KIT STATUS',
      sortable: true,
      align: 'center',
      render: (val, row) => (
        <select
          className={`form-select form-select-sm fw-bold ${
            val === 'Generated' ? 'bg-success text-white' : val === 'In Progress' ? 'bg-info text-dark' : 'bg-warning text-dark'
          }`}
          style={{ fontSize: '12px', minWidth: '120px' }}
          value={val || 'Pending'}
          onChange={(e) => handleKitStatusChange(row.id, e.target.value)}
        >
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Generated">Generated</option>
          <option value="Dispatched">Dispatched</option>
        </select>
      )
    },
    {
      key: 'invoiceStatus',
      title: 'INVOICE & E-WAY BILL',
      sortable: true,
      align: 'center',
      render: (val, row) => (
        <div className="d-flex align-items-center justify-content-center gap-1">
          <button
            type="button"
            className="btn btn-sm btn-outline-primary px-2 py-1 fw-bold d-inline-flex align-items-center gap-1 shadow-sm"
            style={{ fontSize: '11px', color: '#2E3192', borderColor: '#2E3192' }}
            title="Open Tax Invoice & E-Way Bill Workspace"
            onClick={() => handleOpenTaxInvoice(row)}
          >
            <Receipt size={14} />
            <span>{val || 'Generated & Locked'}</span>
          </button>
        </div>
      )
    },
    {
      key: 'installationStatus',
      title: 'INSTALLATION STATUS',
      sortable: true,
      align: 'center',
      render: (val, row) => {
        const isDone = val === 'Completed';
        const isSched = val === 'Scheduled';
        return (
          <div className="d-flex align-items-center justify-content-center gap-1">
            <span className={`badge ${isDone ? 'bg-success' : isSched ? 'bg-info text-dark' : 'bg-secondary'} px-2 py-1`}>
              {val || 'Pending'}
            </span>
            <button
              type="button"
              className="btn btn-sm btn-outline-success p-1 border-0"
              title="Open Installation Task Assignment Workspace"
              onClick={() => handleOpenInstallationTask(row)}
            >
              <Wrench size={14} style={{ color: '#16A34A' }} />
            </button>
          </div>
        );
      }
    }
  ];

  // Actions column renderer (Kit Generation, Tax Invoice, Installation & Transaction action buttons)
  const tableActions = (row) => (
    <div className="category-actions-container d-flex align-items-center gap-1">
      <button
        type="button"
        className="btn btn-sm btn-primary px-2 py-1 fw-bold d-inline-flex align-items-center gap-1 shadow-sm"
        style={{ backgroundColor: '#2E3192', borderColor: '#2E3192', fontSize: '12px' }}
        title="Open Kit Generation Workspace for this Order"
        onClick={() => handleOpenKitGeneration(row)}
      >
        <Package size={14} />
      </button>

      <button
        type="button"
        className="btn btn-sm btn-outline-primary px-2 py-1 fw-bold d-inline-flex align-items-center gap-1 shadow-sm"
        style={{ color: '#2E3192', borderColor: '#2E3192', fontSize: '12px' }}
        title="Open Tax Invoice & E-Way Bill Workspace for this Order"
        onClick={() => handleOpenTaxInvoice(row)}
      >
        <Receipt size={14} />
      </button>

      <button
        type="button"
        className="btn btn-sm btn-outline-success px-2 py-1 fw-bold d-inline-flex align-items-center gap-1 shadow-sm"
        style={{ color: '#16A34A', borderColor: '#16A34A', fontSize: '12px' }}
        title="Open Installation Task Assignment Workspace for this Order"
        onClick={() => handleOpenInstallationTask(row)}
      >
        <Wrench size={14} />
      </button>

      <button
        type="button"
        className="btn btn-sm btn-outline-warning px-2 py-1 fw-bold d-inline-flex align-items-center gap-1 shadow-sm"
        style={{ color: '#D97706', borderColor: '#F59E0B', fontSize: '12px' }}
        title="Open Transaction History Workspace Page for this Order"
        onClick={() => handleOpenTransactionHistory(row)}
      >
        <Wallet size={14} color="#D97706" />
      </button>
    </div>
  );

  return (
    <div className="category-master-page lead-management-page container-fluid px-0 px-md-2 py-2">
      <Helmet>
        <title>Order Fulfilment Register | Sonocare CRM</title>
        <meta name="description" content="Order Fulfilment Register & Kit Generation Module in Sonocare CRM." />
      </Helmet>
      <ToastContainer />

      {/* HEADER SECTION */}
      <div className="category-page-header mb-3">
        <div className="category-page-title-group">
          <PackageCheck size={28} style={{ color: '#2E3192' }} />
          <div>
            <h1 className="category-page-title mb-0">Order Fulfilment & Kit Generation</h1>
          </div>
        </div>
      </div>

      {/* MAIN CARD CONTAINER */}
      <div className="category-card shadow-sm border mb-4" style={{ borderRadius: '10px' }}>
        {/* Card Header & Search / Filters */}
        <div className="category-card-header pb-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
          <h2 className="category-card-title mb-0">ORDER FULFILMENT REGISTER ({filteredFulfilments.length})</h2>

          {/* Search Box */}
          <div className="category-search-wrapper">
            <Search size={16} className="category-search-icon" />
            <input
              type="text"
              className="category-search-input"
              placeholder="Search by Fulfilment ID, PI Number, Customer Name..."
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

            <div className="col-12 col-sm-4 col-md-3">
              <select
                className="form-select form-select-sm"
                value={kitStatusFilter}
                onChange={(e) => setKitStatusFilter(e.target.value)}
              >
                <option value="">All Kit Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Generated">Generated</option>
                <option value="Dispatched">Dispatched</option>
              </select>
            </div>

            <div className="col-12 col-sm-4 col-md-3">
              <select
                className="form-select form-select-sm"
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
              >
                <option value="">All Payment Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
                <option value="Paid">Paid</option>
              </select>
            </div>

            {(kitStatusFilter || paymentStatusFilter || searchQuery) && (
              <div className="col-12 col-md-auto ms-auto">
                <button
                  type="button"
                  className="btn btn-sm btn-link text-decoration-none text-danger p-0 fw-semibold"
                  onClick={() => {
                    setKitStatusFilter('');
                    setPaymentStatusFilter('');
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
            data={filteredFulfilments}
            showSerialNumber={true}
            serialNumberHeader="S.NO"
            actions={tableActions}
            actionHeader="ACTIONS"
            actionWidth="210px"
            emptyMessage="No order fulfilment records found."
            emptyIcon={<PackageCheck size={40} className="text-muted d-block mx-auto mb-2 opacity-50" />}
            paginated={true}
            pageSizeOptions={[10, 25, 50]}
            defaultPageSize={10}
            tableClassName="category-custom-table"
            headerClassName=""
            bordered={false}
            striped={false}
            hover={true}
            minWidth="1300px"
          />
        </div>
      </div>
    </div>
  );
};

export default OrderFulfilment;
