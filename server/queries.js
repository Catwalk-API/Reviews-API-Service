//The purpose of ideally separating out all of these queries is to modularize code and also improve testing ability because everything is organized.

module.exports = {
  sqlA: function(productId, count, offset, client) {
    let sql = `SELECT review_id, rating, summary, recommend, response, body, date, reviewer_name, helpfulnessCount FROM reviews WHERE product_id = ${productId} AND reported is not true LIMIT ${count} OFFSET ${offset}`;
    return client.query(sql);
  }
}