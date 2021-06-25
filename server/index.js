// Create Express Server
const express = require('express')
const app = express()
const port = 5000;
const fs = require('fs');
const path = require('path');

// Connect To Database
const { Client } = require('pg');
const client = new Client({
  user: 'neildudani',
  database: 'reviews_sdc'
})

client.connect();

// Handle Requests
app.get('/reviews', async (req, res) => {
  let productId = req.query.product_id;
  let count = req.query.count || 5;
  let sqlA = `SELECT review_id, rating, summary, recommend, response, body, date, reviewer_name, helpfulnessCount FROM reviews WHERE product_id = ${productId} LIMIT ${count}`;
  let results = await client.query(sqlA);
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
    review.response = results.rows[i].response;
    review.body = results.rows[i].body;
    review.date = results.rows[i].date;
    review.reviewer_name = results.rows[i].reviewer_name;
    review.helpfulness = results.rows[i].helpfulnesscount;
    review.photos = reviewIdPhotos[i];
    reviewsArray.push(review);
  }
  let responseObject = {
    product: productId,
    page: 0,
    count: count,
    results: reviewsArray
  };
  res.send(responseObject);
});

app.get('/reviews/meta', async (req, res) => {
  let productId = req.query.product_id;
  let sqlA = `SELECT * FROM meta WHERE product_id = ${productId};`
  let meta = await client.query(sqlA);
  let sqlB = `SELECT * FROM characteristics WHERE product_id = ${productId};`;
  let characteristics = await client.query(sqlB);
  let characteristicsObject = {};
  for (var i = 0; i < characteristics.rows.length; i++) {
    let characteristicName = characteristics.rows[i].characteristic;
    let oneCount = characteristics.rows[i].ratingonecount;
    let twoCount = characteristics.rows[i].ratingtwocount;
    let threeCount = characteristics.rows[i].ratingthreecount;
    let fourCount = characteristics.rows[i].ratingfourcount;
    let fiveCount = characteristics.rows[i].ratingfivecount;
    let totalReviews = oneCount + twoCount + threeCount + fourCount + fiveCount;
    let totalScore = oneCount * 1 + twoCount * 2 + threeCount * 3 + fourCount * 4 + fiveCount * 5;
    let average = totalScore / totalReviews;
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
  let sqlB = `
              UPDATE reviews
                SET
                  helpfulnessCount = ${updatedCount}
                WHERE review_id = ${reviewId}
            ;`
  await client.query(sqlB);
  res.send('Helpfulness count added!');
});

app.put('/reviews/:review_id/report', async (req, res) => {
  let reviewId = req.params.review_id;
  let sql = `
              UPDATE reviews
                SET
                  reported = 'true'
              WHERE review_id = ${reviewId}
            ;`
  await client.query(sql);
  res.send('Report complete!');
});

app.post('/reviews', (req, res) => {
  res.send('post');
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
