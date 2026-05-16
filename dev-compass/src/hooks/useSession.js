import { useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

const SESSION_KEY = 'oss_session_id';
const VISIT_KEY = 'oss_visited';
const HEARTBEAT_INTERVAL = 20000; // 20s
const STALE_THRESHOLD = 45000;   // 45s

function getOrCreateSessionId() {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function isReturningUser() {
  const visited = localStorage.getItem(VISIT_KEY);
  localStorage.setItem(VISIT_KEY, 'true');
  return !!visited;
}

export function useSession({ page, pageLabel, activeSearch = '' } = {}) {
  const sessionId = useRef(getOrCreateSessionId());
  const isReturning = useRef(isReturningUser());
  const recordRef = useRef(null);

  const sendHeartbeat = useCallback(async () => {
    const payload = {
      session_id: sessionId.current,
      page: page || window.location.pathname,
      page_label: pageLabel || document.title,
      is_returning: isReturning.current,
      active_search: activeSearch || '',
      last_heartbeat: new Date().toISOString(),
    };

    if (recordRef.current) {
      // Update existing record
      base44.entities.LiveSession.update(recordRef.current, payload).catch(() => {});
    } else {
      // Find existing or create
      try {
        const existing = await base44.entities.LiveSession.filter({ session_id: sessionId.current });
        if (existing && existing.length > 0) {
          recordRef.current = existing[0].id;
          base44.entities.LiveSession.update(recordRef.current, payload).catch(() => {});
        } else {
          const created = await base44.entities.LiveSession.create(payload);
          recordRef.current = created.id;
        }
      } catch (_) {}
    }
  }, [page, pageLabel, activeSearch]);

  const cleanup = useCallback(async () => {
    if (recordRef.current) {
      base44.entities.LiveSession.delete(recordRef.current).catch(() => {});
      recordRef.current = null;
    }
  }, []);

  useEffect(() => {
    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
    window.addEventListener('beforeunload', cleanup);
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', cleanup);
      cleanup();
    };
  }, [sendHeartbeat, cleanup]);
}

export { STALE_THRESHOLD };