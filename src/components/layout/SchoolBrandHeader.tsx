import { useSchoolProfile } from '@/features/auth/hooks/useSchoolProfile';
import { cn } from '@/lib/utils/cn';

function BrandMark({
  src,
  name,
  caption,
  compact,
  logoOnly,
  className,
  nameClassName,
}: {
  src: string;
  name: string;
  caption?: string;
  compact?: boolean;
  logoOnly?: boolean;
  className?: string;
  nameClassName?: string;
}) {
  return (
    <div className={cn('flex items-center gap-2.5 min-w-0', className)}>
      <div
        className={cn(
          compact ? 'h-8 w-8' : 'h-10 w-10',
          'rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 ring-1 ring-slate-200/80 dark:ring-slate-700',
        )}
      >
        <img src={src} alt="" className="h-full w-full object-cover" />
      </div>
      {!logoOnly && (
        <div className={cn('min-w-0', nameClassName)}>
          <p
            className={cn(
              'font-bold text-[#002a56] dark:text-white truncate',
              compact ? 'text-sm' : 'text-base',
            )}
          >
            {name}
          </p>
          {!compact && caption && (
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              {caption}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/** Tenant school — omitted until lookup resolves so Elite CBT can stand alone. */
export function SchoolBrandHeader({
  compact = false,
  logoOnly = false,
  className,
  nameClassName,
}: {
  compact?: boolean;
  logoOnly?: boolean;
  className?: string;
  nameClassName?: string;
}) {
  const school = useSchoolProfile();
  if (!school?.school_name && !school?.badge_url) return null;
  return (
    <BrandMark
      src={school.badge_url || '/logo192.png'}
      name={school.school_name}
      compact={compact}
      logoOnly={logoOnly}
      className={className}
      nameClassName={nameClassName}
    />
  );
}

export function EliteBrandMark({
  compact = false,
  logoOnly = false,
  className,
  nameClassName,
}: {
  compact?: boolean;
  logoOnly?: boolean;
  className?: string;
  nameClassName?: string;
}) {
  return (
    <BrandMark
      src="/logo192.png"
      name="Elite CBT"
      caption="Elite Scholar"
      compact={compact}
      logoOnly={logoOnly}
      className={cn('shrink-0', className)}
      nameClassName={nameClassName}
    />
  );
}
