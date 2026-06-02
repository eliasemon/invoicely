export const mockData = {
  dashboard: {
    totalRevenue: 124500.00,
    revenueGrowth: 12,
    unpaidAmount: 18200.00,
    unpaidCount: 12,
    paidAmount: 106300.00,
    paidCount: 84
  },
  recentInvoices: [
    {
      id: 'INV-2023-089',
      clientName: 'Acme Corp',
      clientInitials: 'AC',
      amount: 4500.00,
      status: 'PENDING',
      date: 'Oct 24, 2023',
      phone: '+1 (555) 123-4567'
    },
    {
      id: 'INV-2023-088',
      clientName: 'Global Logistics',
      clientInitials: 'GL',
      amount: 12000.00,
      status: 'PAID',
      date: 'Oct 20, 2023',
      phone: '+1 (555) 987-6543'
    },
    {
      id: 'INV-2023-087',
      clientName: 'Stark Web',
      clientInitials: 'SW',
      amount: 850.00,
      status: 'DRAFT',
      date: 'Oct 15, 2023',
      phone: '+1 (555) 555-5555'
    }
  ]
};
