import { describe, it, expect } from 'vitest';
import { formatDate } from './format-date.js';

describe('formatDate', () => {
  it('formats a known date to expected locale string', () => {
    const date = new Date('2025-01-15');
    expect(formatDate(date)).toBe('January 15, 2025');
  });

  it('formats a year-boundary date correctly', () => {
    const date = new Date('2024-12-31');
    expect(formatDate(date)).toBe('December 31, 2024');
  });

  it('formats a single-digit day and month correctly', () => {
    const date = new Date('2023-03-05');
    expect(formatDate(date)).toBe('March 5, 2023');
  });

  it('formats a leap day correctly', () => {
    const date = new Date('2024-02-29');
    expect(formatDate(date)).toBe('February 29, 2024');
  });

  it('returns a non-empty string for any valid date', () => {
    const date = new Date('2000-01-01');
    expect(typeof formatDate(date)).toBe('string');
    expect(formatDate(date).length).toBeGreaterThan(0);
  });
});
