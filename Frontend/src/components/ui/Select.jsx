import './Select.css';

const Select = ({
    label,
    options = [],
    value,
    onChange,
    error,
    required = false,
    disabled = false,
    className = '',
    ...props
}) => {
    return (
        <div className={`select-wrapper ${className}`}>
            {label && (
                <label className="select-label">
                    {label}
                    {required && <span className="select-required">*</span>}
                </label>
            )}
            <div className={`select-container ${error ? 'select-error' : ''} ${disabled ? 'select-disabled' : ''}`}>
                <select
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className="select-field"
                    {...props}
                >
                    <option value="" disabled>Select an option</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
            {error && <span className="select-error-text">{error}</span>}
        </div>
    );
};

export default Select;
