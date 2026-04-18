import React, { useState } from 'react';
import apiClient from '../api/client';
import './DocumentUpload.css';

function DocumentUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files && event.target.files[0] ? event.target.files[0] : null;
    setSelectedFile(file);
    setError('');
    setMessage('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please choose a file to upload');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const fileText = await selectedFile.text();

      if (!fileText.trim()) {
        setError('Selected file is empty. Please upload a file with text content.');
        setLoading(false);
        return;
      }

      await apiClient.post('/api/rag/documents', {
        filename: selectedFile.name,
        text: fileText,
      });

      setMessage(`✓ Uploaded ${selectedFile.name} successfully!`);
      setSelectedFile(null);
    } catch (err) {
      setError('Error uploading file: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="document-upload">
      <h2>📄 Add Documents</h2>
      <p className="subtitle">Upload a real file so RAG can use its text content</p>

      <div className="upload-area">
        <input
          type="file"
          onChange={handleFileChange}
          disabled={loading}
          className="filename-input"
          accept=".txt,.md,.json,.csv,.log,.text"
        />
      </div>

      {selectedFile && (
        <p className="file-meta">
          Selected: {selectedFile.name} ({Math.ceil(selectedFile.size / 1024)} KB)
        </p>
      )}

      <button
        onClick={handleUpload}
        disabled={loading || !selectedFile}
        className="upload-btn"
      >
        {loading ? 'Uploading...' : 'Upload File'}
      </button>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default DocumentUpload;
