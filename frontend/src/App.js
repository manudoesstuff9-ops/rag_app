import React, { useState, useEffect } from 'react';
import apiClient from './api/client';
import './App.css';
import DocumentUpload from './components/DocumentUpload';
import RAGQuery from './components/RAGQuery';

function App() {
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('upload');

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const response = await apiClient.get('/api/health');
      setHealthStatus(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Health check failed:', error);
      setHealthStatus({ status: 'error' });
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>RAG APP</h1>
        <p>Retrieval Augmented Generation System</p>
        <div className="view-switcher">
          <button
            className={`view-btn ${activeView === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveView('upload')}
          >
            Upload Documents
          </button>
          <button
            className={`view-btn ${activeView === 'query' ? 'active' : ''}`}
            onClick={() => setActiveView('query')}
          >
            Query RAG
          </button>
        </div>
      </header>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : !healthStatus || healthStatus.status === 'error' ? (
        <div className="error-banner">
          ⚠️ Backend service is not available. Please check if the server is running.
        </div>
      ) : (
        <div className="status-badge">✓ Backend connected</div>
      )}

      <main className="main main-single">
        <section className="section">
          {activeView === 'upload' ? (
            <DocumentUpload />
          ) : (
            <>
              <button
                className="jump-upload-btn"
                onClick={() => setActiveView('upload')}
              >
                Go to Upload Documents
              </button>
              <RAGQuery />
            </>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>manu</p>
      </footer>
    </div>
  );
}

export default App;
