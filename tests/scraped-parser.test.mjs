import test from 'node:test';
import assert from 'node:assert/strict';
import { parseScrapedJobLine, parseScrapedJobText } from '../lib/scraped-parser.js';

test('parseScrapedJobLine parses markdown link with title, company, and contract type', () => {
  const line = 'Decision Scientist – Eliassen Group (Contract) — [https://www.dice.com/job-detail/3b30bd0a-b692-42ed-8928-1868d0d2e7cb](https://www.dice.com/job-detail/3b30bd0a-b692-42ed-8928-1868d0d2e7cb)';
  const job = parseScrapedJobLine(line);

  assert.ok(job);
  assert.equal(job.title, 'Decision Scientist');
  assert.equal(job.company, 'Eliassen Group');
  assert.equal(job.employment_type, 'Contract');
  assert.equal(job.url, 'https://www.dice.com/job-detail/3b30bd0a-b692-42ed-8928-1868d0d2e7cb');
  assert.equal(job.status, 'drafted');
  assert.equal(job.source, 'dice.com');
});

test('parseScrapedJobLine parses full-time role with dash separator', () => {
  const line = 'Junior Solutions Architect – Redhorse Corporation (Full-time) — [https://www.dice.com/job-detail/ccbc2f73-1416-4c2e-8aed-09ae05599457](https://www.dice.com/job-detail/ccbc2f73-1416-4c2e-8aed-09ae05599457)';
  const job = parseScrapedJobLine(line);

  assert.ok(job);
  assert.equal(job.title, 'Junior Solutions Architect');
  assert.equal(job.company, 'Redhorse Corporation');
  assert.equal(job.employment_type, 'Full-time');
  assert.equal(job.url, 'https://www.dice.com/job-detail/ccbc2f73-1416-4c2e-8aed-09ae05599457');
});

test('parseScrapedJobText parses multiple lines and deduplicates', () => {
  const raw = `
Decision Scientist – Eliassen Group (Contract) — [https://www.dice.com/job-detail/3b30bd0a-b692-42ed-8928-1868d0d2e7cb](https://www.dice.com/job-detail/3b30bd0a-b692-42ed-8928-1868d0d2e7cb)
Junior Solutions Architect – Redhorse Corporation (Full-time) — [https://www.dice.com/job-detail/ccbc2f73-1416-4c2e-8aed-09ae05599457](https://www.dice.com/job-detail/ccbc2f73-1416-4c2e-8aed-09ae05599457)
Senior Data Scientist (GenAI/NLP) – Fiekon (Full-time) — [https://www.dice.com/job-detail/0cc46c15-a48e-4eb9-87f6-fe9eeec85e4e](https://www.dice.com/job-detail/0cc46c15-a48e-4eb9-87f6-fe9eeec85e4e)
Decision Scientist – Eliassen Group (Contract) — [https://www.dice.com/job-detail/3b30bd0a-b692-42ed-8928-1868d0d2e7cb](https://www.dice.com/job-detail/3b30bd0a-b692-42ed-8928-1868d0d2e7cb)
  `;

  const list = parseScrapedJobText(raw);
  assert.equal(list.length, 3);
  assert.equal(list[2].title, 'Senior Data Scientist (GenAI/NLP)');
  assert.equal(list[2].company, 'Fiekon');
});
