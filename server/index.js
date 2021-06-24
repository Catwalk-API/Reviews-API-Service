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

// ******************************* CREATE META *********************** \\
const createMeta = async function () {

    let sqlA = `INSERT INTO meta (product_id) SELECT DISTINCT product_id FROM characteristics;`;
    await client.query(sqlA);

    let sqlB = `UPDATE meta
    SET
      product_id=subquery.product_id,
      ratingOneCount=subquery.ratingOneCount,
      ratingTwoCount=subquery.ratingTwoCount,
      ratingThreeCount=subquery.ratingThreeCount,
      ratingFourCount=subquery.ratingFourCount,
      ratingFiveCount=subquery.ratingFiveCount
    FROM (
      SELECT
        r.product_id AS product_id,
        SUM (CASE WHEN cr.rating = 1 THEN 1 ELSE 0 END) AS ratingOneCount,
        SUM (CASE WHEN cr.rating = 2 THEN 1 ELSE 0 END) AS ratingTwoCount,
        SUM (CASE WHEN cr.rating = 3 THEN 1 ELSE 0 END) AS ratingThreeCount,
        SUM (CASE WHEN cr.rating = 4 THEN 1 ELSE 0 END) AS ratingFourCount,
        SUM (CASE WHEN cr.rating = 5 THEN 1 ELSE 0 END) AS ratingFiveCount
      FROM
        characteristic_reviews cr
      LEFT JOIN
        reviews r
      ON r.review_id = cr.review_id
      GROUP BY 1
    ) AS subquery
    WHERE meta.product_id = subquery.product_id;`;
    await client.query(sqlB);

};


createMeta();

// Handle Requests
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
