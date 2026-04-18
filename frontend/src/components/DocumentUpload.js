import React, { useState } from 'react';
import apiClient from '../api/client';
import './DocumentUpload.css';

function DocumentUpload() {
  const [filename, setFilename] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleUpload = async () => {
    if (!filename.trim()) {
      setError('Please enter a filename');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await apiClient.post('/api/documents', {
        filename: filename,
        content_type: 'text/plain',
        file_size: 0
      });
      setMessage('✓ Document added successfully!');
      setFilename('');
    } catch (err) {
      setError('Error adding document: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="document-upload">
      <h2>📄 Add Documents</h2>
      <p className="subtitle">Add documents for the RAG system</p>

      <div className="upload-area">
        <input
          type="text"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          placeholder="Enter document filename"
          disabled={loading}
          className="filename-input"
        />
      </div>

      <button
        onClick={handleUpload}
        disabled={loading || !filename}
        className="upload-btn"
      >
        {loading ? 'Adding...' : 'Add Document'}
      </button>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default DocumentUpload;
