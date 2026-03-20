import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Languages, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Reader.css';

export default function Reader() {
  const { id } = useParams();
  const [lang, setLang] = useState('en');
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAsset();
  }, [id]);

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

  if (loading) return <div className="reader-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" size={64} /></div>;

  if (!asset) return <div className="reader-layout">Asset not found.</div>;

  const content = (asset.content_json && asset.content_json[lang]) || {
    title: asset.title,
    chapter: "N/A",
    body: "Content not available in this language.",
    infographicLabel: "N/A"
  };

  return (
    <div className="reader-layout">
      <header className="reader-header glass-panel">
        <Link to="/" className="back-link"><ArrowLeft size={20} /> Back to Collection</Link>
        <div className="lang-toggle">
          <Languages size={20} />
          <select value={lang} onChange={(e) => setLang(e.target.value)} className="lang-select">
            <option value="en">English</option>
            <option value="bn">বাংলা (Bengali)</option>
            <option value="hi">हिंदी (Hindi)</option>
          </select>
        </div>
      </header>
      
      <main className="reader-content animate-fade-in-up">
        <article className="vintage-page">
          <h1 className="page-title">{content.title}</h1>
          <hr className="ornate-divider" />
          <h2 className="chapter-title">{content.chapter}</h2>
          
          <div className="text-body">
            <p className="drop-cap">{content.body.charAt(0)}</p>
            <p>{content.body.substring(1)}</p>
          </div>

          <figure className="infographic zoom-in-animate">
            <div className="interactive-timeline">
              <div className="timeline-item">
                <span className="year">PDF</span>
                <span className="event">Verifiable Asset</span>
              </div>
              <div className="timeline-item">
                <span className="year">LIVE</span>
                <span className="event">Market Updates</span>
              </div>
            </div>
            <figcaption>Interactive Timeline for {asset.title}</figcaption>
          </figure>
          
        </article>
      </main>
    </div>
  );
}
