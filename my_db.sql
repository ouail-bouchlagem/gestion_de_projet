-- Sequences
CREATE SEQUENCE agency_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE customer_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE trip_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE booking_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE message_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE review_seq START WITH 1 INCREMENT BY 1;

-- the Address Object Type 3la jal ORM
CREATE OR REPLACE TYPE Address_Typ AS OBJECT (
    street VARCHAR2(100),
    city VARCHAR2(50),
    country VARCHAR2(50),
    postal_code VARCHAR2(20)
);

-- Agency Table
CREATE TABLE Agency (
    agency_id NUMBER DEFAULT agency_seq.NEXTVAL PRIMARY KEY,
    agency_name VARCHAR2(100) NOT NULL,
    address Address_Typ,
    phone VARCHAR2(20),
    email VARCHAR2(100),
    registration_date DATE DEFAULT SYSDATE,
    status VARCHAR2(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    CONSTRAINT agency_email_unique UNIQUE (email)
);

-- a. Customers_Contact (Vertical Fragmentation , frequent fields)
CREATE TABLE Customers_Contact (
    customer_id NUMBER DEFAULT customer_seq.NEXTVAL PRIMARY KEY,
    first_name VARCHAR2(50) NOT NULL,
    last_name VARCHAR2(50) NOT NULL,
    email VARCHAR2(100) NOT NULL UNIQUE,
    phone VARCHAR2(20),
    registration_date DATE DEFAULT SYSDATE
);

-- b. Customers_Info (Vertical Fragmentation , less frequent fields)
CREATE TABLE Customers_Info (
    customer_id NUMBER PRIMARY KEY,
    address Address_Typ,
    date_of_birth DATE,
    FOREIGN KEY (customer_id) REFERENCES Customers_Contact(customer_id)
);

-- Trips Table (Horizontal Fragmentation by agency_id)
CREATE TABLE Trips (
    trip_id NUMBER DEFAULT trip_seq.NEXTVAL,
    agency_id NUMBER NOT NULL,
    trip_name VARCHAR2(100) NOT NULL,
    description VARCHAR2(1000),
    destination VARCHAR2(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    price NUMBER(10,2) NOT NULL,
    max_capacity NUMBER NOT NULL,
    current_bookings NUMBER DEFAULT 0,
    status VARCHAR2(20) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'FULL', 'CANCELLED', 'COMPLETED')),
    created_date DATE DEFAULT SYSDATE,
    CONSTRAINT pk_trips PRIMARY KEY (trip_id, agency_id),
    CONSTRAINT fk_trip_agency FOREIGN KEY (agency_id) REFERENCES Agency(agency_id),
    CONSTRAINT chk_trip_dates CHECK (end_date > start_date),
    CONSTRAINT chk_trip_capacity CHECK (current_bookings <= max_capacity)
)PARTITION BY LIST (agency_id) (
    PARTITION trips_agency1 VALUES (1),
    PARTITION trips_agency2 VALUES (2),
    PARTITION trips_agency_other VALUES (3,4,5,6,7,8,9,10)
);

-- table ta3 bookings
CREATE TABLE Bookings (
    booking_id NUMBER DEFAULT booking_seq.NEXTVAL,
    trip_id NUMBER NOT NULL,
    agency_id NUMBER NOT NULL,
    customer_id NUMBER NOT NULL,
    booking_date DATE DEFAULT SYSDATE,
    num_persons NUMBER NOT NULL,
    total_price NUMBER(10,2) NOT NULL,
    status VARCHAR2(20) DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'CANCELLED', 'COMPLETED', 'PENDING')),
    payment_status VARCHAR2(20) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'PARTIAL', 'REFUNDED')),
    notes VARCHAR2(500),
    CONSTRAINT pk_bookings PRIMARY KEY (booking_id, agency_id),
    CONSTRAINT fk_booking_trip FOREIGN KEY (trip_id, agency_id) REFERENCES Trips(trip_id, agency_id),
    CONSTRAINT fk_booking_customer FOREIGN KEY (customer_id) REFERENCES Customers_Contact(customer_id),
    CONSTRAINT chk_num_persons CHECK (num_persons > 0)
);

-- Messages Table
CREATE TABLE Messages (
    message_id NUMBER DEFAULT message_seq.NEXTVAL,
    agency_id NUMBER NOT NULL,
    customer_id NUMBER NOT NULL,
    sender_type VARCHAR2(10) NOT NULL CHECK (sender_type IN ('AGENCY', 'CUSTOMER')),
    message_text VARCHAR2(2000) NOT NULL,
    sent_date TIMESTAMP DEFAULT SYSTIMESTAMP,
    read_status VARCHAR2(10) DEFAULT 'UNREAD' CHECK (read_status IN ('READ', 'UNREAD')),
    CONSTRAINT pk_messages PRIMARY KEY (message_id, agency_id),
    CONSTRAINT fk_message_agency FOREIGN KEY (agency_id) REFERENCES Agency(agency_id),
    CONSTRAINT fk_message_customer FOREIGN KEY (customer_id) REFERENCES Customers_Contact(customer_id)
);

-- Reviews Table (Horizontal Fragmentation by agency_id)
CREATE TABLE Reviews (
    review_id NUMBER DEFAULT review_seq.NEXTVAL,
    trip_id NUMBER NOT NULL,
    agency_id NUMBER NOT NULL,
    customer_id NUMBER NOT NULL,
    rating NUMBER(1) NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text VARCHAR2(2000),
    review_date DATE DEFAULT SYSDATE,
    status VARCHAR2(20) DEFAULT 'PUBLISHED' CHECK (status IN ('PUBLISHED', 'PENDING', 'REJECTED')),
    CONSTRAINT pk_reviews PRIMARY KEY (review_id, agency_id),
    CONSTRAINT fk_review_trip FOREIGN KEY (trip_id, agency_id) REFERENCES Trips(trip_id, agency_id),
    CONSTRAINT fk_review_customer FOREIGN KEY (customer_id) REFERENCES Customers_Contact(customer_id)
);


CREATE OR REPLACE VIEW Customer_Complete_View AS
SELECT 
    cc.customer_id,
    cc.first_name,
    cc.last_name,
    cc.email,
    cc.phone,
    cc.registration_date,
    ci.address,
    ci.date_of_birth
FROM 
    Customers_Contact cc
LEFT JOIN 
    Customers_Info ci ON cc.customer_id = ci.customer_id;

-- Indexes
CREATE INDEX idx_trips_agency ON Trips(agency_id) LOCAL;
CREATE INDEX idx_trips_dates ON Trips(start_date, end_date) LOCAL;

CREATE INDEX idx_bookings_trip ON Bookings(trip_id, agency_id) LOCAL;
CREATE INDEX idx_bookings_customer ON Bookings(customer_id) LOCAL;

CREATE INDEX idx_messages_agency_customer ON Messages(agency_id, customer_id) LOCAL;

CREATE INDEX idx_reviews_trip ON Reviews(trip_id, agency_id) LOCAL;