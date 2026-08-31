import React, { useState, useRef, useEffect, forwardRef } from 'react';
import '../styles/FormInputs.css';

/**
 * Helper to extract error message string whether error is passed as a string 
 * or as a React Hook Form FieldError object `{ message: 'Error text' }`
 */
const getErrorMessage = (error) => {
  if (!error) return null;
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && error.message) return error.message;
  return 'Invalid input';
};

// ============================================================================
// 1. INPUT FIELD (Text, Email, Password, Number, Textarea)
// Supports React Hook Form ({...register('name')}) & React state
// ============================================================================
export const InputField = forwardRef(({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder = '',
  required = false,
  disabled = false,
  error = null,
  helpText = '',
  icon = null,
  iconRight = null,
  rows = 3,
  className = '',
  ...props
}, ref) => {
  const errorMessage = getErrorMessage(error);
  const inputId = id || name || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  const isTextarea = type === 'textarea';

  return (
    <div className={`sonocare-form-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="sonocare-label">
          <span>
            {label} {required && <span className="required-star">*</span>}
          </span>
        </label>
      )}

      <div className="sonocare-input-wrapper">
        {icon && (
          <span className="sonocare-input-icon-left">
            {typeof icon === 'string' ? <i className={`bi ${icon}`}></i> : icon}
          </span>
        )}

        {isTextarea ? (
          <textarea
            ref={ref}
            id={inputId}
            name={name}
            rows={rows}
            className={`sonocare-control ${icon ? 'has-icon-left' : ''} ${iconRight ? 'has-icon-right' : ''} ${errorMessage ? 'is-invalid' : ''
              }`}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            aria-invalid={errorMessage ? 'true' : 'false'}
            {...props}
          />
        ) : (
          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            className={`sonocare-control ${icon ? 'has-icon-left' : ''} ${iconRight ? 'has-icon-right' : ''} ${errorMessage ? 'is-invalid' : ''
              }`}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            aria-invalid={errorMessage ? 'true' : 'false'}
            {...props}
          />
        )}

        {iconRight && (
          <span className="sonocare-input-icon-right">
            {typeof iconRight === 'string' ? <i className={`bi ${iconRight}`}></i> : iconRight}
          </span>
        )}
      </div>

      {errorMessage && (
        <div className="sonocare-error-message" role="alert">
          <i className="bi bi-exclamation-circle-fill"></i> {errorMessage}
        </div>
      )}

      {!errorMessage && helpText && <div className="sonocare-help-text">{helpText}</div>}
    </div>
  );
});
InputField.displayName = 'InputField';

// ============================================================================
// 2. DROPDOWN / SINGLE-SELECT CUSTOM COMPONENT
// Fully responsive menu overlay for long option strings across 320px - 1024px+
// ============================================================================
export const Dropdown = forwardRef(({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  options = [],
  placeholder = null,
  required = false,
  disabled = false,
  error = null,
  helpText = '',
  icon = null,
  dropUp = false,
  className = '',
  ...props
}, ref) => {
  const errorMessage = getErrorMessage(error);
  const selectId = id || name || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  const [isOpen, setIsOpen] = useState(false);
  const [isDropUp, setIsDropUp] = useState(dropUp);
  const containerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        if (onBlur) onBlur();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onBlur]);

  // Toggle Dropdown with smart Auto-DropUp positioning detection
  const toggleDropdown = () => {
    if (disabled) return;
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const spaceBelow = windowHeight - rect.bottom;
      // If space below is less than 220px (e.g. bottom of modal) and space above is sufficient, dropUp
      if (dropUp || (spaceBelow < 220 && rect.top > 200)) {
        setIsDropUp(true);
      } else {
        setIsDropUp(false);
      }
    }
    setIsOpen((prev) => !prev);
  };

  // Find currently selected option label
  const matchedOpt = options.find((opt) => {
    const optVal = typeof opt === 'object' ? opt.value : opt;
    return String(optVal) === String(value);
  });

  const displayLabel = matchedOpt
    ? (typeof matchedOpt === 'object' ? matchedOpt.label : matchedOpt)
    : (value !== undefined && value !== null && value !== '' ? String(value) : '');

  const handleSelectOption = (optVal) => {
    if (disabled) return;
    setIsOpen(false);
    if (onChange) {
      // Pass synthetic event for compatibility with React Hook Form and standard state handlers
      onChange({ target: { name, value: optVal } });
    }
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleDropdown();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={`sonocare-form-group ${className}`} ref={containerRef}>
      {label && (
        <label htmlFor={selectId} className="sonocare-label">
          <span>
            {label} {required && <span className="required-star">*</span>}
          </span>
        </label>
      )}

      <div className="sonocare-dropdown-container">
        {/* Dropdown Trigger Box */}
        <div
          ref={ref}
          id={selectId}
          className={`sonocare-control sonocare-dropdown-trigger ${icon ? 'has-icon-left' : ''} ${
            errorMessage ? 'is-invalid' : ''
          } ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
          onClick={toggleDropdown}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          role="combobox"
          aria-expanded={isOpen}
          aria-invalid={errorMessage ? 'true' : 'false'}
          {...props}
        >
          {icon && (
            <span className="sonocare-input-icon-left">
              {typeof icon === 'string' ? <i className={`bi ${icon}`}></i> : icon}
            </span>
          )}

          <span
            className={`sonocare-dropdown-selected-text ${!displayLabel ? 'text-muted' : ''}`}
            title={displayLabel || placeholder}
          >
            {displayLabel || placeholder}
          </span>

          <span className="sonocare-dropdown-arrow">
            <i className={`bi bi-chevron-down ${isOpen ? 'rotate-180' : ''}`}></i>
          </span>
        </div>

        {/* Floating Responsive Dropdown Menu Overlay */}
        {isOpen && !disabled && (
          <div className={`sonocare-dropdown-menu ${isDropUp ? 'drop-up' : ''}`} role="listbox">
            {placeholder && placeholder !== '' && (!value || value === '') && (
              <div
                className={`sonocare-dropdown-item placeholder-item ${!value ? 'selected' : ''}`}
                onClick={() => handleSelectOption('')}
                role="option"
                aria-selected={!value}
              >
                <span className="sonocare-dropdown-item-text">{placeholder}</span>
              </div>
            )}
            {options.map((opt, idx) => {
              const optVal = typeof opt === 'object' ? opt.value : opt;
              const optLabel = typeof opt === 'object' ? opt.label : opt;
              const isSelected = String(optVal) === String(value);

              return (
                <div
                  key={idx}
                  className={`sonocare-dropdown-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectOption(optVal)}
                  role="option"
                  aria-selected={isSelected}
                  title={String(optLabel)}
                >
                  <span className="sonocare-dropdown-item-text">{optLabel}</span>
                  {isSelected && <i className="bi bi-check2 sonocare-dropdown-check"></i>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="sonocare-error-message" role="alert">
          <i className="bi bi-exclamation-circle-fill"></i> {errorMessage}
        </div>
      )}

      {!errorMessage && helpText && <div className="sonocare-help-text">{helpText}</div>}
    </div>
  );
});
Dropdown.displayName = 'Dropdown';

// ============================================================================
// 3. MULTISELECT COMPONENT (Badge Tags, Checkbox Selection & Search)
// ============================================================================
export const MultiSelect = forwardRef(({
  id,
  name,
  label,
  value = [], // Array of selected values
  onChange,
  onBlur,
  options = [],
  placeholder = 'Select options...',
  required = false,
  disabled = false,
  error = null,
  helpText = '',
  className = '',
}, ref) => {
  const errorMessage = getErrorMessage(error);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  const selectedValues = Array.isArray(value) ? value : [];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        if (onBlur) onBlur();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onBlur]);

  const toggleOption = (optVal) => {
    if (disabled) return;
    let newValues;
    if (selectedValues.includes(optVal)) {
      newValues = selectedValues.filter((v) => v !== optVal);
    } else {
      newValues = [...selectedValues, optVal];
    }
    if (onChange) {
      onChange({ target: { name, value: newValues } });
    }
  };

  const removeBadge = (e, optVal) => {
    e.stopPropagation();
    if (disabled) return;
    const newValues = selectedValues.filter((v) => v !== optVal);
    if (onChange) {
      onChange({ target: { name, value: newValues } });
    }
  };

  const filteredOptions = options.filter((opt) => {
    const optLabel = typeof opt === 'object' ? opt.label : opt;
    return String(optLabel).toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className={`sonocare-form-group ${className}`} ref={containerRef}>
      {label && (
        <label className="sonocare-label">
          <span>
            {label} {required && <span className="required-star">*</span>}
          </span>
          <span className="sonocare-label-subtext">{selectedValues.length} selected</span>
        </label>
      )}

      <div className="sonocare-multiselect-container">
        <div
          ref={ref}
          className={`sonocare-multiselect-trigger ${isOpen ? 'open' : ''} ${errorMessage ? 'is-invalid' : ''}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          tabIndex={disabled ? -1 : 0}
          role="combobox"
          aria-expanded={isOpen}
        >
          {selectedValues.length === 0 ? (
            <span className="text-muted small">{placeholder}</span>
          ) : (
            selectedValues.map((val) => {
              const matchedOpt = options.find((o) => (typeof o === 'object' ? o.value === val : o === val));
              const displayLabel = matchedOpt ? (typeof matchedOpt === 'object' ? matchedOpt.label : matchedOpt) : val;
              return (
                <span key={val} className="sonocare-multiselect-badge">
                  {displayLabel}
                  {!disabled && (
                    <span
                      className="sonocare-multiselect-badge-remove"
                      onClick={(e) => removeBadge(e, val)}
                    >
                      <i className="bi bi-x"></i>
                    </span>
                  )}
                </span>
              );
            })
          )}
        </div>

        {isOpen && !disabled && (
          <div className="sonocare-multiselect-dropdown">
            <div className="sonocare-multiselect-search">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {filteredOptions.length === 0 ? (
              <div className="text-muted small p-2 text-center">No options found</div>
            ) : (
              filteredOptions.map((opt, idx) => {
                if (typeof opt === 'object' && opt.isHeader) {
                  return (
                    <div key={`header-${idx}`} className="px-3 py-1 bg-light text-primary fw-bold small border-top border-bottom">
                      {opt.label}
                    </div>
                  );
                }

                const optVal = typeof opt === 'object' ? opt.value : opt;
                const optLabel = typeof opt === 'object' ? opt.label : opt;
                const optSub = typeof opt === 'object' ? opt.subtext : null;
                const isSelected = selectedValues.includes(optVal);

                return (
                  <div
                    key={idx}
                    className={`sonocare-multiselect-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleOption(optVal)}
                  >
                    <div>
                      <span className="d-block">{optLabel}</span>
                      {optSub && <small className="text-muted font-monospace">{optSub}</small>}
                    </div>
                    {isSelected && <i className="bi bi-check2"></i>}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="sonocare-error-message" role="alert">
          <i className="bi bi-exclamation-circle-fill"></i> {errorMessage}
        </div>
      )}

      {!errorMessage && helpText && <div className="sonocare-help-text">{helpText}</div>}
    </div>
  );
});
MultiSelect.displayName = 'MultiSelect';

// ============================================================================
// 4. RADIO GROUP COMPONENT (Radio Cards or Inline/Vertical Options)
// ============================================================================
export const RadioGroup = forwardRef(({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  options = [],
  required = false,
  disabled = false,
  error = null,
  helpText = '',
  layout = 'horizontal', // 'horizontal' | 'vertical'
  className = '',
}, ref) => {
  const errorMessage = getErrorMessage(error);
  const groupId = id || name || (label ? `radio-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={`sonocare-form-group ${className}`}>
      {label && (
        <label className="sonocare-label">
          <span>
            {label} {required && <span className="required-star">*</span>}
          </span>
        </label>
      )}

      <div className={`sonocare-radio-group ${layout === 'vertical' ? 'vertical' : ''}`} id={groupId}>
        {options.map((opt, idx) => {
          const optVal = typeof opt === 'object' ? opt.value : opt;
          const optLabel = typeof opt === 'object' ? opt.label : opt;
          const optSub = typeof opt === 'object' ? opt.subtext : null;
          const isSelected = String(value) === String(optVal);
          const optionId = `${groupId}-${idx}`;

          return (
            <label
              key={idx}
              htmlFor={optionId}
              className={`sonocare-radio-option ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
            >
              <input
                ref={idx === 0 ? ref : undefined}
                type="radio"
                id={optionId}
                name={name}
                value={optVal}
                checked={isSelected}
                onChange={onChange}
                onBlur={onBlur}
                disabled={disabled}
              />
              <div className="sonocare-radio-text">
                <span className="fw-semibold d-block text-dark small">{optLabel}</span>
                {optSub && <span className="text-muted extra-small d-block">{optSub}</span>}
              </div>
            </label>
          );
        })}
      </div>

      {errorMessage && (
        <div className="sonocare-error-message" role="alert">
          <i className="bi bi-exclamation-circle-fill"></i> {errorMessage}
        </div>
      )}

      {!errorMessage && helpText && <div className="sonocare-help-text">{helpText}</div>}
    </div>
  );
});
RadioGroup.displayName = 'RadioGroup';

// ============================================================================
// 5. CHECKBOX GROUP COMPONENT
// ============================================================================
export const CheckboxGroup = forwardRef(({
  id,
  name,
  label,
  value = [],
  onChange,
  onBlur,
  options = [],
  required = false,
  disabled = false,
  error = null,
  helpText = '',
  className = '',
}, ref) => {
  const errorMessage = getErrorMessage(error);
  const groupId = id || name || (label ? `checkbox-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  const selectedValues = Array.isArray(value) ? value : [];

  const handleCheckboxToggle = (optVal) => {
    if (disabled) return;
    let newValues;
    if (selectedValues.includes(optVal)) {
      newValues = selectedValues.filter((v) => v !== optVal);
    } else {
      newValues = [...selectedValues, optVal];
    }
    if (onChange) {
      onChange({ target: { name, value: newValues } });
    }
  };

  return (
    <div className={`sonocare-form-group ${className}`}>
      {label && (
        <label className="sonocare-label">
          <span>
            {label} {required && <span className="required-star">*</span>}
          </span>
        </label>
      )}

      <div className="sonocare-checkbox-group" id={groupId}>
        {options.map((opt, idx) => {
          const optVal = typeof opt === 'object' ? opt.value : opt;
          const optLabel = typeof opt === 'object' ? opt.label : opt;
          const isChecked = selectedValues.includes(optVal);
          const itemKey = `${groupId}-${idx}`;

          return (
            <label
              key={idx}
              className={`sonocare-checkbox-item ${isChecked ? 'selected' : ''}`}
              htmlFor={itemKey}
            >
              <input
                ref={idx === 0 ? ref : undefined}
                type="checkbox"
                id={itemKey}
                name={name}
                value={optVal}
                checked={isChecked}
                onChange={() => handleCheckboxToggle(optVal)}
                onBlur={onBlur}
                disabled={disabled}
              />
              <span className="small text-dark">{optLabel}</span>
            </label>
          );
        })}
      </div>

      {errorMessage && (
        <div className="sonocare-error-message" role="alert">
          <i className="bi bi-exclamation-circle-fill"></i> {errorMessage}
        </div>
      )}

      {!errorMessage && helpText && <div className="sonocare-help-text">{helpText}</div>}
    </div>
  );
});
CheckboxGroup.displayName = 'CheckboxGroup';
