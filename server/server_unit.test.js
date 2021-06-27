//The goal of server_unit.test is to write unit tests that mock responses from databases so you are actually not hitting the database. This is because we do not want to be dependent on the database to be correct. Instead, we want to be dependent on the server being correct. As such, we can continue to connect to the 'test' database because we want to mock the responses back to the server anyways. Because we are not doing this entirely and the app has not been designed perfectly, I am only technically doing a test on one query. We assume here that everything with the database is working correctly, and as such we mock out the responses. The reason we are still using the 'client.connect' is because we are not mocking out every single response here due to time constraints, otherwise you would not need to connect.

const request = require("supertest");
const { app, client } = require('./app.js');
const port = 5002;
var server;
const queries = require('./queries.js');

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

afterAll(() => {
  server.close();
  client.end();
})

describe ('server unit tests (mocking db response)', () => {

  it('Testing to see if Jest works', () => {
    expect(1).toBe(1);
  });

  it('return the correct characteristic ratings to the user', async () => {

    const mockSqlA = (queries.sqlA = jest.fn());

    const sqlAMockReturnData = {
      rows: [
        {
          review_id: 4,
          rating: 2,
          summary: 'NeilSummaryForRealsTrae',
          recommend: false,
          response: 'null',
          body: 'NeilBodyTest',
          date: '2021-06-27 09:05:45.484-04',
          reviewer_name: 'NeilNickname',
          helpfulnesscount: 0
        }
      ]
    }

    mockSqlA.mockResolvedValueOnce(sqlAMockReturnData);

    let res = await request(app)
      .get('/reviews/?product_id=1')
      expect(res.body.results[0].rating).toBe(2);

  });


});