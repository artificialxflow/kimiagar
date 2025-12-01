import { clearStoredTokens, getStoredTokens, storeTokens } from './auth';

type ApiFetchOptions = RequestInit & {
  /** امکان غیرفعال کردن تلاش مجدد خودکار در موارد خاص */
  autoRefresh?: boolean;
};

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const tokens = getStoredTokens();
        if (!tokens?.refreshToken) return false;

        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) return false;

        const data = await response.json();
        if (!data?.accessToken) return false;

        // refreshToken جدیدی برنمی‌گردد؛ قبلی را نگه می‌داریم
        storeTokens({
          accessToken: data.accessToken,
          refreshToken: tokens.refreshToken,
        });
        return true;
      } catch (error) {
        console.error('refreshAccessToken error:', error);
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

function redirectToLogin() {
  if (typeof window !== 'undefined') {
    window.location.href = '/login?expired=1';
  }
}

export async function apiFetch(
  input: RequestInfo | URL,
  init: ApiFetchOptions = {}
): Promise<Response> {
  const { autoRefresh = true, headers: initHeaders, ...rest } = init;
  const headers = new Headers(initHeaders ?? {});

  const tokens = getStoredTokens();
  if (tokens?.accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${tokens.accessToken}`);
  }

  let response = await fetch(input, {
    ...rest,
    headers,
  });

  if (response.status !== 401 || !autoRefresh) {
    return response;
  }

  const refreshed = await refreshAccessToken();
  if (!refreshed) {
    clearStoredTokens();
    redirectToLogin();
    throw new Error('نشست کاربر منقضی شده است');
  }

  const updatedTokens = getStoredTokens();
  if (updatedTokens?.accessToken) {
    headers.set('Authorization', `Bearer ${updatedTokens.accessToken}`);
  }

  response = await fetch(input, {
    ...rest,
    headers,
  });

  if (response.status === 401) {
    clearStoredTokens();
    redirectToLogin();
    throw new Error('نشست کاربر منقضی شده است');
  }

  return response;
}


