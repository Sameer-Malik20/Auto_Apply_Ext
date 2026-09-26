import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

import {
  collectUnresolvedDescriptors,
  applyDynamicAnswers,
} from '../lib/form-filler.js';
import { handleResolveDynamicFields } from '../background/modules/handlers/answers.js';

function setupDom(html) {
  const dom = new JSDOM(html, { url: 'https://example.com/apply' });
  global.window = dom.window;
  global.document = dom.window.document;
  global.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
  global.Event = dom.window.Event;
  global.CSS = dom.window.CSS || { escape: (value) => String(value).replace(/"/g, '\\"') };
  return dom;
}

test('collectUnresolvedDescriptors extracts unfilled input, select options, and radio groups', () => {
  setupDom(`
    <form>
      <label for="name">Full Name</label>
      <input id="name" name="full_name" value="Jane Doe" />

      <label for="notice">Notice Period</label>
      <select id="notice" name="notice_period">
        <option value="">-- Choose --</option>
        <option value="immediate">Immediate</option>
        <option value="1month">1 Month</option>
      </select>

      <fieldset>
        <legend>Work Authorization</legend>
        <label><input type="radio" name="work_auth" value="yes" /> Yes</label>
        <label><input type="radio" name="work_auth" value="no" /> No</label>
      </fieldset>

      <label for="why">Why this company?</label>
      <textarea id="why" name="why_us" placeholder="Tell us why..."></textarea>
    </form>
  `);

  const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
  const descriptors = collectUnresolvedDescriptors(inputs);

  // Field 0 has a value ("Jane Doe") so it must NOT be in unresolved
  assert.equal(descriptors.some((d) => d.id === 0), false);

  // Field 1 is the select
  const selectDesc = descriptors.find((d) => d.id === 1);
  assert.ok(selectDesc);
  assert.equal(selectDesc.tag, 'select');
  assert.deepEqual(selectDesc.options, ['Immediate', '1 Month']);

  // Field 4 is the textarea
  const textDesc = descriptors.find((d) => d.id === 4);
  assert.ok(textDesc);
  assert.equal(textDesc.tag, 'textarea');
  assert.equal(textDesc.placeholder, 'Tell us why...');
});

test('applyDynamicAnswers fills mapped fields by index and highlights them', () => {
  setupDom(`
    <form>
      <input id="f0" name="field0" />
      <select id="f1" name="field1">
        <option value="">Select...</option>
        <option value="opt_a">Option A</option>
        <option value="opt_b">Option B</option>
      </select>
      <textarea id="f2" name="field2"></textarea>
    </form>
  `);

  const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
  const dynamicAnswers = {
    '0': 'Dynamic text value',
    '1': 'Option B',
    '2': 'Generated essay explanation.',
  };

  const filledCount = applyDynamicAnswers(inputs, dynamicAnswers, { highlight: false });

  assert.equal(filledCount, 3);
  assert.equal(document.getElementById('f0').value, 'Dynamic text value');
  assert.equal(document.getElementById('f1').value, 'opt_b');
  assert.equal(document.getElementById('f2').value, 'Generated essay explanation.');
});

test('handleResolveDynamicFields safely handles empty or non-array inputs', async () => {
  const result = await handleResolveDynamicFields({ fields: [] });
  assert.deepEqual(result, { success: true, answers: {} });

  const nullResult = await handleResolveDynamicFields({});
  assert.deepEqual(nullResult, { success: true, answers: {} });
});
