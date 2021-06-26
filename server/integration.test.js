const request = require("supertest");
const { app, client } = require('./app.js');
const port = 5001;
var server;

beforeAll(() => {
  return new Promise((resolve, reject) => {
    server = app.listen(port, () => {
      console.log("Test server has started!");
      client.connect()
        .then(() => {
          resolve();
        })
    })
  });
});

beforeEach((done) => {
  let sql = `
  DROP TABLE IF EXISTS meta;
  CREATE TABLE meta (
    product_id serial PRIMARY KEY,
    ratingOneCount INT DEFAULT 0,
    ratingTwoCount INT DEFAULT 0,
    ratingThreeCount INT DEFAULT 0,
    ratingFourCount INT DEFAULT 0,
    ratingFiveCount INT DEFAULT 0,
    recommendedFalseCount INT DEFAULT 0,
    recommendedTrueCount INT DEFAULT 0
    );

  DROP TABLE IF EXISTS reviews;
  CREATE TABLE reviews (
     review_id serial PRIMARY KEY,
     product_id INT NOT NULL,
     rating INT,
     date TEXT,
     summary VARCHAR(1000),
     body VARCHAR(1000),
     recommend boolean,
     reported boolean,
     reviewer_name VARCHAR(60),
     reviewer_email VARCHAR(60),
     response VARCHAR,
     helpfulnessCount INT
    );

  DROP TABLE IF EXISTS photos;
  CREATE TABLE photos (
    photo_id serial PRIMARY KEY,
    review_id INT NOT NULL,
    url TEXT
    );

  DROP TABLE IF EXISTS characteristics;
  CREATE TABLE characteristics (
    characteristic_id serial PRIMARY KEY,
    product_id INT NOT NULL,
    characteristic VARCHAR(30),
    ratingOneCount INT DEFAULT 0,
    ratingTwoCount INT DEFAULT 0,
    ratingThreeCount INT DEFAULT 0,
    ratingFourCount INT DEFAULT 0,
    ratingFiveCount INT DEFAULT 0
    );

  DROP TABLE IF EXISTS characteristic_reviews;
  CREATE TABLE characteristic_reviews (
    id serial PRIMARY KEY,
    characteristic_id INT NOT NULL,
    review_id INT NOT NULL,
    rating INT
  );

  -- LOAD INTO TEST DATABASE DUMMY ENTRIES

  INSERT INTO characteristics (product_id, characteristic)
  VALUES
    (1, 'Fit'),
    (1, 'Comfort'),
    (1, 'Length'),
    (1, 'Size'),
    (2, 'Fit'),
    (2, 'Colour'),
    (2, 'Size')
  ;

  INSERT INTO reviews (product_id, rating, summary, body, recommend, reviewer_name, reviewer_email)
  VALUES
    (1, 3, 'SummaryOneA', 'BodyOneA', 'true', 'Neil', 'Neil@123.com'),
    (1, 4, 'SummaryOneB', 'BodyOneB', 'false', 'Fab', 'Fab@456.com'),
    (2, 5, 'SummaryTwoA', 'BodyTwoA', 'false', 'Alex', 'Alex@789.com')
  ;

  INSERT INTO characteristic_reviews (characteristic_id, review_id, rating)
  VALUES
    (1, 1, 1),
    (2, 1, 1),
    (3, 1, 1),
    (4, 1, 1),
    (1, 2, 2),
    (2, 2, 2),
    (3, 2, 2),
    (4, 2, 2),
    (5, 3, 3),
    (6, 3, 3),
    (7, 3, 3)
  ;

  UPDATE reviews
    SET date = to_timestamp(reviews.date::numeric/1000);

  INSERT INTO meta (product_id) SELECT DISTINCT product_id FROM characteristics;

  -- Update Meta

UPDATE meta
  SET
    ratingOneCount=subquery.ratingOneCount,
    ratingTwoCount=subquery.ratingTwoCount,
    ratingThreeCount=subquery.ratingThreeCount,
    ratingFourCount=subquery.ratingFourCount,
    ratingFiveCount=subquery.ratingFiveCount,
    recommendedFalseCount=subquery.recommendedFalseCount,
    recommendedTrueCount=subquery.recommendedTrueCount
  FROM (
    SELECT
      product_id AS product_id,
      SUM (CASE WHEN r.rating = 1 THEN 1 ELSE 0 END) AS ratingOneCount,
      SUM (CASE WHEN r.rating = 2 THEN 1 ELSE 0 END) AS ratingTwoCount,
      SUM (CASE WHEN r.rating = 3 THEN 1 ELSE 0 END) AS ratingThreeCount,
      SUM (CASE WHEN r.rating = 4 THEN 1 ELSE 0 END) AS ratingFourCount,
      SUM (CASE WHEN r.rating = 5 THEN 1 ELSE 0 END) AS ratingFiveCount,
      SUM (CASE WHEN r.recommend = 'false' THEN 1 ELSE 0 END) AS recommendedFalseCount,
      SUM (CASE WHEN r.recommend = 'true' THEN 1 ELSE 0 END) AS recommendedTrueCount
    FROM
      (SELECT review_id, product_id, rating, recommend FROM reviews) r
    GROUP BY 1
  ) AS subquery
  WHERE meta.product_id = subquery.product_id;

-- Update Characteristics

UPDATE characteristics
  SET
    product_id=subquery.product_id,
    ratingOneCount=subquery.ratingOneCount,
    ratingTwoCount=subquery.ratingTwoCount,
    ratingThreeCount=subquery.ratingThreeCount,
    ratingFourCount=subquery.ratingFourCount,
    ratingFiveCount=subquery.ratingFiveCount
  FROM (
    SELECT
      ch.characteristic_id as characteristic_id,
      ch.product_id as product_id,
      SUM (CASE WHEN cr.rating = 1 THEN 1 ELSE 0 END) AS ratingOneCount,
      SUM (CASE WHEN cr.rating = 2 THEN 1 ELSE 0 END) AS ratingTwoCount,
      SUM (CASE WHEN cr.rating = 3 THEN 1 ELSE 0 END) AS ratingThreeCount,
      SUM (CASE WHEN cr.rating = 4 THEN 1 ELSE 0 END) AS ratingFourCount,
      SUM (CASE WHEN cr.rating = 5 THEN 1 ELSE 0 END) AS ratingFiveCount
    FROM
      characteristic_reviews cr
    INNER JOIN
      (SELECT characteristic_id, product_id, characteristic FROM characteristics) ch
    ON
      ch.characteristic_id = cr.characteristic_id
    INNER JOIN
      (SELECT review_id FROM reviews) r
    ON
      cr.review_id = r.review_id
    GROUP BY 1,2
  ) AS subquery
  WHERE characteristics.characteristic_id = subquery.characteristic_id;

-- Reset Id For All Tables
SELECT setval('meta_product_id_seq', (SELECT MAX(product_id) FROM meta));
SELECT setval('reviews_review_id_seq', (SELECT MAX(review_id) FROM reviews));
SELECT setval('photos_photo_id_seq', (SELECT MAX(photo_id) FROM photos));
SELECT setval('characteristics_characteristic_id_seq', (SELECT MAX(characteristic_id) FROM characteristics));
SELECT setval('characteristic_reviews_id_seq', (SELECT MAX(id) FROM characteristic_reviews));
  `;
  client.query(sql)
    .then(() => {
      done();
    })
})

afterAll(() => {
  server.close();
  client.end();
})

describe('server tests', () => {

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
