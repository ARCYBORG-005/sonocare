export const initialMockInventory = [
  {
    id: 1,
    inventoryId: 'INV-PRD-001',
    itemType: 'Product', // 'Product' | 'Kit'
    productName: 'Sonoscape X5 Portable Ultrasound System',
    unitPrice: 5000000,
    totalQuantity: 18,
    totalValuation: 90000000,
    stockStatus: 'In Stock', // 'In Stock' | 'Low Stock' | 'Out of Stock'
    category: 'Medical & Diagnostic Scanners',
    lastShiftDate: '2026-08-25',
    adjustmentHistory: [
      {
        id: 101,
        date: '2026-08-25 10:30 AM',
        action: 'Add (+)',
        changedQty: 5,
        previousStock: 13,
        newStock: 18,
        reason: 'Received shipment batch #4910 from manufacturing plant',
        adjustedBy: 'Rajesh Kumar (Warehouse Manager)'
      },
      {
        id: 102,
        date: '2026-08-20 02:15 PM',
        action: 'Subtract (-)',
        changedQty: 2,
        previousStock: 15,
        newStock: 13,
        reason: 'Dispatched 2 units for Order #PI-2026-003',
        adjustedBy: 'Suresh Babu (Operations Exec)'
      }
    ]
  },
  {
    id: 2,
    inventoryId: 'INV-PRD-002',
    itemType: 'Product',
    productName: 'Sonocare Premium 4D Ultrasound Workstation',
    unitPrice: 4500000,
    totalQuantity: 12,
    totalValuation: 54000000,
    stockStatus: 'In Stock',
    category: 'Medical & Diagnostic Scanners',
    lastShiftDate: '2026-08-22',
    adjustmentHistory: [
      {
        id: 103,
        date: '2026-08-22 11:00 AM',
        action: 'Set (=)',
        changedQty: 12,
        previousStock: 10,
        newStock: 12,
        reason: 'Annual physical inventory audit adjustment',
        adjustedBy: 'Amit Patel (Inventory Auditor)'
      }
    ]
  },
  {
    id: 3,
    inventoryId: 'INV-KIT-001',
    itemType: 'Kit',
    productName: 'Sonoscape X5 Standard Transducer & Trolley Kit',
    unitPrice: 135000,
    totalQuantity: 25,
    totalValuation: 3375000,
    stockStatus: 'In Stock',
    category: 'Ultrasound Transducers & Accessories',
    lastShiftDate: '2026-08-26',
    adjustmentHistory: [
      {
        id: 104,
        date: '2026-08-26 09:45 AM',
        action: 'Add (+)',
        changedQty: 10,
        previousStock: 15,
        newStock: 25,
        reason: 'Assembled trolley carts and probe holders in warehouse',
        adjustedBy: 'Vikram Singh (Kit Assembler)'
      }
    ]
  },
  {
    id: 4,
    inventoryId: 'INV-KIT-002',
    itemType: 'Kit',
    productName: 'Sonoscape X5 Premium Cardiac Probe & Software License Pack',
    unitPrice: 250000,
    totalQuantity: 3,
    totalValuation: 750000,
    stockStatus: 'Low Stock',
    category: 'Ultrasound Transducers & Accessories',
    lastShiftDate: '2026-08-28',
    adjustmentHistory: [
      {
        id: 105,
        date: '2026-08-28 04:00 PM',
        action: 'Subtract (-)',
        changedQty: 4,
        previousStock: 7,
        newStock: 3,
        reason: 'Issued for Order Fulfilment PI-2026-002',
        adjustedBy: 'Suresh Babu (Operations Exec)'
      }
    ]
  }
];
