import React, { useState } from "react";
import UploadData from "./components/uploaddata";
import Dashboard from "./components/dashboard";
import VisionCameras from "./components/VisionCameras";
import PredictiveForecasting from "./components/PredictiveForecasting";
import { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Box, BarChart2, Camera, TrendingUp, AlertCircle } from "lucide-react";
import "./App.css";

function App() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("analytics");

  return (
    <div className="app-container">
      <div className="bg-glow"></div>
      <div className="bg-glow-2"></div>

      <Toaster position="top-right" toastOptions={{
        style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' }
      }} />

      <nav className="navbar">
        <div className="brand">
          <Box className="brand-icon" size={28} />
          Smart Warehouse Nexus
        </div>
      </nav>

      <main className="main-content">
        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            <BarChart2 size={18} />
            Data Analytics Pipeline
          </button>
          <button
            className={`tab-btn ${activeTab === "vision" ? "active" : ""}`}
            onClick={() => setActiveTab("vision")}
          >
            <Camera size={18} />
            AI Vision Feeds
          </button>
          <button
            className={`tab-btn ${activeTab === "forecasting" ? "active" : ""}`}
            onClick={() => setActiveTab("forecasting")}
          >
            <TrendingUp size={18} />
            Capacity Forecast
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
            >
              <div className="card">
                <UploadData setData={setData} />
              </div>

              {data && (
                <div className="card">
                  <Dashboard data={data} onNavigateToForecasting={() => setActiveTab("forecasting")} />
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "vision" && (
            <motion.div
              key="vision"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <VisionCameras data={data} setData={setData} />
            </motion.div>
          )}

          {activeTab === "forecasting" && (
            <motion.div
              key="forecasting"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {data && data.metrics ? (
                <PredictiveForecasting metrics={data.metrics} />
              ) : (
                <div className="card" style={{ marginTop: "30px", textAlign: "center", padding: "40px" }}>
                  <AlertCircle size={48} color="var(--warning-color)" style={{ marginBottom: "16px", display: "inline-block" }} />
                  <h3>Waiting for Analytical Data</h3>
                  <p style={{ color: "var(--text-muted)", marginTop: "12px", fontSize: "1.05rem" }}>
                    Please upload a dataset in the Data Analytics Pipeline section first to view the AI capacity forecasting.
                  </p>
                  <button
                    className="btn-primary"
                    onClick={() => setActiveTab("analytics")}
                    style={{ marginTop: "24px", display: "inline-flex", gap: "8px", alignItems: "center" }}
                  >
                    <BarChart2 size={16} /> Go to Analytics Pipeline
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;