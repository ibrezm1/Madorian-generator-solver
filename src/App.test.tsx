import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Mondrian Blocks title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Mondrian Blocks/i);
  expect(titleElement).toBeInTheDocument();
});
