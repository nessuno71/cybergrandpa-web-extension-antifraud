import { describe, it, expect } from 'vitest';
import { getArrayFromString } from '../get-array-from-string';

describe('getArrayFromString', () => {
  it('splits a string by newlines', () => {
    const result = getArrayFromString('a\nb\nc');
    expect(result).toEqual(['a', 'b', 'c']);
  });

  it('handles empty string', () => {
    const result = getArrayFromString('');
    expect(result).toEqual(['']);
  });

  it('handles single line', () => {
    const result = getArrayFromString('hello');
    expect(result).toEqual(['hello']);
  });

  it('filters lines with a predicate', () => {
    const result = getArrayFromString('0.0.0.0 evil.com\n# comment\n0.0.0.0 bad.com', (x) => x.startsWith('0.0.0.0'));
    expect(result).toEqual(['0.0.0.0 evil.com', '0.0.0.0 bad.com']);
  });

  it('removes a prefix from each line', () => {
    const result = getArrayFromString('0.0.0.0 evil.com\n0.0.0.0 bad.com', undefined, '0.0.0.0');
    expect(result).toEqual(['evil.com', 'bad.com']);
  });

  it('trims whitespace after replacing', () => {
    const result = getArrayFromString('0.0.0.0   evil.com  ', undefined, '0.0.0.0');
    expect(result).toEqual(['evil.com']);
  });

  it('applies both filter and replace', () => {
    const result = getArrayFromString(
      '0.0.0.0 evil.com\n# comment\n0.0.0.0 bad.com',
      (x) => x.startsWith('0.0.0.0'),
      '0.0.0.0'
    );
    expect(result).toEqual(['evil.com', 'bad.com']);
  });

  it('filters out comment lines like hblock format', () => {
    const hblock = '# Title\n0.0.0.0 ads.example.com\n0.0.0.0 tracker.example.com\n# End';
    const result = getArrayFromString(hblock, (x) => x.length > 0 && !x.startsWith('#'), '0.0.0.0');
    expect(result).toEqual(['ads.example.com', 'tracker.example.com']);
  });
});
