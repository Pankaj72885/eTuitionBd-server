const stripe = await import("stripe")(process.env.STRIPE_SECRET_KEY);

const initializeStripe = () => {
  console.log("Stripe initialized successfully");
};

const getStripe = () => {
  return stripe;
};

export default {
  initializeStripe,
  getStripe,
};
