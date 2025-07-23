-- SQL Server schema for BBG application

-- Create distributors table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='distributors' AND xtype='U')
CREATE TABLE distributors (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    business_name NVARCHAR(255),
    contact NVARCHAR(10) NOT NULL UNIQUE,
    email NVARCHAR(255) NOT NULL UNIQUE,
    pincode NVARCHAR(6) NOT NULL,
    location NVARCHAR(255) NOT NULL,
    preferred_mode NVARCHAR(50) NOT NULL,
    -- Tax & Compliance Details
    pan_number NVARCHAR(10) NOT NULL,
    pan_copy_file NVARCHAR(500),
    is_gst_registered BIT DEFAULT 0,
    gstin NVARCHAR(15),
    gst_certificate_file NVARCHAR(500),
    registered_business_address NVARCHAR(1000),
    is_msme_registered BIT DEFAULT 0,
    msme_certificate_file NVARCHAR(500),
    -- Bank Details
    account_holder_name NVARCHAR(255) NOT NULL,
    bank_account NVARCHAR(50) NOT NULL,
    bank_account_confirm NVARCHAR(50) NOT NULL,
    ifsc_code NVARCHAR(11) NOT NULL,
    upi_id NVARCHAR(255),
    cancelled_cheque_file NVARCHAR(500) NOT NULL,
    -- Declarations
    info_declaration BIT DEFAULT 0,
    tds_understanding BIT DEFAULT 0,
    gst_invoice_agreement BIT DEFAULT 0,
    terms_agreement BIT DEFAULT 0,
    -- System fields
    seller_code NVARCHAR(10) NOT NULL UNIQUE,
    commission_earned DECIMAL(10,2) DEFAULT 0,
    total_customers INT DEFAULT 0,
    is_verified BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE()
);

-- Create customers table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='customers' AND xtype='U')
CREATE TABLE customers (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    contact NVARCHAR(10) NOT NULL,
    email NVARCHAR(255) NOT NULL,
    pincode NVARCHAR(6) NOT NULL,
    device_type NVARCHAR(50) NOT NULL,
    serial_number NVARCHAR(255) NOT NULL,
    brand NVARCHAR(100) NOT NULL,
    model_name NVARCHAR(255) NOT NULL,
    invoice_value DECIMAL(10,2) NOT NULL,
    seller_code NVARCHAR(10),
    voucher_code NVARCHAR(15) NOT NULL UNIQUE,
    payment_intent_id NVARCHAR(255),
    is_verified BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE()
);

-- Create claims table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='claims' AND xtype='U')
CREATE TABLE claims (
    id INT IDENTITY(1,1) PRIMARY KEY,
    customer_id INT NOT NULL,
    voucher_code NVARCHAR(15) NOT NULL,
    contact NVARCHAR(10) NOT NULL,
    email NVARCHAR(255) NOT NULL,
    device_age_months INT NOT NULL,
    claim_percentage DECIMAL(5,2) NOT NULL,
    claim_amount DECIMAL(10,2) NOT NULL,
    status NVARCHAR(50) DEFAULT 'pending',
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Create otp_verifications table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='otp_verifications' AND xtype='U')
CREATE TABLE otp_verifications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    contact NVARCHAR(10) NOT NULL,
    otp NVARCHAR(6) NOT NULL,
    expires_at DATETIME2 NOT NULL,
    is_verified BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE()
);

-- Create distributor sessions table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='distributor_sessions' AND xtype='U')
CREATE TABLE distributor_sessions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    distributor_id INT NOT NULL,
    contact NVARCHAR(10) NOT NULL,
    session_token NVARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME2 NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (distributor_id) REFERENCES distributors(id)
);

-- Create commission payouts tracking table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='commission_payouts' AND xtype='U')
CREATE TABLE commission_payouts (
    id INT IDENTITY(1,1) PRIMARY KEY,
    distributor_id INT NOT NULL,
    customer_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status NVARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'paid', 'cancelled'
    payment_reference NVARCHAR(255),
    paid_at DATETIME2,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (distributor_id) REFERENCES distributors(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Create brands table for brand management
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='brands' AND xtype='U')
CREATE TABLE brands (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    device_type NVARCHAR(20) NOT NULL,
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    UNIQUE(name, device_type)
);

-- Create models table for model management
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='models' AND xtype='U')
CREATE TABLE models (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    brand_id INT NOT NULL,
    device_type NVARCHAR(20) NOT NULL,
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (brand_id) REFERENCES brands(id),
    UNIQUE(name, brand_id)
);

-- Create indexes for better performance
CREATE NONCLUSTERED INDEX IX_distributors_seller_code ON distributors(seller_code);
CREATE NONCLUSTERED INDEX IX_distributors_email ON distributors(email);
CREATE NONCLUSTERED INDEX IX_distributors_contact ON distributors(contact);
CREATE NONCLUSTERED INDEX IX_customers_voucher_code ON customers(voucher_code);
CREATE NONCLUSTERED INDEX IX_customers_seller_code ON customers(seller_code);
CREATE NONCLUSTERED INDEX IX_distributor_sessions_token ON distributor_sessions(session_token);
CREATE NONCLUSTERED INDEX IX_commission_payouts_distributor ON commission_payouts(distributor_id);
CREATE NONCLUSTERED INDEX IX_claims_voucher_code ON claims(voucher_code);
CREATE NONCLUSTERED INDEX IX_otp_contact ON otp_verifications(contact);