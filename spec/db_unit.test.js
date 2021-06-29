//The goal of db_unit.test is to exclude the server and simply determine if the queries to the database are returning the correct results. This will operate under the assumption that the database schema was created correctly. We will be testing for both #1) data was uploaded correctly, and #2) whether the query results are as expected. We will use a test database to ensure no false positive records and also not to modify the actual database. We will not need to connect to the server. The use of the 'beforeEach' is to ensure that we can have a clean database on each test and no results carry forward. The use of the 'beforeEach' is to ensure that we can have a clean database on each test and no results carry forward.

const { Client } = require('pg');
const client = new Client({
  user: 'neildudani',
  database: 'test_reviews_sdc'
})
const queries = require('./../server/queries.js');
const { load } = require('./load_test_db.js');

beforeAll(() => {
  return new Promise((resolve, reject) => {
    client.connect()
      .then(() => {
        resolve();
      })
  });
});

beforeEach((done) => {
  client.query(load)
    .then(() => {
      done();
    })
})


afterAll(() => {
  client.end();
})

describe ('db unit tests', () => {

  it('Testing to see if Jest works', () => {
    expect(1).toBe(1);
  });

  it('should fetch the correct information when sending a query. note the info is based on what was loaded into db in this test', async () => {

    let productId = 1;
    let count = 5;
    let offset = 0;

    let res = await queries.sqlA(productId, count, offset, client);
      expect(res.rows[0].rating).toBe(3);
      expect(res.rows[0].body).toBe('BodyOneA');
      expect(res.rows[1].rating).toBe(4);
      expect(res.rows[1].summary).toBe('SummaryOneB');

  });

});