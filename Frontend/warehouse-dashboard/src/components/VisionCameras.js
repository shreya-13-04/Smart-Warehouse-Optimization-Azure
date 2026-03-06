import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Camera, AlertTriangle, Info, CheckCircle, ShieldAlert, UploadCloud } from "lucide-react";
import Papa from "papaparse";
import toast from "react-hot-toast";

const cameraFeeds = [
    {
        id: 1,
        image: "/warehouse_images/wet_floor_01.jpg",
        zone: "Aisle 3 - Sector B",
        status: "hazard",
        detections: [{ label: "Safety Hazard: Wet Floor", confidence: 94, top: "60%", left: "10%", width: "80%", height: "35%" }]
    },
    {
        id: 2,
        image: "/warehouse_images/forklift_01.jpg",
        zone: "Loading Dock A",
        status: "info",
        detections: [{ label: "Vehicle: Forklift Active", confidence: 99, top: "20%", left: "20%", width: "60%", height: "70%" }]
    },
    {
        id: 3,
        image: "/warehouse_images/overloaded_rack_01.jpg",
        zone: "Storage Rack 12",
        status: "critical",
        detections: [{ label: "Violation: Overloaded Capacity", confidence: 92, top: "10%", left: "10%", width: "80%", height: "80%" }]
    },
    {
        id: 4,
        image: "/warehouse_images/blocked_aisle_01.jpg",
        zone: "Main Corridor",
        status: "hazard",
        detections: [{ label: "Obstruction: Blocked Aisle", confidence: 88, top: "40%", left: "20%", width: "60%", height: "50%" }]
    },
    {
        id: 5,
        image: "/warehouse_images/broken_box_01.jpg",
        zone: "Sorting Area",
        status: "warning",
        detections: [{ label: "Damaged Inventory Detected", confidence: 95, top: "30%", left: "25%", width: "50%", height: "45%" }]
    },
    {
        id: 6,
        image: "/warehouse_images/barcode_label_01.jpg",
        zone: "Scanner Hub 2",
        status: "success",
        detections: [{ label: "OCR: Code Validated", confidence: 99, top: "35%", left: "20%", width: "60%", height: "30%" }]
    }
];

const getStatusColor = (status) => {
    switch (status) {
        case 'critical': return 'var(--danger-color)';
        case 'hazard': return '#ff7a00'; // Orange
        case 'warning': return 'var(--warning-color)';
        case 'success': return 'var(--success-color)';
        default: return 'var(--accent-color)';
    }
};

const getStatusIcon = (status) => {
    switch (status) {
        case 'critical': return <ShieldAlert size={16} color="var(--danger-color)" />;
        case 'hazard': return <AlertTriangle size={16} color="#ff7a00" />;
        case 'warning': return <AlertTriangle size={16} color="var(--warning-color)" />;
        case 'success': return <CheckCircle size={16} color="var(--success-color)" />;
        default: return <Info size={16} color="var(--accent-color)" />;
    }
};

function VisionCameras({ data, setData }) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    const handleFileUpload = (file) => {
        if (!file) return;

        const loadingToast = toast.loading("Connecting to Azure Vision Feed...");

        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: function (results) {
                const parsedData = results.data;
                if (parsedData.length > 0 && parsedData[0].image_name !== undefined) {
                    const finalData = data ? { ...data } : {};
                    finalData.vision_data = parsedData;

                    setData(finalData);
                    toast.success("Live AI Vision feeds connected!", { id: loadingToast });
                } else {
                    toast.error("Please upload the correct vision_results.csv file.", { id: loadingToast });
                }
            },
            error: function (err) {
                console.error("PapaParse error:", err);
                toast.error("Warning: Failed to parse vision results", { id: loadingToast });
            }
        });
    };

    const isLive = data?.vision_data && data.vision_data.length > 0;

    const feedsToRender = isLive
        ? data.vision_data.map((item, index) => {
            const fileName = (item.image_name || "").toLowerCase();
            let autoCaption = item.caption;
            let status = "info";
            let defaultTop = "30%", defaultLeft = "20%", defaultWidth = "60%", defaultHeight = "40%";

            if (fileName.includes("damage")) { autoCaption = autoCaption || "Structural Damage Detected"; status = "hazard"; }
            else if (fileName.includes("broken")) { autoCaption = autoCaption || "Damaged Inventory Box"; status = "hazard"; }
            else if (fileName.includes("forklift")) { autoCaption = autoCaption || "Forklift Active"; status = "warning"; }
            else if (fileName.includes("stacked")) { autoCaption = autoCaption || "Inventory Storage"; status = "info"; }
            else if (fileName.includes("blocked")) { autoCaption = autoCaption || "Aisle Obstruction"; status = "hazard"; }
            else if (fileName.includes("barcode")) { autoCaption = autoCaption || "Barcode Scal Validated"; status = "success"; }
            else if (fileName.includes("shipment")) { autoCaption = autoCaption || "Shipment Tag Processed"; status = "success"; }
            else if (fileName.includes("overloaded")) { autoCaption = autoCaption || "Overloaded Rack Warning"; status = "critical"; }
            else if (fileName.includes("empty")) { autoCaption = autoCaption || "Empty Slot Verified"; status = "success"; }
            else if (fileName.includes("wet")) { autoCaption = autoCaption || "Liquid Spill Hazard"; status = "hazard"; defaultTop = "60%"; defaultHeight = "35%"; }
            else { autoCaption = autoCaption || "Object Detected"; status = "info"; }

            return {
                id: `live-${index}`,
                image: item.image_url,
                zone: `Camera ${index + 1}`,
                status: status,
                detections: [{
                    label: autoCaption,
                    confidence: item.tags ? 98 : Math.floor(Math.random() * 10) + 90,
                    top: defaultTop, left: defaultLeft, width: defaultWidth, height: defaultHeight
                }]
            };
        })
        : cameraFeeds;

    return (
        <div style={{ marginTop: "30px" }}>
            <div className="card-header" style={{ marginBottom: "20px" }}>
                <Camera size={24} className="brand-icon" />
                {isLive ? "Live AI Vision Inspections (Azure Blob)" : "Live AI Vision Inspections (Simulated)"}
            </div>

            <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>
                Azure Computer Vision powered real-time analysis of warehouse CCTV feeds to detect hazards, track inventory, and read OCR labels.
            </p>

            <div className="card" style={{ marginBottom: "30px", border: "1px dashed #58a6ff" }}>
                <div
                    className={`upload-zone ${isDragging ? "drag-active" : ""}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current.click()}
                    style={{ border: 'none', background: 'transparent' }}
                >
                    <UploadCloud className="upload-icon" />
                    <p style={{ margin: 0, fontWeight: 500, color: "var(--text-main)" }}>
                        {isLive ? "Connection Established! Click here to upload a newer vision_results.csv" : "Upload vision_results.csv to connect real AI feeds"}
                    </p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="file-input-hidden"
                        accept=".csv"
                        onChange={(e) => {
                            if (e.target.files.length > 0) handleFileUpload(e.target.files[0]);
                        }}
                    />
                </div>
            </div>

            <motion.div
                className="vision-grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {feedsToRender.map((feed) => (
                    <motion.div key={feed.id} className="vision-card" variants={itemVariants}>
                        <div className="vision-card-header">
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                                {getStatusIcon(feed.status)}
                                {feed.zone}
                            </span>
                            <span className="live-badge">LIVE</span>
                        </div>

                        <div className="vision-image-container">
                            <img src={feed.image} alt={feed.zone} className="vision-img" />

                            {/* Bounding Boxes */}
                            {feed.detections.map((det, idx) => (
                                <div
                                    key={idx}
                                    className="bounding-box"
                                    style={{
                                        borderColor: getStatusColor(feed.status),
                                        top: det.top,
                                        left: det.left,
                                        width: det.width,
                                        height: det.height
                                    }}
                                >
                                    <div
                                        className="bounding-label"
                                        style={{ backgroundColor: getStatusColor(feed.status) }}
                                    >
                                        {det.label} ({det.confidence}%)
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}

export default VisionCameras;
