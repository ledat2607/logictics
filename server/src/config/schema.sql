-- Chạy extension hỗ trợ sinh UUID tự động
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================================
-- 1. BẢNG NGƯỜI DÙNG & TÀI KHOẢN (USERS & AUTH)
-- ========================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(250) NOT NULL,
    
    -- Phân quyền cho cả hiện tại và tương lai
    -- 'customer': Chủ hàng | 'admin': Quản trị | 'driver': Tài xế (GĐ2) | 'warehouse_staff': Nhân viên kho (GĐ2)
    role VARCHAR(30) NOT NULL DEFAULT 'customer' 
        CHECK (role IN ('admin', 'customer', 'driver', 'warehouse_staff')),
    
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    avatar_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb, -- Lưu cấu hình riêng, tích hợp bên 3PL...
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_phone_email ON users(phone, email);

-- ========================================================
-- 2. BẢNG SỔ ĐỊA CHỈ (ADDRESS BOOK)
-- Tách riêng địa chỉ giúp khách hàng chọn nhanh khi tạo đơn
-- ========================================================
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    contact_name VARCHAR(250) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    
    -- Phân rã địa chỉ chuẩn để tính giá chuẩn xác
    street_address TEXT NOT NULL, -- Số nhà, tên đường
    ward VARCHAR(100),            -- Phường / Xã
    district VARCHAR(100) NOT NULL, -- Quận / Huyện
    province VARCHAR(100) NOT NULL, -- Tỉnh / Thành phố
    country_code VARCHAR(10) DEFAULT 'VN',
    
    -- Sẵn sàng cho GĐ3: Định vị GPS
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_addresses_user_id ON addresses(user_id);

-- ========================================================
-- 3. BẢNG BẢNG GIÁ (PRICING MATRIX)
-- Hỗ trợ cấu hình giá theo Tỉnh/Vùng và Trọng lượng
-- ========================================================
CREATE TABLE pricing_rules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- VD: Nội thành HCMC, Liên tỉnh Bắc Nam
    
    from_province VARCHAR(100), -- NULL = Áp dụng toàn quốc
    to_province VARCHAR(100),
    
    min_weight_kg DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
    max_weight_kg DECIMAL(8, 2) NOT NULL,
    
    base_price DECIMAL(12, 2) NOT NULL, -- Phí khởi điểm
    extra_price_per_kg DECIMAL(12, 2) DEFAULT 0, -- Phí mỗi kg tiếp theo
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- 4. BẢNG ĐƠN HÀNG TRUNG TÂM (ORDERS)
-- ========================================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracking_code VARCHAR(50) UNIQUE NOT NULL, -- VD: LOG-20261005-X8K9L2
    
    -- Khách hàng tạo đơn
    customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Sẵn sàng cho GĐ2: Phân công Tài xế & Kho
    assigned_driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    current_warehouse_id UUID, -- Sẽ nối với bảng warehouses ở GĐ2
    
    -- Thông tin người gửi (Lưu snapshot tránh việc đổi sổ địa chỉ làm sai lệch đơn cũ)
    sender_name VARCHAR(250) NOT NULL,
    sender_phone VARCHAR(20) NOT NULL,
    sender_address_full TEXT NOT NULL,
    sender_province VARCHAR(100) NOT NULL,
    sender_district VARCHAR(100) NOT NULL,
    
    -- Thông tin người nhận
    receiver_name VARCHAR(250) NOT NULL,
    receiver_phone VARCHAR(20) NOT NULL,
    receiver_address_full TEXT NOT NULL,
    receiver_province VARCHAR(100) NOT NULL,
    receiver_district VARCHAR(100) NOT NULL,
    
    -- Thông tin hàng hóa
    package_name VARCHAR(255),
    weight_kg DECIMAL(8, 2) NOT NULL CHECK (weight_kg > 0),
    length_cm DECIMAL(8, 2) DEFAULT 0,
    width_cm DECIMAL(8, 2) DEFAULT 0,
    height_cm DECIMAL(8, 2) DEFAULT 0,
    chargeable_weight_kg DECIMAL(8, 2) NOT NULL, -- Quy đổi thể tích: (D x R x C)/5000
    
    -- Tài chính & Cước phí
    shipping_fee DECIMAL(12, 2) NOT NULL DEFAULT 0,  -- Phí vận chuyển
    cod_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,    -- Tiền thu hộ COD (GĐ2)
    insurance_fee DECIMAL(12, 2) DEFAULT 0,         -- Phí bảo hiểm hàng hóa
    total_amount DECIMAL(12, 2) NOT NULL,            -- Tổng tiền người gửi/nhận phải trả
    payment_status VARCHAR(20) DEFAULT 'unpaid' 
        CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
    payer VARCHAR(20) DEFAULT 'sender' CHECK (payer IN ('sender', 'receiver')),
    
    -- Trạng thái đơn hàng chuẩn Logistics
    status VARCHAR(50) DEFAULT 'draft' CHECK (
        status IN (
            'draft',            -- Mới nháp/chờ xác nhận
            'created',          -- Đã tạo, chờ lấy hàng
            'picking_up',       -- Tài xế đang đi lấy (GĐ2)
            'picked_up',        -- Đã lấy hàng / Đã nhập kho
            'in_transit',       -- Đang luân chuyển / Đang giao
            'delivered',        -- Giao hàng thành công
            'failed_delivery',  -- Giao thất bại
            'cancelled',        -- Đã hủy
            'returned'          -- Đã trả hàng về
        )
    ),
    
    note TEXT,
    metadata JSONB DEFAULT '{}'::jsonb, -- Chứa QR/Barcode data, thông tin hình ảnh POD, etc.
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_tracking_code ON orders(tracking_code);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- ========================================================
-- 5. BẢNG LỊCH SỬ HÀNH TRÌNH (ORDER LOGS / TIMELINE)
-- ========================================================
CREATE TABLE order_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    
    status VARCHAR(50) NOT NULL,
    location_name VARCHAR(255), 
    description TEXT,           
    
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    created_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Ai là người đổi trạng thái
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS pricing_rules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    from_province VARCHAR(100),
    to_province VARCHAR(100),
    min_weight_kg DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
    max_weight_kg DECIMAL(8, 2) NOT NULL,
    base_price DECIMAL(12, 2) NOT NULL,
    extra_price_per_kg DECIMAL(12, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Thêm dữ liệu mẫu vào bảng giá để API không bị trống
INSERT INTO pricing_rules (name, min_weight_kg, max_weight_kg, base_price, extra_price_per_kg)
VALUES ('Gói Tiêu Chuẩn All-zone', 0.00, 1000.00, 22000, 5000);


CREATE INDEX idx_order_logs_order_id ON order_logs(order_id);