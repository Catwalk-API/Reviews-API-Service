//The goal of server_unit.test is to write unit tests that mock responses from databases so you are actually not hitting the database. This is because we do not want to be dependent on the database to be correct. Instead, we want to be dependent on the server being correct. As such, we can continue to connect to the 'test' database because we want to mock the responses back to the server anyways. Because we are not doing this entirely and the app has not been designed perfectly, I am only technically doing a test on one query. We assume here that everything with the database is working correctly, and as such we mock out the responses. The reason we are still using the 'client.connect' is because we are not mocking out every single response here due to time constraints, otherwise you would not need to connect. The use of the 'beforeEach' is to ensure that we can have a clean database on each test and no results carry forward. Again, if we were working 100% with fake queries, then would not do this.

const request = require("supertest");
const { app, client } = require('./../server/app.js');
const port = 5002;
var server;
const queries = require('./../server/queries.js');
const { load } = require('./load_test_db.js');

beforeAll(() => {
  return new Promise((resolve, reject) => {
    server = app.listen(port, () => {
      console.log(`Listening on port ${port}!`);
      client.connect()
        .then(() => {
          resolve();
        })
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
  server.close();
  client.end();
})

describe ('server unit tests (mocking db response)', () => {

  it('Testing to see if Jest works', () => {
    expect(1).toBe(1);
  });

  it('correctly respond to get requests at /reviews', async () => {

    const mockSqlA = (queries.sqlA = jest.fn());

    const sqlAMockReturnData = {
      rows: [
        {
          review_id: 1,
          rating: 3,
          summary: 'SummaryOneA',
          response: null,
          body: 'BodyOneA',
          date: '2020-07-29 23:41:21.467-04',
          reviewer_name: 'Neil',
          helpfulness: 0,
          photos: []
        },
        {
          review_id: 2,
          rating: 4,
          summary: 'SummaryOneB',
          response: null,
          body: 'BodyOneB',
          date: '2021-01-09 02:47:13.963-05',
          reviewer_name: 'Fab',
          helpfulness: 0,
          photos: []
        }
      ]
    }

    mockSqlA.mockResolvedValueOnce(sqlAMockReturnData);

    let res = await request(app)
      .get('/reviews/?product_id=1')
      expect(res.body.results[0].rating).toBe(3);
      expect(res.body.results[1].rating).toBe(4);

  });

});