import * as React from 'react';
import { render } from '@testing-library/react';
import App from '../App';

test('renders learn react link', () => {
  window.__iff_VALUES__ = {};
  const { getByText } = render(<App />);
  const linkElement = getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
