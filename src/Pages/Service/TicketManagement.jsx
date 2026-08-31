import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { toast, ToastContainer } from '../../components/Toast';
import {
  Wrench,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  AlertTriangle,
  Star,
  CheckCircle2,
  Clock,
  HelpCircle
} from 'lucide-react';
import { initialMockTickets } from './mockTicketData';
import '../../styles/Category.css';
import '../../styles/Product.css';
import '../../styles/Lead.css';
import '../AMC/AMCManagement.css';

/**
 * TicketManagement Component
 * Dedicated workspace page for Service Ticket Management.
 * Route: /service/tickets
 */
const TicketManagement = () => {
  const navigate = useNavigate();

  // Dataset with localStorage sync
  const [tickets, setTickets] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('app_service_tickets') || '[]');
      if (stored.length > 0) return stored;
    } catch (err) {
      console.error(err);
    }
    return [...initialMockTickets];
  });

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('app_service_tickets', JSON.stringify(tickets));
    } catch (err) {
      console.error(err);
    }
  }, [tickets]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Filtered List
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        t.ticketId.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.productName.toLowerCase().includes(q);

      const matchesType = !typeFilter || t.type === typeFilter;
      const matchesStatus = !statusFilter || t.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [tickets, searchQuery, typeFilter, statusFilter]);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const handleOpenDeleteModal = (row) => {
    setSelectedTicket(row);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedTicket) return;
    setTickets((prev) => prev.filter((item) => item.ticketId !== selectedTicket.ticketId));
    toast.success(`Service ticket ${selectedTicket.ticketId} deleted successfully.`);
    setIsDeleteModalOpen(false);
  };

  // Table Columns Definition (8 Specified Columns)
  const columns = [
    {
      key: 'ticketId',
      title: 'TICKET ID',
      sortable: true,
      render: (val) => <span className="font-monospace fw-bold text-primary">{val}</span>
    },
    {
      key: 'customerName',
      title: 'CUSTOMER NAME',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="fw-semibold text-dark d-block">{val}</span>
          <span className="small text-muted font-monospace">{row.mobile} | {row.territory}</span>
        </div>
      )
    },
    {
      key: 'type',
      title: 'SERVICE TYPE',
      sortable: true,
      align: 'center',
      render: (val) => {
        const isCamc = val === 'CAMC';
        const isSub = val === 'Subscription';
        const cls = isCamc
          ? 'badge bg-primary text-white'
          : isSub
          ? 'badge bg-info text-dark'
          : 'badge bg-secondary text-white';
        return <span className={`px-3 py-1 fw-bold ${cls}`}>{val || 'SAMC'}</span>;
      }
    },
    {
      key: 'dateCreated',
      title: 'DATE CREATED',
      sortable: true,
      render: (val) => <span className="font-monospace small text-dark">{val}</span>
    },
    {
      key: 'status',
      title: 'STATUS',
      sortable: true,
      align: 'center',
      render: (val) => {
        const isResolved = val === 'Resolved' || val === 'Closed';
        const isInProg = val === 'In Progress';
        const cls = isResolved
          ? 'badge bg-success text-white'
          : isInProg
          ? 'badge bg-warning text-dark'
          : 'badge bg-secondary text-white';
        return <span className={`px-3 py-1 fw-bold ${cls}`}>{val}</span>;
      }
    },
   
  
  ];

  // Actions Renderer (View, Edit, Delete Icons)
  const tableActions = (row) => (
    <div className="category-actions-container d-flex align-items-center gap-1">
      {/* 1. View Action */}
      <button
        type="button"
        className="category-action-btn view-btn"
        title="View Service Ticket Details Page"
        onClick={() => navigate(`/service/tickets/${encodeURIComponent(row.ticketId)}/view`)}
      >
        <Eye size={15} />
      </button>

      {/* 2. Edit Action */}
      <button
        type="button"
        className="category-action-btn edit-btn"
        title="Edit Service Ticket & Resolution Page"
        onClick={() => navigate(`/service/tickets/${encodeURIComponent(row.ticketId)}/edit`)}
      >
        <Edit size={15} />
      </button>

      {/* 3. Delete Action */}
      <button
        type="button"
        className="category-action-btn delete-btn"
        title="Delete Service Ticket"
        onClick={() => handleOpenDeleteModal(row)}
      >
        <Trash2 size={15} />
      </button>
    </div>
  );

  return (
    <div className="category-master-page amc-management-page container-fluid px-0 px-md-2 py-2">
      <Helmet>
        <title>Ticket Creation | Sonocare CRM</title>
        <meta name="description" content="Ticket Creation in Sonocare CRM." />
      </Helmet>
      <ToastContainer />

      {/* HEADER SECTION */}
      <div className="category-page-header mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="category-page-title-group">
          <Wrench size={28} className="text-primary" />
          <div>
            <h1 className="category-page-title mb-0">Ticket Creation Register</h1>
            <span className="small text-muted">Track customer service requests, service types (SAMC, CAMC, Subscription), and SLA compliance</span>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary px-3 py-2 fw-bold d-inline-flex align-items-center gap-2 shadow-sm"
          style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
          onClick={() => navigate('/service/tickets/add')}
        >
          <Plus size={18} />
          <span>Create Ticket</span>
        </button>
      </div>

      {/* MAIN CARD CONTAINER */}
      <div className="category-card shadow-sm border mb-4" style={{ borderRadius: '10px' }}>
        {/* Card Header & Search */}
        <div className="category-card-header pb-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
          <h2 className="category-card-title mb-0">SERVICE TICKETS ({filteredTickets.length})</h2>

          {/* Search Box */}
          <div className="category-search-wrapper">
            <Search size={16} className="category-search-icon" />
            <input
              type="text"
              className="category-search-input"
              placeholder="Search Ticket ID, Customer, Product..."
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
                <option value="">All Ticket Types</option>
                <option value="SAMC">SAMC (Support AMC)</option>
                <option value="CAMC">CAMC (Comprehensive AMC)</option>
                <option value="Subscription">Subscription</option>
              </select>
            </div>

            <div className="col-12 col-sm-4 col-md-3">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
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
            data={filteredTickets}
            showSerialNumber={true}
            serialNumberHeader="S.NO"
            actions={tableActions}
            actionHeader="ACTIONS"
            actionWidth="130px"
            emptyMessage="No Service Ticket records found."
            paginated={true}
            pageSizeOptions={[10, 25, 50]}
            defaultPageSize={10}
            tableClassName="category-custom-table"
            bordered={false}
            striped={false}
            hover={true}
            minWidth="1050px"
          />
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete Service Ticket"
        size="md"
      >
        <div className="p-3 text-center">
          <AlertTriangle size={48} className="text-danger mb-3" />
          <h5 className="fw-bold mb-2">Delete Ticket {selectedTicket?.ticketId}?</h5>
          <p className="text-muted small mb-4">
            Are you sure you want to delete service ticket for <strong>{selectedTicket?.customerName}</strong>?
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

export default TicketManagement;
