import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { History, Calendar, CheckCircle, AlertTriangle, Info, Zap } from "lucide-react";

function OperationsTimeline({ logsData }) {
    // Sort logs by date descending and take top 25 for visualization
    const sortedLogs = useMemo(() => {
        if (!logsData || logsData.length === 0) return [];
        // filter out empty rows
        const validLogs = logsData.filter((log) => log.date && log.notes);
        return validLogs.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 25);
    }, [logsData]);

    if (sortedLogs.length === 0) return null;

    // Sentiment / Status Mapping logic based on notes content
    const getLogStyle = (notes) => {
        const text = notes.toLowerCase();
        if (text.includes("error") || text.includes("damage") || text.includes("blocked") || text.includes("shortage")) {
            return { color: "var(--danger-color)", icon: <AlertTriangle size={18} />, bg: "rgba(218, 54, 51, 0.1)" };
        }
        if (text.includes("delay") || text.includes("mismatch") || text.includes("backlog") || text.includes("fluctuation")) {
            return { color: "var(--warning-color)", icon: <Zap size={18} />, bg: "rgba(210, 153, 34, 0.1)" };
        }
        if (text.includes("success") || text.includes("smooth") || text.includes("improved")) {
            return { color: "var(--success-color)", icon: <CheckCircle size={18} />, bg: "rgba(35, 134, 54, 0.1)" };
        }
        return { color: "var(--accent-color)", icon: <Info size={18} />, bg: "rgba(88, 166, 255, 0.1)" };
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
            style={{ marginTop: "20px" }}
        >
            <div className="card-header">
                <History size={20} className="brand-icon" />
                Operations Master Log
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "20px" }}>
                Chronological timeline of operational activities, shifts, and systemic issues across all zones.
            </p>

            <motion.div
                className="timeline-container"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{ position: "relative", marginLeft: "10px", marginTop: "30px", borderLeft: "2px solid var(--border-color)", paddingLeft: "30px", paddingBottom: "20px" }}
            >
                {sortedLogs.map((log, index) => {
                    const style = getLogStyle(log.notes);
                    return (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            style={{ position: "relative", marginBottom: "24px" }}
                        >
                            {/* Timeline dot */}
                            <div style={{
                                position: "absolute",
                                left: "-42px",
                                top: "14px",
                                width: "22px",
                                height: "22px",
                                borderRadius: "50%",
                                backgroundColor: "#0d1117",
                                border: `2px solid ${style.color}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                zIndex: 2
                            }}>
                                <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: style.color }}></div>
                            </div>

                            {/* Log Card */}
                            <div style={{
                                backgroundColor: "rgba(22, 27, 34, 0.6)",
                                border: "1px solid var(--border-color)",
                                borderRadius: "8px",
                                padding: "16px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                                transition: "transform 0.2s, box-shadow 0.2s"
                            }}
                                className="timeline-card"
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500 }}>
                                        <Calendar size={14} /> {log.date}
                                    </span>
                                    <span style={{ backgroundColor: style.bg, color: style.color, padding: "2px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 600 }}>
                                        Zone {log.zone ? log.zone.replace('Z', '') : "?"}
                                    </span>
                                </div>

                                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginTop: "4px" }}>
                                    <div style={{ color: style.color, marginTop: "2px" }}>
                                        {style.icon}
                                    </div>
                                    <div style={{ color: "var(--text-main)", fontSize: "1rem", lineHeight: "1.4" }}>
                                        {log.notes}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>
        </motion.div>
    );
}

export default OperationsTimeline;
