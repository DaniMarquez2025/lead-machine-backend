const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
app.use(cors());
app.use(express.json());

// 🔥 Firebase config
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// 👉 GET leads
app.get("/leads", async (req, res) => {
  try {
    const snapshot = await db.collection("leads").get();
    const leads = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 👉 POST lead
app.post("/leads", async (req, res) => {
  try {
    const data = req.body;
    const docRef = await db.collection("leads").add(data);
    res.json({ id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor corriendo en puerto", PORT));
