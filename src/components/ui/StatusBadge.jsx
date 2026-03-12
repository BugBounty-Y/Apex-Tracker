import { Icons } from '../Icons';

const statusConfig = {
  saved: {
    label: 'محفوظ',
    icon: <Icons.CloudCheck />,
    color: 'var(--c-success)',
    background: 'var(--c-success-soft)',
  },
  syncing: {
    label: 'تتم المزامنة',
    icon: <Icons.RefreshCw className="animate-spin" />,
    color: 'var(--c-info)',
    background: 'var(--c-info-soft)',
  },
  offline: {
    label: 'بدون اتصال',
    icon: <Icons.WifiOff />,
    color: 'var(--c-warning)',
    background: 'var(--c-warning-soft)',
  },
  error: {
    label: 'تحتاج إعادة محاولة',
    icon: <Icons.AlertTriangle />,
    color: 'var(--c-danger)',
    background: 'var(--c-danger-soft)',
  },
};

export default function StatusBadge({ status = 'saved' }) {
  const config = statusConfig[status] || statusConfig.saved;

  return (
    <div
      className="app-chip"
      style={{ backgroundColor: config.background, color: config.color }}
    >
      {config.icon}
      {config.label}
    </div>
  );
}
