/**
 * Text to HTML Converter for Tiptap
 * Converts plain text with \n to proper HTML formatting
 */

/**
 * Convert plain text to HTML for Tiptap editor
 * Handles: paragraphs, line breaks, bold, italic, lists, headings, horizontal rules
 */
export function convertTextToHtml(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  // Split by double line breaks for paragraphs
  const paragraphs = text.split(/\n\n+/);

  const htmlParagraphs = paragraphs.map((para) => {
    const trimmed = para.trim();
    if (!trimmed) return "";

    // Check if it's a horizontal rule (---, ***, ___)
    if (/^[-*_]{3,}$/.test(trimmed)) {
      return "<hr>";
    }

    // Check if it's a heading (starts with ##, ###, etc)
    if (trimmed.startsWith("##")) {
      const level = trimmed.match(/^#+/)?.[0].length || 2;
      const content = trimmed.replace(/^#+\s*/, "");
      return `<h${Math.min(level, 3)}>${processInlineFormatting(content)}</h${Math.min(level, 3)}>`;
    }

    // Check if it's a list (multiple lines starting with -, *, or •)
    const lines = trimmed.split("\n");
    if (lines.length > 1 && lines.every((line) => /^\s*[-*•]\s+/.test(line))) {
      const listItems = lines
        .map((line) => {
          const content = line.replace(/^\s*[-*•]\s+/, "");
          return `<li>${processInlineFormatting(content)}</li>`;
        })
        .join("");
      return `<ul>${listItems}</ul>`;
    }

    // Check if it's a numbered list
    if (lines.length > 1 && lines.every((line) => /^\s*\d+\.\s+/.test(line))) {
      const listItems = lines
        .map((line) => {
          const content = line.replace(/^\s*\d+\.\s+/, "");
          return `<li>${processInlineFormatting(content)}</li>`;
        })
        .join("");
      return `<ol>${listItems}</ol>`;
    }

    // Regular paragraph - replace single \n with <br>
    const withBreaks = lines.map((line) => processInlineFormatting(line)).join("<br>");
    return `<p>${withBreaks}</p>`;
  });

  return htmlParagraphs.filter((p) => p).join("");
}

/**
 * Process inline formatting (bold, italic, etc)
 */
function processInlineFormatting(text: string): string {
  let result = text;

  // Bold: **text** or __text__
  result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  result = result.replace(/__(.+?)__/g, "<strong>$1</strong>");

  // Italic: *text* or _text_ (but not URLs or **bold**)
  result = result.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>");
  result = result.replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, "<em>$1</em>");

  // Strikethrough: ~~text~~
  result = result.replace(/~~(.+?)~~/g, "<s>$1</s>");

  // Code: `text`
  result = result.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Links: [text](url)
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  return result;
}

/**
 * Simpler version - just convert \n\n to <p> and \n to <br>
 * Use this if the full version causes issues
 */
export function convertTextToHtmlSimple(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  // Split by double line breaks
  const paragraphs = text
    .split(/\n\n+/)
    .map((para) => {
      const trimmed = para.trim();
      if (!trimmed) return "";

      // Replace single line breaks with <br>
      const withBreaks = trimmed.replace(/\n/g, "<br>");
      return `<p>${withBreaks}</p>`;
    })
    .filter((p) => p);

  return paragraphs.join("");
}

/**
 * Strip HTML tags and decode HTML entities from string
 * Useful for displaying HTML content as plain text
 *
 * @param html - HTML string to strip
 * @returns Plain text without HTML tags
 */
export function stripHtml(html: string): string {
  if (!html) return "";

  return (
    html
      // Remove HTML tags
      .replace(/<[^>]*>/g, "")
      // Decode common HTML entities
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      // Remove extra whitespace
      .replace(/\s+/g, " ")
      .trim()
  );
}
