import { describe, expect, it } from 'vitest';
import { isIgnoreUrlMatch } from '../is-ignore-url-match';

// CONFIG_LOCAL_URL_MATCHES = '^(?!chrome|firefox|edge|file).*'
// Returns true for URLs that are NOT browser-internal (chrome/firefox/edge/file).

describe('isIgnoreUrlMatch', () => {
  it('returns true for https URLs', () => {
    expect(isIgnoreUrlMatch('https://example.com')).toBe(true);
  });

  it('returns true for http URLs', () => {
    expect(isIgnoreUrlMatch('http://example.com')).toBe(true);
  });

  it('returns false for chrome:// URLs', () => {
    expect(isIgnoreUrlMatch('chrome://settings')).toBe(false);
  });

  it('returns false for firefox:// URLs', () => {
    expect(isIgnoreUrlMatch('firefox://settings')).toBe(false);
  });

  it('returns false for edge:// URLs', () => {
    expect(isIgnoreUrlMatch('edge://settings')).toBe(false);
  });

  it('returns false for file:// URLs', () => {
    expect(isIgnoreUrlMatch('file:///etc/passwd')).toBe(false);
  });

  it('returns true for about:blank (not excluded by the regex)', () => {
    expect(isIgnoreUrlMatch('about:blank')).toBe(true);
  });

  it('returns true for ftp URLs', () => {
    expect(isIgnoreUrlMatch('ftp://example.com')).toBe(true);
  });
});
