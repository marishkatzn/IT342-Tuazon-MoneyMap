import React, { useEffect, useRef, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Input from "../components/Input";
import Button from "../components/Button";
import Layout from "../components/Layout";
import { Mail, Lock } from "lucide-react";
import logoImage from "../assets/m-logo.png";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const googleButtonRef = useRef(null);
    const { login, googleLogin } = useContext(AuthContext);
    const navigate = useNavigate();
    const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

    useEffect(() => {
        if (!googleClientId || !window.google?.accounts?.id || !googleButtonRef.current) {
            return undefined;
        }

        const handleGoogleCredential = async (response) => {
            const success = await googleLogin(response.credential);
            if (success) {
                navigate("/dashboard");
            } else {
                alert("Google login failed");
            }
        };

        window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredential,
        });

        googleButtonRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: "outline",
            size: "large",
            shape: "pill",
            text: "continue_with",
            width: 360,
        });

        return () => {
            if (window.google?.accounts?.id) {
                window.google.accounts.id.cancel();
            }
        };
    }, [googleClientId, googleLogin, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(email, password);

        if (success) {
            navigate("/dashboard");
        } else {
            alert("Login failed");
        }
    };

    return (
        <Layout noPadding noFooter>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr auto 1fr",
                    height: "calc(100vh - 73px)",
                    background: "transparent",
                    overflow: "hidden",
                }}
                className="grid-bg"
            >

                {/* LEFT SIDE */}

                <div
                    style={{
                        padding: "1.5rem 7rem",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                    }}
                >
                    <div style={{ maxWidth: "540px" }}>
                        <div
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "12px",
                                marginBottom: "1.5rem",
                                padding: "10px 14px",
                                borderRadius: "18px",
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.08)",
                            }}
                        >
                            <img src={logoImage} alt="MoneyMap logo" style={{ width: "42px", height: "42px", objectFit: "contain", display: "block" }} />
                            <div>
                                <div style={{ fontSize: "1.15rem", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.03em" }}>MoneyMap</div>
                                <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.38)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Savings Tracker</div>
                            </div>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                marginBottom: "1.25rem",
                            }}
                        >
                            <div
                                style={{
                                    width: "32px",
                                    height: "1.5px",
                                    background: "var(--primary)",
                                }}
                            ></div>

                            <span
                                style={{
                                    fontSize: "0.75rem",
                                    fontWeight: "800",
                                    color: "var(--primary)",
                                    letterSpacing: "0.2em",
                                    textTransform: "uppercase",
                                }}
                            >
                                Welcome Back
                            </span>
                        </div>

                        <h1
                            style={{
                                fontSize: "4.5rem",
                                fontWeight: "900",
                                lineHeight: "1",
                                color: "#ffffff",
                                marginBottom: "1.25rem",
                                letterSpacing: "-0.04em",
                            }}
                        >
                            Your money
                            <br />
                            map{" "}
                            <span className="text-gradient-emerald">
                                awaits
                            </span>
                            <br />
                            you.
                        </h1>

                        <p
                            style={{
                                fontSize: "1.125rem",
                                color: "rgba(255,255,255,0.5)",
                                lineHeight: "1.6",
                                marginBottom: "2.5rem",
                                maxWidth: "430px",
                            }}
                        >
                            Sign in to track your savings progress, review your goals,
                            and stay on top of your finances.
                        </p>

                        {/* BALANCE CARD */}

                        <div
                            style={{
                                padding: "1.25rem 1.5rem",
                                borderRadius: "24px",
                                maxWidth: "300px",
                                background: "rgba(255,255,255,0.02)",
                                backdropFilter: "blur(12px)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                marginBottom: "2rem",
                            }}
                        >

                            <div
                                style={{
                                    fontSize: "0.75rem",
                                    fontWeight: "700",
                                    color: "rgba(255,255,255,0.4)",
                                    textTransform: "uppercase",
                                    marginBottom: "0.75rem",
                                }}
                            >
                                Current Balance
                            </div>

                            <div style={{ marginBottom: "1rem" }}>
                                <span
                                    style={{
                                        fontSize: "2.5rem",
                                        fontWeight: "900",
                                        color: "#ffffff",
                                    }}
                                >
                                    $24,850
                                </span>
                            </div>

                            <div
                                style={{
                                    height: "6px",
                                    background: "rgba(255,255,255,0.1)",
                                    borderRadius: "10px",
                                    overflow: "hidden",
                                    marginBottom: "0.75rem",
                                }}
                            >
                                <div
                                    style={{
                                        width: "65%",
                                        height: "100%",
                                        background: "var(--primary)",
                                        borderRadius: "10px",
                                    }}
                                ></div>
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    fontSize: "0.75rem",
                                    fontWeight: "600",
                                }}
                            >
                                <span style={{ color: "rgba(255,255,255,0.4)" }}>
                                    Savings rate 65%
                                </span>

                                <span style={{ color: "var(--primary)" }}>
                                    ↑ 8% MoM
                                </span>
                            </div>

                        </div>
                    </div>
                </div>

                {/* DIVIDER */}

                <div
                    style={{
                        width: "1px",
                        height: "70%",
                        alignSelf: "center",
                        background:
                            "linear-gradient(to bottom, transparent, rgba(255,255,255,0.15), transparent)",
                    }}
                ></div>

                {/* RIGHT SIDE */}

                <div
                    style={{
                        padding: "1.5rem 7rem",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        position: "relative",
                    }}
                >

                    {/* POP GLOW */}

                    <div
                        style={{
                            position: "absolute",
                            top: "120px",
                            right: "40px",
                            width: "220px",
                            height: "220px",
                            background:
                                "radial-gradient(circle, rgba(16,185,129,0.25), transparent)",
                            filter: "blur(60px)",
                            zIndex: 0,
                        }}
                    ></div>

                    {/* LOGIN CARD */}

                    <div
                        style={{
                            position: "relative",
                            maxWidth: "440px",
                            padding: "2.5rem",
                            borderRadius: "24px",
                            background: "rgba(255,255,255,0.03)",
                            backdropFilter: "blur(14px)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
                            zIndex: 1,
                        }}
                    >

                        <h2
                            style={{
                                fontSize: "2.5rem",
                                fontWeight: "900",
                                color: "#ffffff",
                                marginBottom: "0.25rem",
                                letterSpacing: "-0.02em",
                            }}
                        >
                            Sign in
                        </h2>

                        <p
                            style={{
                                marginBottom: "2.5rem",
                                color: "rgba(255,255,255,0.4)",
                                fontWeight: "500",
                            }}
                        >
                            New to MoneyMap?{" "}
                            <Link
                                to="/register"
                                style={{
                                    color: "var(--primary)",
                                    textDecoration: "none",
                                    fontWeight: "700",
                                }}
                            >
                                Create account →
                            </Link>
                        </p>

                        <form onSubmit={handleSubmit}>

                            <Input
                                placeholder="Email Address"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                icon={<Mail size={20} />}
                                required
                            />

                            <Input
                                placeholder="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                icon={<Lock size={20} />}
                                required
                            />

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "2rem",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        id="remember"
                                        style={{
                                            width: "16px",
                                            height: "16px",
                                            accentColor: "var(--primary)",
                                        }}
                                    />

                                    <label
                                        htmlFor="remember"
                                        style={{
                                            color: "rgba(255,255,255,0.5)",
                                            fontSize: "0.875rem",
                                        }}
                                    >
                                        Remember
                                    </label>
                                </div>

                                <Link
                                    to="#"
                                    style={{
                                        color: "var(--primary)",
                                        textDecoration: "none",
                                        fontSize: "0.875rem",
                                        fontWeight: "700",
                                    }}
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                size="lg"
                                style={{
                                    width: "100%",
                                    borderRadius: "12px",
                                    padding: "1.125rem",
                                }}
                            >
                                Sign In
                            </Button>

                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    margin: "1rem 0",
                                }}
                            >
                                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }}></div>
                                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.75rem", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                                    Or
                                </span>
                                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }}></div>
                            </div>

                            {googleClientId ? (
                                <div
                                    ref={googleButtonRef}
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        minHeight: "44px",
                                    }}
                                ></div>
                            ) : (
                                <div
                                    style={{
                                        textAlign: "center",
                                        color: "rgba(255,255,255,0.45)",
                                        fontSize: "0.8rem",
                                    }}
                                >
                                    Set <code>REACT_APP_GOOGLE_CLIENT_ID</code> to enable Google sign-in.
                                </div>
                            )}

                        </form>

                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Login;
