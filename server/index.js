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
  res.send('detailed reviews!')
  let productId = req.query.product_id;
});

app.get('/reviews/meta', (req, res) => {
  res.send('meta')
  let productId = req.query.product_id;
});

app.put('/reviews/:review_id/helpful', (req, res) => {
  let productId = req.params.review_id;
  res.send('helpful');
});

app.put('/reviews/:review_id/report', (req, res) => {
  let productId = req.params.review_id;
  res.send('report');
});

app.post('/reviews', (req, res) => {
  res.send('post');
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
