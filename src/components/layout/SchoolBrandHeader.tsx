import { useSchoolProfile } from '@/features/auth/hooks/useSchoolProfile';
import { cn } from '@/lib/utils/cn';

export function SchoolBrandHeader({
  compact = false,
  logoOnly = false,
  className,
}: {
  compact?: boolean;
  logoOnly?: boolean;
  className?: string;
}) {
  const school = useSchoolProfile();
  const name = school?.school_name || 'Elite CBT';
  const badge = school?.badge_url || '/logo192.png';

  return (
    <div className={cn('flex items-center gap-3 min-w-0', className)}>
      <div
        className={cn(
          compact ? 'h-8 w-8' : 'h-10 w-10',
          'rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 ring-1 ring-slate-200/80 dark:ring-slate-700',
        )}
      >
        <img src={badge} alt="" className="h-full w-full object-cover" />
      </div>
      {!logoOnly && (
        <div className="min-w-0">
          <p
            className={cn(
              'font-bold text-[#002a56] dark:text-white truncate',
              compact ? 'text-sm' : 'text-base',
            )}
          >
            {name}
          </p>
          {!compact && (
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Computer Based Testing
            </p>
          )}
        </div>
      )}
    </div>
  );
}
