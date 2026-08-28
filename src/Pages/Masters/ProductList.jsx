import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { toast, ToastContainer } from '../../components/Toast';
import { Package, Plus, Eye, Pencil, Trash2, Search } from 'lucide-react';
import '../../styles/Category.css';
import '../../styles/Product.css';

const ProductList = ({ products = [], onStatusChange, onNavigateToAdd, onNavigateToEdit, onNavigateToView, onDeleteProduct }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Search Filter
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase().trim();
    return products.filter(
      (p) =>
        (p.productId && p.productId.toLowerCase().includes(query)) ||
        (p.productName && p.productName.toLowerCase().includes(query)) ||
        (p.category && p.category.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query))
    );
  }, [products, searchQuery]);

  const handleOpenDelete = (product) => {
    setSelectedProduct(product);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedProduct) {
      if (onDeleteProduct) onDeleteProduct(selectedProduct.id);
      toast.success('Product deleted successfully');
    }
    setDeleteModalOpen(false);
    setSelectedProduct(null);
  };

  const handleAddClick = () => {
    if (onNavigateToAdd) onNavigateToAdd();
    navigate('/our-stock/master/products/add');
  };

  const handleEditClick = (row) => {
    if (onNavigateToEdit) onNavigateToEdit(row);
    navigate(`/our-stock/master/products/edit/${row.id}`);
  };

  const handleViewClick = (row) => {
    if (onNavigateToView) onNavigateToView(row);
    navigate(`/our-stock/master/products/view/${row.id}`);
  };

  // Table Columns Setup (Same Design as Category Page)
  const columns = [
    {
      key: 'productId',
      title: 'PRODUCT ID',
      sortable: true,
      render: (val) => <span className="badge bg-secondary font-monospace">{val}</span>
    },
    {
      key: 'category',
      title: 'CATEGORY',
      sortable: true,
      render: (val) => <span className="category-name-text">{val}</span>
    },
    {
      key: 'productName',
      title: 'PRODUCT NAME',
      sortable: true,
      render: (val) => <span className="category-name-text fw-bold">{val}</span>
    },
    {
      key: 'purchasePrice',
      title: 'ONE TIME PRICE (₹)',
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-monospace">₹{Number(val || 0).toLocaleString()}</span>
    },
    {
      key: 'subscriptionMonthlyPrice',
      title: 'SUB. MONTHLY (₹)',
      sortable: true,
      align: 'right',
      render: (val) => <span className="font-monospace text-primary">₹{Number(val || 0).toLocaleString()}</span>
    },
    {
      key: 'gstPercent',
      title: 'GST (%)',
      sortable: true,
      align: 'center',
      render: (val) => <span className="badge bg-light text-dark border">{val !== undefined ? `${val}%` : '18%'}</span>
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

  // Action Icon Buttons (Same Design as Category Page)
  const tableActions = (row) => (
    <div className="category-actions-container">
      <button
        type="button"
        className="category-action-btn view-btn"
        title="View Product"
        aria-label={`View ${row.productName}`}
        onClick={() => handleViewClick(row)}
      >
        <Eye size={15} />
      </button>

      <button
        type="button"
        className="category-action-btn edit-btn"
        title="Edit Product"
        aria-label={`Edit ${row.productName}`}
        onClick={() => handleEditClick(row)}
      >
        <Pencil size={15} />
      </button>

      <button
        type="button"
        className="category-action-btn delete-btn"
        title="Delete Product"
        aria-label={`Delete ${row.productName}`}
        onClick={() => handleOpenDelete(row)}
      >
        <Trash2 size={15} />
      </button>
    </div>
  );

  return (
    <div className="product-master-page container-fluid px-0 px-md-1">
      <ToastContainer />

      {/* 1. TOP HEADER SECTION */}
      <div className="category-page-header">
        <div className="category-page-title-group">
          <Package size={28} style={{ color: '#2E3192' }} />
          <h1 className="category-page-title">Product Master</h1>
        </div>

        <button
          type="button"
          className="category-add-btn"
          onClick={handleAddClick}
        >
          <Plus size={18} />
          <span>Add Product</span>
        </button>
      </div>

      {/* 2. MAIN CARD LIST (Same Design as Category Page) */}
      <div className="category-card">
        <div className="category-card-header">
          <h2 className="category-card-title">Product Register List</h2>

          <div className="category-search-wrapper">
            <Search size={16} className="category-search-icon" />
            <input
              type="text"
              className="category-search-input"
              placeholder="Search by product ID, name, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="category-table-wrapper">
          <Table
            columns={columns}
            data={filteredProducts}
            showSerialNumber={true}
            serialNumberHeader="S.NO"
            actions={tableActions}
            actionHeader="ACTIONS"
            actionWidth="120px"
            emptyMessage="No product records found"
            emptyIcon="bi-box-seam"
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

      {/* 3. DELETE CONFIRMATION MODAL */}
      <Modal
        show={deleteModalOpen}
        onHide={() => setDeleteModalOpen(false)}
        title="Delete Product"
        size="md"
        centered={true}
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            <Button variant="outline-secondary" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </div>
        }
      >
        {selectedProduct && (
          <div className="py-2">
            <p className="text-dark fs-6 mb-0">
              Are you sure you want to delete the product &quot;
              <strong className="text-danger">{selectedProduct.productName}</strong>&quot; (ID: {selectedProduct.productId})?
            </p>
            <span className="text-muted small d-block mt-2">
              This action cannot be undone.
            </span>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProductList;
