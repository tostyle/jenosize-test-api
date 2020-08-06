const functions = require("firebase-functions");
const axios = require("axios");
const qs = require("query-string");
const cors = require("cors")({ origin: true });

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
const GOOGLE_PLACE_API = "https://maps.googleapis.com/maps/api/place";
const TOKEN = "AIzaSyD8ORy1XACA86rQUA3bQSwCl6Uy3qLZdOw";

const searchPlace = (searchQuery) => {
  return axios({
    method: "GET",
    url: `${GOOGLE_PLACE_API}/textsearch/json`,
    params: {
      query: searchQuery,
      key: TOKEN,
      region: "th",
    },
  });
};

const getPlacePhoto = (placeReference, maxWidth = 400) => {
  const params = {
    photoreference: placeReference,
    maxwidth: maxWidth,
    key: TOKEN,
  };
  const query = qs.stringify(params);
  return `${GOOGLE_PLACE_API}/photo?${query}`;
};

exports.searchGooglePlace = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    functions.logger.info("Hello logs!", { structuredData: true });
    const { searchQuery } = request.query;
    try {
      const { data } = await searchPlace(searchQuery);
      console.log(data, searchQuery);
      const places = data.results.map((result) => {
        const [photo] = result.photos || [];
        const photoUrl = photo ? getPlacePhoto(photo.photo_reference) : null;
        return {
          name: result.name,
          formatted_address: result.formatted_address,
          thumbnail: photoUrl,
          photos: result.photos,
        };
      });
      response.send(places);
    } catch (error) {
      functions.logger.error(error, { structuredData: true });
      response.status(500).send({
        message: error.message,
      });
    }
  });
});
