/**
 * apply-bot — scraped-parser.js
 * Parses raw scraped job lists, markdown links, or URL pastes into structured tracker jobs.
 */

export function parseScrapedJobLine(line) {
  const raw = String(line || '').trim();
  if (!raw) return null;

  // 1. Extract URL (support markdown [URL](URL) or plain URL)
  let url = '';
  const mdMatch = raw.match(/\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/i);
  if (mdMatch) {
    url = mdMatch[2].trim();
  } else {
    const urlMatch = raw.match(/https?:\/\/[^\s)\],]+/i);
    if (urlMatch) {
      url = urlMatch[0].trim();
    }
  }

  if (!url) return null;

  // Clean trailing punctuation from URL if any
  url = url.replace(/[.,;:>]+$/, '');

  // 2. Extract domain/source
  let source = 'web';
  try {
    const parsedUrl = new URL(url);
    source = parsedUrl.hostname.replace(/^www\./i, '');
  } catch {
    // Ignore URL parse error
  }

  // 3. Extract text preceding the URL / markdown
  let prefix = raw;
  if (mdMatch) {
    prefix = raw.slice(0, mdMatch.index).trim();
  } else {
    const idx = raw.indexOf(url);
    if (idx >= 0) {
      prefix = raw.slice(0, idx).trim();
    }
  }

  // Remove trailing dashes, colons, or em-dashes
  prefix = prefix.replace(/[\s—–\-:]+$/, '').trim();

  // 4. Extract employment type from parentheses e.g. (Contract), (Full-time), (Part-time)
  let employmentType = 'Full-time';
  const typeMatch = prefix.match(/\((Full-time|Contract|Part-time|Internship|Temporary|Contractor)\)/i);
  if (typeMatch) {
    employmentType = typeMatch[1].trim();
    prefix = prefix.replace(typeMatch[0], '').trim();
  }

  // Remove trailing punctuation again after type removal
  prefix = prefix.replace(/[\s—–\-:]+$/, '').trim();

  // 5. Parse Title and Company from remainder
  let title = '';
  let company = '';

  // Look for separators like ' – ', ' — ', ' - ', ' | ', ' at '
  const splitMatch = prefix.split(/\s*(?:—|–|-|\||\bat\b)\s*/i);
  if (splitMatch.length >= 2) {
    title = splitMatch[0].trim();
    company = splitMatch[1].trim();
  } else if (prefix) {
    title = prefix;
    company = source.includes('dice') ? 'Dice Employer' : 'Target Company';
  } else {
    title = source.includes('dice') ? 'Dice Opportunity' : 'Job Listing';
    company = source.includes('dice') ? 'Dice Employer' : 'Target Company';
  }

  return {
    id: crypto.randomUUID ? crypto.randomUUID() : 'job-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
    title: title || 'Software Engineer',
    company: company || 'Company',
    url,
    employment_type: employmentType,
    status: 'drafted',
    source,
    date: new Date().toISOString().slice(0, 10),
    updated_at: new Date().toISOString(),
    description: `Imported from Scraper (${source})`,
    remote: /remote/i.test(raw),
  };
}

/**
 * Parses full raw text with multiple job lines into structured job objects.
 * Automatically deduplicates by URL.
 */
export function parseScrapedJobText(text) {
  if (!text) return [];
  const lines = String(text).split(/\r?\n/);
  const seenUrls = new Set();
  const results = [];

  for (const line of lines) {
    const job = parseScrapedJobLine(line);
    if (job && job.url && !seenUrls.has(job.url)) {
      seenUrls.add(job.url);
      results.push(job);
    }
  }

  return results;
}
