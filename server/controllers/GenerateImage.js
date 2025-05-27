// import * as dotenv from "dotenv";
// import { createError } from "../error.js";
// import axios from "axios";

// dotenv.config();

// // Controller to generate Image using Hugging Face
// export const generateImage = async (req, res, next) => {
//   try {
//     const { prompt } = req.body;
//         console.log("📥 Prompt received:", prompt); // Log input prompt
//     console.log("🔑 Hugging Face Token prefix:", process.env.HUGGINGFACE_API_TOKEN?.slice(0, 5));
//     const response = await axios({
//       method: "POST",
//       url: "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev",  // 
//       headers: {
//         Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
//         "Content-Type": "application/json",
//       },
//       data: {
//         inputs: prompt,
//       },
//       responseType: "arraybuffer", // Important if the response is an image
//     });

//     const generatedImage = Buffer.from(response.data, "binary").toString("base64");

//     res.status(200).json({ photo: generatedImage });
//   } catch (error) {
//     next(
//       createError(
//         error.response?.status || 500,
//         error?.response?.data?.error || error.message
//       )
//     );
//   }
// };
import * as dotenv from "dotenv";
import { createError } from "../error.js";
import { GoogleGenAI, Modality } from "@google/genai";
import fs from "fs";

dotenv.config();

export const generateImage = async (req, res, next) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return next(createError(400, "Prompt is required and must be a string"));
    }

    console.log("📥 Prompt received:", prompt);

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation", // Use the model for image gen
      contents: prompt,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE], // Request image generation
      },
    });

    // Find the first candidate's first content part with image data
    const parts = response.candidates[0].content.parts;

    let imageBase64 = null;
    let textResult = "";

    for (const part of parts) {
      if (part.text) {
        textResult += part.text + "\n"; // collect any text part if needed
      } else if (part.inlineData) {
        // inlineData.data is the base64 string of image
        imageBase64 = part.inlineData.data;
      }
    }

    if (!imageBase64) {
      return next(createError(500, "No image generated from API"));
    }

    // Optionally save image on server (comment this if not needed)
    // fs.writeFileSync("generated-image.png", Buffer.from(imageBase64, "base64"));

    // Send base64 image back to frontend
    res.status(200).json({ photo: imageBase64, text: textResult.trim() });
  } catch (error) {
    console.error("Gemini API error details:", error.response?.data || error.message);
    next(
      createError(
        error.response?.status || 500,
        error.response?.data?.error || error.message || "Internal Server Error"
      )
    );
  }
};
