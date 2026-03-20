import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Reader.css';

// Dynamic import for html2pdf to avoid bundle-time issues
const getHtml2Pdf = async () => {
  const mod = await import('html2pdf.js');
  return mod.default || mod;
};

export default function Reader() {
  const { id } = useParams();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      console.log("Reader: Loading ID", id);
      try {
        const { data, error: fetchError } = await supabase
          .from('assets')
          .select('*')
          .eq('id', id)
          .single();
        
        if (fetchError) throw fetchError;
        if (!data) throw new Error("Asset data is empty");
        
        console.log("Reader: Asset loaded", data.title);
        setAsset(data);
      } catch (err) {
        console.error("Reader Load Crash:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return (
    <div style={{ background: '#0f0f0e', color: 'gold', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <Loader2 className="animate-spin" size={48} />
      <p style={{ marginTop: '1rem', fontStyle: 'italic' }}>Opening Imperial Archives...</p>
    </div>
  );

  if (error || !asset) return (
    <div style={{ background: '#0f0f0e', color: 'white', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '20px' }}>
      <AlertCircle size={48} color="red" />
      <h2 style={{ margin: '1rem 0' }}>Archive unavailable</h2>
      <p style={{ opacity: 0.6 }}>{error || "Manuscript not found."}</p>
      <Link to="/" style={{ color: 'gold', marginTop: '2rem' }}>← Back to Collection</Link>
    </div>
  );

  return (
    <div className="reader-layout-modern" style={{ color: 'white' }}>
      <header className="reader-top-bar glass-panel" style={{ position: 'fixed', top: '1rem', left: '1rem', right: '1rem', zIndex: 1000 }}>
        <div className="top-bar-left" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" className="btn-back"><ArrowLeft size={18} /> Close</Link>
          <span style={{ opacity: 0.5 }}>{asset.title}</span>
        </div>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '10rem', paddingBottom: '10rem' }}>
        <div className="premium-doc-page" style={{ background: '#fffcf5', color: '#1a1a1a', padding: '4rem', borderRadius: '8px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', textAlign: 'center' }}>{asset.title}</h1>
          <p style={{ textAlign: 'center', opacity: 0.5, marginBottom: '4rem' }}>By {asset.author || 'Imperial Archive'} • {asset.year || '2025'}</p>
          
          <div style={{ fontSize: '1.2rem', lineHeight: '1.8' }}>
            {asset.content_json ? (
              <div dangerouslySetInnerHTML={{ __html: asset.content_json.en?.body || "Transcription error" }} />
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                <p>This manuscript is a PDF document.</p>
                {asset.pdf_url && (
                  <a href={asset.pdf_url} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '2rem', padding: '1rem 2.5rem', background: '#d4a017', color: 'black', borderRadius: '50px', fontWeight: 'bold', textDecoration: 'none' }}>
                    Open PDF Document
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Minimal Suggestions */}
        <section style={{ marginTop: '6rem' }}>
          <h3 style={{ color: '#d4a017', marginBottom: '2rem', textAlign: 'center' }}>Keep Exploring</h3>
          <p style={{ textAlign: 'center', opacity: 0.3 }}>Discovery system is being re-indexed. Check back soon for related works.</p>
        </section>
      </main>
    </div>
  );
}
