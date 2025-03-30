import React, { useContext, useRef, useState } from "react";
import axios from "axios";
import { AppContent } from "../context/AppContext";

const NewPage = () => {
  const { userData } = useContext(AppContent);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [showDownloadButton, setShowDownloadButton] = useState(false);
  const [confidence, setConfidence] = useState("");
  const [formData, setFormData] = useState({
    name: userData?.name || "",
    email: userData?.email || "",
    age: userData?.age || "",
    gender: userData?.gender || "Other",
    dob: userData?.dob || "",
    sex: userData?.sex || "Other",
    bloodgrp: userData?.bloodgrp || "N/A",
    smokinghabbits: userData?.smokinghabbits || 0,
    docName: userData?.docName || "",
    lastVisited: userData?.lastVisited || "",
  });

  // Handle user input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith(".dcm")) {
      setSelectedFile(file);
    } else {
      alert("Only .dcm files are allowed!");
      event.target.value = "";
    }
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // Handle File Upload
  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post("http://localhost:4000/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Upload successful:", response.data.metadata);
      setUploadedImage(response.data.imageData);
      setConfidence(response.data.metadata.confidence);
      setShowDownloadButton(true); // Show PDF button after upload success
      alert("File uploaded successfully!");
    } catch (error) {
      console.error("File upload error:", error);
      alert("File upload failed!");
    }
  };

  // Handle PDF Download
  const handleDownloadPDF = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/user/download-pdf", 
        { ...formData, image: uploadedImage }, 
        { responseType: "blob" } // Receive PDF as binary blob
      );

      // Create a downloadable link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "patient_summary.pdf");
      document.body.appendChild(link);
      link.click();
      alert("PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF download error:", error);
      alert("Failed to generate PDF!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <h1 className="text-2xl font-semibold mb-4">Upload a DICOM File & Generate PDF</h1>

      {/* Form Section */}

      {/* Hidden file input */}
      <input type="file" accept=".dcm" ref={fileInputRef} onChange={handleFileChange} style={{ display: "none" }} />

      <button onClick={handleUploadClick} className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
        Select File
      </button>

      {selectedFile && (
        <>
          <p className="mt-2 text-sm text-gray-600">Selected File: {selectedFile.name}</p>
          <button onClick={handleUpload} className="mt-4 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
            Upload File
          </button>
        </>
      )}

      {uploadedImage && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Confidence: {confidence || "N/A"}</h2>
          <img src={`data:image/png;base64,${uploadedImage}`} alt="Converted DICOM" className="max-w-md border rounded-lg shadow-lg" />
        </div>
      )}

    </div>
  );
};

export default NewPage;

