import React from 'react';

const Input = ({ label, type, placeholder, value, onChange, name, icon, required = false, style = {} }) => {
    return (
        <div style={{ marginBottom: '1.25rem', width: '100%' }}>
            {label && (
                <label
                    style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        color: 'var(--text-muted)',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}
                >
                    {label}
                </label>
            )}
            <div style={{ position: 'relative' }}>
                {icon && (
                    <div style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '1.125rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'rgba(255,255,255,0.4)',
                        pointerEvents: 'none'
                    }}>
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    name={name}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    required={required}
                    className="glass-input"
                    style={{
                        width: '100%',
                        padding: '14px 16px',
                        paddingLeft: icon ? '44px' : '16px',
                        borderRadius: '12px',
                        fontSize: '0.9375rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        color: '#ffffff',
                        ...style
                    }}
                />
            </div>
        </div>
    );
};


export default Input;
