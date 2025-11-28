-- Create bookings table for storing customer booking requests
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(255),
    service_type VARCHAR(255),
    car_brand VARCHAR(100),
    car_model VARCHAR(100),
    preferred_date DATE,
    preferred_time VARCHAR(50),
    comment TEXT,
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);

-- Add comments
COMMENT ON TABLE bookings IS 'Customer booking requests from the website';
COMMENT ON COLUMN bookings.status IS 'Booking status: new, confirmed, completed, cancelled';
