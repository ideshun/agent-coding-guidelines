import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Counter } from '../src/Counter';

test('increments and resets observable counter state', () => {
  render(<Counter />);
  const count = screen.getByLabelText('计数');
  expect(count.textContent).toBe('0');
  fireEvent.click(screen.getByRole('button', { name: '+1' }));
  fireEvent.click(screen.getByRole('button', { name: '+1' }));
  expect(count.textContent).toBe('2');
  fireEvent.click(screen.getByRole('button', { name: '重置' }));
  expect(count.textContent).toBe('0');
  fireEvent.click(screen.getByRole('button', { name: '+1' }));
  expect(count.textContent).toBe('1');
});
