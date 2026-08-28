import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { toast } from '../../components/Toast';
import { Boxes, Plus, Eye, Pencil, Trash2, Search, Filter } from 'lucide-react';
import '../../styles/Category.css';
import '../../styles/Product.css';

const KitList = ({ kits = [], products = [], onStatusChange, onDeleteKit }) => {
  const navigate = useNavigate();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Delete Modal State
  const [selectedKit, setSelectedKit] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Filtered Kits Logic
  const filteredKits = useMemo(() => {
    return kits.filter((kit) => {
      // 1. Search Query Match (Kit ID, Kit Name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchKitId = kit.kitId && kit.kitId.toLowerCase().includes(q);
        const matchKitName = kit.kitName && kit.kitName.toLowerCase().includes(q);
        if (!matchKitId && !matchKitName) return false;
      }

      // 2. Status Filter Match
      if (statusFilter && statusFilter !== 'All Statuses') {
        if (kit.status !== statusFilter) return false;
      }

      return true;
    });
  }, [kits, searchQuery, statusFilter]);

  // Navigation & Modal Handlers
  const handleNavigateToAdd = () => {
    navigate('/masters/kits/add');
  };

  const handleNavigateToView = (row) => {
    navigate(`/masters/kits/${row.id}/view`);
  };

  const handleNavigateToEdit = (row) => {
    navigate(`/masters/kits/${row.id}/edit`);
  };

  const handleOpenDelete = (row) => {
    setSelectedKit(row);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedKit) {
      if (onDeleteKit) onDeleteKit(selectedKit.id);
      setIsDeleteModalOpen(false);
      setSelectedKit(null);
      toast.success('Kit deleted successfully');
    }
  };

  // Table Columns Setup
  const columns = [
    {
      key: 'kitId',
      title: 'KIT ID',
      sortable: true,
      render: (val) => <span className="badge bg-secondary font-monospace">{val}</span>
    },
    {
      key: 'kitName',
      title: 'KIT NAME',
      sortable: true,
      render: (val) => <span className="fw-bold text-dark">{val}</span>
    },
    {
      key: 'description',
      title: 'DESCRIPTION',
      sortable: true,
      render: (val) => <span className="category-desc-text">{val || '—'}</span>
    },
    {
      key: 'kitPrice',
      title: 'KIT PRICE',
      sortable: true,
      render: (val) => (
        <span className="fw-bold text-dark">
          ₹{Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      )
    },
    {
      key: 'gstPercent',
      title: 'GST (%)',
      sortable: true,
      align: 'center',
      render: (val) => (
        <span className="badge bg-light text-dark border font-monospace">
          {val !== undefined && val !== null ? `${val}%` : '18%'}
        </span>
      )
    },
    {
      key: 'status',
      title: 'STATUS',
      sortable: true,
      align: 'center',
      render: (val, row) => (
        <select
          className={`table-status-select ${row.status === 'Active' ? 'active' : 'inactive'}`}
          value={row.status || 'Active'}
          onChange={(e) => onStatusChange && onStatusChange(row.id, e.target.value)}
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      )
    }
  ];

  // Action Icon Buttons (View, Edit, Delete)
  const tableActions = (row) => (
    <div className="category-actions-container">
      <button
        type="button"
        className="category-action-btn view-btn"
        title="View Kit Details"
        aria-label={`View ${row.kitName}`}
        onClick={() => handleNavigateToView(row)}
      >
        <Eye size={15} color="#2563EB" />
      </button>

      <button
        type="button"
        className="category-action-btn edit-btn"
        title="Edit Kit"
        aria-label={`Edit ${row.kitName}`}
        onClick={() => handleNavigateToEdit(row)}
      >
        <Pencil size={15} color="#16A34A" />
      </button>

      <button
        type="button"
        className="category-action-btn delete-btn"
        title="Delete Kit"
        aria-label={`Delete ${row.kitName}`}
        onClick={() => handleOpenDelete(row)}
      >
        <Trash2 size={15} color="#DC2626" />
      </button>
    </div>
  );

  return (
    <div className="product-master-page container-fluid px-0 px-md-1">
      {/* 1. TOP HEADER SECTION */}
      <div className="category-page-header">
        <div className="category-page-title-group">
          <Boxes size={28} style={{ color: '#2E3192' }} />
          <h1 className="category-page-title">Kit Master</h1>
        </div>

        <button
          type="button"
          className="category-add-btn"
          onClick={handleNavigateToAdd}
        >
          <Plus size={18} />
          <span>Add Kit</span>
        </button>
      </div>

      {/* 2. MAIN CARD LIST */}
      <div className="category-card">
        {/* Card Header & Search / Filters */}
        <div className="category-card-header pb-3 border-bottom">
          <h2 className="category-card-title">Kit Register List</h2>

          {/* Search Box */}
          <div className="category-search-wrapper">
            <Search size={16} className="category-search-icon" />
            <input
              type="text"
              className="category-search-input"
              placeholder="Search by Kit ID, Kit Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Dropdown Filters Toolbar */}
        <div className="p-3 bg-light border-bottom">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-auto d-flex align-items-center text-muted small me-2">
              <Filter size={15} className="me-1" />
              <span className="fw-semibold">Filter Kits:</span>
            </div>

            {/* Status Filter */}
            <div className="col-12 col-sm-4 col-md-3">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            {(statusFilter || searchQuery) && (
              <div className="col-12 col-md-auto ms-auto">
                <button
                  type="button"
                  className="btn btn-sm btn-link text-decoration-none text-danger p-0 fw-semibold"
                  onClick={() => {
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
            data={filteredKits}
            showSerialNumber={true}
            serialNumberHeader="S.No"
            actions={tableActions}
            actionHeader="ACTIONS"
            actionWidth="120px"
            emptyMessage="No kit records found matching criteria"
            emptyIcon="bi-boxes"
            paginated={true}
            pageSizeOptions={[10, 25, 50]}
            defaultPageSize={10}
            tableClassName="category-custom-table"
            headerClassName=""
            bordered={false}
            striped={false}
            hover={true}
            minWidth="750px"
          />
        </div>
      </div>

      {/* 3. DELETE KIT CONFIRMATION MODAL */}
      <Modal
        show={isDeleteModalOpen}
        onHide={() => setIsDeleteModalOpen(false)}
        title="Delete Kit"
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
        {selectedKit && (
          <div className="py-2">
            <p className="text-dark fs-6 mb-0">
              Are you sure you want to delete the kit &quot;
              <strong className="text-danger">{selectedKit.kitName}</strong>&quot; (ID: {selectedKit.kitId})?
            </p>
            <span className="text-muted small d-block mt-2">
              This action will permanently remove this kit record from your register.
            </span>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default KitList;
