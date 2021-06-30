//The goal of integration.test is to confirm that there is a succesful connection between the server and the database. We do not want to hit the real database for 2 reasons: #1) on post requests we want to make sure that what we actually posted got added to the database, and that the record was not there by mistake. #2) If the test database is a replica of the real database, we do not want to manipulate the real database. This test builds on the unit tests by confirming that the server is able to send and receive information from the database. This assumes the front-end is working correctly. The challenge with the integration tests is that it does not tell you whether the server is not working properly or if the database is not working properly. The unit tests help to isolate these problems as you are not communicating over the network. The next step after integration testing is typically end-to-end testing, however we cannot do that as we cannot mimic the user without access to the front-end code.

const request = require("supertest");
const { app, client } = require('./../server/app.js');
const port = 5001;
var server;
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

describe('integration tests between server and db', () => {

  it('Testing to see if Jest works', () => {
    expect(1).toBe(1);
  });

  it('test connection', async () => {
    let res = await request(app)
      .get('/reviews/?product_id=1')
      expect(res.statusCode).toEqual(200);
  });

  it('be able to fetch the characteristics and average ratings for a product on the meta request', async () => {

    let res = await request(app)
      .get('/reviews/meta/?product_id=1')
      expect(res.body.characteristics.Fit.value).toBe("1.5");
      expect(res.body.characteristics.Comfort.value).toBe("1.5");
      expect(res.body.characteristics.Length.value).toBe("1.5");
      expect(res.body.characteristics.Size.value).toBe("1.5");
  });

  it('add a new review and correctly update the total rating', async () => {

    let reqObj =
      {
        "product_id": 1,
        "rating": 2,
        "summary": "NeilSummaryForRealsTrae",
        "photos": [
            "https://image.shutterstock.com/image-vector/national-flag-canada-paper-texture-260nw-1725850915.jpg",
            "https://www.history.com/.image/ar_1:1%2Cc_fill%2Ccs_srgb%2Cfl_progressive%2Cq_auto:good%2Cw_1200/MTU3ODc4NjAzNTM2MTQ4MTkx/hith-eiffel-tower-istock_000016468972large-2.jpg"
        ],
        "body": "NeilBodyTest",
        "recommend": false,
        "name": "NeilNickname",
        "email": "Neil@123.com",
        "characteristics": {
            "1": 3,
            "2": 3,
            "3": 3,
            "4": 3
        }
      };

    let res1 = await request(app)
      .post('/reviews')
      .send(reqObj)
      .set('Accept', 'application/json')
      expect(res1.statusCode).toEqual(200)

    let res2 = await request(app)
      .get('/reviews/meta/?product_id=1')
        expect(res2.body.characteristics.Fit.value).toBe("2");
        expect(res2.body.characteristics.Comfort.value).toBe("2");
        expect(res2.body.characteristics.Length.value).toBe("2");
        expect(res2.body.characteristics.Size.value).toBe("2");
  });

});
