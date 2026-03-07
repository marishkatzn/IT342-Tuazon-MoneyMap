import React from 'react';

const Card = ({ children, className = '', title }) => {
    return (
        <div
            className={`glass-panel ${className}`}
            style={{
                padding: '2rem',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '480px', // Default max-width for auth cards
                margin: '0 auto'
            }}
        >
            {title && (
                <h2 style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    marginBottom: '1.5rem',
                    background: 'var(--gradient-emerald)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textAlign: 'center'
                }}>
                    {title}
                </h2>
            )}
            {children}
        </div>
    );
};

export default Card;
