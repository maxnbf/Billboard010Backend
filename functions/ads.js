const { onRequest } = require("firebase-functions/v2/https");
const { getStorage } = require("firebase-admin/storage");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

const getAds = onRequest(async (request, response) => {
  logger.info("Hello from, getAds!", { structuredData: true });

  // Your Firebase Storage bucket name
  const bucketName = "adup-b77b2.appspot.com";
  const bucket = getStorage().bucket(bucketName);

  // Get the first 5 documents in ads collection,
  // where field shouldBeShown is true
  const snapshot = await db
    .collection("ads")
    .limit(5)
    .where("shouldBeShown", "==", true)
    .get();

  // Extract imagePath
  const adImagePaths = snapshot.docs.map((doc) => {
    const data = doc.data();
    const imagePath = data["imagePath"];
    const imageUrl = data["goToUrl"];
    const id = doc.id;

    return {
      imagePath,
      imageUrl,
      id,
    };
  });

  // Fetch data for all the files in parallel
  const imagePromises = adImagePaths.map(async (imagePathAndUrl) => {
    const image = bucket.file(imagePathAndUrl.imagePath);
    const [imageData] = await image.download();
    return {
      imagePath: imagePathAndUrl.imagePath,
      imageUrl: imagePathAndUrl.imageUrl,
      imageData: imageData.toString("base64"),
      id: imagePathAndUrl.id,
    };
  });

  // Wait for all files to be fetched
  const imagesData = await Promise.all(imagePromises);

  // Set the appropriate content type for JSON response
  response.setHeader("Content-Type", "application/json");

  // Return the list of file data
  return response.status(200).send({
    images: imagesData, // Send the file paths and data
  });
});

module.exports = { getAds };
