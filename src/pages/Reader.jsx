import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Languages, Loader2, Download, FileText, Share2, BookOpen, Eye, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ArchiveSeal, YellowTaxi } from '../components/HeritageIcons';
import html2pdf from 'html2pdf.js';
import './Reader.css';

export default function Reader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [lang, setLang] = useState('en');
  const [asset, setAsset] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [shareMsg, setShareMsg] = useState('');
  const [error, setError] = useState(null);
  const readerRef = useRef();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([fetchAsset(), fetchSuggestions()]);
      } catch (err) {
        console.error("Reader data load error:", err);
        setError("Failed to load archive data. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (!loading && asset && searchParams.get('download') === 'true') {
      handleDownload();
    }
  }, [loading, asset]);

  async function fetchAsset() {
    const { data, fetchError } = await supabase
      .from('assets')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;
    if (!data) throw new Error("Asset not found");
    setAsset(data);
  }

  async function fetchSuggestions() {
    const { data, fetchError } = await supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (!fetchError && data) {
      const filtered = data.filter(item => item.id !== id).slice(0, 3);
      setSuggestions(filtered);
    }
  }

  const handleShare = () => {
    try {
      const url = window.location.href;
      navigator.clipboard.writeText(url);
      setShareMsg('Link Copied! 🏛️');
      setTimeout(() => setShareMsg(''), 3000);
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  const handleDownload = async () => {
    if (!asset) return;
    if (asset.pdf_url && !searchParams.get('download')) {
      window.open(asset.pdf_url, '_blank');
      return;
    }

    setGenerating(true);
    const fileName = `${(asset.title || 'asset').replace(/\s+/g, '_')}.pdf`;

    try {
      const { data: existingPdf } = await supabase.storage
        .from('pdf-assets')
        .list('cached-pdfs', { search: fileName });

      if (existingPdf && existingPdf.length > 0) {
        const { data: { publicUrl } } = supabase.storage
          .from('pdf-assets')
          .getPublicUrl(`cached-pdfs/${fileName}`);
        window.open(publicUrl, '_blank');
      } else {
        const element = readerRef.current;
        if (!element) throw new Error("Document element not found for PDF generation");
        
        const opt = {
          margin: 1,
          filename: fileName,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        const pdfBlob = await html2pdf().from(element).set(opt).output('blob');
        await supabase.storage.from('pdf-assets').upload(`cached-pdfs/${fileName}`, pdfBlob, {
          contentType: 'application/pdf',
          upsert: true
        });
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
      }
    } catch (err) {
      console.error('PDF Generation failed:', err);
      alert("PDF Generation failed. Please try viewing the original PDF if available.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return (
    <div className="reader-layout-modern-loading">
      <Loader2 className="animate-spin" size={64} color="var(--color-accent-gold)" />
    </div>
  );

  if (error || !asset) return (
    <div className="reader-layout-modern-error">
      <AlertCircle size={48} color="var(--color-imperial-red)" />
      <h2>Archive Unavailable</h2>
      <p>{error || "The manuscript you are looking for does not exist in our archives."}</p>
      <Link to="/" className="btn-back mt-4">Return to Storefront</Link>
    </div>
  );

  const content = (asset.content_json && asset.content_json[lang]) || {
    title: asset.title || "Untitled Archive",
    chapter: "Archive",
    body: "Interactive transcript not available for this manuscript."
  };

  const isOnlyPdf = !asset.content_json;

  return (
    <div className="reader-layout-modern">
      <header className="reader-top-bar glass-panel animate-reveal">
        <div className="top-bar-left">
          <Link to="/" className="btn-back"><ArrowLeft size={18} /> Close</Link>
          <div className="asset-path">Archives / {asset.title}</div>
        </div>
        
        <div className="top-bar-right">
          <button className="btn-share-gold" onClick={handleShare}>
            {shareMsg ? shareMsg : <><Share2 size={16} /> Share Archive</>}
          </button>
          
          {(asset.pdf_url || asset.content_json) && (
            <button className="btn-action-gold" onClick={handleDownload} disabled={generating}>
              {generating ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
              {asset.pdf_url ? 'Original PDF' : 'Generate PDF'}
            </button>
          )}
          
          {!isOnlyPdf && (
            <div className="lang-selector-premium">
              <Languages size={16} />
              <select value={lang} onChange={(e) => setLang(e.target.value)}>
                <option value="en">English</option>
                <option value="bn">বাংলা</option>
                <option value="hi">हिंदी</option>
              </select>
            </div>
          )}
        </div>
      </header>

      {generating && (
        <div className="generation-overlay">
          <div className="gen-popup glass-panel">
            <Loader2 className="animate-spin" size={32} />
            <h3>Processing Document...</h3>
            <p>Finalizing the high-quality digital copy.</p>
          </div>
        </div>
      )}
      
      <main className="document-viewport reader-discovery-layout">
        <div className="reader-main-content">
          {isOnlyPdf ? (
            <div className="pdf-fallback-container animate-reveal">
              <div className="fallback-card glass-panel">
                <ArchiveSeal className="seal-animated" size={80} />
                <FileText size={64} color="var(--color-accent-amber)" />
                <h2>Document Available as PDF</h2>
                <p>This historical manuscript is currently preserved as a direct PDF document.</p>
                {asset.pdf_url ? (
                  <button className="btn-premium-gold" onClick={() => window.open(asset.pdf_url, '_blank')}>
                    Open Original Manuscript
                  </button>
                ) : (
                  <p className="mt-4 italic opacity-50">Document link missing. Contact administrator.</p>
                )}
              </div>
            </div>
          ) : (
            <article className="premium-doc-page animate-reveal" ref={readerRef}>
              <header className="doc-header">
                <ArchiveSeal className="doc-seal-heritage" size={120} />
                <div className="doc-seal">IMPERIAL ARCHIVES</div>
                <h1 className="doc-title">{content.title}</h1>
                <div className="doc-meta">
                  <span>{asset.author || 'Imperial Correspondent'}</span>
                  <span className="dot"></span>
                  <span>Kolkata, {asset.year || '2025'}</span>
                </div>
              </header>

              <div className="doc-body-grid">
                <div className="doc-column-main" dangerouslySetInnerHTML={{ __html: content.body }}></div>
              </div>
              
              <footer className="doc-footer">
                <div className="footer-line"></div>
                <p>© 2025 Imperial Calcutta Archives</p>
                <YellowTaxi className="footer-taxi-mini" size={40} />
              </footer>
            </article>
          )}
        </div>

        <section className={`discover-archives-section animate-reveal ${suggestions.length > 0 ? 'visible' : 'hidden'}`}>
          <div className="section-header-mini">
            <div className="dec-line"></div>
            <h3>Explore Related Manuscripts</h3>
            <div className="dec-line"></div>
          </div>
          
          <div className="discover-grid">
            {suggestions.map((item) => (
              <div key={item.id} className="discover-card glass-panel" onClick={() => navigate(`/reader/${item.id}`)}>
                <div className="d-cover">
                  {item.cover_url ? <img src={item.cover_url} alt="" /> : <BookOpen size={24} color="var(--color-accent-amber)" opacity="0.3" />}
                </div>
                <div className="d-info">
                  <h4>{item.title}</h4>
                  <p>{item.author} • {item.year}</p>
                  <button className="btn-d-view"><Eye size={12}/> Dive In</button>
                </div>
              </div>
            ))}
            {suggestions.length === 0 && (
              <div className="discover-empty glass-panel">
                <Sparkles size={16} color="var(--color-accent-gold)" />
                <p>Enhance the collection by adding more archives to the library.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
