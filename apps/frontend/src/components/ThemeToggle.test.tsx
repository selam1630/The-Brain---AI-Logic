/**
 * Theme toggle tests
 * Verifies accessible light/dark controls and the persisted-theme handoff.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { ThemeToggle } from './ThemeToggle';

const setTheme = jest.fn<void, [string]>();

jest.mock('next-themes', () => ({
  useTheme: () => ({
    resolvedTheme: 'light',
    setTheme,
    theme: 'light',
  }),
}));

describe('ThemeToggle', () => {
  it('switches from light to dark mode with an accessible label', () => {
    render(<ThemeToggle />);

    const toggle = screen.getByRole('button', { name: 'Switch to dark mode' });
    fireEvent.click(toggle);

    expect(setTheme).toHaveBeenCalledWith('dark');
  });
});
