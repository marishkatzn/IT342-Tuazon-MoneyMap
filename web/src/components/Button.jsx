import React from "react";

const Button = ({
    children,
    onClick,
    type = "button",
    className = "",
    variant = "primary",
    size = "md",
    disabled = false,
    style = {},
}) => {
    const sizes = {
        sm: {
            padding: "8px 20px",
            fontSize: "0.875rem",
            borderRadius: "50px",
        },
        md: {
            padding: "12px 28px",
            fontSize: "1rem",
            borderRadius: "50px",
        },
        lg: {
            padding: "16px 40px",
            fontSize: "1.125rem",
            borderRadius: "50px",
        },
    };

    const getVariantStyle = () => {
        switch (variant) {
            case "secondary":
                return {
                    background: "rgba(255,255,255,0.05)",
                    color: "var(--text-main)",
                    border: "1px solid var(--glass-border)",
                    backdropFilter: "blur(12px)",
                    boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
                };

            case "tertiary":
                return {
                    background: "transparent",
                    color: "var(--primary)",
                    border: "1px solid var(--primary)",
                    boxShadow: "none",
                };

            case "ghost":
                return {
                    background: "transparent",
                    color: "var(--text-muted)",
                    border: "1px solid transparent",
                    boxShadow: "none",
                };

            case "danger":
                return {
                    background: "linear-gradient(135deg,#ef4444 0%,#ec4899 100%)",
                    color: "#ffffff",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(239,68,68,0.25)",
                };

            case "primary":
            default:
                return {
                    background: "var(--gradient-emerald)",
                    color: "#ffffff",
                    border: "none",
                    boxShadow: "0 10px 20px -5px rgba(34,197,94,0.35)",
                };
        }
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            style={{
                fontWeight: "600",
                cursor: disabled ? "not-allowed" : "pointer",
                transition: "all 0.25s ease",
                opacity: disabled ? 0.6 : 1,
                ...sizes[size],
                ...getVariantStyle(),
                ...style,
            }}
            className={`animate-hover ${className}`}
            onMouseEnter={(e) => {
                if (!disabled) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                        "0 12px 25px rgba(34,197,94,0.35)";
                }
            }}
            onMouseLeave={(e) => {
                if (!disabled) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = getVariantStyle().boxShadow;
                }
            }}
        >
            {children}
        </button>
    );
};

export default Button;