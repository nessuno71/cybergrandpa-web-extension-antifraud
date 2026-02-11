import type { ScriptInfo } from './types';

// Extract all JavaScript from the current page
export function extractPageScripts(doc?: Document): ScriptInfo[] {
  const resolvedDoc = doc ?? document;
  const scripts: ScriptInfo[] = [];

  try {
    // Inline scripts in <script> tags
    const scriptTags = resolvedDoc.querySelectorAll('script');
    scriptTags.forEach((script, index) => {
      if (script.src) {
        scripts.push({
          type: 'external',
          source: script.src,
          content: null,
          element: script,
          id: `external_${index}`,
        });
      } else if (script.textContent?.trim()) {
        scripts.push({
          type: 'inline',
          source: 'inline',
          content: script.textContent,
          element: script,
          id: `inline_${index}`,
        });
      }
    });

    // Event handlers in HTML attributes
    const allElements = resolvedDoc.querySelectorAll('*');
    allElements.forEach((element, index) => {
      const eventAttrs = Array.from(element.attributes).filter(
        (attr) => attr.name.startsWith('on') && attr.value.trim()
      );

      eventAttrs.forEach((attr) => {
        scripts.push({
          type: 'event_handler',
          source: `${element.tagName.toLowerCase()}.${attr.name}`,
          content: attr.value,
          element: element,
          id: `event_${index}_${attr.name}`,
        });
      });
    });

    // JavaScript URLs (href="javascript:...")
    const jsLinks = resolvedDoc.querySelectorAll<HTMLAnchorElement | HTMLAreaElement>(
      'a[href^="javascript:"], area[href^="javascript:"]'
    );
    jsLinks.forEach((link, index) => {
      scripts.push({
        type: 'javascript_url',
        source: 'javascript_url',
        content: link.href.substring(11), // Remove "javascript:"
        element: link,
        id: `jsurl_${index}`,
      });
    });
  } catch (error) {
    console.error('Error extracting scripts:', error);
  }

  return scripts;
}

// Fetch external script content
export async function fetchExternalScript(url: string): Promise<string | null> {
  try {
    // Check if URL is from same origin or use proxy for CORS
    const response = await fetch(url);
    if (response.ok) {
      return await response.text();
    }
  } catch (error) {
    console.warn(`Could not fetch external script: ${url}`, error);
  }
  return null;
}
