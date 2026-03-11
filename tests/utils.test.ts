import { describe, it, expect } from 'vitest';
import { countWords, formatTime, getRandomEmojis, seededRandom } from '../src/lib/utils';

describe('countWords', () => {
  it('should count words correctly', () => {
    expect(countWords('Hello world')).toBe(2);
    expect(countWords('This is a test')).toBe(4);
    expect(countWords('Single')).toBe(1);
  });

  it('should handle empty strings', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   ')).toBe(0);
  });

  it('should handle multiple spaces', () => {
    expect(countWords('Hello    world')).toBe(2);
    expect(countWords('  Multiple   spaces   here  ')).toBe(3);
  });

  it('should handle newlines and tabs', () => {
    expect(countWords('Hello\nworld')).toBe(2);
    expect(countWords('Tab\tseparated\twords')).toBe(3);
  });
});

describe('formatTime', () => {
  it('should format time correctly', () => {
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(30)).toBe('00:30');
    expect(formatTime(60)).toBe('01:00');
    expect(formatTime(90)).toBe('01:30');
    expect(formatTime(125)).toBe('02:05');
  });

  it('should pad single digits with zeros', () => {
    expect(formatTime(5)).toBe('00:05');
    expect(formatTime(65)).toBe('01:05');
  });

  it('should handle large values', () => {
    expect(formatTime(599)).toBe('09:59');
    expect(formatTime(3600)).toBe('60:00');
  });
});

describe('seededRandom', () => {
  it('should generate deterministic random numbers', () => {
    const random1 = seededRandom(12345);
    const random2 = seededRandom(12345);

    const values1 = [random1(), random1(), random1()];
    const values2 = [random2(), random2(), random2()];

    expect(values1).toEqual(values2);
  });

  it('should generate different sequences for different seeds', () => {
    const random1 = seededRandom(12345);
    const random2 = seededRandom(54321);

    const values1 = [random1(), random1(), random1()];
    const values2 = [random2(), random2(), random2()];

    expect(values1).not.toEqual(values2);
  });

  it('should generate numbers between 0 and 1', () => {
    const random = seededRandom(999);

    for (let i = 0; i < 100; i++) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('getRandomEmojis', () => {
  const testEmojis = ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃'];

  it('should return the requested number of emojis', () => {
    const result = getRandomEmojis(testEmojis, 3);
    expect(result).toHaveLength(3);
  });

  it('should return emojis from the provided list', () => {
    const result = getRandomEmojis(testEmojis, 5);
    result.forEach((emoji) => {
      if (emoji !== undefined) {
        expect(testEmojis).toContain(emoji);
      }
    });
  });

  it('should generate deterministic results with seed', () => {
    const result1 = getRandomEmojis(testEmojis, 3, new Set(), 12345);
    const result2 = getRandomEmojis(testEmojis, 3, new Set(), 12345);
    expect(result1).toEqual(result2);
  });

  it('should generate different results with different seeds', () => {
    const result1 = getRandomEmojis(testEmojis, 5, new Set(), 11111);
    const result2 = getRandomEmojis(testEmojis, 5, new Set(), 22222);
    expect(result1).not.toEqual(result2);
  });

  it('should skip locked indices', () => {
    const locked = new Set([0, 2]);
    const result = getRandomEmojis(testEmojis, 5, locked);

    // Locked positions should be undefined (caller preserves them)
    expect(result[0]).toBeUndefined();
    expect(result[2]).toBeUndefined();

    // Unlocked positions should have emojis
    expect(result[1]).toBeDefined();
    expect(result[3]).toBeDefined();
    expect(result[4]).toBeDefined();
  });
});
