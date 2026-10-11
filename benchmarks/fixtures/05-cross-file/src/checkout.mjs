import { shippingCost } from './pricing.mjs';

export const checkoutSummary = subtotal => ({
  total: subtotal + shippingCost(subtotal),
  freeShipping: subtotal > 100,
});
