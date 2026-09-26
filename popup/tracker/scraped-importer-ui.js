// scraped-importer-ui.js
// Handles UI for bulk scraped links import and the quick queue on the main screen.

import { $, esc, escAttr, sendMessage } from '../../lib/utils.js';
import { parseScrapedJobText } from '../../lib/scraped-parser.js';
import { normalizeApplicationStatus } from '../../lib/tracker.js';

export function openBulkImportModal() {
  const modal = $('bulk-import-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  const textarea = $('bulk-jobs-textarea');
  if (textarea) {
    textarea.focus();
    updateParseCount();
  }
}

export function closeBulkImportModal() {
  const modal = $('bulk-import-modal');
  if (!modal) return;
  modal.classList.add('hidden');
}

function updateParseCount() {
  const textarea = $('bulk-jobs-textarea');
  const countEl = $('bulk-parse-count');
  if (!textarea || !countEl) return;

  const parsed = parseScrapedJobText(textarea.value);
  const count = parsed.length;
  countEl.textContent = count === 1 ? '1 valid job link detected' : `${count} valid job links detected`;
  countEl.style.color = count > 0 ? 'var(--accent)' : 'var(--text-muted)';
}

export function renderScrapedQueue(applications = []) {
  const queueList = $('scraped-queue-list');
  const queueBadge = $('scraped-queue-badge');
  if (!queueList) return;

  // Filter for pending or drafted jobs with a valid URL
  const pendingJobs = applications.filter((app) => {
    if (!app.url) return false;
    const s = normalizeApplicationStatus(app.status);
    return ['drafted', 'pending', 'filled'].includes(s);
  });

  if (queueBadge) {
    queueBadge.textContent = `${pendingJobs.length} ready to apply`;
    queueBadge.className = 'badge ' + (pendingJobs.length > 0 ? 'badge-ok' : 'badge-info');
  }

  if (pendingJobs.length === 0) {
    queueList.innerHTML = `
      <div class="scraped-queue-empty">
        <p>No scraped jobs in queue.</p>
        <button id="empty-paste-links-btn" class="btn btn-secondary btn-sm" type="button">📥 Paste Scraped Links</button>
      </div>
    `;
    $('empty-paste-links-btn')?.addEventListener('click', openBulkImportModal);
    return;
  }

  // Render top 10 queued items
  const itemsHtml = pendingJobs.slice(0, 10).map((job) => {
    const domain = (job.source || 'web').replace(/^www\./i, '');
    const empType = job.employment_type || 'Full-time';
    return `
      <div class="scraped-queue-item" data-id="${escAttr(job.id)}">
        <div class="scraped-item-left">
          <div class="scraped-item-role">${esc(job.title || 'Tech Role')}</div>
          <div class="scraped-item-company">
            <span>${esc(job.company || 'Target Employer')}</span>
            <span class="scraped-item-pill">${esc(empType)}</span>
            <span class="scraped-item-source">${esc(domain)}</span>
          </div>
        </div>
        <div class="scraped-item-right">
          <button class="btn btn-primary btn-xs scraped-open-apply-btn" data-url="${escAttr(job.url)}" type="button" title="Open ${escAttr(job.url)} in Chrome">
            ⚡ Open &amp; Apply
          </button>
        </div>
      </div>
    `;
  }).join('');

  const moreCount = pendingJobs.length > 10 ? pendingJobs.length - 10 : 0;
  const moreNotice = moreCount > 0
    ? `<div class="scraped-queue-more">+${moreCount} more queued jobs in Pipeline</div>`
    : '';

  queueList.innerHTML = itemsHtml + moreNotice;
}

export function initScrapedImporter(callbacks = {}) {
  const { onImportSuccess } = callbacks;

  // Open modal buttons
  $('main-bulk-import-btn')?.addEventListener('click', openBulkImportModal);
  $('bulk-import-btn')?.addEventListener('click', openBulkImportModal);

  // Close modal buttons
  $('close-bulk-import-btn')?.addEventListener('click', closeBulkImportModal);
  $('bulk-import-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'bulk-import-modal') {
      closeBulkImportModal();
    }
  });

  // Textarea input count
  $('bulk-jobs-textarea')?.addEventListener('input', updateParseCount);

  // Clear button
  $('clear-bulk-jobs-btn')?.addEventListener('click', () => {
    const textarea = $('bulk-jobs-textarea');
    if (textarea) {
      textarea.value = '';
      updateParseCount();
    }
  });

  // Confirm import button
  $('confirm-bulk-import-btn')?.addEventListener('click', async () => {
    const textarea = $('bulk-jobs-textarea');
    const btn = $('confirm-bulk-import-btn');
    if (!textarea || !textarea.value.trim()) {
      alert('Please paste at least one job link.');
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.textContent = '⏳ Importing…';
    }

    try {
      const resp = await sendMessage({
        type: 'BULK_ADD_APPLICATIONS',
        payload: { text: textarea.value.trim() },
      });

      if (!resp?.success) {
        throw new Error(resp?.error || 'Failed to import jobs.');
      }

      textarea.value = '';
      closeBulkImportModal();

      if (onImportSuccess) {
        await onImportSuccess(resp.count);
      }
    } catch (err) {
      alert('Import failed: ' + (err.message || 'Unknown error'));
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = '🚀 Save All to Queue';
      }
    }
  });

  // Global click handler for Open & Apply buttons across popup
  document.addEventListener('click', (e) => {
    const applyBtn = e.target.closest('.scraped-open-apply-btn, .tracker-open-apply-btn');
    if (applyBtn) {
      const url = applyBtn.dataset.url;
      if (url) {
        chrome.tabs.create({ url, active: true });
      }
    }
  });
}
