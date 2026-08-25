import { useCallback, useEffect, useRef } from 'react';
import apiClient from '@/lib/api/client';
import { API_CONFIG } from '@/lib/utils/constants';
import { createAuthHeaders } from '@/lib/utils/school';

export interface ProctoringEvent {
  event_type: string;
  details?: Record<string, unknown>;
}

const FLUSH_INTERVAL_MS = 15_000;
const HEARTBEAT_INTERVAL_MS = 30_000;

/**
 * Captures integrity-relevant browser events while an exam is active,
 * batches them and flushes to the proctoring API. Runs silently — it never
 * blocks the exam and failures are swallowed (the exam continues either way).
 *
 * When the server auto-terminates the session (flag threshold crossed), the
 * flush response carries `terminated: true` and `onTerminated` fires so the
 * exam page can lock the student out.
 */
export const useProctoring = (
  examId: string | null,
  sessionId: string | null,
  active: boolean,
  onTerminated?: () => void
) => {
  const bufferRef = useRef<ProctoringEvent[]>([]);
  const activeRef = useRef(active);
  activeRef.current = active;
  // Kept in a ref so the callback never needs to be a hook dependency.
  const onTerminatedRef = useRef(onTerminated);
  onTerminatedRef.current = onTerminated;

  const pushEvent = useCallback((event_type: string, details?: Record<string, unknown>) => {
    if (!activeRef.current) return;
    // Cap the buffer so a pathological user can't blow up memory.
    if (bufferRef.current.length >= 200) return;
    bufferRef.current.push({ event_type, details });
  }, []);

  const flush = useCallback(async () => {
    if (!examId || bufferRef.current.length === 0) return;
    const events = bufferRef.current.splice(0, bufferRef.current.length);
    try {
      const res = await apiClient.post('/api/cbt/proctoring/events', {
        exam_id: examId,
        session_id: sessionId,
        events,
      });
      // Server terminated the session for crossing the flag threshold —
      // surface it so the page can lock the exam. Drop the buffer: the
      // attempt is over, no further events matter.
      if (res.data?.terminated) {
        bufferRef.current = [];
        onTerminatedRef.current?.();
      }
    } catch {
      // Requeue on failure so nothing is silently lost during flaky networks.
      bufferRef.current.unshift(...events);
    }
  }, [examId, sessionId]);

  useEffect(() => {
    if (!active || !examId) return;

    const onVisibility = () => {
      if (document.hidden) pushEvent('tab_switch');
      else pushEvent('tab_return');
    };
    const onBlur = () => pushEvent('window_blur');
    const onFocus = () => pushEvent('window_focus');
    const onCopy = () => pushEvent('copy_attempt');
    const onPaste = () => pushEvent('paste_attempt');
    const onCut = () => pushEvent('cut_attempt');
    const onContext = () => pushEvent('right_click');
    const onFullscreen = () => {
      if (!document.fullscreenElement) pushEvent('fullscreen_exit');
    };
    const onKeyDown = (e: KeyboardEvent) => {
      const isDevToolsShortcut =
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) ||
        (e.ctrlKey && e.key === 'U');
      if (isDevToolsShortcut) pushEvent('devtools');
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    document.addEventListener('copy', onCopy);
    document.addEventListener('paste', onPaste);
    document.addEventListener('cut', onCut);
    document.addEventListener('contextmenu', onContext);
    document.addEventListener('fullscreenchange', onFullscreen);
    window.addEventListener('keydown', onKeyDown);

    // Heartbeat — keeps the live proctoring dashboard's "online" dot alive,
    // and carries the session status so a termination is discovered even when
    // the event buffer is empty (no violations to flush).
    const heartbeatTimer = window.setInterval(() => {
      apiClient
        .post('/api/cbt/proctoring/heartbeat', { exam_id: examId, session_id: sessionId })
        .then((res) => {
          if (res.data?.data?.status === 'terminated') {
            onTerminatedRef.current?.();
          }
        })
        .catch(() => {});
    }, HEARTBEAT_INTERVAL_MS);

    // Periodic flush of the event buffer.
    const flushTimer = window.setInterval(() => {
      flush();
    }, FLUSH_INTERVAL_MS);

    // Best-effort flush on tab close (keepalive fetch carries auth headers).
    const onUnload = () => {
      if (bufferRef.current.length === 0) return;
      const events = bufferRef.current.splice(0, bufferRef.current.length);
      const body = JSON.stringify({ exam_id: examId, session_id: sessionId, events });
      try {
        fetch(`${API_CONFIG.BASE_URL}/api/cbt/proctoring/events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(createAuthHeaders() as Record<string, string>),
          },
          body,
          keepalive: true,
        }).catch(() => {});
      } catch {
        /* ignore — fire-and-forget */
      }
    };
    window.addEventListener('beforeunload', onUnload);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('copy', onCopy);
      document.removeEventListener('paste', onPaste);
      document.removeEventListener('cut', onCut);
      document.removeEventListener('contextmenu', onContext);
      document.removeEventListener('fullscreenchange', onFullscreen);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('beforeunload', onUnload);
      window.clearInterval(heartbeatTimer);
      window.clearInterval(flushTimer);
      flush();
    };
  }, [active, examId, sessionId, pushEvent, flush]);

  return { pushEvent, flush };
};
