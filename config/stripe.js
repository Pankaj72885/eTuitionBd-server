import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const initializeStripe = () => {
  console.log("Stripe initialized successfully");
};

const getStripe = () => {
  return stripe;
};

export { getStripe, initializeStripe };
