import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Upload, Plus, FileText, CheckCircle, Loader2, Code, Trash2, FileIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Admin.css';

export default function Admin() {
  const [uploading, setUploading] = useState(false);
  const [assets, setAssets] = useState([]);
  const [formData, setFormData] = useState({ title: '', author: '', year: '' });
  const [htmlContent, setHtmlContent] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [htmlFile, setHtmlFile] = useState(null);
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

  const readHtmlFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const handlePush = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      setMessage('Please provide at least a title.');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      let finalPdfUrl = null;
      let finalHtmlContent = htmlContent;

      // 1. Handle HTML File Upload (if any)
      if (htmlFile) {
        finalHtmlContent = await readHtmlFile(htmlFile);
      }

      // 2. Handle PDF File Upload (if any)
      if (pdfFile) {
        const fileExt = pdfFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `manual-pdfs/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('pdf-assets')
          .upload(filePath, pdfFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('pdf-assets')
          .getPublicUrl(filePath);
        
        finalPdfUrl = publicUrl;
      }

      // 3. Save to DB
      const { error: dbError } = await supabase
        .from('assets')
        .insert([
          { 
            title: formData.title, 
            author: formData.author, 
            year: formData.year, 
            pdf_url: finalPdfUrl,
            content_json: finalHtmlContent ? {
              en: { title: formData.title, chapter: "Interactive Content", body: finalHtmlContent }
            } : null
          }
        ]);

      if (dbError) throw dbError;

      setMessage('Asset broadcasted successfully!');
      setHtmlContent('');
      setPdfFile(null);
      setHtmlFile(null);
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
          <p className="admin-subtitle">Distribute HTML interactive reports or pure PDF assets.</p>
        </header>

        <div className="admin-row">
          <section className="admin-left glass-panel">
            <h2><Plus size={20} /> Create New Distribution</h2>
            <form onSubmit={handlePush} className="upload-form">
              <div className="form-group-full">
                <input 
                  type="text" 
                  placeholder="Asset Title" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="admin-input-premium"
                  required
                />
              </div>
              <div className="form-group-duo">
                <input 
                  type="text" 
                  placeholder="Author" 
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

              <div className="upload-options-grid">
                <div className={`file-drop-zone ${pdfFile ? 'has-file' : ''}`}>
                  <FileText size={24} />
                  <span>{pdfFile ? pdfFile.name : "Attach PDF (Optional)"}</span>
                  <input type="file" accept=".pdf" onChange={(e) => setPdfFile(e.target.files[0])} />
                </div>
                <div className={`file-drop-zone ${htmlFile ? 'has-file' : ''}`}>
                  <Code size={24} />
                  <span>{htmlFile ? htmlFile.name : "Attach HTML (Optional)"}</span>
                  <input type="file" accept=".html" onChange={(e) => setHtmlFile(e.target.files[0])} />
                </div>
              </div>

              <div className="editor-container">
                <label>Or Paste HTML Manually</label>
                <textarea 
                  className="html-editor"
                  placeholder="<div>Content here...</div>"
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  rows="8"
                ></textarea>
              </div>

              <button type="submit" className="btn-premium push-btn" disabled={uploading}>
                {uploading ? <Loader2 className="animate-spin" /> : "Verify & Broadcast"}
              </button>
              {message && <p className="status-msg">{message}</p>}
            </form>
          </section>

          <section className="admin-right glass-panel">
            <h2><FileIcon size={20} /> Audit Trail</h2>
            <div className="asset-scroll-list">
              {assets.map(asset => (
                <div key={asset.id} className="admin-asset-item glass-panel">
                  <div className="asset-info">
                    <h4>{asset.title}</h4>
                    <div className="asset-types">
                      {asset.pdf_url && <span className="type-dot pdf">PDF</span>}
                      {asset.content_json && <span className="type-dot html">HTML</span>}
                    </div>
                  </div>
                  <button className="btn-delete" onClick={() => handleDelete(asset.id)}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
