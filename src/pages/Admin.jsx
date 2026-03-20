import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import { Upload, Plus, FileText, CheckCircle, Loader2, Code, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Admin.css';

export default function Admin() {
  const [uploading, setUploading] = useState(false);
  const [assets, setAssets] = useState([]);
  const [formData, setFormData] = useState({ title: '', author: '', year: '' });
  const [htmlContent, setHtmlContent] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAssets();
  }, []);

  async function fetchAssets() {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error('Error fetching assets:', error);
    else setAssets(data || []);
  }

  const handleDelete = async (id) => {
    const { error } = await supabase.from('assets').delete().eq('id', id);
    if (error) setMessage(`Error deleting: ${error.message}`);
    else fetchAssets();
  };

  const handlePush = async (e) => {
    e.preventDefault();
    if (!htmlContent || !formData.title) {
      setMessage('Please provide a title and HTML content.');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      // Save Metadata and HTML directly to DB
      const { error: dbError } = await supabase
        .from('assets')
        .insert([
          { 
            title: formData.title, 
            author: formData.author, 
            year: formData.year, 
            content_json: {
              en: { 
                title: formData.title, 
                chapter: "Interactive Report", 
                body: htmlContent // The actual HTML string
              },
              bn: { title: formData.title, chapter: "রিপোর্ট", body: "বাংলা শীঘ্রই আসছে।" },
              hi: { title: formData.title, chapter: "रिपोर्ट", body: "हिंदी जल्द ही आ रही है।" }
            } 
          }
        ]);

      if (dbError) throw dbError;

      setMessage('Digital asset pushed successfully!');
      setHtmlContent('');
      setFormData({ title: '', author: '', year: '' });
      fetchAssets();
    } catch (error) {
      console.error('Push failed:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-layout dark-theme">
      <Header />
      
      <main className="admin-main container animate-reveal">
        <header className="admin-header">
          <h1 className="hero-display-title" style={{fontSize: '3rem'}}>Admin <span>Portal</span></h1>
        </header>

        <div className="admin-row">
          <section className="admin-left glass-panel">
            <h2><Plus size={20} /> Push New HTML Asset</h2>
            <form onSubmit={handlePush} className="upload-form">
              <div className="form-group-full">
                <input 
                  type="text" 
                  placeholder="Asset Title (e.g. Kolkata Market Update Oct 2025)" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="admin-input-premium"
                  required
                />
              </div>
              <div className="form-group-duo">
                <input 
                  type="text" 
                  placeholder="Author/Source" 
                  value={formData.author}
                  onChange={(e) => setFormData({...formData, author: e.target.value})}
                  className="admin-input-premium"
                />
                <input 
                  type="text" 
                  placeholder="Year" 
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                  className="admin-input-premium"
                />
              </div>

              <div className="editor-container">
                <label><Code size={16} /> HTML Content (Paste from your editor)</label>
                <textarea 
                  className="html-editor"
                  placeholder="<div><h1>Report</h1><p>Market is booming...</p></div>"
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  rows="12"
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn-premium push-btn" disabled={uploading}>
                {uploading ? <Loader2 className="animate-spin" /> : "Broadcast to Audience"}
              </button>
              {message && <p className="status-msg">{message}</p>}
            </form>
          </section>

          <section className="admin-right glass-panel">
            <h2><FileText size={20} /> Active Distribution</h2>
            <div className="asset-scroll-list">
              {assets.map(asset => (
                <div key={asset.id} className="admin-asset-item glass-panel">
                  <div className="asset-info">
                    <h4>{asset.title}</h4>
                    <p>{new Date(asset.created_at).toLocaleDateString()}</p>
                  </div>
                  <button className="btn-delete" onClick={() => handleDelete(asset.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {assets.length === 0 && <p className="empty-hint">No active distributions.</p>}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
