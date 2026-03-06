import React, { useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { UploadCloud, FileText, Loader2, Send } from "lucide-react";
import Papa from "papaparse";

function UploadData({ setData }) {
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

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
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    if (!notes.trim()) {
      toast.error("Please enter operation notes");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("notes", notes);

    setIsLoading(true);
    const loadingToast = toast.loading("Analyzing dataset with AI...");

    try {
      const res = await axios.post(
        "https://smart-warehouse-backend-a4evdkeagkbfgje0.southeastasia-01.azurewebsites.net/analyze",
        formData
      );

      // Parse the CSV locally for the 2D Digital Twin feature
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function (results) {
          const parsedData = results.data;
          if (parsedData.length > 0) {
            const firstRow = parsedData[0];
            const finalData = { ...res.data };

            if (firstRow.image_name !== undefined) {
              finalData.vision_data = parsedData;
            } else {
              // Fallback for digital twin or operation logs
              finalData.slots_data = parsedData;
            }

            setData(finalData);
            toast.success("Analysis complete!", { id: loadingToast });
          } else {
            setData(res.data);
            toast.success("Analysis complete!", { id: loadingToast });
          }
        },
        error: function (err) {
          console.error("PapaParse error:", err);
          setData(res.data);
          toast.error("Warning: Parse failed to load", { id: loadingToast });
        }
      });

    } catch (err) {
      console.error(err);
      toast.error("Error connecting to backend", { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="card-header">
        <UploadCloud size={24} className="brand-icon" />
        Upload Warehouse Dataset
      </h2>

      <div
        className={`upload-zone ${isDragging ? "drag-active" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <UploadCloud className="upload-icon" />
        <p style={{ margin: 0, fontWeight: 500 }}>
          {file ? file.name : "Drag & drop your CSV file here or click to browse"}
        </p>
        <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>
          Supports .csv and structured datasets
        </p>
        <input
          type="file"
          ref={fileInputRef}
          className="file-input-hidden"
          accept=".csv"
          onChange={(e) => {
            if (e.target.files.length > 0) setFile(e.target.files[0]);
          }}
        />
      </div>

      <div style={{ position: "relative" }}>
        <FileText size={18} style={{ position: "absolute", top: "25px", left: "12px", color: "var(--text-muted)" }} />
        <textarea
          placeholder="Enter operation notes (e.g., 'Analyze afternoon shift utilization...')"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ paddingLeft: "38px" }}
        />
      </div>

      <button className="btn-primary" onClick={handleSubmit} disabled={isLoading || (!file && !notes)}>
        {isLoading ? (
          <>
            <Loader2 size={18} className="spin" />
            Processing...
          </>
        ) : (
          <>
            <Send size={18} />
            Analyze Data
          </>
        )}
      </button>
    </div>
  );
}

export default UploadData;