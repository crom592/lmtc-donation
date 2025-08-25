export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: 'BAZAAR' | 'CAFE';
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED';
  paymentInfo?: any;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  tickets?: Ticket[];
}

export interface Ticket {
  id: string;
  orderId: string;
  ticketTypeId: string;
  qrCode: string;
  status: 'PENDING' | 'ACTIVE' | 'USED' | 'EXPIRED' | 'CANCELLED';
  issuedAt?: Date;
  usedAt?: Date;
  usedById?: string;
  createdAt: Date;
  updatedAt: Date;
  order?: Order;
  ticketType?: TicketType;
}

export interface UsageLog {
  id: string;
  ticketId: string;
  usedById: string;
  location?: string;
  notes?: string;
  createdAt: Date;
  ticket?: Ticket;
  usedBy?: User;
}