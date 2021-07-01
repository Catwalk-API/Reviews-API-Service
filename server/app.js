// Create Express Server
const express = require('express');
const app = express();
app.use(express.json());
const isTesting = process.env.isTesting ? process.env.isTesting : 'true';
const db = isTesting === 'true' ? 'test_reviews_sdc' : 'reviews_sdc';
const { sqlA } = require('./queries.js');

// Connect To Database
const { Client } = require('pg');
var client;

if (db === 'reviews_sdc') {
  client = new Client({
    user: 'postgres',
    database: db,
    host: 'db',
    password: 'mysecretpassword',
    port: 5432
  })
}

if (db === 'test_reviews_sdc') {
  client = new Client({
    user: 'neildudani',
    database: db,
  })
}

// Handle Requests
app.get('/reviews', async (req, res) => {
  let productId = req.query.product_id;
  let count = req.query.count || 5;
  let page = req.query.page || 0;
  let offset;
  page > 0 ? offset = (count * page)  : offset = 0;
  let results = await sqlA(productId, count, offset, client);
  let reviewIds = [];
  for (var j = 0; j < results.rows.length; j++) {
    reviewIds.push(results.rows[j].review_id)
  }
  let reviewIdPhotos = [];
  for (var k = 0; k < reviewIds.length; k++) {
    let reviewId = reviewIds[k];
    let sqlB = `SELECT photo_id, url FROM photos WHERE review_id = ${reviewId};`;
    let photosObj = await client.query(sqlB);
    for (var l = 0; l < photosObj.rows.length; l++) {
      for (var key in photosObj.rows[l]) {
        if (key === 'photo_id') {
          photosObj.rows[l].id = photosObj.rows[l].photo_id;
          delete photosObj.rows[l].photo_id;
        }
      }
    }
    reviewIdPhotos.push(photosObj.rows);
  }

  let reviewsArray = [];
  for (var i = 0; i < results.rows.length; i++) {
    let review = {};
    review.review_id = results.rows[i].review_id;
    review.rating = results.rows[i].rating;
    review.summary = results.rows[i].summary;
    if (results.rows[i].response === 'null') {
      review.response = null;
    } else {
      review.response = results.rows[i].response;
    }
    review.body = results.rows[i].body;
    review.date = results.rows[i].date;
    review.reviewer_name = results.rows[i].reviewer_name;
    review.helpfulness = results.rows[i].helpfulnesscount;
    review.photos = reviewIdPhotos[i];
    reviewsArray.push(review);
  }
  let responseObject = {
    product: productId,
    page: page,
    count: count,
    results: reviewsArray
  };
  res.send(responseObject);
});

app.get('/reviews/meta', async (req, res) => {
  let productId = req.query.product_id;
  let sqlA = `SELECT * FROM meta WHERE product_id = ${productId};`
  let meta = await client.query(sqlA);
  let sqlB1 =
  `SELECT
      characteristic_id,
      SUM (CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS ratingOneCount,
      SUM (CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS ratingTwoCount,
      SUM (CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS ratingThreeCount,
      SUM (CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS ratingFourCount,
      SUM (CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS ratingFiveCount
    FROM
      characteristic_reviews
    WHERE
      review_id in (SELECT review_id FROM reviews where product_id = ${productId})
    GROUP BY 1;
  `;
  let characteristics = await client.query(sqlB1);
  let sqlB2 = `SELECT characteristic FROM characteristics WHERE product_id = ${productId};`;
  let names = await client.query(sqlB2);
  let characteristicsObject = {};
  for (var i = 0; i < characteristics.rows.length; i++) {
    let oneCount = Number(characteristics.rows[i].ratingonecount);
    let twoCount = Number(characteristics.rows[i].ratingtwocount);
    let threeCount = Number(characteristics.rows[i].ratingthreecount);
    let fourCount = Number(characteristics.rows[i].ratingfourcount);
    let fiveCount = Number(characteristics.rows[i].ratingfivecount);
    let characteristicName = names.rows[i].characteristic;
    let totalReviews = oneCount + twoCount + threeCount + fourCount + fiveCount;
    let totalScore = oneCount * 1 + twoCount * 2 + threeCount * 3 + fourCount * 4 + fiveCount * 5;
    let average;
    if (totalReviews === 0) {
      average = 'No reviews'
    } else {
      average = totalScore / totalReviews;
    }
    characteristicsObject[characteristicName] = {};
    characteristicsObject[characteristicName].id = characteristics.rows[i].characteristic_id;
    characteristicsObject[characteristicName].value = average.toString();
  }
  let responseObject = {
    product_id: productId,
    ratings: {
      1: meta.rows[0].ratingonecount.toString(),
      2: meta.rows[0].ratingtwocount.toString(),
      3: meta.rows[0].ratingthreecount.toString(),
      4: meta.rows[0].ratingfourcount.toString(),
      5: meta.rows[0].ratingfivecount.toString()
    },
    recommended: {
      false: meta.rows[0].recommendedfalsecount.toString(),
      true: meta.rows[0].recommendedtruecount.toString()
    },
    characteristics: characteristicsObject
  }
  res.send(responseObject);
});

app.put('/reviews/:review_id/helpful', async (req, res) => {
  let reviewId = req.params.review_id;
  let sqlA = `SELECT helpfulnessCount FROM reviews WHERE review_id = ${reviewId};`;
  let results = await client.query(sqlA);
  let currentCount = results.rows[0].helpfulnesscount;
  let updatedCount = currentCount + 1;
  let sqlB = `UPDATE reviews SET helpfulnessCount = ${updatedCount} WHERE review_id = ${reviewId};`;
  await client.query(sqlB);
  res.send('Helpfulness count added!');
});

app.put('/reviews/:review_id/report', async (req, res) => {
  let reviewId = req.params.review_id;
  let sql = `UPDATE reviews SET reported = 'true' WHERE review_id = ${reviewId};`;
  await client.query(sql);
  res.send('Report complete!');
});

app.post('/reviews', async (req, res) => {

  let sqlA = `SELECT max(review_id) FROM reviews;`;
  let responseA = await client.query(sqlA);
  let nextReviewId = responseA.rows[0].max + 1;
  let productId = req.body.product_id;
  let rating = req.body.rating;
  let summary = req.body.summary;
  let body = req.body.body;
  let recommend = req.body.recommend;
  let reported = false;
  let reviewer_name = req.body.name;
  let reviewer_email = req.body.email;
  let response = 'null';
  let helpfulnessCount = 0;

  let sqlB = `INSERT INTO reviews (product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulnessCount) VALUES (${productId}, ${rating}, current_timestamp, '${summary}', '${body}', ${recommend}, ${reported}, '${reviewer_name}', '${reviewer_email}', '${response}', ${helpfulnessCount});`;
  let responseB = await client.query(sqlB);

  let ratingColumn = '';
  if (rating === 1) {ratingColumn = 'ratingonecount';}
  else if (rating === 2) {ratingColumn = 'ratingtwocount';}
  else if (rating === 3) {ratingColumn = 'ratingthreecount';}
  else if (rating === 4) {ratingColumn = 'ratingfourcount';}
  else if (rating === 5) {ratingColumn = 'ratingfivecount';}

  let recommendedColumn = '';
  if (recommend === false) {recommendedColumn = 'recommendedfalsecount';}
  else {recommendedColumn = 'recommendedtruecount';}

  let sqlD = `SELECT ${ratingColumn}, ${recommendedColumn} FROM meta WHERE product_id = ${productId};`;
  let responseD = await client.query(sqlD);
  let updatedRatingCount = responseD.rows[0][ratingColumn] + 1;
  let updatedRecommendCount = responseD.rows[0][recommendedColumn] + 1;

  let sqlE = `UPDATE meta SET ${ratingColumn} = ${updatedRatingCount}, ${recommendedColumn} = ${updatedRecommendCount} WHERE product_id = ${productId};`;
  let responseE = await client.query(sqlE);

  let characteristics = req.body.characteristics;
  for (var characteristic in characteristics) {
    let chrRating = characteristics[characteristic];
    let sqlF = `INSERT INTO characteristic_reviews (characteristic_id, review_id, rating) VALUES (${characteristic}, ${nextReviewId}, ${chrRating});`;
    let responseF = await client.query(sqlF);
  }

  let photos = req.body.photos;
  for (var p = 0; p < photos.length; p++) {
    let url = photos[p];
    let sqlG = `INSERT INTO photos (review_id, url) VALUES (${nextReviewId}, '${url}');`;
    let responseI = await client.query(sqlG);
  }

  res.send('Added your review successfully!');
});

module.exports.app = app;
module.exports.client = client;