import React, { useState } from 'react';
import Header from '../components/Header';
import { Upload, Plus, FileText } from 'lucide-react';
import './Admin.css';

export default function Admin() {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave" || e.type === "drop") {
      setDragActive(false);
    }
  };

  return (
    <div className="admin-layout">
      <Header />
      
      <main className="admin-main container animate-fade-in-up">
        <header className="admin-header">
          <h1>Admin Dashboard</h1>
          <button className="btn-primary"><Plus size={18} /> New Asset</button>
        </header>

        <section className="upload-section">
          <h2>Upload Digital Asset (PDF)</h2>
          <form 
            className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrag}
          >
            <Upload size={48} className="upload-icon" />
            <p>Drag and drop your PDF here, or click to browse files</p>
            <input type="file" className="file-input" accept=".pdf" />
          </form>
        </section>

        <section className="asset-list glass-panel" style={{ padding: '2rem' }}>
          <h2>Recent Uploads</h2>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Asset Name</th>
                  <th>Date Added</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><FileText size={16} /> The Bengal Renaissance</td>
                  <td>Oct 24, 2026</td>
                  <td><span className="status-badge live">Live</span></td>
                  <td><button className="btn-secondary btn-small">Edit HTML</button></td>
                </tr>
                <tr>
                  <td><FileText size={16} /> Tramways of Old Calcutta</td>
                  <td>Oct 20, 2026</td>
                  <td><span className="status-badge draft">Draft</span></td>
                  <td><button className="btn-secondary btn-small">Edit HTML</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
