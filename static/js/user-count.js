const USER_COUNT_ENDPOINT = 'https://tianna-unretractive-ellen.ngrok-free.dev/api/auth/users/count';

function updateUserCountElement(value) {
  const element = document.getElementById('user-count');
  if (!element) {
    return;
  }
  element.textContent = value;
}

async function parseUserCountResponse(response) {
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

  throw new Error('Unable to parse user count from response.');
}

async function fetchUserCount() {
  const element = document.getElementById('user-count');
  if (!element) {
    return;
  }

  try {
    updateUserCountElement('...');
    const response = await fetch(USER_COUNT_ENDPOINT, { mode: 'cors' });
    if (!response.ok) {
      throw new Error(`User count request failed with status ${response.status}`);
    }
    const count = await parseUserCountResponse(response);
    updateUserCountElement(count.toLocaleString());
  } catch (error) {
    console.error('Failed to fetch RepoWise user count', error);
    updateUserCountElement('N/A');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchUserCount();
});
