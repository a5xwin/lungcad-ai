import React, { useRef, useState } from 'react';

const NewPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null); // Ref for the hidden file input

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      if (file.name.endsWith('.dicom')) {
        setSelectedFile(file);
      } else {
        alert('Only .dicom files are allowed!');
        event.target.value = ''; // Reset file input
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click(); // Simulate a click on the hidden file input
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-2xl font-semibold mb-4">Upload a DICOM File</h1>
      
      {/* Hidden file input */}
      <input
        type="file"
        accept=".dicom"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }} // Hide the input
      />
      
      <button
        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        onClick={handleUploadClick} // Opens file picker
      >
        Upload
      </button>

      {selectedFile && (
        <p className="mt-2 text-sm text-gray-600">Selected File: {selectedFile.name}</p>
      )}
    </div>
  );
};

export default NewPage;
