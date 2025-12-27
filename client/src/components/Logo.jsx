/**
 * Mathathlon Logo Component
 *
 * Brand Strategy: Navy (Intellect/Math) → Gold (Achievement/Athlon)
 * The two-color approach visually communicates "Academic rigor meets competitive performance"
 */

export function Logo({ size = 'medium', variant = 'gradient', className = '' }) {
  const sizeClass = {
    small: 'logo-small',
    medium: 'logo-medium',
    large: 'logo-large'
  }[size] || 'logo-medium';

  if (variant === 'navy') {
    return (
      <span class={`logo ${sizeClass} logo-navy ${className}`}>
        MathAthlon
      </span>
    );
  }

  // Gradient variant - two colors
  return (
    <span class={`logo ${sizeClass} ${className}`}>
      <span class="logo-math">Math</span>
      <span class="logo-athlon">Athlon</span>
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
