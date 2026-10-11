export const formatPrice = amount => `USD ${amount.toFixed(2)}`;

// Keep this unrelated legacy helper as it is.
export function legacyLabel( value ) { return String( value ); }
