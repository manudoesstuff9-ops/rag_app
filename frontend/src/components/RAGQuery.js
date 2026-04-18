import React, { useState } from 'react';
import apiClient from '../api/client';
import './RAGQuery.css';

function RAGQuery() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQuery = async () => {
    if (!query.trim()) {
      setError('Please enter a query');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await apiClient.post('/api/rag/query', { query });
      setResult(response.data.result || response.data.message);
    } catch (err) {
      setError('Error processing query: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleQuery();
    }
  };

  return (
    <div className="rag-query">
      <h2>🔍 Query Documents</h2>
      <p className="subtitle">Ask questions about your uploaded documents</p>

      <div className="query-input-group">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter your question here..."
          disabled={loading}
          className="query-input"
          rows={4}
        />
      </div>

      <button
        onClick={handleQuery}
        disabled={loading}
        className="query-btn"
      >
        {loading ? 'Processing...' : 'Search Documents'}
      </button>

      {result && (
        <div className="result-container">
          <h3>📋 Result</h3>
          <div className="result-text">
            {result}
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default RAGQuery;
