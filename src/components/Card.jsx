import React, { useEffect, useCallback } from 'react';
import Button from './Button';
import '../styles/Card.css';

/**
 * Card Header Component
 */
export const CardHeader = ({
  title,
  subtitle,
  icon,
  iconBg = 'bg-primary',
  iconColor = 'text-white',
  onClose,
  showCloseButton = false,
  children,
  className = ''
}) => {
  return (
    <div className={`sonocare-card-header ${className}`}>
      {title || subtitle || icon ? (
        <div className="sonocare-card-title-group">
          {icon && (
            <div className={`sonocare-card-icon-badge ${iconBg} ${iconColor}`}>
              {typeof icon === 'string' ? <i className={`bi ${icon}`}></i> : icon}
            </div>
          )}
          <div>
            {title && typeof title === 'string' ? (
              <h3 className="sonocare-card-title">{title}</h3>
            ) : (
              title
            )}
            {subtitle && <p className="sonocare-card-subtitle">{subtitle}</p>}
          </div>
        </div>
      ) : (
        children
      )}

      {showCloseButton && onClose && (
        <button
          type="button"
          className="sonocare-card-close-btn"
          onClick={onClose}
          aria-label="Close dialog"
          title="Close"
        >
          <i className="bi bi-x-lg"></i>
        </button>
      )}
    </div>
  );
};

/**
 * Card Body Component
 */
export const CardBody = ({ children, className = '' }) => {
  return <div className={`sonocare-card-body ${className}`}>{children}</div>;
};

/**
 * Card Footer Component
 */
export const CardFooter = ({
  children,
  align = 'end', // 'start' | 'center' | 'end' | 'between'
  className = ''
}) => {
  const getAlignClass = () => {
    if (align === 'start') return 'justify-content-start';
    if (align === 'center') return 'justify-content-center';
    if (align === 'between') return 'sonocare-card-footer-space-between';
    return 'justify-content-end';
  };

  return (
    <div className={`sonocare-card-footer ${getAlignClass()} ${className}`}>
      {children}
    </div>
  );
};

/**
 * Main Card & Popup Modal Card Component
 * 
 * Clean layout wrapper for Standalone Cards and Popup Modals.
 * Renders Header (Title, Subtitle, Close Button), Body (Children), and Footer (Action Buttons).
 */
const Card = ({
  // Popup / Modal specific props
  isPopup = false,
  isOpen = true,
  onClose = null,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl' | 'full'

  // Header Props
  title,
  subtitle,
  titleIcon,
  titleIconBg = 'bg-primary bg-opacity-10 text-primary',
  showCloseButton = true,

  // Body Content
  children,

  // Footer & Buttons Props
  footer,
  buttons = [], // Array of button props or React nodes
  primaryButton, // { label, onClick, variant, loading, disabled, type, icon }
  secondaryButton, // { label, onClick, variant, disabled, icon }
  footerAlign = 'end',

  // Style Props
  hoverEffect = false,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  style = {}
}) => {

  // Handle ESC Key to Close Popup
  const handleKeyDown = useCallback(
    (e) => {
      if (isPopup && isOpen && closeOnEsc && e.key === 'Escape' && onClose) {
        onClose(e);
      }
    },
    [isPopup, isOpen, closeOnEsc, onClose]
  );

  useEffect(() => {
    if (isPopup && isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isPopup, isOpen, handleKeyDown]);

  if (isPopup && !isOpen) {
    return null;
  }

  // Card Inner Markup
  const cardContent = (
    <div
      className={`sonocare-card ${isPopup ? `sonocare-popup-card sonocare-popup-${size}` : ''} ${
        hoverEffect ? 'sonocare-card-hover' : ''
      } ${className}`}
      style={style}
      role={isPopup ? 'dialog' : undefined}
      aria-modal={isPopup ? 'true' : undefined}
      aria-labelledby={title ? 'card-title-id' : undefined}
    >
      {/* Header */}
      {(title || subtitle || titleIcon || (isPopup && showCloseButton)) && (
        <CardHeader
          title={title}
          subtitle={subtitle}
          icon={titleIcon}
          iconBg={titleIconBg}
          showCloseButton={isPopup && showCloseButton}
          onClose={onClose}
          className={headerClassName}
        />
      )}

      {/* Body Section */}
      <CardBody className={bodyClassName}>
        {children}
      </CardBody>

      {/* Footer Section */}
      {(footer || primaryButton || secondaryButton || (buttons && buttons.length > 0)) && (
        <CardFooter align={footerAlign} className={footerClassName}>
          {footer ? (
            footer
          ) : (
            <>
              {/* Secondary Button */}
              {secondaryButton && (
                <Button
                  variant={secondaryButton.variant || 'outline-secondary'}
                  size={secondaryButton.size || 'md'}
                  onClick={secondaryButton.onClick || onClose}
                  disabled={secondaryButton.disabled}
                  icon={secondaryButton.icon}
                  type={secondaryButton.type || 'button'}
                >
                  {secondaryButton.label || 'Cancel'}
                </Button>
              )}

              {/* Dynamic Buttons List */}
              {buttons &&
                buttons.map((btn, index) =>
                  React.isValidElement(btn) ? (
                    React.cloneElement(btn, { key: index })
                  ) : (
                    <Button key={index} {...btn} />
                  )
                )}

              {/* Primary Button */}
              {primaryButton && (
                <Button
                  variant={primaryButton.variant || 'primary'}
                  size={primaryButton.size || 'md'}
                  onClick={primaryButton.onClick}
                  loading={primaryButton.loading}
                  loadingText={primaryButton.loadingText}
                  disabled={primaryButton.disabled}
                  icon={primaryButton.icon}
                  type={primaryButton.type || 'button'}
                >
                  {primaryButton.label || 'Save Changes'}
                </Button>
              )}
            </>
          )}
        </CardFooter>
      )}
    </div>
  );

  // If PopUp Mode, wrap in overlay backdrop
  if (isPopup) {
    return (
      <div
        className="sonocare-popup-backdrop"
        onClick={(e) => {
          if (closeOnOverlayClick && e.target === e.currentTarget && onClose) {
            onClose(e);
          }
        }}
      >
        {cardContent}
      </div>
    );
  }

  return cardContent;
};

// Attach helper sub-components
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
