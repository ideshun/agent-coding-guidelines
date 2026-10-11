import { useState } from 'react';

export const Counter = () => {
  const [count] = useState(0);
  return <output aria-label="计数">{count}</output>;
};
