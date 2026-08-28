import React, { useState } from 'react';
import ProductList from './ProductList';
import AddProduct from './AddProduct';
import EditProduct from './EditProduct';
import ViewProduct from './ViewProduct';
import { toast } from '../../components/Toast';

const initialMockProducts = [
  {
    id: 1,
    productId: 'PRD-1001',
    category: 'Machinery & Equipment',
    productName: 'Heavy CNC Milling Center 5000',
    specification: '5-Axis Precision Milling with 12000 RPM Spindle',
    modelNo: 'CNC-5000X',
    hsnCode: '8459',
    purchasePrice: 450000.0,
    cancellationBeforeDispatch: 5.0,
    cancellationAfterDispatch: 15.0,
    cancellationAfterInstallation: 25.0,
    kitRequirement: 'Yes',
    status: 'Active',
    description: 'Industrial heavy machinery CNC milling center for automated manufacturing and high-precision metal tooling.'
  },
  {
    id: 2,
    productId: 'PRD-1002',
    category: 'Tooling & Accessories',
    productName: 'Precision CNC Collet Assembly Kit',
    specification: 'ER32 Spring Collet Set (18 Pcs)',
    modelNo: 'COLLET-ER32',
    hsnCode: '8466',
    purchasePrice: 85000.0,
    cancellationBeforeDispatch: 2.0,
    cancellationAfterDispatch: 10.0,
    cancellationAfterInstallation: 15.0,
    kitRequirement: 'Yes',
    status: 'Active',
    description: 'High-precision workholding fixtures and CNC collet assemblies for toolholders.'
  },
  {
    id: 3,
    productId: 'PRD-1003',
    category: 'Electrical & Automation',
    productName: 'Industrial PLC Servo Controller Unit',
    specification: '32-Channel Digital I/O Modbus TCP/IP',
    modelNo: 'PLC-SERVO-32',
    hsnCode: '8537',
    purchasePrice: 320000.0,
    cancellationBeforeDispatch: 5.0,
    cancellationAfterDispatch: 20.0,
    cancellationAfterInstallation: 30.0,
    kitRequirement: 'No',
    status: 'Active',
    description: 'Control panels, AC drives, and servo motor controllers with automation sensors.'
  },
  {
    id: 4,
    productId: 'PRD-1004',
    category: 'Medical & Diagnostic Scanners',
    productName: 'Sonocare HD Cardiac Probe Transducer',
    specification: 'Phased Array 1-5 MHz Diagnostic Cardiac Probe',
    modelNo: 'SONO-CP15',
    hsnCode: '9018',
    purchasePrice: 1250000.0,
    cancellationBeforeDispatch: 3.0,
    cancellationAfterDispatch: 12.0,
    cancellationAfterInstallation: 20.0,
    kitRequirement: 'Yes',
    status: 'Inactive',
    description: 'Diagnostic ultrasound transducer probe for cardiac and abdominal healthcare diagnostics.'
  }
];

const Product = () => {
  const [products, setProducts] = useState(initialMockProducts);
  const [currentView, setCurrentView] = useState('list'); // 'list' | 'add' | 'edit' | 'view'
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Status Change Handler (directly in Table)
  const handleStatusChange = (id, newStatus) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    toast.success(`Product status updated to ${newStatus}`);
  };

  // Add Product Handler
  const handleAddProduct = (newProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
    setCurrentView('list');
  };

  // Edit Product Handler
  const handleUpdateProduct = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === updatedProduct.id ? updatedProduct : item))
    );
    setCurrentView('list');
    setSelectedProduct(null);
  };

  // Delete Product Handler
  const handleDeleteProduct = (id) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
  };

  // Navigation Handlers
  const handleNavigateToAdd = () => {
    setCurrentView('add');
  };

  const handleNavigateToEdit = (product) => {
    setSelectedProduct(product);
    setCurrentView('edit');
  };

  const handleNavigateToView = (product) => {
    setSelectedProduct(product);
    setCurrentView('view');
  };

  const handleCancel = () => {
    setCurrentView('list');
    setSelectedProduct(null);
  };

  return (
    <div>
      {currentView === 'add' && (
        <AddProduct onAddProduct={handleAddProduct} onCancel={handleCancel} />
      )}

      {currentView === 'edit' && (
        <EditProduct
          product={selectedProduct}
          onUpdateProduct={handleUpdateProduct}
          onCancel={handleCancel}
        />
      )}

      {currentView === 'view' && (
        <ViewProduct product={selectedProduct} onCancel={handleCancel} />
      )}

      {currentView === 'list' && (
        <ProductList
          products={products}
          onStatusChange={handleStatusChange}
          onNavigateToAdd={handleNavigateToAdd}
          onNavigateToEdit={handleNavigateToEdit}
          onNavigateToView={handleNavigateToView}
          onDeleteProduct={handleDeleteProduct}
        />
      )}
    </div>
  );
};

export default Product;
