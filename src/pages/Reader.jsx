import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Languages, Loader2, Download, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import html2pdf from 'html2pdf.js';
import './Reader.css';

export default function Reader() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [lang, setLang] = useState('en');
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const readerRef = useRef();

  useEffect(() => {
    fetchAsset();
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

  const handleDownload = async () => {
    if (!asset) return;
    
    // If direct PDF exists, just open it
    if (asset.pdf_url && !searchParams.get('download')) {
      window.open(asset.pdf_url, '_blank');
      return;
    }

    setGenerating(true);
    const fileName = `${asset.title.replace(/\s+/g, '_')}.pdf`;

    try {
      // 1. Check if cached PDF exists
      const { data: existingPdf } = await supabase.storage
        .from('pdf-assets')
        .list('cached-pdfs', { search: fileName });

      if (existingPdf && existingPdf.length > 0) {
        const { data: { publicUrl } } = supabase.storage
          .from('pdf-assets')
          .getPublicUrl(`cached-pdfs/${fileName}`);
        window.open(publicUrl, '_blank');
      } else {
        // 2. Generate PDF from HTML
        const element = readerRef.current;
        const opt = {
          margin: 1,
          filename: fileName,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        const pdfBlob = await html2pdf().from(element).set(opt).output('blob');

        // 3. Cache to Supabase
        await supabase.storage
          .from('pdf-assets')
          .upload(`cached-pdfs/${fileName}`, pdfBlob, {
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

  // If NO HTML content exists but there IS a PDF, we might want to show a PDF viewer or message
  if (!asset.content_json && asset.pdf_url) {
    return (
      <div className="reader-layout-modern pdf-only">
        <header className="reader-top-bar glass-panel">
          <Link to="/" className="btn-back"><ArrowLeft size={18} /> Exit</Link>
          <div className="asset-path">{asset.title} (PDF)</div>
        </header>
        <div className="pdf-fallback-container animate-reveal">
          <div className="fallback-card glass-panel">
            <FileText size={64} color="var(--color-accent-amber)" />
            <h2>Document Available as PDF</h2>
            <p>This asset is currently only available in PDF format for download.</p>
            <button className="btn-premium" onClick={() => window.open(asset.pdf_url, '_blank')}>
              Open PDF Document
            </button>
          </div>
        </div>
      </div>
    );
  }

  const content = (asset.content_json && asset.content_json[lang]) || {
    title: asset.title,
    chapter: "Archive",
    body: "Content not available."
  };

  return (
    <div className="reader-layout-modern">
      <header className="reader-top-bar glass-panel animate-reveal">
        <div className="top-bar-left">
          <Link to="/" className="btn-back"><ArrowLeft size={18} /> Exit Archives</Link>
          <div className="asset-path">Collection / {asset.title}</div>
        </div>
        
        <div className="top-bar-right">
          <button className="btn-action-gold" onClick={handleDownload} disabled={generating}>
            {generating ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
            {generating ? 'Processing...' : (asset.pdf_url ? 'Download Original PDF' : 'Generate PDF')}
          </button>
          
          <div className="lang-selector-premium">
            <Languages size={16} />
            <select value={lang} onChange={(e) => setLang(e.target.value)}>
              <option value="en">English</option>
              <option value="bn">বাংলা</option>
              <option value="hi">हिंदी</option>
            </select>
          </div>
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
      
      <main className="document-viewport">
        <article className="premium-doc-page animate-reveal" ref={readerRef}>
          <header className="doc-header">
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
          </footer>
        </article>
      </main>
    </div>
  );
}
