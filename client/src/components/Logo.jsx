/**
 * Mathathlon Logo Component
 *
 * Brand Strategy: Navy (Intellect/Math) → Gold (Achievement/Athlon)
 * The gradient visually communicates "Academic rigor transitioning into competitive performance"
 */

export function Logo({ size = 'medium', variant = 'gradient', className = '' }) {
  const sizeClass = {
    small: 'logo-small',
    medium: 'logo-medium',
    large: 'logo-large'
  }[size] || 'logo-medium';

  const variantClass = {
    gradient: 'logo-gradient',
    navy: 'logo-navy'
  }[variant] || 'logo-gradient';

  return (
    <span class={`logo ${sizeClass} ${variantClass} ${className}`}>
      MATHATHLON
    </span>
  );
}

export function LogoWithTagline({ size = 'large', tagline = 'Where Math Meets Competition' }) {
  return (
    <div class="text-center">
      <Logo size={size} variant="gradient" />
      <p class="logo-tagline">{tagline}</p>
    </div>
  );
}
