const express = require("express");
const cors = require("cors");

// Node-fetch corretto per Node <18
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
app.use(cors());
app.use(express.json());

// Avatar locale
const avatarUrl = "avatar.png"; // metti avatar.png nella stessa cartella del frontend

app.post("/talk", async (req, res) => {
  try {
    const userText = req.body.text;

    // Prompt avanzato tutor inglese
    const prompt = `
You are an English tutor AI. Your goal is to help the user learn English efficiently and naturally.
Follow these rules:

1. Speak in ENGLISH naturally and keep sentences short (1-2 phrases max).
2. Ask questions and continue the conversation like a real dialogue partner.
3. Correct only actual mistakes in grammar, spelling, or pronunciation.
4. When correcting an error, explain it briefly in ITALIAN, ONLY for the specific error.
5. For pronunciation, give a short tip or example in English and explain it in Italian.
6. Be encouraging: praise the user for effort and participation.
7. Avoid long monologues; keep explanations concise.
8. Continuously evaluate the user's English level based on grammar, vocabulary, and pronunciation.
9. Gradually increase the difficulty of questions and sentences as the user's level improves.
10. Adapt your questions and comments dynamically based on the user's previous answers.

User: ${userText}
`;

    // Chiamata al modello locale Ollama
    const ollamaResp = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "phi3",
        prompt: prompt,
        stream: false
      })
    });

    const ollamaData = await ollamaResp.json();
    const reply = ollamaData.response || "Hello! Let's start practicing English.";

    res.json({
      text: reply,
      video: avatarUrl
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
