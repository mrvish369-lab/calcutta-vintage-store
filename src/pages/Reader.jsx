import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Languages, Loader2, Download, FileText, Share2, BookOpen, Eye } from 'lucide-react';
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
  const readerRef = useRef();

  useEffect(() => {
    fetchAsset();
    fetchSuggestions();
  }, [id]);

  useEffect(() => {
    if (!loading && asset && searchParams.get('download') === 'true') {
      handleDownload();
    }
  }, [loading, asset]);

  async function fetchAsset() {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) console.error('Error fetching asset:', error);
    else setAsset(data);
    setLoading(false);
  }

  async function fetchSuggestions() {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .neq('id', id)
      .limit(3)
      .order('created_at', { ascending: false });
    
    if (error) console.error('Error fetching suggestions:', error);
    else setSuggestions(data || []);
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
    const fileName = `${asset.title.replace(/\s+/g, '_')}.pdf`;

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
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="reader-layout-modern-loading"><Loader2 className="animate-spin" size={64} /></div>;

  if (!asset) return <div className="reader-layout-modern">Asset not found.</div>;

  const content = (asset.content_json && asset.content_json[lang]) || {
    title: asset.title,
    chapter: "Archive",
    body: "Content not available."
  };

  const isOnlyPdf = !asset.content_json && asset.pdf_url;

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
          
          <button className="btn-action-gold" onClick={handleDownload} disabled={generating}>
            {generating ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
            {asset.pdf_url ? 'Original PDF' : 'Generate PDF'}
          </button>
          
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
      
      <main className="document-viewport Discover-Discover">
        {isOnlyPdf ? (
          <div className="pdf-fallback-container animate-reveal">
            <div className="fallback-card glass-panel">
              <ArchiveSeal className="seal-animated" size={80} />
              <FileText size={64} color="var(--color-accent-amber)" />
              <h2>Document Available as PDF</h2>
              <p>This asset is currently only available in PDF format for direct download.</p>
              <button className="btn-premium" onClick={() => window.open(asset.pdf_url, '_blank')}>
                Open PDF Document
              </button>
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

        {/* RELEVANT SUGGESTIONS AT THE BOTTOM */}
        {suggestions.length > 0 && (
          <section className="discover-archives-section animate-reveal">
            <div className="section-header-mini">
              <div className="dec-line"></div>
              <h3>Explore Related Manuscripts</h3>
              <div className="dec-line"></div>
            </div>
            
            <div className="discover-grid">
              {suggestions.map((item) => (
                <div key={item.id} className="discover-card glass-panel" onClick={() => {navigate(`/reader/${item.id}`); window.scrollTo(0,0);}}>
                  <div className="d-cover">
                    {item.cover_url ? <img src={item.cover_url} alt="" /> : <FileText size={24} />}
                  </div>
                  <div className="d-info">
                    <h4>{item.title}</h4>
                    <p>{item.author} • {item.year}</p>
                    <button className="btn-d-view"><Eye size={12}/> View</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
