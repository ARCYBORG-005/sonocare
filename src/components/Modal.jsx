import React, { useEffect, useCallback } from 'react';
import { Button } from './Button';
import '../styles/Modal.css';

/**
 * Modal Header Sub-component
 */
export const ModalHeader = ({
  children,
  closeButton = true,
  onHide,
  className = ''
}) => {
  return (
    <div className={`erp-modal-header ${className}`}>
      {children}
      {closeButton && onHide && (
        <button
          type="button"
          className="erp-modal-close-btn"
          onClick={onHide}
          aria-label="Close modal"
          title="Close"
        >
          <i className="bi bi-x-lg"></i>
        </button>
      )}
    </div>
  );
};

/**
 * Modal Title Sub-component
 */
export const ModalTitle = ({ children, className = '' }) => {
  return <h4 className={`erp-modal-title ${className}`}>{children}</h4>;
};

/**
 * Modal Body Sub-component
 */
export const ModalBody = ({ children, className = '' }) => {
  return <div className={`erp-modal-body ${className}`}>{children}</div>;
};

/**
 * Modal Footer Sub-component
 */
export const ModalFooter = ({ children, className = '' }) => {
  return <div className={`erp-modal-footer ${className}`}>{children}</div>;
};

/**
 * Production-Ready Reusable Modal Component
 * 
 * Compatible with React Bootstrap prop interface & custom props.
 * Supports:
 * - Simple usage via props: <Modal show={show} onHide={onHide} title="Title" footer={...}>Body</Modal>
 * - Compound subcomponent usage: <Modal.Header>, <Modal.Title>, <Modal.Body>, <Modal.Footer>
 */
export const Modal = ({
  show = false,
  isOpen, // Alias for show
  onHide,
  onClose, // Alias for onHide
  title,
  children,
  footer,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl' | 'full'
  centered = true,
  closeButton = true,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  contentClassName = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  className = ''
}) => {
  const isVisible = show !== undefined ? show : isOpen;
  const handleClose = onHide || onClose;

  // Handle ESC Key Press
  const handleKeyDown = useCallback(
    (e) => {
      if (isVisible && closeOnEsc && e.key === 'Escape' && handleClose) {
        handleClose(e);
      }
    },
    [isVisible, closeOnEsc, handleClose]
  );

  useEffect(() => {
    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Lock background scrolling
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isVisible, handleKeyDown]);

  if (!isVisible) {
    return null;
  }

  // Detect if children already contains Modal.Header / Modal.Body compound components
  const hasSubComponents = React.Children.toArray(children).some(
    (child) =>
      React.isValidElement(child) &&
      (child.type === ModalHeader || child.type === ModalBody || child.type === ModalFooter)
  );

  return (
    <div
      className="erp-modal-backdrop"
      onClick={(e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget && handleClose) {
          handleClose(e);
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`erp-modal-dialog erp-modal-${size} ${
          centered ? 'my-auto' : ''
        } ${className}`}
      >
        <div className={`erp-modal-content ${contentClassName}`}>
          {hasSubComponents ? (
            /* Pass onHide to children if subcomponents are used */
            React.Children.map(children, (child) => {
              if (React.isValidElement(child) && child.type === ModalHeader) {
                return React.cloneElement(child, {
                  onHide: child.props.onHide || handleClose
                });
              }
              return child;
            })
          ) : (
            <>
              {/* Auto Header */}
              {title && (
                <ModalHeader closeButton={closeButton} onHide={handleClose} className={headerClassName}>
                  {typeof title === 'string' ? <ModalTitle>{title}</ModalTitle> : title}
                </ModalHeader>
              )}

              {/* Auto Body */}
              <ModalBody className={bodyClassName}>{children}</ModalBody>

              {/* Auto Footer */}
              {footer && <ModalFooter className={footerClassName}>{footer}</ModalFooter>}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Attach subcomponents to Modal object for compound component pattern
Modal.Header = ModalHeader;
Modal.Title = ModalTitle;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;
