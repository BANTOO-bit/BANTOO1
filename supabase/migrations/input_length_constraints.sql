-- ============================================================
-- PRODUCTION HARDENING: SQL Input Length Validation
-- Fix #4: Add CHECK constraints to prevent excessively long text
-- Deploy via: Supabase SQL Editor → paste → Run
-- ============================================================

-- Orders: Limit address and notes lengths
ALTER TABLE public.orders
    ADD CONSTRAINT chk_orders_delivery_address_len CHECK (length(delivery_address) <= 500),
    ADD CONSTRAINT chk_orders_delivery_detail_len CHECK (length(delivery_detail) <= 500),
    ADD CONSTRAINT chk_orders_notes_len CHECK (length(notes) <= 1000),
    ADD CONSTRAINT chk_orders_customer_name_len CHECK (length(customer_name) <= 100),
    ADD CONSTRAINT chk_orders_customer_phone_len CHECK (length(customer_phone) <= 20),
    ADD CONSTRAINT chk_orders_cancellation_reason_len CHECK (length(cancellation_reason) <= 1000);

-- Profiles: Limit name and phone
ALTER TABLE public.profiles
    ADD CONSTRAINT chk_profiles_full_name_len CHECK (length(full_name) <= 100),
    ADD CONSTRAINT chk_profiles_phone_len CHECK (length(phone) <= 20);

-- Merchants: Limit text fields
ALTER TABLE public.merchants
    ADD CONSTRAINT chk_merchants_name_len CHECK (length(name) <= 200),
    ADD CONSTRAINT chk_merchants_description_len CHECK (length(description) <= 2000),
    ADD CONSTRAINT chk_merchants_address_len CHECK (length(address) <= 500),
    ADD CONSTRAINT chk_merchants_phone_len CHECK (length(phone) <= 20);

-- Menu items: Limit name and description
ALTER TABLE public.menu_items
    ADD CONSTRAINT chk_menu_items_name_len CHECK (length(name) <= 200),
    ADD CONSTRAINT chk_menu_items_description_len CHECK (length(description) <= 1000),
    ADD CONSTRAINT chk_menu_items_category_len CHECK (length(category) <= 100);

-- Order disputes: Limit reason and resolution
ALTER TABLE public.order_disputes
    ADD CONSTRAINT chk_disputes_reason_len CHECK (length(reason) <= 2000),
    ADD CONSTRAINT chk_disputes_resolution_len CHECK (length(resolution) <= 2000);

-- Drivers: Limit vehicle info
ALTER TABLE public.drivers
    ADD CONSTRAINT chk_drivers_vehicle_plate_len CHECK (length(vehicle_plate) <= 20),
    ADD CONSTRAINT chk_drivers_vehicle_brand_len CHECK (length(vehicle_brand) <= 100);
