const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

const db = admin.firestore();
const collectionName = "ads_viewed";

const insertAdViewedEntry = onRequest(async (request, response) => {
  const adId = request.query.adId;
  const userId = request.query.userId;

  const newEntry = {
    adId,
    userId,
    ttl: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000),
  };
  try {
    await db.collection(collectionName).add(newEntry);
  } catch (error) {
    return response.status(500).send("Query to DB failed");
  }

  return response.status(200).send("Inserting item succeeded");
});

const hasAdViewedEntry = onRequest(async (request, response) => {
  const adId = request.query.adId;
  const userId = request.query.userId;

  try {
    const items = await db
      .collection(collectionName)
      .where("adId", "==", adId)
      .where("userId", "==", userId)
      .get();

    if (items.size > 0) {
      return response.status(200).send(true);
    }

    return response.status(200).send(false);
  } catch (error) {
    return response.status(500).send("Query to DB failed");
  }
});

module.exports = { insertAdViewedEntry, hasAdViewedEntry };
