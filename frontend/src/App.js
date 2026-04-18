import React, { useState, useEffect } from 'react';
import apiClient from './api/client';
import './App.css';
import DocumentUpload from './components/DocumentUpload';
import RAGQuery from './components/RAGQuery';

function App() {
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(true);

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

      <main className="main">
        <section className="section">
          <DocumentUpload />
        </section>

        <section className="section">
          <RAGQuery />
        </section>
      </main>

      <footer className="footer">
        <p>manu</p>
      </footer>
    </div>
  );
}

export default App;
