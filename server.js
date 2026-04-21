import express from "express";
import Stripe from "stripe";
import admin from "firebase-admin";

const app = express();
app.use(express.json());

// 👉 AQUÍ LUEGO VA TU CLAVE
const stripe = new Stripe("TU_STRIPE_SECRET");

// 👉 FIREBASE (luego metemos la clave)
import fs from "fs";

const serviceAccount = JSON.parse(
  fs.readFileSync("./serviceAccountKey.json", "utf-8")
);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 👉 AQUÍ ESCUCHAMOS A STRIPE
app.post("/webhook", async (req, res) => {
  const event = req.body;

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const email = session.customer_details.email;

    const snapshot = await db.collection("users")
      .where("email", "==", email)
      .get();

    snapshot.forEach(async (docu) => {
      await db.collection("users").doc(docu.id).update({
        paid: true
      });
    });
  }

  res.sendStatus(200);
});

app.get("/", (req, res) => {
  res.send("Servidor funcionando");
});

app.listen(3000, () => console.log("Server running"));
