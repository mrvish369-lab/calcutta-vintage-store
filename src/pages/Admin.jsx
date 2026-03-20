import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Upload, Plus, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Admin.css';

export default function Admin() {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [assets, setAssets] = useState([]);
  const [formData, setFormData] = useState({ title: '', author: '', year: '' });
  const [file, setFile] = useState(null);
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

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave" || e.type === "drop") setDragActive(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !formData.title) {
      setMessage('Please provide a title and select a PDF file.');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      // 1. Upload PDF to Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `pdfs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('pdf-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('pdf-assets')
        .getPublicUrl(filePath);

      // 3. Save Metadata to DB
      const { error: dbError } = await supabase
        .from('assets')
        .insert([
          { 
            title: formData.title, 
            author: formData.author, 
            year: formData.year, 
            pdf_url: publicUrl,
            content_json: {
              en: { title: formData.title, chapter: "Interactive Reader Content", body: `This is the digital version of ${formData.title}. The full interactive content can be configured here.` },
              bn: { title: formData.title, chapter: "ইন্টারেক্টিভ রিডার", body: "বাংলা ভাষায় পাঠ্য শীঘ্রই আসছে।" },
              hi: { title: formData.title, chapter: "इंटरएक्टिव रीडर", body: "हिंदी भाषा में पाठ जल्द ही आ रहा है।" }
            } 
          }
        ]);

      if (dbError) throw dbError;

      setMessage('Asset uploaded successfully!');
      setFile(null);
      setFormData({ title: '', author: '', year: '' });
      fetchAssets();
    } catch (error) {
      console.error('Upload failed:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-layout">
      <Header />
      
      <main className="admin-main container animate-fade-in-up">
        <header className="admin-header">
          <h1>Admin Dashboard</h1>
        </header>

        <section className="upload-section">
          <h2>Push New Asset</h2>
          <div className="admin-grid">
            <form onSubmit={handleUpload} className="upload-form">
              <div className="form-group">
                <input 
                  type="text" 
                  placeholder="Asset Title (e.g. Real Estate Report)" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="admin-input"
                  required
                />
                <input 
                  type="text" 
                  placeholder="Author/Source" 
                  value={formData.author}
                  onChange={(e) => setFormData({...formData, author: e.target.value})}
                  className="admin-input"
                />
                <input 
                  type="text" 
                  placeholder="Year" 
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                  className="admin-input"
                />
              </div>

              <div 
                className={`upload-zone ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={(e) => {
                  handleDrag(e);
                  if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
                }}
              >
                {file ? <CheckCircle size={48} color="var(--color-tram-red)" /> : <Upload size={48} className="upload-icon" />}
                <p>{file ? file.name : "Drag and drop PDF, or click to browse"}</p>
                <input type="file" className="file-input" accept=".pdf" onChange={handleFileChange} disabled={uploading} />
              </div>

              <button type="submit" className="btn-primary push-btn" disabled={uploading}>
                {uploading ? <Loader2 className="animate-spin" /> : <Plus size={18} />}
                {uploading ? 'Uploading...' : 'Push Update to Users'}
              </button>
              {message && <p className="status-msg">{message}</p>}
            </form>
          </div>
        </section>

        <section className="asset-list glass-panel" style={{ padding: '2rem' }}>
          <h2>Live Archives</h2>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Asset Name</th>
                  <th>Date Added</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {assets.map(asset => (
                  <tr key={asset.id}>
                    <td><FileText size={16} /> {asset.title}</td>
                    <td>{new Date(asset.created_at).toLocaleDateString()}</td>
                    <td><span className="status-badge live">PDF + HTML</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
