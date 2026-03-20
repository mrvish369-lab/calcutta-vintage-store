import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Upload, Plus, FileText, CheckCircle, Loader2, Code, Trash2, FileIcon, Image as ImageIcon, LayoutDashboard, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Admin.css';

export default function Admin() {
  const [uploading, setUploading] = useState(false);
  const [assets, setAssets] = useState([]);
  const [formData, setFormData] = useState({ title: '', author: '', year: '' });
  const [htmlContent, setHtmlContent] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [htmlFile, setHtmlFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'manage'

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
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
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

  const handleCoverChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
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
      let finalCoverUrl = null;
      let finalHtmlContent = htmlContent;

      // 1. Upload Cover Image (if any)
      if (coverFile) {
        const fileExt = coverFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `covers/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('pdf-assets').upload(filePath, coverFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('pdf-assets').getPublicUrl(filePath);
        finalCoverUrl = publicUrl;
      }

      // 2. Handle HTML File Upload (if any)
      if (htmlFile) {
        finalHtmlContent = await readHtmlFile(htmlFile);
      }

      // 3. Handle PDF File Upload (if any)
      if (pdfFile) {
        const fileExt = pdfFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `manual-pdfs/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('pdf-assets').upload(filePath, pdfFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('pdf-assets').getPublicUrl(filePath);
        finalPdfUrl = publicUrl;
      }

      // 4. Save to DB
      const { error: dbError } = await supabase
        .from('assets')
        .insert([
          { 
            title: formData.title, 
            author: formData.author, 
            year: formData.year, 
            pdf_url: finalPdfUrl,
            cover_url: finalCoverUrl,
            content_json: finalHtmlContent ? {
              en: { title: formData.title, chapter: "Interactive Content", body: finalHtmlContent }
            } : null
          }
        ]);

      if (dbError) throw dbError;

      setMessage('Asset published successfully! ✨');
      setHtmlContent('');
      setPdfFile(null);
      setHtmlFile(null);
      setCoverFile(null);
      setCoverPreview(null);
      setFormData({ title: '', author: '', year: '' });
      fetchAssets();
      setActiveTab('manage');
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
        <header className="admin-header-modern">
          <div className="admin-title-area">
            <h1 className="hero-display-title">Admin <span>Dashboard</span></h1>
            <p className="admin-subtitle">Control Center for Imperial Archives</p>
          </div>
          <div className="admin-nav-tabs glass-panel">
            <button className={activeTab === 'new' ? 'active' : ''} onClick={() => setActiveTab('new')}>
              <Plus size={18} /> New Broadcast
            </button>
            <button className={activeTab === 'manage' ? 'active' : ''} onClick={() => setActiveTab('manage')}>
              <LayoutDashboard size={18} /> Manage Assets
            </button>
          </div>
        </header>

        {activeTab === 'new' ? (
          <section className="broadcast-zone animate-reveal">
            <form onSubmit={handlePush} className="admin-form-modern">
              <div className="form-split">
                <div className="form-left">
                  <div className="form-section glass-panel">
                    <h3>1. Basic Information</h3>
                    <div className="input-group">
                      <input 
                        type="text" 
                        placeholder="Asset Title (e.g. Market Intelligence Report Q4)" 
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="admin-input-gold"
                        required
                      />
                      <div className="input-row">
                        <input 
                          type="text" 
                          placeholder="Author / Organization" 
                          value={formData.author}
                          onChange={(e) => setFormData({...formData, author: e.target.value})}
                          className="admin-input-gold"
                        />
                        <input 
                          type="text" 
                          placeholder="Release Year" 
                          value={formData.year}
                          onChange={(e) => setFormData({...formData, year: e.target.value})}
                          className="admin-input-gold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-section glass-panel">
                    <h3>2. Digital Files</h3>
                    <div className="dual-file-grid">
                      <div className={`file-card ${pdfFile ? 'selected' : ''}`}>
                        <FileText size={24} />
                        <div className="file-info">
                          <span>{pdfFile ? pdfFile.name : "Direct PDF File"}</span>
                          <p>Standard document download</p>
                        </div>
                        <input type="file" accept=".pdf" onChange={(e) => setPdfFile(e.target.files[0])} />
                      </div>
                      <div className={`file-card ${htmlFile ? 'selected' : ''}`}>
                        <Code size={24} />
                        <div className="file-info">
                          <span>{htmlFile ? htmlFile.name : "Interactive HTML"}</span>
                          <p>Live read online view</p>
                        </div>
                        <input type="file" accept=".html" onChange={(e) => setHtmlFile(e.target.files[0])} />
                      </div>
                    </div>
                    <div className="manual-html">
                      <label>Or Paste HTML Manually</label>
                      <textarea 
                        className="html-textarea-gold"
                        placeholder="<div>Raw HTML content here...</div>"
                        value={htmlContent}
                        onChange={(e) => setHtmlContent(e.target.value)}
                        rows="6"
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="form-right">
                  <div className="form-section glass-panel sticky-preview">
                    <h3>3. Visual Identity</h3>
                    <div className="cover-upload-area">
                      {coverPreview ? (
                        <div className="cover-preview-box">
                          <img src={coverPreview} alt="Preview" />
                          <button type="button" className="btn-remove-p" onClick={() => {setCoverPreview(null); setCoverFile(null);}}>Change</button>
                        </div>
                      ) : (
                        <div className="cover-placeholder">
                          <ImageIcon size={48} />
                          <p>Upload Cover Photo</p>
                          <span className="hint">Recommended: 400 x 600px</span>
                          <input type="file" accept="image/*" onChange={handleCoverChange} />
                        </div>
                      )}
                    </div>
                    
                    <button type="submit" className="btn-broadcast-p" disabled={uploading}>
                      {uploading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                      {uploading ? 'Publishing...' : 'Broadcast Asset'}
                    </button>
                    {message && <p className="status-msg-p">{message}</p>}
                  </div>
                </div>
              </div>
            </form>
          </section>
        ) : (
          <section className="management-zone animate-reveal">
            <div className="asset-data-grid">
              {assets.map(asset => (
                <div key={asset.id} className="manage-asset-card glass-panel">
                  <div className="manage-cover">
                    {asset.cover_url ? <img src={asset.cover_url} alt="" /> : <div className="no-cover"><FileIcon size={32} /></div>}
                  </div>
                  <div className="manage-details">
                    <h4>{asset.title}</h4>
                    <p>{asset.author} • {asset.year}</p>
                    <div className="manage-badges">
                      {asset.pdf_url && <span className="m-badge pdf">PDF</span>}
                      {asset.content_json && <span className="m-badge html">HTML</span>}
                    </div>
                  </div>
                  <button className="btn-delete-p" onClick={() => handleDelete(asset.id)}>
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {assets.length === 0 && <div className="empty-manage glass-panel">No assets distributed yet.</div>}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
