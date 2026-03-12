export default function SkeletonCard({ heightClass = 'h-48' }) {
  return (
    <div
      className={`overflow-hidden rounded-[20px] border ${heightClass}`}
      style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
    >
      <div className="h-full w-full animate-pulse bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </div>
  );
}
