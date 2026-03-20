import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { Download, Eye, Loader2, Sparkles, BookOpen, FileText, Share2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { HowrahBridge, YellowTaxi, CalcuttaTram } from '../components/HeritageIcons';
import './StoreFront.css';

export default function StoreFront() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

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
    setLoading(false);
  }

  const handleDownloadDirect = (url) => {
    window.open(url, '_blank');
  };

  const handleShare = (id, e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/reader/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="store-bg">
      <div className="bg-grain"></div>
      <Header />
      
      <main className="store-main container">
        <section className="hero-modern animate-reveal">
          <div className="hero-heritage-bg">
            <HowrahBridge className="bridge-motif top-right" size={300} color="rgba(212, 160, 23, 0.05)" />
            <HowrahBridge className="bridge-motif bottom-left" size={400} color="rgba(212, 160, 23, 0.03)" />
          </div>

          <div className="hero-glass glass-panel">
            <div className="hero-top">
              <span className="badge-vintage"><Sparkles size={14} /> Established 1920</span>
              <CalcuttaTram className="tram-animated" />
            </div>
            <h1 className="hero-display-title">Imperial <br/><span>Calcutta</span> Archives</h1>
            <p className="hero-description">
              A premium repository of rare West Bengal manuscripts, real estate market insights, 
              and historical digital assets. Curated with precision, delivered with elegance.
            </p>
            <div className="hero-reactive-footer">
              <YellowTaxi className="taxi-animated" />
              <div className="road-line"></div>
            </div>
          </div>
        </section>

        <section className="collection-grid">
          <div className="section-header">
            <h2 className="section-title">Latest Releases</h2>
            <div className="title-underline"></div>
          </div>

          {loading ? (
            <div className="loader-container"><Loader2 className="animate-spin" size={48} /></div>
          ) : (
            <div className="modern-grid">
              {assets.map((asset, index) => (
                <article key={asset.id} className="asset-card glass-panel" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="card-media">
                    <div className="card-overlay"></div>
                    {asset.cover_url ? (
                      <img src={asset.cover_url} alt={asset.title} className="card-cover-image" />
                    ) : (
                      <>
                        {asset.content_json ? <BookOpen className="card-icon" size={40} /> : <FileText className="card-icon" size={40} />}
                      </>
                    )}
                    <div className="card-badge">{asset.content_json ? 'Interactive' : 'Document'}</div>
                    <button className={`btn-card-share ${copiedId === asset.id ? 'active' : ''}`} onClick={(e) => handleShare(asset.id, e)}>
                      <Share2 size={16} />
                      {copiedId === asset.id && <span className="share-toast">Link Copied!</span>}
                    </button>
                  </div>
                  <div className="card-body">
                    <h3 className="asset-name">{asset.title}</h3>
                    <p className="asset-meta">By {asset.author || 'Imperial Archive'} • {asset.year || '2025'}</p>
                    
                    <div className="card-actions">
                      {asset.content_json && (
                        <button className="btn-glass-small" onClick={() => navigate(`/reader/${asset.id}`)}>
                          <Eye size={16} /> View Online
                        </button>
                      )}
                      
                      {asset.pdf_url ? (
                        <button className="btn-premium-small" onClick={() => handleDownloadDirect(asset.pdf_url)}>
                          <Download size={16} /> Get PDF
                        </button>
                      ) : (
                        asset.content_json && (
                          <button className="btn-premium-small" onClick={() => navigate(`/reader/${asset.id}?download=true`)}>
                            <Download size={16} /> Get PDF
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
          
          {!loading && assets.length === 0 && (
            <div className="empty-state glass-panel animate-reveal">
              <p>The archives are currently being updated. Check back soon for new real estate insights.</p>
            </div>
          )}
        </section>
      </main>

      <footer className="heritage-footer container">
        <div className="footer-content glass-panel">
          <div className="footer-left">
            <h3>Imperial Calcutta</h3>
            <p>Preserving history, one archive at a time.</p>
          </div>
          <CalcuttaTram className="footer-tram" size={60} />
          <div className="footer-right">
            <div className="footer-links">
              <a href="#">Archives</a>
              <a href="#">Market Intelligence</a>
              <a href="#">Legal</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
