-- Query to create the 'users' table

CREATE TABLE users(
	user_id serial PRIMARY KEY,
	first_name VARCHAR(50) NOT NULL,
	last_name VARCHAR(50),
	profile_pic VARCHAR(255),
	email VARCHAR(50) NOT NULL,
	password VARCHAR(255) NOT NULL
);

-- Query to create the 'houses' table

CREATE TABLE houses (
    house_id SERIAL PRIMARY KEY,
    location VARCHAR(100) NOT NULL,
    bedrooms INT NOT NULL,
    bathrooms INT NOT NULL,
    price_per_night INT NOT NULL,
    description TEXT,
    host_id INT REFERENCES users(user_id),
    rating DECIMAL(3, 2) DEFAULT 0,
    review_count INTEGER DEFAULT 0
);

-- Query to create 'house_pics' table

CREATE TABLE house_pics(
	house_pics_id serial PRIMARY KEY,
	house_id INT REFERENCES houses(house_id) NOT NULL,
	url VARCHAR(255) NOT NULL
);

-- Query to create the 'bookings' table

CREATE TABLE bookings (
	booking_id SERIAL PRIMARY KEY,
	guest_id INT REFERENCES users(user_id) NOT NULL,
	house_id INT REFERENCES houses(house_id) NOT NULL,
	check_in_date DATE NOT NULL,
	check_out_date DATE NOT NULL,
	total_price INT NOT NULL,
	nights INT NOT NULL
);

-- Query to create the 'reviews' table

CREATE TABLE reviews (
	review_id SERIAL PRIMARY KEY,
	house_id INT REFERENCES houses(house_id) NOT NULL,
	reviewer_id INT REFERENCES users(user_id) NOT NULL,
	review_date TIMESTAMP NOT NULL,
	rating INT NOT NULL,
	review_text TEXT
);

-- Function to update house ratings and reviews count
CREATE OR REPLACE FUNCTION update_house_review_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE houses
    SET rating = COALESCE((SELECT AVG(rating) FROM reviews WHERE house_id = NEW.house_id), 0),
        review_count = (SELECT COUNT(*) FROM reviews WHERE house_id = NEW.house_id)
    WHERE house_id = NEW.house_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update house ratings and reviews count after review insert
CREATE TRIGGER after_review_insert
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_house_review_stats();

-- Trigger to update house ratings and reviews count after review update
CREATE TRIGGER after_review_update
AFTER UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_house_review_stats();

-- Trigger to update house ratings and reviews count after review delete
CREATE TRIGGER after_review_delete
AFTER DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_house_review_stats();
	