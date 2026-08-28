import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { Helmet } from 'react-helmet-async';
import { InputField } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import {
  Tag,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Search,
  Upload,
  X
} from 'lucide-react';
import '../../styles/Category.css';

// Initial Mock Dataset matching Reference UI & Sonocare Healthcare CRM
const initialCategories = [
  {
    id: 1,
    name: 'Machinery & Equipment',
    description: 'Industrial heavy machinery, CNC machines, tooling centers, and automated manufacturing systems.',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 2,
    name: 'Tooling & Accessories',
    description: 'Precision cutting tools, workholding fixtures, CNC collets, and toolholder assemblies.',
    image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 3,
    name: 'Electrical & Automation',
    description: 'Control panels, AC drives, PLC controllers, servo motors, and automation sensors.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 4,
    name: 'Medical & Diagnostic Scanners',
    description: 'Ultrasound machines, Echocardiogram scanners, diagnostic probes, and transducer assemblies.',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80'
  }
];

const Category = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  // --- LOCAL STATE ---
  const [categories, setCategories] = useState(initialCategories);
  const [searchQuery, setSearchQuery] = useState('');

  // --- MODAL STATES ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // --- FORM STATES & SELECTED ROW ---
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Sync route URL with modal display
  useEffect(() => {
    const path = location.pathname;
    if (path.endsWith('/add')) {
      setFormData({ name: '', description: '', image: '' });
      setImagePreview(null);
      setFormErrors({});
      setIsAddModalOpen(true);
      setIsEditModalOpen(false);
      setIsViewModalOpen(false);
    } else if (path.includes('/edit/') && id) {
      const found = categories.find((c) => String(c.id) === String(id));
      if (found) {
        setSelectedCategory(found);
        setFormData({ name: found.name || '', description: found.description || '', image: found.image || '' });
        setImagePreview(found.image || null);
        setIsEditModalOpen(true);
        setIsAddModalOpen(false);
        setIsViewModalOpen(false);
      }
    } else if (path.includes('/view/') && id) {
      const found = categories.find((c) => String(c.id) === String(id));
      if (found) {
        setSelectedCategory(found);
        setIsViewModalOpen(true);
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
      }
    } else {
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      setIsViewModalOpen(false);
    }
  }, [location.pathname, id, categories]);

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsViewModalOpen(false);
    setIsDeleteModalOpen(false);
    navigate('/our-stock/master/general-categories');
  };

  // --- FILTERED DATA ---
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const query = searchQuery.toLowerCase().trim();
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(query) ||
        (cat.description && cat.description.toLowerCase().includes(query))
    );
  }, [categories, searchQuery]);

  // --- HANDLERS FOR FORM INPUTS ---
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Handle Image File Selection & Preview
  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setFormErrors((prev) => ({ ...prev, image: 'Please select a valid image file' }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image: '' }));
  };

  // --- ADD CATEGORY HANDLERS ---
  const handleOpenAddModal = () => {
    navigate('/our-stock/master/general-categories/add');
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Category Name is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddCategorySubmit = (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    const newCategory = {
      id: Date.now(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      image: formData.image || imagePreview || ''
    };

    setCategories((prev) => [newCategory, ...prev]);
    toast.success('Category added successfully');
    handleCloseModal();
  };

  // --- EDIT CATEGORY HANDLERS ---
  const handleOpenEditModal = (category) => {
    navigate(`/our-stock/master/general-categories/edit/${category.id}`);
  };

  const handleEditCategorySubmit = (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === selectedCategory.id
          ? {
              ...cat,
              name: formData.name.trim(),
              description: formData.description.trim(),
              image: formData.image || imagePreview || ''
            }
          : cat
      )
    );
    toast.success('Category updated successfully');
    handleCloseModal();
  };

  // --- VIEW CATEGORY HANDLERS ---
  const handleOpenViewModal = (category) => {
    navigate(`/our-stock/master/general-categories/view/${category.id}`);
  };

  // --- DELETE CATEGORY HANDLERS ---
  const handleOpenDeleteModal = (category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCategoryConfirm = () => {
    if (!selectedCategory) return;
    setCategories((prev) => prev.filter((cat) => cat.id !== selectedCategory.id));
    setIsDeleteModalOpen(false);
    setSelectedCategory(null);
    toast.success('Category deleted successfully');
  };

  // --- TABLE COLUMNS CONFIGURATION ---
  const columns = [
    {
      key: 'name',
      title: 'GENERAL CATEGORY NAME',
      sortable: true,
      render: (val) => <span className="category-name-text">{val}</span>
    },
    {
      key: 'description',
      title: 'DESCRIPTION',
      sortable: true,
      render: (val) => <span className="category-desc-text">{val || '—'}</span>
    }
  ];

  // Table actions renderer matching reference UI
  const tableActions = (row) => (
    <div className="category-actions-container">
      <button
        type="button"
        className="category-action-btn view-btn"
        title="View Category"
        aria-label={`View ${row.name}`}
        onClick={() => handleOpenViewModal(row)}
      >
        <Eye size={15} color="#2563EB" />
      </button>

      <button
        type="button"
        className="category-action-btn edit-btn"
        title="Edit Category"
        aria-label={`Edit ${row.name}`}
        onClick={() => handleOpenEditModal(row)}
      >
        <Pencil size={15} color="#16A34A" />
      </button>

      <button
        type="button"
        className="category-action-btn delete-btn"
        title="Delete Category"
        aria-label={`Delete ${row.name}`}
        onClick={() => handleOpenDeleteModal(row)}
      >
        <Trash2 size={15} color="#DC2626" />
      </button>
    </div>
  );

  return (
    <div className="category-master-page container-fluid px-0 px-md-1">
      <Helmet>
        <title>General Categories Master | Sonocare CRM</title>
        <meta name="description" content="Manage equipment and product categories for Sonocare diagnostic CRM." />
      </Helmet>
      <ToastContainer />

      {/* 1. TOP HEADER SECTION */}
      <div className="category-page-header">
        <div className="category-page-title-group">
          <Tag size={28} style={{ color: '#EAB308', transform: 'rotate(-45deg)' }} />
          <h1 className="category-page-title">General Categories Master</h1>
        </div>

        <button
          type="button"
          className="category-add-btn"
          onClick={handleOpenAddModal}
        >
          <Plus size={18} />
          <span>Add General Category</span>
        </button>
      </div>

      {/* 2. MAIN CARD CONTAINER */}
      <div className="category-card">
        {/* Card Header: Title & Pill Search Bar */}
        <div className="category-card-header">
          <h2 className="category-card-title">General Category List</h2>

          <div className="category-search-wrapper">
            <Search size={16} className="category-search-icon" />
            <input
              type="text"
              className="category-search-input"
              placeholder="Search by category name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Table Container */}
        <div className="category-table-wrapper">
          <Table
            columns={columns}
            data={filteredCategories}
            showSerialNumber={false}
            actions={tableActions}
            actionHeader="ACTIONS"
            actionWidth="120px"
            emptyMessage="No category records found"
            emptyIcon="bi-folder-x"
            paginated={true}
            pageSizeOptions={[10, 25, 50]}
            defaultPageSize={10}
            tableClassName="category-custom-table"
            headerClassName=""
            bordered={false}
            striped={false}
            hover={true}
            minWidth="650px"
          />
        </div>
      </div>

      {/* 3. ADD CATEGORY MODAL */}
      <Modal
        show={isAddModalOpen}
        onHide={handleCloseModal}
        title="Add General Category"
        size="md"
        centered={true}
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            <Button
              variant="outline-secondary"
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddCategorySubmit}
              style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
            >
              Add Category
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAddCategorySubmit} noValidate>
          <div className="row g-3">
            <div className="col-12">
              <InputField
                label="Category Name"
                placeholder="e.g. Machinery & Equipment..."
                required={true}
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={formErrors.name}
              />
            </div>

            <div className="col-12">
              <InputField
                label="Description"
                type="textarea"
                rows={3}
                placeholder="Enter category detailed description..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>

            <div className="col-12">
              <label className="sonocare-label mb-2">
                <span>Category Image</span>
              </label>

              {imagePreview ? (
                <div className="position-relative d-inline-block border rounded p-2 bg-light">
                  <img
                    src={imagePreview}
                    alt="Category Preview"
                    className="rounded object-fit-cover"
                    style={{ width: '120px', height: '100px' }}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 p-1 rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: '24px', height: '24px' }}
                    onClick={handleRemoveImage}
                    title="Remove Image"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="border border-2 border-dashed rounded p-3 text-center bg-light">
                  <Upload size={28} className="text-muted mb-2" />
                  <div className="small text-muted mb-2">
                    Select an image file to upload category preview
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    id="add-category-image"
                    className="d-none"
                    onChange={handleImageChange}
                  />
                  <label
                    htmlFor="add-category-image"
                    className="btn btn-sm btn-outline-primary m-0"
                  >
                    Choose Image File
                  </label>
                </div>
              )}
              {formErrors.image && (
                <div className="sonocare-error-message mt-1" role="alert">
                  {formErrors.image}
                </div>
              )}
            </div>
          </div>
        </form>
      </Modal>

      {/* 4. EDIT CATEGORY MODAL */}
      <Modal
        show={isEditModalOpen}
        onHide={handleCloseModal}
        title="Edit General Category"
        size="md"
        centered={true}
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            <Button
              variant="outline-secondary"
              onClick={handleCloseModal}
            >
              Back
            </Button>
            <Button
              variant="primary"
              onClick={handleEditCategorySubmit}
              style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
            >
              Update Category
            </Button>
          </div>
        }
      >
        <form onSubmit={handleEditCategorySubmit} noValidate>
          <div className="row g-3">
            <div className="col-12">
              <InputField
                label="Category Name"
                placeholder="Category Name"
                required={true}
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={formErrors.name}
              />
            </div>

            <div className="col-12">
              <InputField
                label="Description"
                type="textarea"
                rows={3}
                placeholder="Category Description..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>

            <div className="col-12">
              <label className="sonocare-label mb-2">
                <span>Category Image</span>
              </label>

              {imagePreview ? (
                <div className="position-relative d-inline-block border rounded p-2 bg-light">
                  <img
                    src={imagePreview}
                    alt="Category Preview"
                    className="rounded object-fit-cover"
                    style={{ width: '120px', height: '100px' }}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 p-1 rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: '24px', height: '24px' }}
                    onClick={handleRemoveImage}
                    title="Remove Image"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="border border-2 border-dashed rounded p-3 text-center bg-light">
                  <Upload size={28} className="text-muted mb-2" />
                  <div className="small text-muted mb-2">
                    Select a new image file to update
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    id="edit-category-image"
                    className="d-none"
                    onChange={handleImageChange}
                  />
                  <label
                    htmlFor="edit-category-image"
                    className="btn btn-sm btn-outline-primary m-0"
                  >
                    Change Image File
                  </label>
                </div>
              )}
            </div>
          </div>
        </form>
      </Modal>

      {/* 5. VIEW CATEGORY MODAL */}
      <Modal
        show={isViewModalOpen}
        onHide={handleCloseModal}
        title="View Category"
        size="md"
        centered={true}
        footer={
          <div className="d-flex justify-content-end w-100">
            <Button
              variant="outline-secondary"
              onClick={handleCloseModal}
            >
              Back
            </Button>
          </div>
        }
      >
        {selectedCategory && (
          <div className="py-2">
            <div className="d-flex align-items-start gap-3 mb-4">
              {selectedCategory.image ? (
                <img
                  src={selectedCategory.image}
                  alt={selectedCategory.name}
                  className="rounded border object-fit-cover shadow-sm"
                  style={{ width: '90px', height: '90px' }}
                />
              ) : (
                <div
                  className="rounded-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold fs-3"
                  style={{ width: '90px', height: '90px' }}
                >
                  {selectedCategory.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <h3 className="h5 fw-bold text-dark mb-1">{selectedCategory.name}</h3>
                <span className="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle px-2 py-1">
                  Category ID: #{selectedCategory.id}
                </span>
              </div>
            </div>

            <div className="border-top pt-3">
              <label className="text-muted small fw-semibold text-uppercase tracking-wide mb-1 d-block">
                Description
              </label>
              <p className="text-dark bg-light p-3 rounded border mb-0" style={{ lineHeight: '1.6' }}>
                {selectedCategory.description || 'No description provided for this category.'}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* 6. DELETE CATEGORY CONFIRMATION MODAL */}
      <Modal
        show={isDeleteModalOpen}
        onHide={() => setIsDeleteModalOpen(false)}
        title="Delete Category"
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
              onClick={handleDeleteCategoryConfirm}
            >
              Delete
            </Button>
          </div>
        }
      >
        {selectedCategory && (
          <div className="py-2">
            <p className="text-dark fs-6 mb-0">
              Are you sure you want to delete the category &quot;
              <strong className="text-danger">{selectedCategory.name}</strong>&quot;?
            </p>
            <span className="text-muted small d-block mt-2">
              This action will remove the category from your local register.
            </span>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Category;
