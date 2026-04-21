import express from "express";
import Stripe from "stripe";
import admin from "firebase-admin";

const app = express();
app.use(express.json());

// 👉 STRIPE
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 👉 FIREBASE (SIN JSON FILE)
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_KEY))
});

const db = admin.firestore();


// 🚀 CREAR CHECKOUT
app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Lead Machine"
            },
            unit_amount: 5000
          },
          quantity: 1
        }
      ],
      success_url: "https://google.com",
      cancel_url: "https://google.com"
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creando sesión" });
  }
});


// 🔔 WEBHOOK STRIPE
app.post("/webhook", async (req, res) => {
  const event = req.body;

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const email = session.customer_details?.email;

    if (email) {
      const snapshot = await db
        .collection("users")
        .where("email", "==", email)
        .get();

      snapshot.forEach(async (docu) => {
        await db.collection("users").doc(docu.id).update({
          paid: true
        });
      });
    }
  }

  res.sendStatus(200);
});


// 🧪 TEST
app.get("/", (req, res) => {
  res.send("Servidor funcionando 🚀");
});


app.listen(3000, () => console.log("Server running"));
