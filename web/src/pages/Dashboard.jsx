import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Layout from "../components/Layout";
import SavingsGoal from "../components/SavingsGoal";

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    const StatCard = ({ title, value, change, isPositive }) => (
        <div
            className="glass-panel"
            style={{
                padding: "1.2rem",
                borderRadius: "20px",
                border: "1px solid var(--glass-border)",
                background: "rgba(255,255,255,0.04)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                height: "120px",
            }}
        >
            <h3
                style={{
                    color: "var(--text-muted)",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    marginBottom: "6px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                }}
            >
                {title}
            </h3>

            <div
                style={{
                    fontSize: "1.8rem",
                    fontWeight: "800",
                    color: "var(--text-main)",
                    marginBottom: "6px",
                }}
            >
                {value}
            </div>

            <div
                style={{
                    fontSize: "0.75rem",
                    color: isPositive ? "#10b981" : "#ef4444",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontWeight: "600",
                    background: isPositive
                        ? "rgba(16,185,129,0.1)"
                        : "rgba(239,68,68,0.1)",
                    padding: "3px 10px",
                    borderRadius: "20px",
                    width: "fit-content",
                }}
            >
                {isPositive ? "↑" : "↓"} {change}
            </div>
        </div>
    );

    return (
        <Layout noPadding noFooter>
            <div
                style={{
                    height: "calc(100vh - 73px)",
                    background: "transparent",
                    overflow: "hidden",
                }}
                className="grid-bg animate-fade-in"
            >
                <div
                    style={{
                        maxWidth: "1200px",
                        margin: "0 auto",
                        padding: "1.2rem 2rem",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                    }}
                >
                    {/* HEADER */}

                    <header style={{ marginBottom: "0.5rem" }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                marginBottom: "4px",
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
                                    fontSize: "0.7rem",
                                    fontWeight: "800",
                                    color: "var(--primary)",
                                    letterSpacing: "0.2em",
                                    textTransform: "uppercase",
                                }}
                            >
                                Financial Overview
                            </span>
                        </div>

                        <h1
                            style={{
                                fontSize: "2rem",
                                fontWeight: "900",
                                color: "var(--text-main)",
                                marginBottom: "2px",
                            }}
                        >
                            Dashboard
                        </h1>

                        <p
                            style={{
                                color: "rgba(255,255,255,0.4)",
                                fontSize: "0.9rem",
                                fontWeight: "500",
                            }}
                        >
                            Welcome back,{" "}
                            <span
                                style={{
                                    color: "var(--primary)",
                                    fontWeight: "700",
                                }}
                            >
                                {user?.name || "User"}
                            </span>
                            .
                        </p>
                    </header>

                    {/* MAIN GRID */}

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem",
                            flex: 1,
                        }}
                    >
                        {/* STATS */}

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, 1fr)",
                                gap: "1rem",
                            }}
                        >
                            <StatCard
                                title="Total Balance"
                                value="$12,450"
                                change="12%"
                                isPositive={true}
                            />

                            <StatCard
                                title="Monthly Income"
                                value="$4,200"
                                change="5%"
                                isPositive={true}
                            />

                            <StatCard
                                title="Monthly Expenses"
                                value="$2,150"
                                change="2%"
                                isPositive={false}
                            />
                        </div>

                        {/* SAVINGS GOAL */}

                        <div
                            style={{
                                flex: 1,
                                minHeight: 0,
                            }}
                        >
                            <SavingsGoal />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;