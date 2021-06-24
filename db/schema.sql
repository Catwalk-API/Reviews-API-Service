DROP DATABASE IF EXISTS test;

CREATE DATABASE test;

\c test;

CREATE TABLE names (
  id INT PRIMARY KEY,
  name VARCHAR(30)
  );

INSERT INTO names (id, name) VALUES (1, 'neil');

CREATE TABLE meta (
  id INT PRIMARY KEY,
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
   date Timestamp,
   summary VARCHAR(60),
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
  id INT PRIMARY KEY,
  product_id INT NOT NULL,
  characteristic_id INT NOT NULL,
  ratingOneCount INT DEFAULT 0,
  ratingTwoCount INT DEFAULT 0,
  ratingThreeCount INT DEFAULT 0,
  ratingFourCount INT DEFAULT 0,
  ratingFiveCount INT DEFAULT 0
  );
