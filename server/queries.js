module.exports = {
  sqlA: function(productId, count, offset, client) {
    let sql = `SELECT review_id, rating, summary, recommend, response, body, date, reviewer_name, helpfulnessCount FROM reviews WHERE product_id = ${productId} AND reported = 'false' LIMIT ${count} OFFSET ${offset}`;
    return client.query(sql);
  }
}