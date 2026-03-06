import React from "react";
import Charts from "./charts";
import DigitalTwin from "./DigitalTwin";
import OperationsTimeline from "./OperationsTimeline";
import PredictiveForecasting from "./PredictiveForecasting";
import { motion } from "framer-motion";
import { Copy, Layers, CheckCircle, Package, AlertTriangle, BarChart, Smile, Frown, Meh, Activity, TrendingUp } from "lucide-react";

function Dashboard({ data, onNavigateToForecasting }) {
  if (!data) return null;

  const metrics = data.metrics || null;
  const operations = data.operations_analysis || null;
  const slotsData = data.slots_data || null;

  const metricVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4 }
    }),
  };

  return (
    <div style={{ marginTop: "10px" }}>
      <h2 className="card-header">
        <Activity size={24} className="brand-icon" />
        Warehouse Analytics
      </h2>

      {/* ---------------- SLOT METRICS ---------------- */}
      {metrics && (
        <>
          <div className="metrics-grid">
            <motion.div custom={0} initial="hidden" animate="visible" variants={metricVariants} className="metric-card">
              <div className="metric-header">
                <Layers size={16} /> Total Slots
              </div>
              <div className="metric-value">{metrics.total_slots}</div>
              <div className="metric-subtext">Overall capacity</div>
            </motion.div>

            <motion.div custom={1} initial="hidden" animate="visible" variants={metricVariants} className="metric-card">
              <div className="metric-header">
                <Package size={16} color="var(--accent-color)" /> Occupied
              </div>
              <div className="metric-value">{metrics.occupied}</div>
              <div className="metric-subtext">Currently loaded</div>
            </motion.div>

            <motion.div custom={2} initial="hidden" animate="visible" variants={metricVariants} className="metric-card">
              <div className="metric-header">
                <CheckCircle size={16} color="var(--success-color)" /> Empty
              </div>
              <div className="metric-value">{metrics.empty}</div>
              <div className="metric-subtext">Available for use</div>
            </motion.div>

            <motion.div custom={3} initial="hidden" animate="visible" variants={metricVariants} className="metric-card">
              <div className="metric-header">
                <Copy size={16} color="var(--warning-color)" /> Reserved
              </div>
              <div className="metric-value">{metrics.reserved}</div>
              <div className="metric-subtext">Pending allocation</div>
            </motion.div>

            <motion.div custom={4} initial="hidden" animate="visible" variants={metricVariants} className="metric-card">
              <div className="metric-header">
                <AlertTriangle size={16} color="var(--danger-color)" /> Blocked
              </div>
              <div className="metric-value">{metrics.blocked}</div>
              <div className="metric-subtext">Maintenance / error</div>
            </motion.div>

            <motion.div custom={5} initial="hidden" animate="visible" variants={metricVariants} className="metric-card">
              <div className="metric-header">
                <BarChart size={16} color="#c372f2" /> Utilization
              </div>
              <div className="metric-value">{metrics.utilization_rate}%</div>
              <div className="metric-subtext">Efficiency metric</div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="charts-grid"
          >
            <div className="chart-wrapper">
              <div className="chart-title">Slot Distribution Breakdown</div>
              <Charts metrics={metrics} />
            </div>

            <div className="chart-wrapper">
              <div className="chart-title">Status Overview</div>
              {/* Optional: if there were other charts. For now just centering text or extra stats */}
              <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
                <p>Advanced metrics visualization area.</p>
                <div style={{ marginTop: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", width: "200px", margin: "0 auto" }}>
                    <span>Occupied Ratio</span>
                    <span style={{ color: "var(--accent-color)", fontWeight: "bold" }}>{((metrics.occupied / metrics.total_slots) * 100).toFixed(1)}%</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", width: "200px", margin: "0 auto" }}>
                    <span>Blocked Risk</span>
                    <span style={{ color: "var(--danger-color)", fontWeight: "bold" }}>{((metrics.blocked / metrics.total_slots) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div style={{ marginTop: "40px", textAlign: "center" }}>
            <button
              className="btn-primary"
              onClick={onNavigateToForecasting}
              style={{ padding: "12px 24px", fontSize: "1rem" }}
            >
              <TrendingUp size={18} />
              Open Predictive AI Capacity Forecasting
            </button>
            <p style={{ marginTop: "12px", color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Explore machine-learning generated capacity trends based on this active dataset.
            </p>
          </div>
        </>
      )}

      {/* ---------------- DYNAMIC RENDER BASED ON DATASET ---------------- */}
      {slotsData && slotsData.length > 0 && slotsData[0].row !== undefined && (
        <DigitalTwin slotsData={slotsData} />
      )}

      {slotsData && slotsData.length > 0 && slotsData[0].date !== undefined && slotsData[0].notes !== undefined && (
        <OperationsTimeline logsData={slotsData} />
      )}

      {/* ---------------- AZURE AI SENTIMENT ---------------- */}
      {operations && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          style={{ marginTop: "40px" }}
        >
          <h3 className="card-header" style={{ fontSize: "1.1rem" }}>
            <Activity size={20} /> Operations Sentiment Analysis (Azure AI)
          </h3>

          <div className="metrics-grid">
            <div className="metric-card sentiment-positive">
              <div className="metric-header">
                <Smile size={16} color="var(--success-color)" /> Positive Impact
              </div>
              <div className="metric-value">{operations.positive || 0}</div>
              <div className="metric-subtext">Favorable shifts</div>
            </div>

            <div className="metric-card sentiment-negative">
              <div className="metric-header">
                <Frown size={16} color="var(--danger-color)" /> Negative Impact
              </div>
              <div className="metric-value">{operations.negative || 0}</div>
              <div className="metric-subtext">Potential risks</div>
            </div>

            <div className="metric-card sentiment-neutral">
              <div className="metric-header">
                <Meh size={16} color="var(--warning-color)" /> Neutral
              </div>
              <div className="metric-value">{operations.neutral || 0}</div>
              <div className="metric-subtext">Standard operations</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default Dashboard;