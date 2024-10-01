/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from "firebase-functions/v2/https";
import { info } from "firebase-functions/logger";

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

import { initializeApp, firestore } from "firebase-admin";
import { getStorage } from "firebase-admin/storage";

initializeApp();
const db = firestore();

export const getAds = onRequest(async (request, response) => {
  info("Hello logs!", {structuredData: true});

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
  const adImagePaths = snapshot.docs.map((doc) => doc.data()["imagePath"]);

  // Fetch data for all the files in parallel
  const imagePromises = adImagePaths.map(async (imagePath) => {
    const image = bucket.file(imagePath);
    const [imageData] = await image.download();
    return {
      imagePath,
      imageData: imageData.toString("base64"),
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
