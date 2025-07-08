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
    gstin NVARCHAR(15),
    bank_account NVARCHAR(50),
    ifsc_code NVARCHAR(11),
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

-- Create indexes for better performance
CREATE NONCLUSTERED INDEX IX_distributors_seller_code ON distributors(seller_code);
CREATE NONCLUSTERED INDEX IX_distributors_email ON distributors(email);
CREATE NONCLUSTERED INDEX IX_customers_voucher_code ON customers(voucher_code);
CREATE NONCLUSTERED INDEX IX_customers_seller_code ON customers(seller_code);
CREATE NONCLUSTERED INDEX IX_claims_voucher_code ON claims(voucher_code);
CREATE NONCLUSTERED INDEX IX_otp_contact ON otp_verifications(contact);