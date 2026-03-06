import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Map, Zap, Settings } from "lucide-react";

function DigitalTwin({ slotsData }) {
    const [activeZone, setActiveZone] = useState(null);
    const [hoveredSlot, setHoveredSlot] = useState(null);

    // Determine unique zones
    const zones = useMemo(() => {
        if (!slotsData) return [];
        const unique = [...new Set(slotsData.map((s) => s.zone))].filter(Boolean).sort();
        return unique;
    }, [slotsData]);

    // Set default zone if null
    if (!activeZone && zones.length > 0) {
        setActiveZone(zones[0]);
    }

    // Filter slots for the active zone
    const zoneData = useMemo(() => {
        if (!slotsData || !activeZone) return [];
        return slotsData.filter((s) => s.zone === activeZone);
    }, [activeZone, slotsData]);

    // Calculate max row and column for grid dimensions
    const maxRow = useMemo(() => (zoneData.length > 0 ? Math.max(...zoneData.map((s) => s.row)) : 0), [zoneData]);
    const maxCol = useMemo(() => (zoneData.length > 0 ? Math.max(...zoneData.map((s) => s.column)) : 0), [zoneData]);

    const getColor = (status) => {
        if (!status) return "transparent";
        switch (status.toLowerCase()) {
            case "empty":
                return "var(--success-color)";
            case "occupied":
                return "var(--accent-color)";
            case "blocked":
                return "var(--danger-color)";
            case "reserved":
                return "var(--warning-color)";
            default:
                return "transparent";
        }
    };

    const getStatusLabel = (status) => {
        if (!status) return "Unknown";
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    // Build the grid mapping based on 1-indexed rows/columns
    const gridRender = [];
    for (let r = 1; r <= maxRow; r++) {
        const rowCells = [];
        for (let c = 1; c <= maxCol; c++) {
            const slot = zoneData.find((s) => s.row === r && s.column === c);

            rowCells.push(
                <motion.div
                    key={`${r}-${c}`}
                    className="twin-slot"
                    style={{
                        backgroundColor: slot ? getColor(slot.status) : "rgba(255, 255, 255, 0.02)",
                        opacity: slot ? 0.9 : 0.2,
                        cursor: slot ? "pointer" : "default"
                    }}
                    whileHover={slot ? { scale: 1.15, zIndex: 10, opacity: 1, boxShadow: "0 0 10px rgba(255,255,255,0.3)" } : {}}
                    onMouseEnter={() => slot && setHoveredSlot(slot)}
                    onMouseLeave={() => setHoveredSlot(null)}
                />
            );
        }
        gridRender.push(
            <div key={`row-${r}`} className="twin-row">
                {rowCells}
            </div>
        );
    }

    if (!slotsData || slotsData.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
            style={{ marginTop: "20px" }}
        >
            <div className="card-header">
                <Map size={20} className="brand-icon" />
                Live 2D Digital Twin
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "20px" }}>
                Interactive real-time map of warehouse slots. Hover over any block to see specific operational data.
            </p>

            {/* Zone selection tabs */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
                {zones.map((zone) => (
                    <button
                        key={zone}
                        onClick={() => setActiveZone(zone)}
                        className={`zone-btn ${activeZone === zone ? "active" : ""}`}
                        style={{
                            padding: "6px 16px",
                            borderRadius: "20px",
                            border: `1px solid ${activeZone === zone ? "var(--accent-hover)" : "var(--border-color)"}`,
                            backgroundColor: activeZone === zone ? "rgba(88, 166, 255, 0.15)" : "transparent",
                            color: activeZone === zone ? "var(--text-main)" : "var(--text-muted)",
                            cursor: "pointer",
                            fontWeight: 600,
                            transition: "all 0.2s"
                        }}
                    >
                        Zone {zone.replace('Z', '')}
                    </button>
                ))}
            </div>

            <div style={{ display: "flex", gap: "30px", alignItems: "flex-start", flexWrap: "wrap" }}>
                {/* Render the Grid */}
                <div style={{ flex: "1 1 auto", overflowX: "auto", paddingBottom: "10px" }}>
                    <div className="twin-grid-container">
                        {gridRender}
                    </div>
                </div>

                {/* Legend and Info Panel */}
                <div style={{ flex: "0 0 250px", backgroundColor: "#0d1117", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "16px" }}>
                    <h4 style={{ marginTop: 0, marginBottom: "16px", fontSize: "0.9rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Legend</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem" }}>
                            <div style={{ width: "14px", height: "14px", borderRadius: "3px", backgroundColor: "var(--success-color)" }}></div> Empty
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem" }}>
                            <div style={{ width: "14px", height: "14px", borderRadius: "3px", backgroundColor: "var(--accent-color)" }}></div> Occupied
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem" }}>
                            <div style={{ width: "14px", height: "14px", borderRadius: "3px", backgroundColor: "var(--warning-color)" }}></div> Reserved
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem" }}>
                            <div style={{ width: "14px", height: "14px", borderRadius: "3px", backgroundColor: "var(--danger-color)" }}></div> Blocked / Hazard
                        </div>
                    </div>

                    <h4 style={{ margin: "24px 0 16px 0", fontSize: "0.9rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Slot Inspector</h4>
                    {hoveredSlot ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ backgroundColor: "rgba(22, 27, 34, 0.6)", padding: "12px", borderRadius: "6px", border: "1px solid var(--border-color)" }}
                        >
                            <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#fff", marginBottom: "8px" }}>{hoveredSlot.slot_id}</div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                                <span style={{ color: "var(--text-muted)" }}>Status</span>
                                <span style={{ color: getColor(hoveredSlot.status), fontWeight: "bold" }}>{getStatusLabel(hoveredSlot.status)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                                <span style={{ color: "var(--text-muted)" }}>Category</span>
                                <span style={{ color: "#fff" }}>{hoveredSlot.item_category !== "NA" ? hoveredSlot.item_category : "-"}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                                <span style={{ color: "var(--text-muted)" }}>Coordinates</span>
                                <span style={{ color: "#fff" }}>R{hoveredSlot.row} ∙ C{hoveredSlot.column}</span>
                            </div>
                        </motion.div>
                    ) : (
                        <div style={{ backgroundColor: "rgba(22, 27, 34, 0.4)", padding: "20px", textAlign: "center", borderRadius: "6px", border: "1px dashed var(--border-color)", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                            Hover over a slot<br />to inspect details
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default DigitalTwin;
