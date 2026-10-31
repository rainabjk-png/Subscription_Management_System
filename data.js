/**
 * SubFlow - Subscription Management System
 * Initial Mock / Demo Data Store
 * Contains pre-populated realistic demo data for presentation and hackathon evaluation.
 * Note: Free of any personal or team member names.
 */

const INITIAL_DATA = {
  // Current user session default
  currentUser: {
    id: 'USR-001',
    name: 'System Administrator',
    email: 'admin@subflow.io',
    role: 'ADMIN', // ADMIN | STAFF | CUSTOMER
    customerId: null
  },

  // Users for Role-Based Access Control demo
  users: [
    {
      id: 'USR-001',
      name: 'System Administrator',
      email: 'admin@subflow.io',
      role: 'ADMIN',
      status: 'Active',
      createdAt: '2026-01-10'
    },
    {
      id: 'USR-002',
      name: 'Operations Staff',
      email: 'staff@subflow.io',
      role: 'STAFF',
      status: 'Active',
      createdAt: '2026-01-15'
    },
    {
      id: 'USR-003',
      name: 'CloudScale Enterprise',
      email: 'customer@cloudscale.io',
      role: 'CUSTOMER',
      customerId: 'CUST-001',
      status: 'Active',
      createdAt: '2026-02-01'
    }
  ],

  // Products Catalog with Variants
  products: [
    {
      id: 'PRD-001',
      name: 'Cloud Platform Core',
      type: 'Service',
      sellingPrice: 149.00,
      cost: 45.00,
      notes: 'High-availability container cloud runtime with auto-scaling.',
      variants: [
        { id: 'VAR-101', name: 'Standard (4 vCPU / 16GB)', extraPrice: 0.00 },
        { id: 'VAR-102', name: 'High-Mem (8 vCPU / 32GB)', extraPrice: 80.00 },
        { id: 'VAR-103', name: 'GPU Accelerated (Tesla T4)', extraPrice: 220.00 }
      ]
    },
    {
      id: 'PRD-002',
      name: 'Enterprise Security Shield',
      type: 'Software',
      sellingPrice: 89.00,
      cost: 20.00,
      notes: 'End-to-end encryption, automated compliance scanning, and DDoS defense.',
      variants: [
        { id: 'VAR-201', name: 'Essential (Up to 50 endpoints)', extraPrice: 0.00 },
        { id: 'VAR-202', name: 'Unlimited Fleet Protection', extraPrice: 110.00 }
      ]
    },
    {
      id: 'PRD-003',
      name: 'API Analytics Pro',
      type: 'Software',
      sellingPrice: 49.00,
      cost: 12.00,
      notes: 'Real-time telemetry, anomaly alerts, and custom dashboard reporting.',
      variants: [
        { id: 'VAR-301', name: 'Standard Tier (1M calls/mo)', extraPrice: 0.00 },
        { id: 'VAR-302', name: 'Enterprise Tier (10M calls/mo)', extraPrice: 99.00 }
      ]
    },
    {
      id: 'PRD-004',
      name: '24/7 Dedicated Support Desk',
      type: 'Service',
      sellingPrice: 199.00,
      cost: 90.00,
      notes: '15-minute SLA response time with dedicated technical account engineers.',
      variants: [
        { id: 'VAR-401', name: 'Standard Business Hours', extraPrice: 0.00 },
        { id: 'VAR-402', name: '24x7x365 Continuous SLA', extraPrice: 150.00 }
      ]
    }
  ],

  // Subscription Plans
  plans: [
    {
      id: 'PLN-001',
      name: 'Developer Starter',
      productId: 'PRD-001',
      price: 49.00,
      billingInterval: 'Monthly', // Daily | Weekly | Monthly | Yearly
      minQuantity: 1,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      autoRenew: true,
      features: ['Up to 5 Projects', 'Community Support', '99.5% SLA', 'Daily Backups']
    },
    {
      id: 'PLN-002',
      name: 'Business Pro Suite',
      productId: 'PRD-001',
      price: 199.00,
      billingInterval: 'Monthly',
      minQuantity: 1,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      autoRenew: true,
      features: ['Unlimited Projects', 'Priority 24/7 Support', '99.99% SLA', 'Real-time Analytics']
    },
    {
      id: 'PLN-003',
      name: 'Enterprise Annual Cloud',
      productId: 'PRD-001',
      price: 1890.00,
      billingInterval: 'Yearly',
      minQuantity: 1,
      startDate: '2026-01-01',
      endDate: '2027-01-01',
      autoRenew: true,
      features: ['Dedicated Account Lead', 'Custom Integrations', 'Custom SLA', 'Security Shield Included']
    },
    {
      id: 'PLN-004',
      name: 'Security Shield Weekly Pass',
      productId: 'PRD-002',
      price: 25.00,
      billingInterval: 'Weekly',
      minQuantity: 1,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      autoRenew: false,
      features: ['Weekly Vulnerability Audit', 'Penetration testing log', 'Instant alert hotline']
    },
    {
      id: 'PLN-005',
      name: 'Daily Compute Burst',
      productId: 'PRD-001',
      price: 15.00,
      billingInterval: 'Daily',
      minQuantity: 2,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      autoRenew: false,
      features: ['On-demand HPC instances', 'Hourly billing granularity', 'Zero idle costs']
    }
  ],

  // Customers Directory
  customers: [
    {
      id: 'CUST-001',
      name: 'CloudScale Enterprise',
      contactPerson: 'Operations Department',
      email: 'customer@cloudscale.io',
      phone: '+1 (555) 234-8901',
      address: '742 Evergreen Suite, Seattle, WA',
      industry: 'Technology & Cloud',
      status: 'Active',
      joinedDate: '2026-01-15'
    },
    {
      id: 'CUST-002',
      name: 'NovaTech Solutions',
      contactPerson: 'Infrastructure Team',
      email: 'billing@novatech.com',
      phone: '+1 (555) 876-5432',
      address: '100 Innovation Way, Austin, TX',
      industry: 'Software Consulting',
      status: 'Active',
      joinedDate: '2026-02-01'
    },
    {
      id: 'CUST-003',
      name: 'Vertex AI Labs',
      contactPerson: 'Procurement Officer',
      email: 'accounts@vertexlabs.io',
      phone: '+1 (555) 345-6789',
      address: '500 Tech Boulevard, San Francisco, CA',
      industry: 'Artificial Intelligence',
      status: 'Active',
      joinedDate: '2026-02-20'
    },
    {
      id: 'CUST-004',
      name: 'Beacon Media Inc',
      contactPerson: 'Finance Director',
      email: 'billing@beaconmedia.org',
      phone: '+1 (555) 901-2345',
      address: '320 Media Plaza, New York, NY',
      industry: 'Digital Broadcasting',
      status: 'Active',
      joinedDate: '2026-03-05'
    },
    {
      id: 'CUST-005',
      name: 'Quantum Logistics',
      contactPerson: 'Logistics Desk',
      email: 'it@quantumlog.net',
      phone: '+1 (555) 432-1098',
      address: '88 Freight Harbor, Chicago, IL',
      industry: 'Supply Chain',
      status: 'Inactive',
      joinedDate: '2026-01-10'
    }
  ],

  // Subscriptions Lifecycle: Draft -> Quotation -> Confirmed -> Active -> Closed
  subscriptions: [
    {
      id: 'SUB-2026-001',
      customerId: 'CUST-001',
      planId: 'PLN-002',
      variantId: 'VAR-102',
      status: 'Active', // Draft | Quotation | Confirmed | Active | Closed
      startDate: '2026-02-01',
      expiryDate: '2026-11-30',
      nextBillingDate: '2026-11-01',
      billingInterval: 'Monthly',
      paymentTerms: 'Net 15',
      quantity: 3,
      unitPrice: 279.00, // 199 base + 80 variant
      taxRate: 10, // 10%
      taxAmount: 83.70,
      totalAmount: 920.70,
      notes: 'Auto-renews each calendar month via corporate card on file.'
    },
    {
      id: 'SUB-2026-002',
      customerId: 'CUST-002',
      planId: 'PLN-003',
      variantId: null,
      status: 'Active',
      startDate: '2026-02-15',
      expiryDate: '2027-02-14',
      nextBillingDate: '2027-02-15',
      billingInterval: 'Yearly',
      paymentTerms: 'Net 30',
      quantity: 1,
      unitPrice: 1890.00,
      taxRate: 10,
      taxAmount: 189.00,
      totalAmount: 2079.00,
      notes: 'Enterprise contract signed with annual advance payment.'
    },
    {
      id: 'SUB-2026-003',
      customerId: 'CUST-003',
      planId: 'PLN-001',
      variantId: 'VAR-101',
      status: 'Confirmed',
      startDate: '2026-11-01',
      expiryDate: '2026-12-01',
      nextBillingDate: '2026-11-01',
      billingInterval: 'Monthly',
      paymentTerms: 'Immediate',
      quantity: 5,
      unitPrice: 49.00,
      taxRate: 10,
      taxAmount: 24.50,
      totalAmount: 269.50,
      notes: 'Awaiting activation upon billing cycle start.'
    },
    {
      id: 'SUB-2026-004',
      customerId: 'CUST-004',
      planId: 'PLN-004',
      variantId: null,
      status: 'Draft',
      startDate: '2026-11-05',
      expiryDate: '2026-11-12',
      nextBillingDate: '2026-11-05',
      billingInterval: 'Weekly',
      paymentTerms: 'Net 7',
      quantity: 2,
      unitPrice: 25.00,
      taxRate: 10,
      taxAmount: 5.00,
      totalAmount: 55.00,
      notes: 'Initial quotation drafted for weekly security assessment.'
    },
    {
      id: 'SUB-2026-005',
      customerId: 'CUST-005',
      planId: 'PLN-001',
      variantId: null,
      status: 'Closed',
      startDate: '2026-01-15',
      expiryDate: '2026-08-15',
      nextBillingDate: '2026-08-15',
      billingInterval: 'Monthly',
      paymentTerms: 'Net 15',
      quantity: 1,
      unitPrice: 49.00,
      taxRate: 10,
      taxAmount: 4.90,
      totalAmount: 53.90,
      notes: 'Terminated upon client project conclusion.'
    }
  ],

  // Quotations
  quotations: [
    {
      id: 'QTE-2026-01',
      customerId: 'CUST-004',
      templateName: 'Standard Enterprise Proposal',
      validUntil: '2026-11-20',
      status: 'Open', // Open | Confirmed | Expired | Rejected
      items: [
        { description: 'Business Pro Suite (Annual Seat)', quantity: 4, unitPrice: 199.00, total: 796.00 },
        { description: 'Dedicated Support Desk Tier', quantity: 1, unitPrice: 199.00, total: 199.00 }
      ],
      subtotal: 995.00,
      discountAmount: 95.00,
      taxRate: 10,
      taxAmount: 90.00,
      totalAmount: 990.00,
      notes: 'Valid for 20 calendar days from issue date.'
    },
    {
      id: 'QTE-2026-02',
      customerId: 'CUST-001',
      templateName: 'Compute Expansion Quotation',
      validUntil: '2026-11-15',
      status: 'Confirmed',
      items: [
        { description: 'GPU Accelerated Compute Node', quantity: 2, unitPrice: 369.00, total: 738.00 },
        { description: 'API Analytics Pro - Enterprise', quantity: 1, unitPrice: 148.00, total: 148.00 }
      ],
      subtotal: 886.00,
      discountAmount: 0.00,
      taxRate: 10,
      taxAmount: 88.60,
      totalAmount: 974.60,
      notes: 'Approved by client procurement team.'
    }
  ],

  // Invoices: Draft -> Confirmed -> Paid (or Overdue)
  invoices: [
    {
      id: 'INV-2026-101',
      invoiceNumber: 'INV-2026-101',
      customerId: 'CUST-001',
      subscriptionId: 'SUB-2026-001',
      issueDate: '2026-10-01',
      dueDate: '2026-10-15',
      subtotal: 837.00,
      taxRate: 10,
      taxAmount: 83.70,
      totalAmount: 920.70,
      amountPaid: 920.70,
      balanceDue: 0.00,
      status: 'Paid', // Draft | Confirmed | Paid | Overdue | Cancelled
      notes: 'Monthly billing cycle for October 2026.'
    },
    {
      id: 'INV-2026-102',
      invoiceNumber: 'INV-2026-102',
      customerId: 'CUST-002',
      subscriptionId: 'SUB-2026-002',
      issueDate: '2026-02-15',
      dueDate: '2026-03-15',
      subtotal: 1890.00,
      taxRate: 10,
      taxAmount: 189.00,
      totalAmount: 2079.00,
      amountPaid: 2079.00,
      balanceDue: 0.00,
      status: 'Paid',
      notes: 'Annual enterprise commitment invoice.'
    },
    {
      id: 'INV-2026-103',
      invoiceNumber: 'INV-2026-103',
      customerId: 'CUST-001',
      subscriptionId: 'SUB-2026-001',
      issueDate: '2026-10-25',
      dueDate: '2026-11-09',
      subtotal: 837.00,
      taxRate: 10,
      taxAmount: 83.70,
      totalAmount: 920.70,
      amountPaid: 0.00,
      balanceDue: 920.70,
      status: 'Confirmed', // Outstanding
      notes: 'Upcoming renewal cycle invoice.'
    },
    {
      id: 'INV-2026-104',
      invoiceNumber: 'INV-2026-104',
      customerId: 'CUST-003',
      subscriptionId: 'SUB-2026-003',
      issueDate: '2026-09-15',
      dueDate: '2026-10-01',
      subtotal: 245.00,
      taxRate: 10,
      taxAmount: 24.50,
      totalAmount: 269.50,
      amountPaid: 0.00,
      balanceDue: 269.50,
      status: 'Overdue',
      notes: 'First reminder notice delivered via email.'
    },
    {
      id: 'INV-2026-105',
      invoiceNumber: 'INV-2026-105',
      customerId: 'CUST-004',
      subscriptionId: 'SUB-2026-004',
      issueDate: '2026-10-30',
      dueDate: '2026-11-14',
      subtotal: 50.00,
      taxRate: 10,
      taxAmount: 5.00,
      totalAmount: 55.00,
      amountPaid: 0.00,
      balanceDue: 55.00,
      status: 'Draft',
      notes: 'Draft pending final supervisor confirmation.'
    }
  ],

  // Payments History
  payments: [
    {
      id: 'PAY-2026-801',
      invoiceId: 'INV-2026-101',
      customerId: 'CUST-001',
      amount: 920.70,
      method: 'Credit Card', // Credit Card | Bank Transfer | Stripe | PayPal | Cash
      date: '2026-10-05',
      transactionRef: 'TXN-98421035',
      notes: 'Autopay processed successfully via Master Corporate Card.'
    },
    {
      id: 'PAY-2026-802',
      invoiceId: 'INV-2026-102',
      customerId: 'CUST-002',
      amount: 2079.00,
      method: 'Bank Transfer',
      date: '2026-02-28',
      transactionRef: 'WIRE-US-55418',
      notes: 'Direct wire transfer received and reconciled.'
    }
  ],

  // Discounts & Promotional Coupons (Admin Only)
  discounts: [
    {
      id: 'DISC-001',
      code: 'HACKATHON20',
      type: 'Percentage', // Percentage | Fixed
      value: 20.00, // 20%
      minPurchase: 100.00,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      maxUsage: 100,
      usageCount: 14,
      status: 'Active', // Active | Expired | Exhausted
      notes: 'Special 20% promotional discount for hackathon evaluation demo.'
    },
    {
      id: 'DISC-002',
      code: 'STARTUP50',
      type: 'Fixed',
      value: 50.00, // $50 flat
      minPurchase: 200.00,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      maxUsage: 50,
      usageCount: 22,
      status: 'Active',
      notes: 'Fixed $50 off initial subscription onboarding.'
    },
    {
      id: 'DISC-003',
      code: 'EXPIRED10',
      type: 'Percentage',
      value: 10.00,
      minPurchase: 50.00,
      startDate: '2026-01-01',
      endDate: '2026-06-30',
      maxUsage: 20,
      usageCount: 20,
      status: 'Expired',
      notes: 'Mid-year discount campaign ended June 2026.'
    }
  ],

  // Activity Logs
  activities: [
    {
      id: 'ACT-001',
      title: 'Payment Reconciled',
      description: 'Payment of $920.70 recorded for INV-2026-101 (CloudScale Enterprise).',
      time: '12 minutes ago',
      type: 'payment'
    },
    {
      id: 'ACT-002',
      title: 'New Quotation Generated',
      description: 'Quotation QTE-2026-01 sent to Beacon Media Inc ($990.00).',
      time: '1 hour ago',
      type: 'quotation'
    },
    {
      id: 'ACT-003',
      title: 'Subscription Status Updated',
      description: 'SUB-2026-003 confirmed and transitioned into active billing queue.',
      time: '3 hours ago',
      type: 'subscription'
    },
    {
      id: 'ACT-004',
      title: 'System Security Audit Completed',
      description: 'Automated role privilege and access logs verified cleanly.',
      time: 'Yesterday at 4:30 PM',
      type: 'security'
    }
  ]
};

// Export to window for vanilla JS access
if (typeof window !== 'undefined') {
  window.INITIAL_DATA = INITIAL_DATA;
}
