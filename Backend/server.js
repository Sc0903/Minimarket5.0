const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');

// Pega aquí tu clave secreta de Stripe (TEST)
const stripe = Stripe('sk_test_51RwEDTLLHyAsYI9jWEGJZvR0WZQgaKZYyo4hJh3BT45vCF7mlLBDz0EoJ1oMeYniVN0ML4KI6jWOW8ARQ3o0sLoI006YkKK9at');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// Endpoint para crear el pago
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { cartItems } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'No hay productos en el carrito' });
    }

    // Mapeamos los items del carrito a lo que Stripe necesita
    const line_items = cartItems.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: { name: item.name },
        unit_amount: item.price * 100, // Stripe necesita centavos
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: 'myapp://success', // Aquí puedes poner tu deep link o pantalla de éxito
      cancel_url: 'myapp://cancel',  // O pantalla de cancelación
    });

    res.json({ url: session.url });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Error creando la sesión de pago' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
