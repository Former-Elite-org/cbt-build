import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { Button } from '@/components/ui/button';
import {
  isNavTourTarget,
  requestTourReplay,
  stepsFor,
  TOUR_EVENT,
  TOUR_OPEN_SIDEBAR,
  tourLabel,
  tourRole,
  tourStorageKey,
  tourUserId,
  type FlowTourRole,
  type FlowTourStep,
} from './tourConfig';

function measureTarget(target?: string): DOMRect | null {
  if (!target) return null;
  const el = document.querySelector(`[data-tour="${target}"]`);
  return el ? el.getBoundingClientRect() : null;
}

export function FlowTour() {
  const { user, isLoading, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const steps = stepsFor(user?.user_type);
  const role = tourRole(user?.user_type);
  const userId = tourUserId(user);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const persistDone = useCallback(() => {
    if (!role) return;
    try {
      localStorage.setItem(tourStorageKey(userId, role), 'done');
    } catch {
      /* private mode */
    }
  }, [role, userId]);

  const startIfNeeded = useCallback(() => {
    if (!steps || !role || !isAuthenticated || isLoading) return;
    try {
      if (localStorage.getItem(tourStorageKey(userId, role)) === 'done') {
        setOpen(false);
        return;
      }
    } catch {
      /* show the tour when storage is unavailable */
    }
    setIndex(0);
    setOpen(true);
  }, [steps, role, isAuthenticated, isLoading, userId]);

  useEffect(() => {
    startIfNeeded();
    const replay = () => {
      setIndex(0);
      setOpen(true);
    };
    window.addEventListener(TOUR_EVENT, replay);
    return () => window.removeEventListener(TOUR_EVENT, replay);
  }, [startIfNeeded]);

  const step: FlowTourStep | undefined = open && steps ? steps[index] : undefined;

  useEffect(() => {
    if (!step?.href) return;
    if (location.pathname !== step.href) {
      navigate(step.href);
    }
  }, [step, location.pathname, navigate]);

  useEffect(() => {
    if (!step) {
      setRect(null);
      return;
    }
    if (isNavTourTarget(step.target)) {
      window.dispatchEvent(new Event(TOUR_OPEN_SIDEBAR));
    }
    const measure = () => setRect(measureTarget(step.target));
    measure();
    const t1 = window.setTimeout(measure, 250);
    const t2 = window.setTimeout(measure, 700);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [step, location.pathname, index]);

  if (!open || !steps || !step || !role) return null;

  const last = index === steps.length - 1;
  const pad = 8;
  const spotlight = rect
    ? {
        top: Math.max(8, rect.top - pad),
        left: Math.max(8, rect.left - pad),
        width: Math.max(24, rect.width + pad * 2),
        height: Math.max(24, rect.height + pad * 2),
      }
    : null;

  function finish() {
    persistDone();
    setOpen(false);
  }

  function next() {
    if (last) {
      finish();
      return;
    }
    setIndex((current) => current + 1);
  }

  const cardStyle: CSSProperties = spotlight
    ? {
        top: Math.min(spotlight.top + spotlight.height + 12, window.innerHeight - 240),
        left: Math.min(Math.max(16, spotlight.left), window.innerWidth - 380),
      }
    : { top: '30%', left: '50%', transform: 'translateX(-50%)' };

  return (
    <div className="fixed inset-0 z-[200]" role="dialog" aria-modal="true" aria-labelledby="cbt-tour-title">
      <div
        className={`absolute inset-0 ${spotlight ? 'bg-transparent' : 'bg-black/45'}`}
        onClick={finish}
      />
      {spotlight && (
        <div
          className="pointer-events-none absolute rounded-xl ring-2 ring-white shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"
          style={{
            top: spotlight.top,
            left: spotlight.left,
            width: spotlight.width,
            height: spotlight.height,
          }}
        />
      )}
      <div
        className="absolute z-10 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-xl"
        style={cardStyle}
      >
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#002a56] dark:text-sky-400">
          {tourLabel(role)} · {index + 1} of {steps.length}
        </p>
        <h2 id="cbt-tour-title" className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
          {step.title}
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{step.body}</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={finish}>
            Skip
          </Button>
          <Button size="sm" onClick={next} className="bg-[#002a56] text-white hover:bg-[#002a56]/90">
            {last ? 'Done' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ReplayTourButton({ className }: { className?: string }) {
  const { user } = useAuthStore();
  const role = tourRole(user?.user_type);
  if (!role) return null;
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={className}
      onClick={() => requestTourReplay(tourUserId(user), role as FlowTourRole)}
    >
      Replay tour
    </Button>
  );
}
