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
app.get('/reviews', (req, res) => {
  let productId = req.query.product_id;
  res.send('detailed reviews!')
});

app.get('/reviews/meta', (req, res) => {
  let productId = req.query.product_id;
  res.send('meta')
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
  res.send('helpful');
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
  res.send('report');
});

app.post('/reviews', (req, res) => {
  res.send('post');
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
