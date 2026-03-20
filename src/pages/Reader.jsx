import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Languages, Loader2, Download, CheckCircle } from 'lucide-react';
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
    // If redirected with ?download=true, trigger download once loaded
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
    setGenerating(true);

    const fileName = `${asset.title.replace(/\s+/g, '_')}.pdf`;

    try {
      // 1. Check if cached PDF exists
      const { data: existingPdf } = await supabase.storage
        .from('pdf-assets')
        .list('cached-pdfs', { search: fileName });

      if (existingPdf && existingPdf.length > 0) {
        // Download existing
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
        const { error: uploadError } = await supabase.storage
          .from('pdf-assets')
          .upload(`cached-pdfs/${fileName}`, pdfBlob, {
            contentType: 'application/pdf',
            upsert: true
          });

        if (uploadError) console.error('Failed to cache PDF:', uploadError);

        // 4. Update Asset in DB (optional: save the cached URL)
        await supabase.from('assets').update({ pdf_url: fileName }).eq('id', id);

        // 5. Save locally for user
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
            {generating ? 'Generating PDF...' : 'Download PDF'}
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
            <p>We are converting this interactive HTML into a high-quality PDF for your archive.</p>
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
            <p>© 2025 Imperial Calcutta Archives - Digitized Assets</p>
          </footer>
        </article>
      </main>
    </div>
  );
}
