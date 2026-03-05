/**
 * @file index.ts
 * @description Centralized TypeScript type definitions for the BANTOO1 application.
 * These types reflect the Supabase database schema and are used across services,
 * contexts, and hooks to provide strict type safety.
 */

// ==========================================
// 1. CORE ENTITIES
// ==========================================

export type UserRole = 'customer' | 'merchant' | 'driver' | 'admin';

export interface Profile {
    id: string; // UUID (matches auth.users.id)
    full_name: string | null;
    phone: string | null; // Unique phone number
    email: string | null;
    avatar_url: string | null;
    role: UserRole; // Primary role enum
    active_role: UserRole; // Currently active role in the UI
    created_at: string; // ISO timestamp
    updated_at: string; // ISO timestamp
}

export type RegistrationStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'suspended';

export interface Merchant {
    id: string; // UUID
    owner_id: string; // UUID referencing Profile.id
    name: string;
    description: string | null;
    address: string | null;
    phone: string | null;
    image_url: string | null;
    category: string | null;
    rating: number; // e.g., 4.5
    rating_count: number;
    delivery_time: string; // e.g., '20-30 min'
    delivery_fee: number;
    distance: number; // Static distance fallback (km)
    latitude: number | null;
    longitude: number | null;
    is_open: boolean; // Store toggle status
    has_promo: boolean;
    status: RegistrationStatus;
    approved_at: string | null; // ISO timestamp
    approved_by: string | null; // UUID referencing Profile.id
    rejected_at: string | null; // ISO timestamp
    rejection_reason: string | null;
    created_at: string; // ISO timestamp
    updated_at: string; // ISO timestamp
}

export interface MenuItem {
    id: string; // UUID
    merchant_id: string; // UUID referencing Merchant.id
    name: string;
    description: string | null;
    price: number; // Integer value >= 0
    image_url: string | null;
    category: string | null;
    is_popular: boolean;
    is_available: boolean;
    created_at: string; // ISO timestamp
    updated_at: string; // ISO timestamp
}

export interface Driver {
    id: string; // UUID
    user_id: string; // UUID referencing Profile.id
    vehicle_type: string; // e.g., 'motorcycle'
    vehicle_plate: string | null;
    vehicle_brand: string | null;
    status: RegistrationStatus;
    is_active: boolean; // Online/Offline status
    latitude: number | null;
    longitude: number | null;
    approved_at: string | null; // ISO timestamp
    approved_by: string | null; // UUID referencing Profile.id
    rejected_at: string | null; // ISO timestamp
    rejection_reason: string | null;
    created_at: string; // ISO timestamp
    updated_at: string; // ISO timestamp
}

// ==========================================
// 2. ORDER & FINANCIAL ENTITIES
// ==========================================

export type OrderStatus = 'pending' | 'accepted' | 'processing' | 'ready' | 'pickup' | 'picked_up' | 'delivering' | 'delivered' | 'completed' | 'cancelled';

export type PaymentMethod = 'cod' | 'wallet' | 'bank_transfer';

export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface Order {
    id: string; // UUID
    customer_id: string; // UUID referencing Profile.id
    merchant_id: string; // UUID referencing Merchant.id
    driver_id: string | null; // UUID referencing Profile.id
    status: OrderStatus;
    subtotal: number; // Cost of items
    delivery_fee: number; // Cost of delivery
    service_fee: number; // Platform fee
    discount: number; // Applied discount amount
    total_amount: number; // Final amount to pay
    payment_method: PaymentMethod;
    payment_status: PaymentStatus;
    promo_id: string | null; // UUID referencing Promo.id
    promo_code: string | null;
    delivery_address: string | null;
    delivery_detail: string | null;
    customer_name: string | null;
    customer_phone: string | null;
    customer_lat: number | null;
    customer_lng: number | null;
    notes: string | null;
    cancellation_reason: string | null;
    created_at: string; // ISO timestamp
    accepted_at: string | null; // ISO timestamp
    picked_up_at: string | null; // ISO timestamp
    delivered_at: string | null; // ISO timestamp
    cancelled_at: string | null; // ISO timestamp
    updated_at: string; // ISO timestamp
}

export interface OrderItem {
    id: string; // UUID
    order_id: string; // UUID referencing Order.id
    product_id: string; // UUID referencing MenuItem.id
    product_name: string; // Name at time of order
    quantity: number; // >= 1
    price_at_time: number; // Price at time of order
    notes: string | null;
    created_at: string; // ISO timestamp
}

export interface Promo {
    id: string; // UUID
    code: string; // Unique promo code
    type: 'fixed' | 'percentage';
    value: number; // Amount or percentage
    max_discount: number | null; // Cap for percentage discounts
    min_order: number; // Minimum order amount to apply
    usage_limit: number | null; // Maximum total uses
    used_count: number; // Current total uses
    valid_until: string | null; // ISO timestamp
    is_active: boolean;
    created_at: string; // ISO timestamp
}

export interface Wallet {
    id: string; // UUID
    user_id: string; // UUID referencing Profile.id
    balance: number; // Current balance >= 0
    pin: string | null; // Hashed PIN
    created_at: string; // ISO timestamp
    updated_at: string; // ISO timestamp
}

export type TransactionType = 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'earnings';

export interface Transaction {
    id: string; // UUID
    wallet_id: string; // UUID referencing Wallet.id
    type: TransactionType;
    amount: number;
    description: string | null;
    status: string; // e.g., 'completed', 'pending'
    reference_id: string | null; // Can link to Order ID or Withdrawal ID
    created_at: string; // ISO timestamp
}

export interface Withdrawal {
    id: string; // UUID
    user_id: string; // UUID referencing Profile.id
    amount: number;
    bank_name: string | null;
    bank_account_name: string | null;
    bank_account_number: string | null;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    proof_image: string | null; // URL to transfer proof
    created_at: string; // ISO timestamp
    updated_at: string; // ISO timestamp
}

// ==========================================
// 3. SERVICE RESPONSES & PAYLOADS
// ==========================================

export interface ServiceResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}
