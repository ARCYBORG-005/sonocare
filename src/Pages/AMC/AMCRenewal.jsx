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
  Trophy,
  Receipt,
  Award
} from 'lucide-react';
import { initialMockAMCContracts } from './mockAMCData';
import { initialMockFulfilments } from '../OrderFulfilment/mockOrderFulfilment';
import '../../styles/Category.css';
import '../../styles/Product.css';
import '../../styles/Lead.css';
import './AMCManagement.css';

/**
 * AMCRenewal Component
 * Dedicated workspace page for managing AMC Contract Renewals.
 * Auto-filters contracts whose alert days are reached.
 * Features PI Icon (navigates to AMCRenewalPI page), Trophy Icon, and Invoice Icon (navigates to AMCRenewalInvoice page).
 * Route: /warranty-amc/renewal
 */
const AMCRenewal = ({ pis = [], leads = [] }) => {
  const navigate = useNavigate();

  // Contract Dataset with localStorage sync
  const [contracts, setContracts] = useState(() => {
    let renewedIds = [];
    let taxInvoices = {};
    try {
      renewedIds = JSON.parse(localStorage.getItem('amc_renewed_ids') || '[]');
      taxInvoices = JSON.parse(localStorage.getItem('amc_tax_invoices') || '{}');
    } catch (err) {
      console.error(err);
    }

    const list = [...initialMockAMCContracts];
    const autoOrd = initialMockFulfilments.find((f) => f.fulfilmentId === 'FUL-2026-003');
    if (autoOrd && !list.some((c) => c.orderFulfilmentId === autoOrd.fulfilmentId)) {
      list.push({
        id: 'AMC-AUTO-FUL-2026-003',
        contractId: 'AMC-2026-005',
        orderFulfilmentId: 'FUL-2026-003',
        piNumber: 'PI-2026-001-V1',
        client: 'Fortis Healthcare Centre',
        contactPerson: 'Dr. Ananya Verma',
        mobile: '9811223344',
        email: 'purchase@fortishealthcare.com',
        territory: 'Bengaluru, Karnataka',
        productSummary: 'GE Voluson E8 Expert Ultrasound Machine',
        amcType: 'SAMC (Support AMC)',
        nature: 'Mandatory support only',
        startDate: '2025-05-11',
        endDate: '2026-05-10',
        period: '1 Year',
        basePrice: 135000,
        discountPercent: 5,
        gstPercent: 18,
        totalAmountCycle: 150000,
        alertBeforeDays: '30 Days',
        status: 'Not Renewed',
        alertStatus: '30-Day Alert',
        isRenewed: false,
        notes: 'Auto-created SAMC contract. Warranty ended.'
      });
    }

    return list.map((c) => {
      const isApprovedInPI = renewedIds.includes(c.contractId);
      const invData = taxInvoices[c.contractId];
      const isRenewed = isApprovedInPI || (c.status === 'Active' && (!c.alertStatus || c.alertStatus === 'Normal'));

      return {
        ...c,
        isRenewed,
        renewalStatus: isRenewed ? 'Renewed' : 'Not Renewed',
        taxInvoiceNo: invData?.invoiceNo || (isRenewed ? 'INV-AMC-2026-881' : 'Pending Invoice Generation'),
        endDate: invData?.newEndDate || c.endDate
      };
    });
  });

  // Sync state when localStorage changes
  useEffect(() => {
    try {
      const renewedIds = JSON.parse(localStorage.getItem('amc_renewed_ids') || '[]');
      const taxInvoices = JSON.parse(localStorage.getItem('amc_tax_invoices') || '{}');
      setContracts((prev) =>
        prev.map((c) => {
          const isApprovedInPI = renewedIds.includes(c.contractId);
          const invData = taxInvoices[c.contractId];
          const isRenewed = isApprovedInPI || (c.status === 'Active' && (!c.alertStatus || c.alertStatus === 'Normal'));
          return {
            ...c,
            isRenewed,
            renewalStatus: isRenewed ? 'Renewed' : 'Not Renewed',
            taxInvoiceNo: invData?.invoiceNo || (isRenewed ? 'INV-AMC-2026-881' : 'Pending Invoice Generation'),
            endDate: invData?.newEndDate || c.endDate
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

  // Modal State for Trophy
  const [selectedContract, setSelectedContract] = useState(null);
  const [isTrophyModalOpen, setIsTrophyModalOpen] = useState(false);

  // Auto-filter contracts whose alert days are reached or status is Not Renewed / Pending
  const filteredRenewals = useMemo(() => {
    return contracts.filter((c) => {
      const isAlertReached =
        c.alertStatus !== 'Normal' ||
        c.status === 'Pending Renewal' ||
        c.status === 'Lapsed' ||
        c.renewalStatus === 'Not Renewed';

      if (!isAlertReached && !c.isRenewed) return false;

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        c.contractId.toLowerCase().includes(q) ||
        c.client.toLowerCase().includes(q) ||
        c.orderFulfilmentId.toLowerCase().includes(q);

      const matchesType = !typeFilter || c.amcType.includes(typeFilter);
      const matchesStatus = !renewalStatusFilter || c.renewalStatus === renewalStatusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [contracts, searchQuery, typeFilter, renewalStatusFilter]);

  // Navigate to PI Renewal Approval Page (FileText Icon action)
  const handleNavigatePIPage = (row) => {
    navigate(`/warranty-amc/renewal/${encodeURIComponent(row.contractId)}/pi`);
  };

  // Navigate to AMC Invoice Page (Receipt Icon action)
  const handleNavigateInvoicePage = (row) => {
    navigate(`/warranty-amc/renewal/${encodeURIComponent(row.contractId)}/invoice`);
  };

  // Open Trophy Modal Handler (Milestone Acceptance)
  const handleOpenTrophyModal = (row) => {
    setSelectedContract(row);
    setIsTrophyModalOpen(true);
  };

  // Confirm Customer Acceptance (Trophy Icon action)
  const handleConfirmTrophyAcceptance = () => {
    if (!selectedContract) return;
    toast.success(`Milestone Achieved! Customer ${selectedContract.client} officially accepted the AMC renewal quotation!`);
    setIsTrophyModalOpen(false);
  };

  // Table Columns Definition
  const columns = [
    {
      key: 'contractId',
      title: 'CONTRACT ID',
      sortable: true,
      render: (val) => <span className="amc-contract-id">{val}</span>
    },
    {
      key: 'client',
      title: 'CUSTOMER NAME',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="amc-client-name d-block">{val}</span>
          <span className="small text-muted font-monospace">{row.orderFulfilmentId}</span>
        </div>
      )
    },
    {
      key: 'amcType',
      title: 'CONTRACT TYPE',
      sortable: true,
      render: (val) => {
        const isCamc = String(val).includes('CAMC');
        return <span className={isCamc ? 'amc-type-camc' : 'amc-type-samc'}>{val}</span>;
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

  // Action column renderer (PI Icon, Trophy Icon, Invoice Icon)
  const tableActions = (row) => (
    <div className="category-actions-container d-flex align-items-center gap-2">
      {/* 1. PI Icon (FileText) — Navigates to dedicated AMCRenewalPI page */}
      <button
        type="button"
        className="btn btn-sm btn-light border p-1 text-primary d-inline-flex align-items-center justify-content-center"
        style={{ width: '32px', height: '32px', borderRadius: '6px' }}
        title="Open AMC Renewal Proforma Invoice (PI) Approval Page"
        onClick={() => handleNavigatePIPage(row)}
      >
        <FileText size={16} />
      </button>

     

      {/* 3. Invoice Icon (Receipt) — Navigates to dedicated AMCRenewalInvoice page */}
      <button
        type="button"
        className={`btn btn-sm border p-1 d-inline-flex align-items-center justify-content-center ${row.isRenewed ? 'btn-success text-white' : 'btn-light text-success'}`}
        style={{ width: '32px', height: '32px', borderRadius: '6px' }}
        title="Open AMC Tax Invoice Page"
        onClick={() => handleNavigateInvoicePage(row)}
      >
        <Receipt size={16} />
      </button>
    </div>
  );

  return (
    <div className="category-master-page amc-management-page container-fluid px-0 px-md-2 py-2">
      <Helmet>
        <title>AMC Renewal Register | Sonocare CRM</title>
        <meta name="description" content="AMC Contract Renewal Register in Sonocare CRM." />
      </Helmet>
      <ToastContainer />

      {/* HEADER SECTION */}
      <div className="category-page-header mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="category-page-title-group">
          <RefreshCw size={28} className="amc-header-icon" />
          <div>
            <h1 className="category-page-title mb-0">AMC Renewal Register</h1>
            <span className="small text-muted">Records automatically populates here when AMC alert days are reached</span>
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
              placeholder="Search Contract ID, Customer Name..."
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
                <option value="">All Contract Types</option>
                <option value="SAMC">SAMC (Support AMC)</option>
                <option value="CAMC">CAMC (Comprehensive AMC)</option>
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
            actionWidth="160px"
            emptyMessage="No AMC Renewal records found reaching alert thresholds."
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

      {/* ------------------------------------------------------------------ */}
      {/* MODAL 1: TROPHY ICON — CUSTOMER RENEWAL ACCEPTANCE MILESTONE       */}
      {/* ------------------------------------------------------------------ */}
      <Modal
        isOpen={isTrophyModalOpen}
        onClose={() => setIsTrophyModalOpen(false)}
        title={`Customer Acceptance Milestone — ${selectedContract?.contractId || ''}`}
        size="md"
      >
        {selectedContract && (
          <div className="p-3 text-center">
            <Trophy size={48} className="text-warning mx-auto mb-2" />
            <h5 className="fw-bold text-dark mb-2">Renewal Milestone Acceptance</h5>
            <p className="text-muted small max-w-md mx-auto mb-4">
              Confirm that customer <strong>{selectedContract.client}</strong> has officially accepted the AMC renewal quotation and agreed to the terms.
            </p>

            <div className="p-3 bg-light rounded border text-start mb-4">
              <div className="d-flex justify-content-between small mb-1">
                <span className="text-muted">Customer Name:</span>
                <span className="fw-bold text-dark">{selectedContract.client}</span>
              </div>
              <div className="d-flex justify-content-between small mb-1">
                <span className="text-muted">Contract ID:</span>
                <span className="font-monospace text-dark">{selectedContract.contractId}</span>
              </div>
              <div className="d-flex justify-content-between small">
                <span className="text-muted">Milestone Status:</span>
                <span className="text-success fw-bold">✓ Quotation Accepted</span>
              </div>
            </div>

            <div className="d-flex justify-content-center gap-2 border-top pt-3">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary px-3"
                onClick={() => setIsTrophyModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-sm btn-warning px-4 fw-bold text-dark d-inline-flex align-items-center gap-1 shadow-sm"
                onClick={handleConfirmTrophyAcceptance}
              >
                <Award size={16} />
                <span>Confirm Acceptance Milestone</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default AMCRenewal;
