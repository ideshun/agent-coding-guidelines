export const total = (values: number[]): number =>
  values.reduce((sum, value) => sum + value, 0).toFixed(2);
