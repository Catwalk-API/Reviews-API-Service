const fs = require('fs');
const path = require('path');

const fileName = './../csv_data/characteristics.csv';
const filePath = path.join(__dirname, fileName);

const readStream = fs.createReadStream(filePath, {encoding: 'utf8'});

var count = 0;
var lineRemainder = '';

readStream.on('data', (chunk) => {

  readStream.pause();
  count++;
  let lines = chunk.split('\n');
  lines[0] = lineRemainder + lines[0];
  lineRemainder = lines.pop();
  let firstLine = lines[0];
  // data manipulation
  // insert into database
  readStream.resume();

});

readStream.on('end', () => {
  console.log(count);
});