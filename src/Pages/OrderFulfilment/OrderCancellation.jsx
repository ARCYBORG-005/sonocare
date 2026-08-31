import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { toast, ToastContainer } from '../../components/Toast';
import {
  Ban,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign
} from 'lucide-react';
import { initialMockCancellations } from './mockCancellationData';
import '../../styles/Category.css';
import '../../styles/Product.css';
import '../../styles/Lead.css';
import './OrderFulfilment.css';
import '../AMC/AMCManagement.css';

/**
 * OrderCancellation Component
 * Dedicated workspace page for managing Order Cancellation requests under Rule 3.3.8.
 * Route: /order-cancellation
 */
const OrderCancellation = () => {
  const navigate = useNavigate();

  // Cancellations Dataset with localStorage sync
  const [cancellations, setCancellations] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('app_order_cancellations') || '[]');
      if (stored.length > 0) return stored;
    } catch (err) {
      console.error(err);
    }
    return [...initialMockCancellations];
  });

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('app_order_cancellations', JSON.stringify(cancellations));
    } catch (err) {
      console.error(err);
    }
  }, [cancellations]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Filtered List
  const filteredCancellations = useMemo(() => {
    return cancellations.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        c.cancellationId.toLowerCase().includes(q) ||
        c.orderFulfilmentId.toLowerCase().includes(q) ||
        c.customerName.toLowerCase().includes(q);

      const matchesStage = !stageFilter || c.cancellationStage === stageFilter;
      const matchesStatus = !statusFilter || c.status === statusFilter;

      return matchesSearch && matchesStage && matchesStatus;
    });
  }, [cancellations, searchQuery, stageFilter, statusFilter]);

  // Modal State for Deleting Record
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const handleOpenDeleteModal = (row) => {
    setSelectedRecord(row);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedRecord) return;
    setCancellations((prev) => prev.filter((item) => item.cancellationId !== selectedRecord.cancellationId));
    toast.success(`Cancellation record ${selectedRecord.cancellationId} deleted successfully.`);
    setIsDeleteModalOpen(false);
  };

  // Handle Payment Status change directly in table view
  const handlePaymentStatusChange = (rowId, newStatus) => {
    setCancellations((prev) =>
      prev.map((c) =>
        c.cancellationId === rowId || c.id === rowId
          ? { ...c, paymentStatus: newStatus }
          : c
      )
    );
    toast.success(`Payment Status for ${rowId} updated to ${newStatus}!`);
  };

  // Table Columns Definition
  const columns = [
    {
      key: 'cancellationId',
      title: 'CANCELLATION ID',
      sortable: true,
      render: (val) => <span className="font-monospace fw-bold text-danger">{val}</span>
    },
    {
      key: 'orderFulfilmentId',
      title: 'FULFILMENT ID',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-monospace small fw-bold text-dark border-bottom d-block">{val}</span>
          <span className="small text-muted">{row.productName}</span>
        </div>
      )
    },
    {
      key: 'customerName',
      title: 'CUSTOMER NAME',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="fw-semibold text-dark d-block">{val}</span>
          <span className="small text-muted font-monospace">{row.mobile}</span>
        </div>
      )
    },
    {
      key: 'cancellationStage',
      title: 'CANCELLATION STAGE',
      sortable: true,
      align: 'center',
      render: (val) => {
        const isBefore = val === 'Before Dispatch';
        const isAfterDisp = val === 'After Dispatch';
        const cls = isBefore
          ? 'badge bg-info text-dark'
          : isAfterDisp
          ? 'badge bg-warning text-dark'
          : 'badge bg-secondary text-white';
        return <span className={`px-3 py-1 fw-bold ${cls}`}>{val}</span>;
      }
    },
  
    {
      key: 'status',
      title: 'STATUS',
      sortable: true,
      align: 'center',
      render: (val, row) => {
        const isPending = val === 'Pending Manager Approval';
        const isApproved = val === 'Approved';
        const isProcessed = val === 'Refund Processed';

        const badgeCls = isPending
          ? 'bg-warning text-dark'
          : isApproved
          ? 'bg-primary text-white'
          : isProcessed
          ? 'bg-success text-white'
          : 'bg-danger text-white';

        return (
          <div>
            <span className={`badge px-3 py-1 fw-bold ${badgeCls}`}>{val}</span>
            {row.managerApprovalRequired && (
              <span className="d-block small text-muted font-monospace mt-1">
                Manager: {row.managerApproved ? 'Approved' : 'Pending'}
              </span>
            )}
          </div>
        );
      }
    },
    {
      key: 'paymentStatus',
      title: 'PAYMENT STATUS',
      sortable: true,
      align: 'center',
      render: (val, row) => {
        const currentVal = val || row.paymentStatus || 'Pending';
        const badgeColor =
          currentVal === 'Complete'
            ? '#16A34A'
            : currentVal === 'In Progress'
            ? '#D97706'
            : '#DC2626';

        return (
          <select
            className="form-select form-select-sm fw-bold shadow-xs text-white"
            style={{
              backgroundColor: badgeColor,
              borderColor: badgeColor,
              borderRadius: '6px',
              fontSize: '12px',
              padding: '3px 8px',
              cursor: 'pointer',
              minWidth: '120px'
            }}
            value={currentVal}
            onChange={(e) => handlePaymentStatusChange(row.cancellationId, e.target.value)}
          >
            <option value="Complete" style={{ backgroundColor: '#ffffff', color: '#16A34A', fontWeight: '600' }}>
              Complete
            </option>
            <option value="In Progress" style={{ backgroundColor: '#ffffff', color: '#D97706', fontWeight: '600' }}>
              In Progress
            </option>
            <option value="Pending" style={{ backgroundColor: '#ffffff', color: '#DC2626', fontWeight: '600' }}>
              Pending
            </option>
          </select>
        );
      }
    }
  ];

  // Actions Renderer (View & Edit Icons)
  const tableActions = (row) => (
    <div className="category-actions-container d-flex align-items-center gap-1">
      {/* 1. View Action */}
      <button
        type="button"
        className="category-action-btn view-btn"
        title="View Order Cancellation Details Page"
        onClick={() => navigate(`/order-cancellation/${encodeURIComponent(row.cancellationId)}/view`)}
      >
        <Eye size={15} />
      </button>

      {/* 2. Edit Action */}
      <button
        type="button"
        className="category-action-btn edit-btn"
        title="Edit Order Cancellation & Manager Approval Page"
        onClick={() => navigate(`/order-cancellation/${encodeURIComponent(row.cancellationId)}/edit`)}
      >
        <Edit size={15} />
      </button>

      {/* 3. Delete Action */}
      <button
        type="button"
        className="category-action-btn delete-btn"
        title="Delete Cancellation Record"
        onClick={() => handleOpenDeleteModal(row)}
      >
        <Trash2 size={15} />
      </button>
    </div>
  );

  return (
    <div className="category-master-page amc-management-page container-fluid px-0 px-md-2 py-2">
      <Helmet>
        <title>Order Cancellation Register | Sonocare CRM</title>
        <meta name="description" content="Rule 3.3.8 Order Cancellation Register in Sonocare CRM." />
      </Helmet>
      <ToastContainer />

      {/* HEADER SECTION */}
      <div className="category-page-header mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="category-page-title-group">
          <Ban size={28} className="text-danger" />
          <div>
            <h1 className="category-page-title mb-0"> Order Cancellation Register</h1>
            <span className="small text-muted">Manage order cancellations before dispatch, after dispatch, and post-installation returns</span>
          </div>
        </div>

      </div>

      {/* MAIN CARD CONTAINER */}
      <div className="category-card shadow-sm border mb-4" style={{ borderRadius: '10px' }}>
        {/* Card Header & Search */}
        <div className="category-card-header pb-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
          <h2 className="category-card-title mb-0">CANCELLATION REQUESTS ({filteredCancellations.length})</h2>

          {/* Search Box */}
          <div className="category-search-wrapper">
            <Search size={16} className="category-search-icon" />
            <input
              type="text"
              className="category-search-input"
              placeholder="Search Cancellation ID, Fulfilment ID, Customer..."
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
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
              >
                <option value="">All Cancellation Stages</option>
                <option value="Before Dispatch">Before Dispatch (100% - Fee)</option>
                <option value="After Dispatch">After Dispatch (20-50% Charge)</option>
                <option value="After Installation">After Installation (20% Restocking)</option>
              </select>
            </div>

            <div className="col-12 col-sm-4 col-md-3">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Pending Manager Approval">Pending Manager Approval</option>
                <option value="Approved">Approved</option>
                <option value="Refund Processed">Refund Processed</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {(stageFilter || statusFilter || searchQuery) && (
              <div className="col-12 col-md-auto ms-auto">
                <button
                  type="button"
                  className="btn btn-sm btn-link text-decoration-none text-danger p-0 fw-semibold"
                  onClick={() => {
                    setStageFilter('');
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
            data={filteredCancellations}
            showSerialNumber={true}
            serialNumberHeader="S.NO"
            actions={tableActions}
            actionHeader="ACTIONS"
            actionWidth="130px"
            emptyMessage="No Order Cancellation records found."
            paginated={true}
            pageSizeOptions={[10, 25, 50]}
            defaultPageSize={10}
            tableClassName="category-custom-table"
            bordered={false}
            striped={false}
            hover={true}
            minWidth="1150px"
          />
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete Cancellation Record"
        size="md"
      >
        <div className="p-3 text-center">
          <AlertTriangle size={48} className="text-danger mb-3" />
          <h5 className="fw-bold mb-2">Delete Record {selectedRecord?.cancellationId}?</h5>
          <p className="text-muted small mb-4">
            Are you sure you want to delete cancellation record for <strong>{selectedRecord?.customerName}</strong>?
          </p>

          <div className="d-flex justify-content-center gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary px-4"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger px-4 fw-bold"
              onClick={handleConfirmDelete}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default OrderCancellation;
