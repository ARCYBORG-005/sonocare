import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { toast, ToastContainer } from '../../components/Toast';
import {
  RefreshCw,
  Search,
  Filter,
  FileText,
  Receipt,
  CreditCard
} from 'lucide-react';
import { initialMockSubscriptions } from './mockSubscriptionData';
import '../../styles/Category.css';
import '../../styles/Product.css';
import '../../styles/Lead.css';
import '../AMC/AMCManagement.css';
import './SubscriptionManagement.css';

/**
 * SubscriptionRenewal Component
 * Dedicated workspace page for managing Subscription Contract Renewals.
 * Auto-filters subscriptions reaching alert days or pending renewal.
 * Route: /subscription/renewal
 */
const SubscriptionRenewal = () => {
  const navigate = useNavigate();

  // Dataset with localStorage sync
  const [subscriptions, setSubscriptions] = useState(() => {
    let renewedIds = [];
    let taxInvoices = {};
    try {
      renewedIds = JSON.parse(localStorage.getItem('sub_renewed_ids') || '[]');
      taxInvoices = JSON.parse(localStorage.getItem('sub_tax_invoices') || '{}');
    } catch (err) {
      console.error(err);
    }

    let list = [...initialMockSubscriptions];
    try {
      const stored = JSON.parse(localStorage.getItem('app_subscriptions') || '[]');
      if (stored.length > 0) list = stored;
    } catch (e) {
      console.error(e);
    }

    return list.map((s) => {
      const isApprovedInPI = renewedIds.includes(s.subscriptionId);
      const invData = taxInvoices[s.subscriptionId];

      return {
        ...s,
        isRenewed: isApprovedInPI,
        renewalStatus: isApprovedInPI ? 'Renewed' : 'Not Renewed',
        taxInvoiceNo: invData?.invoiceNo || (isApprovedInPI ? 'INV-SUB-2026-881' : 'Pending Invoice Generation'),
        nextBillingDate: invData?.newBillingDate || s.nextBillingDate
      };
    });
  });

  // Sync with localStorage
  useEffect(() => {
    try {
      const renewedIds = JSON.parse(localStorage.getItem('sub_renewed_ids') || '[]');
      const taxInvoices = JSON.parse(localStorage.getItem('sub_tax_invoices') || '{}');
      setSubscriptions((prev) =>
        prev.map((s) => {
          const isApprovedInPI = renewedIds.includes(s.subscriptionId);
          const invData = taxInvoices[s.subscriptionId];
          return {
            ...s,
            isRenewed: isApprovedInPI,
            renewalStatus: isApprovedInPI ? 'Renewed' : 'Not Renewed',
            taxInvoiceNo: invData?.invoiceNo || (isApprovedInPI ? 'INV-SUB-2026-881' : 'Pending Invoice Generation'),
            nextBillingDate: invData?.newBillingDate || s.nextBillingDate
          };
        })
      );
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [renewalStatusFilter, setRenewalStatusFilter] = useState('');

  // Auto-filter subscription renewals reaching alert threshold or pending
  const filteredRenewals = useMemo(() => {
    return subscriptions.filter((s) => {
      const todayStr = new Date().toISOString().split('T')[0];
      const isAlertReached =
        s.status === 'Pending' ||
        s.status === 'Lapsed' ||
        s.renewalStatus === 'Not Renewed' ||
        (s.nextBillingDate && (new Date(s.nextBillingDate) - new Date(todayStr)) / (1000 * 60 * 60 * 24) <= 60);

      if (!isAlertReached && !s.isRenewed) return false;

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        s.subscriptionId.toLowerCase().includes(q) ||
        s.client.toLowerCase().includes(q) ||
        s.orderFulfilmentId.toLowerCase().includes(q);

      const matchesType = !typeFilter || s.subscriptionType === typeFilter;
      const matchesStatus = !renewalStatusFilter || s.renewalStatus === renewalStatusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [subscriptions, searchQuery, typeFilter, renewalStatusFilter]);

  // Navigate to PI Approval Page
  const handleNavigatePIPage = (row) => {
    navigate(`/subscription/renewal/${encodeURIComponent(row.subscriptionId)}/pi`);
  };

  // Navigate to Invoice Page
  const handleNavigateInvoicePage = (row) => {
    if (!row.isRenewed) return;
    navigate(`/subscription/renewal/${encodeURIComponent(row.subscriptionId)}/invoice`);
  };

  // Table Columns
  const columns = [
    {
      key: 'subscriptionId',
      title: 'SUBSCRIPTION ID',
      sortable: true,
      render: (val) => <span className="sub-id-text">{val}</span>
    },
    {
      key: 'client',
      title: 'CUSTOMER NAME',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="sub-client-name d-block">{val}</span>
          <span className="small text-muted font-monospace">{row.orderFulfilmentId}</span>
        </div>
      )
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
      key: 'renewalStatus',
      title: 'STATUS',
      sortable: true,
      align: 'center',
      render: (val) => {
        const isRenewed = val === 'Renewed';
        return (
          <span className={`badge px-3 py-1 fw-bold ${isRenewed ? 'bg-success' : 'bg-danger'}`}>
            {val}
          </span>
        );
      }
    }
  ];

  // Table Action Column (PI Icon & Invoice Icon)
  const tableActions = (row) => (
    <div className="category-actions-container d-flex align-items-center gap-2">
      {/* 1. PI Icon (FileText) */}
      <button
        type="button"
        className="btn btn-sm btn-light border p-1 text-primary d-inline-flex align-items-center justify-content-center"
        style={{ width: '32px', height: '32px', borderRadius: '6px' }}
        title="Open Subscription Renewal Proforma Invoice (PI) Approval Page"
        onClick={() => handleNavigatePIPage(row)}
      >
        <FileText size={16} />
      </button>

      {/* 2. Invoice Icon (Receipt) — Disabled until Customer approves PI renewal */}
      <button
        type="button"
        disabled={!row.isRenewed}
        className={`btn btn-sm border p-1 d-inline-flex align-items-center justify-content-center ${row.isRenewed ? 'btn-success text-white' : 'btn-light text-muted opacity-50'}`}
        style={{ width: '32px', height: '32px', borderRadius: '6px', cursor: row.isRenewed ? 'pointer' : 'not-allowed' }}
        title={row.isRenewed ? 'Open Subscription Tax Invoice Page' : 'Pending Customer PI Approval'}
        onClick={() => row.isRenewed && handleNavigateInvoicePage(row)}
      >
        <Receipt size={16} />
      </button>
    </div>
  );

  return (
    <div className="category-master-page amc-management-page subscription-management-page container-fluid px-0 px-md-2 py-2">
      <Helmet>
        <title>Subscription Renewal Register | Sonocare CRM</title>
        <meta name="description" content="Subscription Renewal Register in Sonocare CRM." />
      </Helmet>
      <ToastContainer />

      {/* HEADER SECTION */}
      <div className="category-page-header mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="category-page-title-group">
          <RefreshCw size={28} className="subscription-header-icon" />
          <div>
            <h1 className="category-page-title mb-0">Subscription Renewal Register</h1>
            <span className="small text-muted">Records automatically populate here when subscription alert days are reached</span>
          </div>
        </div>
      </div>

      {/* MAIN CARD CONTAINER */}
      <div className="category-card shadow-sm border mb-4" style={{ borderRadius: '10px' }}>
        {/* Card Header & Search */}
        <div className="category-card-header pb-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
          <h2 className="category-card-title mb-0">RENEWAL CONTRACTS ({filteredRenewals.length})</h2>

          {/* Search Box */}
          <div className="category-search-wrapper">
            <Search size={16} className="category-search-icon" />
            <input
              type="text"
              className="category-search-input"
              placeholder="Search Subscription ID, Customer Name..."
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
                value={renewalStatusFilter}
                onChange={(e) => setRenewalStatusFilter(e.target.value)}
              >
                <option value="">All Renewal Statuses</option>
                <option value="Renewed">Renewed</option>
                <option value="Not Renewed">Not Renewed</option>
              </select>
            </div>

            {(typeFilter || renewalStatusFilter || searchQuery) && (
              <div className="col-12 col-md-auto ms-auto">
                <button
                  type="button"
                  className="btn btn-sm btn-link text-decoration-none text-danger p-0 fw-semibold"
                  onClick={() => {
                    setTypeFilter('');
                    setRenewalStatusFilter('');
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
            data={filteredRenewals}
            showSerialNumber={true}
            serialNumberHeader="S.NO"
            actions={tableActions}
            actionHeader="ACTIONS"
            actionWidth="140px"
            emptyMessage="No Subscription Renewal records found reaching alert thresholds."
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

    </div>
  );
};

export default SubscriptionRenewal;
