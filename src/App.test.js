import { render, screen } from '@testing-library/react';
import App from './App';

test('renders diabetes predictor app', () => {
  render(<App />);
  const titleElement = screen.getByText(/DiabetesPredictor/i);
  expect(titleElement).toBeInTheDocument();
});
