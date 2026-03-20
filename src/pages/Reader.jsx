import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Languages, Loader2, Download, FileText, Share2, BookOpen, Eye, AlertCircle, Sparkles, GraduationCap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ArchiveSeal, YellowTaxi, HowrahBridge } from '../components/HeritageIcons';
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
    <div className="reader-layout-ios-loading">
      <div className="loading-heritage">
        <HowrahBridge size={200} className="bridge-glow" />
        <Loader2 className="animate-spin" size={48} color="var(--color-accent-amber)" />
        <p>Opening the Imperial Vault...</p>
      </div>
    </div>
  );

  if (error || !asset) return (
    <div className="reader-layout-ios-error">
      <AlertCircle size={48} color="var(--color-imperial-red)" />
      <h2>Archive Unavailable</h2>
      <p>{error}</p>
      <Link to="/" className="btn-ios-back-home">Return to Library</Link>
    </div>
  );

  const content = (asset.content_json && asset.content_json[lang]) || {
    title: asset.title || "Untitled Document",
    chapter: "Archive",
    body: "Interactive summary not available."
  };

  const isOnlyPdf = !asset.content_json;

  return (
    <div className="reader-layout-ios">
      <header className="reader-header-ios glass-panel animate-reveal">
        <div className="header-top-row">
          <Link to="/" className="btn-ios-close"><ArrowLeft size={20} /> Library</Link>
          <div className="ios-path-badge">{asset.year || '1942'}</div>
          <button className="btn-ios-share" onClick={handleShare}>
            {shareMsg ? shareMsg : <Share2 size={20} />}
          </button>
        </div>
        <div className="header-title-row">
          <h1>{asset.title}</h1>
        </div>
      </header>

      {generating && (
        <div className="ios-overlay">
          <div className="ios-popup glass-panel">
            <Loader2 className="animate-spin" size={32} />
            <p>Exporting Digital Archive...</p>
          </div>
        </div>
      )}
      
      <main className="document-viewport-ios">
        {/* Growth Gurukul Branding Banner - Slim & Aesthetic */}
        <div className="gg-branding-banner animate-reveal">
          <div className="gg-left">
            <div className="gg-logo-pill">
              <GraduationCap size={16} />
              <span>GROWTH GURUKUL</span>
            </div>
            <div className="gg-course-info">
              <span className="gg-course-title">Real Estate Business Masterclass</span>
              <span className="gg-price">Get Certified</span>
            </div>
          </div>
          <a 
            href="https://growthgurukul.store/course/real-estate-business-masterclass" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn-gg-enroll"
          >
            Enroll Now <Sparkles size={14} />
          </a>
        </div>

        <div className="reader-frame-ios glass-panel animate-reveal">
          {/* Tram Track Motifs */}
          <div className="tram-track left"></div>
          <div className="tram-track right"></div>
          
          <div className="viewer-scroll-ios">
            {isOnlyPdf ? (
              <div className="pdf-ios-viewer">
                {asset.pdf_url ? (
                  <iframe 
                    src={`${asset.pdf_url}#toolbar=0`} 
                    title={asset.title}
                    width="100%" 
                    height="100%"
                    frameBorder="0"
                  ></iframe>
                ) : (
                  <div className="ios-viewer-error">
                    <FileText size={64} opacity="0.2" />
                    <p>Document source link missing.</p>
                  </div>
                )}
              </div>
            ) : (
              <article className="premium-doc-page-ios" ref={readerRef}>
                <header className="doc-header-ios">
                  <ArchiveSeal size={100} className="heritage-seal-ios" />
                  <div className="imperial-stamp">DOCUMENTED HERITAGE</div>
                  <h1 className="doc-title-ios">{content.title}</h1>
                  <div className="doc-meta-ios">
                    <span>{asset.author || 'Imperial Correspondent'}</span>
                    <span className="dot"></span>
                    <span>Kolkata, {asset.year || '1942'}</span>
                  </div>
                </header>

                <div className="doc-body-ios" dangerouslySetInnerHTML={{ __html: content.body }}></div>
                
                <footer className="doc-footer-ios">
                  <div className="divider-ios"></div>
                  <YellowTaxi size={40} className="taxi-footer-ios" />
                  <p>© 1925 - 2025 Imperial Calcutta Archives</p>
                </footer>
              </article>
            )}
          </div>
        </div>

        {/* Discovery System - Native iOS Style Cards */}
        <section className={`discover-section-ios animate-reveal ${suggestions.length > 0 ? 'visible' : 'hidden'}`}>
          <div className="section-title-ios">
            <Sparkles size={16} />
            <h3>More Historical Records</h3>
          </div>
          
          <div className="discover-scroll-ios">
            {suggestions.map((item) => (
              <div key={item.id} className="discover-tile-ios glass-panel" onClick={() => navigate(`/reader/${item.id}`)}>
                <div className="d-tile-img">
                  {item.cover_url ? <img src={item.cover_url} alt="" /> : <BookOpen size={24} color="var(--color-accent-gold)" opacity="0.3" />}
                </div>
                <div className="d-tile-content">
                  <h4>{item.title}</h4>
                  <div className="d-tile-btn">
                    <span>Read</span> <ArrowLeft size={14} style={{ transform: 'rotate(180deg)' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Action Bar Mobile - iOS style floating bar for download/lang */}
        <div className="floating-actions-ios glass-panel animate-reveal">
          {(asset.pdf_url || asset.content_json) && (
            <button className="ios-action-btn" onClick={handleDownload} disabled={generating}>
              <Download size={20} />
              <span>{asset.pdf_url ? 'Original PDF' : 'Get PDF'}</span>
            </button>
          )}
          
          {!isOnlyPdf && (
            <div className="ios-lang-pill">
              <Languages size={18} />
              <select value={lang} onChange={(e) => setLang(e.target.value)}>
                <option value="en">English</option>
                <option value="bn">Bengali</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
