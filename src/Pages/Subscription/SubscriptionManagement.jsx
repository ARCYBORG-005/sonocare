import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { toast, ToastContainer } from '../../components/Toast';
import {
  CreditCard,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  Plus,
  Info
} from 'lucide-react';
import { initialMockSubscriptions } from './mockSubscriptionData';
import { initialMockFulfilments } from '../OrderFulfilment/mockOrderFulfilment';
import '../../styles/Category.css';
import '../../styles/Product.css';
import '../../styles/Lead.css';
import '../AMC/AMCManagement.css';
import './SubscriptionManagement.css';

/**
 * SubscriptionManagement Component
 * Rule 3.3.7: Products offered as a Subscription (monthly/half-yearly/yearly) instead of one-time purchase + AMC.
 * AMC (SAMC/CAMC) is never applicable to Subscription orders (BR-ORD-016).
 * Route: /subscription
 */
const SubscriptionManagement = () => {
  const navigate = useNavigate();

  // Subscriptions State with auto-flow from Order Fulfilment and localStorage sync
  const [subscriptions, setSubscriptions] = useState(() => {
    let stored = [];
    let renewedIds = [];
    let newRenewedRecords = [];
    try {
      stored = JSON.parse(localStorage.getItem('app_subscriptions') || '[]');
      renewedIds = JSON.parse(localStorage.getItem('sub_renewed_ids') || '[]');
      newRenewedRecords = JSON.parse(localStorage.getItem('sub_new_renewed_records') || '[]');
    } catch (e) {
      console.error(e);
    }

    const list = stored.length > 0 ? [...stored] : [...initialMockSubscriptions];

    // Append new renewed records generated from PI approval
    newRenewedRecords.forEach((newSub) => {
      if (!list.some((s) => s.id === newSub.id)) {
        list.push(newSub);
      }
    });

    // Auto-capture subscription orders from Order Fulfilment
    initialMockFulfilments.forEach((ord) => {
      if (ord.serviceType === 'Subscription') {
        const orderRef = ord.fulfilmentId || `FUL-${ord.id}`;
        const exists = list.some((s) => s.orderFulfilmentId === orderRef);
        if (!exists) {
          list.push({
            id: `SUB-AUTO-${ord.id || ord.fulfilmentId}`,
            subscriptionId: `SUB-2026-${String(list.length + 1).padStart(3, '0')}`,
            orderFulfilmentId: orderRef,
            piNumber: ord.piNumber || 'PI-2026-002-V1',
            client: ord.customerName || 'Fortis Healthcare Centre',
            contactPerson: ord.contactPerson || 'Dr. Ananya Verma',
            mobile: ord.mobile || '9811223344',
            email: ord.email || 'purchase@fortis.com',
            territory: ord.billingAddress || 'Bengaluru, Karnataka',
            productSummary: ord.productSummary || 'Sonoscape X5 Portable Ultrasound System',
            productQty: 1,
            category: 'Diagnostic Ultrasound System',
            serialNumber: 'SN-X5-2026-8812',
            softwareVersion: 'v4.2.0-SUB',
            licenseKey: 'LIC-SUB-X5-8812',
            installationDate: '2025-01-10',
            warrantyMonths: 'Bundled in Subscription',
            warrantyEndDate: 'N/A (Bundled)',
            subscriptionType: 'Monthly',
            billingCycle: 'Monthly (1st of month)',
            price: 45000,
            basePrice: 40000,
            discountPercent: 5,
            gstPercent: 18,
            startDate: '2025-01-11',
            nextBillingDate: '2026-06-11',
            status: 'Active',
            paymentStatus: 'Paid',
            notes: 'Auto-captured from Order Fulfilment deal with bundled support.'
          });
        }
      }
    });

    return list.map((s) => {
      const isApprovedInPI = renewedIds.includes(s.subscriptionId);
      const isNewRecord = String(s.id).includes('SUB-RENEWED');

      if (isApprovedInPI && !isNewRecord) {
        return {
          ...s,
          isRenewed: true,
          status: 'Complete',
          notes: 'Old subscription cycle completed & renewed into new billing cycle.'
        };
      }
      return s;
    });
  });

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Delete Modal State
  const [selectedSub, setSelectedSub] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Filtered dataset
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        s.subscriptionId.toLowerCase().includes(q) ||
        s.orderFulfilmentId.toLowerCase().includes(q) ||
        s.client.toLowerCase().includes(q);

      const matchesType = !typeFilter || s.subscriptionType === typeFilter;
      const matchesStatus = !statusFilter || s.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [subscriptions, searchQuery, typeFilter, statusFilter]);

  // Delete Handler
  const handleDeleteConfirm = () => {
    if (!selectedSub) return;
    const updated = subscriptions.filter((s) => s.id !== selectedSub.id && s.subscriptionId !== selectedSub.subscriptionId);
    setSubscriptions(updated);
    try {
      localStorage.setItem('app_subscriptions', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    toast.success(`Subscription record ${selectedSub.subscriptionId} deleted successfully.`);
    setIsDeleteModalOpen(false);
  };

  // Table Columns (Matching AMCManagement table view columns exactly)
  const columns = [
    {
      key: 'subscriptionId',
      title: 'SUBSCRIPTION ID',
      sortable: true,
      render: (val) => <span className="sub-id-text">{val}</span>
    },
    {
      key: 'orderFulfilmentId',
      title: 'ORDER FULFILMENT ID',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-monospace small border-bottom d-block">{val}</span>
          <span className="small text-muted font-monospace">{row.piNumber || '—'}</span>
        </div>
      )
    },
    {
      key: 'client',
      title: 'CLIENT',
      sortable: true,
      render: (val) => <span className="sub-client-name">{val}</span>
    },
    {
      key: 'subscriptionType',
      title: 'SUBSCRIPTION TYPE',
      sortable: true,
      align: 'center',
      render: (val) => {
        const cls =
          val === 'Monthly'
            ? 'sub-type-monthly'
            : val === 'Half-Yearly'
            ? 'sub-type-half-yearly'
            : 'sub-type-yearly';
        return <span className={cls}>{val || 'Monthly'}</span>;
      }
    },
    {
      key: 'startDate',
      title: 'START DATE',
      sortable: true,
      render: (val) => <span className="font-monospace small">{val || '2025-01-16'}</span>
    },
    {
      key: 'nextBillingDate',
      title: 'NEXT BILLING DATE',
      sortable: true,
      render: (val) => <span className="font-monospace small text-dark fw-semibold">{val || '2026-06-16'}</span>
    },
    {
      key: 'billingCycle',
      title: 'PERIOD',
      sortable: true,
      render: (val, row) => <span className="small text-muted">{val || row.subscriptionType || 'Monthly'}</span>
    },
    {
      key: 'price',
      title: 'CYCLE AMOUNT (₹)',
      sortable: true,
      align: 'right',
      render: (val) => (
        <span className="fw-bold font-monospace text-dark">
          ₹{Number(val || 0).toLocaleString()}
        </span>
      )
    },
    {
      key: 'alertBeforeDays',
      title: 'ALERT BEFORE',
      sortable: true,
      align: 'center',
      render: (val) => <span className="small text-secondary font-monospace border-bottom">{val || '30 Days'}</span>
    },
    {
      key: 'status',
      title: 'STATUS',
      sortable: true,
      align: 'center',
      render: (val) => {
        const cls =
          val === 'Active'
            ? 'sub-status-active'
            : String(val).trim() === 'Pending'
            ? 'sub-status-pending'
            : 'sub-status-lapsed';
        return <span className={cls}>{val}</span>;
      }
    },
    {
      key: 'alertStatus',
      title: 'ALERT STATUS',
      sortable: true,
      align: 'center',
      render: (val, row) => {
        const todayStr = new Date().toISOString().split('T')[0];
        const isExpired = row.status === 'Lapsed' || (row.nextBillingDate && row.nextBillingDate < todayStr);
        const isAlert = String(val || '').includes('Alert') || (row.nextBillingDate && (new Date(row.nextBillingDate) - new Date(todayStr)) / (1000 * 60 * 60 * 24) <= 30);

        if (isExpired) {
          return <span className="amc-alert-danger">Expired</span>;
        }
        if (isAlert) {
          return <span className="amc-alert-warning">{val || '30-Day Alert'}</span>;
        }
        return <span className="amc-alert-normal">Normal</span>;
      }
    },
    {
      key: 'renew',
      title: 'RENEW',
      sortable: false,
      align: 'center',
      render: (_, row) => {
        let renewedIds = [];
        try {
          renewedIds = JSON.parse(localStorage.getItem('sub_renewed_ids') || '[]');
        } catch (err) {
          console.error(err);
        }
        const isApprovedInPI = (renewedIds.includes(row.subscriptionId) || row.isRenewed || row.status === 'Complete') && !String(row.id).includes('SUB-RENEWED');
        const isAlertReached = (row.alertStatus && row.alertStatus !== 'Normal') || row.status === 'Pending' || row.status === 'Lapsed';

        if (isApprovedInPI) {
          return <span className="badge bg-success px-3 py-2 fw-bold">Renewed</span>;
        }
        if (isAlertReached) {
          return <span className="badge bg-danger px-3 py-2 fw-bold">Not Renewed</span>;
        }

        return <span className="badge bg-secondary px-3 py-2 fw-bold">Normal</span>;
      }
    }
  ];

  // Action Buttons Renderer (View, Edit, Delete)
  const tableActions = (row) => (
    <div className="category-actions-container d-flex align-items-center gap-1">
      {/* 1. View Action (Eye) */}
      <button
        type="button"
        className="category-action-btn view-btn"
        title="View Subscription Details Page"
        onClick={() => navigate(`/subscription/${encodeURIComponent(row.subscriptionId)}/view`)}
      >
        <Eye size={15} />
      </button>

      {/* 2. Edit Action (Edit) */}
      <button
        type="button"
        className="category-action-btn edit-btn"
        title="Edit Subscription Details Page"
        onClick={() => navigate(`/subscription/${encodeURIComponent(row.subscriptionId)}/edit`)}
      >
        <Edit size={15} />
      </button>

      {/* 3. Delete Action (Trash2) */}
      <button
        type="button"
        className="category-action-btn delete-btn"
        title="Delete Subscription Record"
        onClick={() => {
          setSelectedSub(row);
          setIsDeleteModalOpen(true);
        }}
      >
        <Trash2 size={15} />
      </button>
    </div>
  );

  return (
    <div className="category-master-page amc-management-page subscription-management-page container-fluid px-0 px-md-2 py-2">
      <Helmet>
        <title>Subscription Management | Sonocare CRM</title>
        <meta name="description" content="Subscription Management module in Sonocare CRM." />
      </Helmet>
      <ToastContainer />

      {/* HEADER SECTION */}
      <div className="category-page-header mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="category-page-title-group">
          <CreditCard size={28} className="subscription-header-icon" />
          <div>
            <h1 className="category-page-title mb-0">Subscription Management</h1>
            <span className="small text-muted">Rule 3.3.7 & BR-ORD-016: Products offered as Subscriptions with bundled support</span>
          </div>
        </div>
      </div>

      {/* RULE BANNER */}
      

      {/* MAIN CARD CONTAINER */}
      <div className="category-card shadow-sm border mb-4" style={{ borderRadius: '10px' }}>
        {/* Card Header & Search */}
        <div className="category-card-header pb-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
          <h2 className="category-card-title mb-0">SUBSCRIPTION ORDERS ({filteredSubscriptions.length})</h2>

          {/* Search Box */}
          <div className="category-search-wrapper">
            <Search size={16} className="category-search-icon" />
            <input
              type="text"
              className="category-search-input"
              placeholder="Search Subscription ID, Fulfilment ID, Client..."
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
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Subscription Types</option>
                <option value="Monthly">Monthly</option>
                <option value="Half-Yearly">Half-Yearly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>

            <div className="col-12 col-sm-4 col-md-3">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending ">Pending </option>
                <option value="Lapsed">Lapsed</option>
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

        {/* Table Wrapper */}
        <div className="category-table-wrapper">
          <Table
            columns={columns}
            data={filteredSubscriptions}
            showSerialNumber={true}
            serialNumberHeader="S.NO"
            actions={tableActions}
            actionHeader="ACTIONS"
            actionWidth="140px"
            emptyMessage="No Subscription Order records found."
            paginated={true}
            pageSizeOptions={[10, 25, 50]}
            defaultPageSize={10}
            tableClassName="category-custom-table"
            bordered={false}
            striped={false}
            hover={true}
            minWidth="900px"
          />
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete Subscription"
        size="md"
      >
        {selectedSub && (
          <div className="p-3 text-center">
            <AlertTriangle size={44} className="text-danger mx-auto mb-2" />
            <h5 className="fw-bold text-dark mb-2">Delete Subscription Record?</h5>
            <p className="text-muted small max-w-md mx-auto mb-4">
              Are you sure you want to delete Subscription <strong>{selectedSub.subscriptionId}</strong> for customer <strong>{selectedSub.client}</strong>? This action cannot be undone.
            </p>

            <div className="d-flex justify-content-center gap-2 border-top pt-3">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary px-4"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-sm btn-danger px-4 fw-bold shadow-sm d-inline-flex align-items-center gap-1"
                onClick={handleDeleteConfirm}
              >
                <Trash2 size={14} />
                <span>Delete Subscription</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SubscriptionManagement;
