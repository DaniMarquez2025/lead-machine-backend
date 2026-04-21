import express from "express";
import Stripe from "stripe";

const app = express();
app.use(express.json());

// ✅ Usa la variable de entorno de Render
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 👉 Crear sesión de pago
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
              name: "Lead Machine",
            },
            unit_amount: 5000, // 50€
          },
          quantity: 1,
        },
      ],
      success_url: "https://tudominio.com/success",
      cancel_url: "https://tudominio.com/cancel",
    });

    res.json({ url: session.url });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creando el pago" });
  }
});

// 👉 Ruta test
app.get("/", (req, res) => {
  res.send("Servidor funcionando 🚀");
});

// 👉 IMPORTANTE para Render
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
