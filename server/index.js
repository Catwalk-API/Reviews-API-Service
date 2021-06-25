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
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
