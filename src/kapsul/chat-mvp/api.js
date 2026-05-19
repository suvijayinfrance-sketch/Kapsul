const BASE = import.meta.env.VITE_API_BASE ?? '';

function formatApiError(body, fallback, status) {
  if (!body) return fallback;
  const d = body.detail;
  if (typeof d === 'string') {
    if (status === 404 && d === 'Not Found') {
      return 'Add-files API is outdated. Stop and restart: npm run dev:api';
    }
    if (status === 404 && d === 'Session not found') {
      return 'Session expired (API was restarted). Use “New files” to start again.';
    }
    return d;
  }
  if (Array.isArray(d)) return d.map((x) => x.msg || x.message || JSON.stringify(x)).join('; ');
  return fallback;
}

async function apiFetch(url, options) {
  try {
    return await fetch(`${BASE}${url}`, options);
  } catch {
    throw new Error(
      'Cannot reach the API server. Start it in a second terminal: npm run dev:api',
    );
  }
}

export async function checkApiHealth() {
  const res = await apiFetch('/api/health');
  if (!res.ok) {
    throw new Error(
      'API server is not running. In a second terminal, run: npm run dev:api',
    );
  }
  const data = await res.json();
  if (!data.mistral) throw new Error('MISTRAL_API_KEY missing on server. Check .env.local');
  return data;
}

export async function uploadFiles(files) {
  await checkApiHealth();
  const form = new FormData();
  files.forEach((f) => form.append('files', f));
  const res = await apiFetch('/api/upload', { method: 'POST', body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = formatApiError(err, `Upload failed (${res.status})`, res.status);
    if (res.status === 500 && msg === 'Internal Server Error') {
      throw new Error(
        'Upload timed out or the server crashed. Restart npm run dev:api, then try again.',
      );
    }
    throw new Error(msg);
  }
  return res.json();
}

export async function addFilesToSession(sessionId, files) {
  await checkApiHealth();
  const form = new FormData();
  files.forEach((f) => form.append('files', f));
  const res = await apiFetch(`/api/session/${sessionId}/add-files`, { method: 'POST', body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(formatApiError(err, `Add files failed (${res.status})`, res.status));
  }
  return res.json();
}

export async function getSession(sessionId) {
  const res = await apiFetch(`/api/session/${sessionId}`);
  if (!res.ok) throw new Error('Session not found');
  return res.json();
}

export function streamChat(sessionId, message, history, { onToken, onDone, onError, onSources }) {
  apiFetch(`/api/chat/${sessionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  })
    .then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(formatApiError(err, `Chat failed (${res.status})`, res.status));
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const pump = () =>
        reader.read().then(({ done, value }) => {
          if (done) {
            onDone?.();
            return;
          }
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') {
              onDone?.();
              return;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.token) onToken(parsed.token);
              if (parsed.sources) onSources?.(parsed.sources);
              if (parsed.error) onError?.(new Error(parsed.error));
            } catch {
              /* ignore partial JSON */
            }
          }
          return pump();
        });

      return pump();
    })
    .catch((e) => onError?.(e));
}

export const SESSION_STORAGE_KEY = 'kapsul_chat_session';
