const PROCESSED_REPO_COUNT_ENDPOINT = '/api/processed-repo-count';

function updateProcessedRepoCountElement(value) {
  const element = document.getElementById('processed-repo-count');
  if (!element) {
    return;
  }
  element.textContent = value;
}

async function parseProcessedRepoCountResponse(response) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const data = await response.json();
    if (typeof data === 'number') {
      return data;
    }
    if (data && typeof data.count === 'number') {
      return data.count;
    }
    const numericValue = Object.values(data).find((value) => typeof value === 'number');
    if (typeof numericValue === 'number') {
      return numericValue;
    }
  }

  const fallbackText = await response.text();
  const parsed = parseInt(fallbackText, 10);
  if (!Number.isNaN(parsed)) {
    return parsed;
  }

  throw new Error('Unable to parse processed repository count from response.');
}

async function fetchProcessedRepoCount() {
  const element = document.getElementById('processed-repo-count');
  if (!element) {
    return;
  }

  try {
    updateProcessedRepoCountElement('...');
    const response = await fetch(PROCESSED_REPO_COUNT_ENDPOINT, { mode: 'cors' });
    if (!response.ok) {
      throw new Error(`Processed repo count request failed with status ${response.status}`);
    }
    const count = await parseProcessedRepoCountResponse(response);
    updateProcessedRepoCountElement(count.toLocaleString());
  } catch (error) {
    console.error('Failed to fetch processed repository count', error);
    updateProcessedRepoCountElement('N/A');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchProcessedRepoCount();
});
