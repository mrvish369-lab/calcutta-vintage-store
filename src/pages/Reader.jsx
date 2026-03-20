import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Languages, Loader2, Download, FileText, Share2, BookOpen, Eye, AlertCircle, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ArchiveSeal, YellowTaxi } from '../components/HeritageIcons';
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
        const { data, fetchError } = await supabase
          .from('assets')
          .select('*')
          .eq('id', id)
          .single();
        
        if (fetchError) throw fetchError;
        if (!data) throw new Error("Manuscript not found in the Imperial Archives.");
        
        setAsset(data);
        await fetchSuggestions(data.id);
      } catch (err) {
        console.error("Reader Data Load Error:", err);
        setError(err.message);
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

  async function fetchSuggestions(currentId) {
    try {
      const { data, fetchError } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (!fetchError && data) {
        const filtered = data.filter(item => item.id !== currentId).slice(0, 3);
        setSuggestions(filtered);
      }
    } catch (err) {
      console.warn("Suggestions fetch failed.");
    }
  }

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setShareMsg('Link Copied! 🏛️');
    setTimeout(() => setShareMsg(''), 3000);
  };

  const handleDownload = async () => {
    if (!asset) return;
    if (asset.pdf_url && !searchParams.get('download')) {
      window.open(asset.pdf_url, '_blank');
      return;
    }

    setGenerating(true);
    const fileName = `${(asset.title || 'manuscript').replace(/\s+/g, '_')}.pdf`;

    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = readerRef.current;
      if (!element) throw new Error("Content not available for generation.");

      const opt = {
        margin: 1,
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      await html2pdf().from(element).set(opt).save();
    } catch (err) {
      console.error('PDF Generation failed:', err);
      if (asset.pdf_url) window.open(asset.pdf_url, '_blank');
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
      <p>{error}</p>
      <Link to="/" className="btn-back" style={{ marginTop: '2rem' }}>Return to Library</Link>
    </div>
  );

  const content = (asset.content_json && asset.content_json[lang]) || {
    title: asset.title || "Untitled Document",
    chapter: "Archive",
    body: "No interactive summary available."
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
              {asset.pdf_url ? 'Original PDF' : 'Get PDF'}
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
        <div className="reader-integrated-viewer glass-panel animate-reveal">
          <div className="viewer-scroll-container">
            {isOnlyPdf ? (
              <div className="pdf-viewer-frame">
                {asset.pdf_url ? (
                  <iframe 
                    src={`${asset.pdf_url}#toolbar=0`} 
                    title={asset.title}
                    width="100%" 
                    height="100%"
                    frameBorder="0"
                  ></iframe>
                ) : (
                  <div className="viewer-error">
                    <FileText size={48} />
                    <p>Document source link is unavailable.</p>
                  </div>
                )}
              </div>
            ) : (
              <article className="premium-doc-page" ref={readerRef}>
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
        </div>

        {/* Discovery System - Now right below the viewer */}
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
          </div>
        </section>
      </main>
    </div>
  );
}
