const { app, client } = require('./app.js');
const port = 5000;

app.listen(port, () => {
  console.log("Actual server has started!");
});

client.connect();