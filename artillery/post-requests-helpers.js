module.exports = {
  transformCharacteristics: transformCharacteristics
}

function transformCharacteristics(requestParams, response, context, ee, next) {
  let stringResponse = response.body;
  let parsedResponse = JSON.parse(stringResponse);
  let characteristics = parsedResponse.characteristics;
  let characteristicsPostRequestObject = {};
  for (var characteristic in characteristics) {
    let randomRating = Math.ceil(Math.random() * 5);
    let id = characteristics[characteristic].id;
    characteristicsPostRequestObject[id] = randomRating;
  }

  context.vars.characteristicsPostRequestObject = characteristicsPostRequestObject;
  return next(); // MUST be called for the scenario to continue
}