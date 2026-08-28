import React from 'react';
import '../styles/Button.css';

/**
 * Reusable Production-Ready Button Component for Sonocare UI
 * 
 * @param {Object} props
 * @param {React.ReactNode} [props.children] - Button label/content
 * @param {'primary'|'secondary'|'success'|'danger'|'warning'|'info'|'light'|'dark'|'outline-primary'|'outline-secondary'|'outline-success'|'outline-danger'|'outline-warning'|'outline-info'|'outline-dark'|'ghost'|'link'} [props.variant='primary']
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Button size
 * @param {'button'|'submit'|'reset'} [props.type='button'] - Button HTML type
 * @param {boolean} [props.loading=false] - Shows loading spinner and disables button
 * @param {string} [props.loadingText] - Text to display while loading
 * @param {boolean} [props.disabled=false] - Disables the button
 * @param {boolean} [props.fullWidth=false] - Makes button expand to 100% width
 * @param {boolean} [props.block=false] - Alias for fullWidth
 * @param {React.ReactNode|string} [props.icon] - Icon element or Bootstrap Icon class name (e.g. 'bi-check-lg')
 * @param {'left'|'right'} [props.iconPosition='left'] - Position of icon relative to children
 * @param {boolean} [props.iconOnly=false] - Render as icon-only square/rounded button
 * @param {'rounded'|'pill'|'square'} [props.shape='rounded'] - Shape of the button corners
 * @param {Function} [props.onClick] - Click handler function
 * @param {string} [props.className] - Additional custom CSS classes
 * @param {Object} [props.style] - Additional inline styles
 * @param {string} [props.ariaLabel] - Accessible ARIA label
 */
const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  loading = false,
  loadingText,
  disabled = false,
  fullWidth = false,
  block = false,
  icon = null,
  iconPosition = 'left',
  iconOnly = false,
  shape = 'rounded',
  onClick,
  className = '',
  style = {},
  ariaLabel,
  ...props
}, ref) => {

  const isDisabled = disabled || loading;
  const isFullWidth = fullWidth || block;

  // Render Icon helper
  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === 'string') {
      return <i className={`bi ${icon}`} aria-hidden="true"></i>;
    }
    return icon;
  };

  // Determine bootstrap variant class
  const getVariantClass = () => {
    if (variant === 'ghost') return 'btn-link text-decoration-none text-dark hover-bg-light';
    if (variant === 'link') return 'btn-link text-decoration-underline p-0 border-0 shadow-none';
    return `btn-${variant}`;
  };

  // Assemble CSS classes
  const buttonClasses = [
    'btn',
    'sonocare-btn',
    getVariantClass(),
    `sonocare-btn-${size}`,
    shape !== 'rounded' && `sonocare-btn-${shape}`,
    isFullWidth && 'sonocare-btn-block',
    iconOnly && 'sonocare-btn-icon-only',
    loading && 'sonocare-btn-loading',
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (isDisabled) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses}
      disabled={isDisabled}
      onClick={handleClick}
      style={style}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      aria-disabled={isDisabled}
      aria-busy={loading}
      {...props}
    >
      {/* Loading Spinner */}
      {loading && <span className="sonocare-btn-spinner" aria-hidden="true"></span>}

      {/* Left Icon */}
      {!loading && icon && iconPosition === 'left' && renderIcon()}

      {/* Button Content */}
      {loading && loadingText ? (
        <span>{loadingText}</span>
      ) : children ? (
        <span>{children}</span>
      ) : null}

      {/* Right Icon */}
      {!loading && icon && iconPosition === 'right' && renderIcon()}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };
export default Button;

