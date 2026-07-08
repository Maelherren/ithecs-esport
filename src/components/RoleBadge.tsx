import type { Role } from '@/lib/types';

// Badge visuel : couronne dorée pour le super-admin, bouclier pour les admins.
export default function RoleBadge({
  role,
  showLabel = false,
}: {
  role: Role;
  showLabel?: boolean;
}) {
  if (role === 'super-admin') {
    return (
      <span className="badge bg-gold/15 text-gold shadow-glow-gold" title="Super-admin">
        <span aria-hidden>👑</span>
        {showLabel && <span>Super-admin</span>}
      </span>
    );
  }
  return (
    <span className="badge bg-primary/15 text-accent" title="Admin">
      <span aria-hidden>🛡️</span>
      {showLabel && <span>Admin</span>}
    </span>
  );
}
