DROP DATABASE IF EXISTS reviews_sdc;

CREATE DATABASE reviews_sdc;

\c reviews_sdc;

--CREATE SCHEMA

CREATE TABLE meta (
  product_id INT NOT NULL,
  ratingOneCount INT DEFAULT 0,
  ratingTwoCount INT DEFAULT 0,
  ratingThreeCount INT DEFAULT 0,
  ratingFourCount INT DEFAULT 0,
  ratingFiveCount INT DEFAULT 0,
  recommendedFalseCount INT DEFAULT 0,
  recommendedTrueCount INT DEFAULT 0
  );

CREATE TABLE reviews (
   review_id INT PRIMARY KEY,
   product_id INT NOT NULL,
   rating INT,
   date TEXT,
   summary VARCHAR(1000),
   body VARCHAR(1000),
   recommend boolean,
   reported boolean,
   reviewer_name VARCHAR(60),
   reviewer_email VARCHAR(60),
   response VARCHAR,
   helpfulnessCount INT
  );

CREATE TABLE photos (
  photo_id INT PRIMARY KEY,
  review_id INT NOT NULL,
  url TEXT
  );

CREATE TABLE characteristics (
  characteristic_id INT PRIMARY KEY,
  product_id INT NOT NULL,
  characteristic VARCHAR(30),
  ratingOneCount INT DEFAULT 0,
  ratingTwoCount INT DEFAULT 0,
  ratingThreeCount INT DEFAULT 0,
  ratingFourCount INT DEFAULT 0,
  ratingFiveCount INT DEFAULT 0
  );

CREATE TABLE characteristic_reviews (
  id INT PRIMARY KEY,
  characteristic_id INT NOT NULL,
  review_id INT NOT NULL,
  rating INT
);

-- LOAD INTO DATABSE

COPY photos(photo_id, review_id, url)
FROM '/Users/neildudani/Desktop/Neil/HackReactor/Immersive/Projects/SDC/Reviews-API-Service/csv_data/reviews_photos.csv'
DELIMITER ','
CSV HEADER;

COPY characteristics(characteristic_id, product_id, characteristic)
FROM '/Users/neildudani/Desktop/Neil/HackReactor/Immersive/Projects/SDC/Reviews-API-Service/csv_data/characteristics.csv'
DELIMITER ','
CSV HEADER;

COPY reviews(review_id, product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulnessCount)
FROM '/Users/neildudani/Desktop/Neil/HackReactor/Immersive/Projects/SDC/Reviews-API-Service/csv_data/reviews.csv'
DELIMITER ','
CSV HEADER;

COPY characteristic_reviews(id, characteristic_id, review_id, rating)
FROM '/Users/neildudani/Desktop/Neil/HackReactor/Immersive/Projects/SDC/Reviews-API-Service/csv_data/characteristic_reviews.csv'
DELIMITER ','
CSV HEADER;

UPDATE reviews
  SET date = to_timestamp(reviews.date::numeric/1000);

INSERT INTO meta (product_id) SELECT DISTINCT product_id FROM characteristics;

UPDATE meta
  SET
    product_id=subquery.product_id,
    ratingOneCount=subquery.ratingOneCount,
    ratingTwoCount=subquery.ratingTwoCount,
    ratingThreeCount=subquery.ratingThreeCount,
    ratingFourCount=subquery.ratingFourCount,
    ratingFiveCount=subquery.ratingFiveCount,
    recommendedFalseCount=subquery.recommendedFalseCount,
    recommendedTrueCount=subquery.recommendedTrueCount
  FROM (
    SELECT
      product_id AS product_id,
      SUM (CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS ratingOneCount,
      SUM (CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS ratingTwoCount,
      SUM (CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS ratingThreeCount,
      SUM (CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS ratingFourCount,
      SUM (CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS ratingFiveCount,
      SUM (CASE WHEN recommend = 'false' THEN 1 ELSE 0 END) AS recommendedFalseCount,
      SUM (CASE WHEN recommend = 'true' THEN 1 ELSE 0 END) AS recommendedTrueCount
    FROM
      reviews
    GROUP BY 1
  ) AS subquery
  WHERE meta.product_id = subquery.product_id;