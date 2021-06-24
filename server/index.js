// Create Express Server
const express = require('express')
const app = express()
const port = 5000;
const fs = require('fs');
const path = require('path');

// Connect To Database (Explore "pool")
const { Client } = require('pg');
const client = new Client({
  user: 'neildudani',
  database: 'test'
})

client.connect();

// ******************************* PHOTOS *********************** \\
const photos = './../csv_data/reviews_photos.csv';
const photosPath = path.join(__dirname, photos);
const photosReadStream = fs.createReadStream(photosPath, {encoding: 'utf8'})
let photosLoaded = false;
let photosLineRemainder = '';

function loadPhotos() {

  photosReadStream.on('data', async (chunk) => {
    photosReadStream.pause();
    let lines = chunk.split('\n');
    lines[0] = photosLineRemainder + lines[0];
    photosLineRemainder = lines.pop();
    let firstLine = lines[0];
    let i = 0;
    while (i < lines.length) {
      let splitArray = lines[i].split(',');
      let photo_id = splitArray[0];
      let review_id = splitArray[1];
      let url = splitArray[2];
      let sql = `INSERT INTO photos (photo_id, review_id, url) VALUES (${photo_id}, ${review_id}, '${url}')`;
      await client.query(sql);
      i++;
      if (i === lines.length - 1) {
        photosReadStream.resume();
      }
    }
  });

  photosReadStream.on('end', () => {
    console.log('Finished photos!');
    loadCharacteristics();
  });

};

// ******************************* CHARACTERISTICS *********************** \\
const characteristics = './../csv_data/characteristics.csv';
const characteristicsPath = path.join(__dirname, characteristics);
const characteristicsReadStream = fs.createReadStream(characteristicsPath, {encoding: 'utf8'})
let characteristicsLoaded = false;
let characteristicsLineRemainder = '';

function loadCharacteristics() {

  characteristicsReadStream.on('data', async (chunk) => {
    characteristicsReadStream.pause();
    let lines = chunk.split('\n');
    lines[0] = characteristicsLineRemainder + lines[0];
    characteristicssLineRemainder = lines.pop();
    let firstLine = lines[0];
    let i = 0;
    while (i < lines.length) {
      let splitArray = lines[i].split(',');
      let characteristic_id = splitArray[0];
      let product_id = splitArray[1];
      let characteristic = splitArray[2];
      let sql = `INSERT INTO characteristics (characteristic_id, product_id, characteristic) VALUES (${characteristic_id}, ${product_id}, '${characteristic}')`;
      await client.query(sql);
      i++;
      if (i === lines.length - 1) {
        characteristicsReadStream.resume();
      }
    }
  });

  characteristicsReadStream.on('end', () => {
    console.log('Finished characteristics!');
  });

};
// ******************************* META *********************** \\

// ******************************* REVIEWS *********************** \\

//Begin chain of createReadStream events
loadPhotos();

// Handle Requests
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
