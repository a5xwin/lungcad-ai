import React, { useRef, useState } from "react";
import axios from "axios";

const NewPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null); // Ref for the hidden file input

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      if (file.name.endsWith(".dcm")) {
        setSelectedFile(file);
      } else {
        alert("Only .dcm files are allowed!");
        event.target.value = ""; // Reset file input
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click(); // Simulate a click on the hidden file input
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post("http://localhost:4000/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Upload successful:", response.data);
      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("File upload failed.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-2xl font-semibold mb-4">Upload a DICOM File</h1>

      {/* Hidden file input */}
      <input
        type="file"
        accept=".dcm"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }} // Hide the input
      />

      <button
        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        onClick={handleUploadClick} // Opens file picker
      >
        Select File
      </button>

      {selectedFile && (
        <>
          <p className="mt-2 text-sm text-gray-600">Selected File: {selectedFile.name}</p>
          <button
            className="mt-4 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            onClick={handleUpload} // Uploads the selected file
          >
            Upload
          </button>
        </>
      )}
    </div>
  );
};

export default NewPage;
