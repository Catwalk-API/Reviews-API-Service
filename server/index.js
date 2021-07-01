require('newrelic');

const { app, client } = require('./app.js');
const port = 5000;

app.listen(port, () => {
  console.log(`Actual server has started on port ${port}!`);
});

async function ConnectToDb() {
  let retries = 5;
  while (retries) {
    try {
      await client.connect()
      console.log('connected!');
      break;
    } catch (err) {
      console.log('error: ', err);
      retries -= 1;
      console.log(`retries left: ${retries}`);
      await new Promise(res => setTimeout(res, 5000));
    }
  }
}

ConnectToDb()
