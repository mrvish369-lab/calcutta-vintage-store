import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { Download, Eye, Loader2, Sparkles, BookOpen, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './StoreFront.css';

export default function StoreFront() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="store-bg">
      <div className="bg-grain"></div>
      <Header />
      
      <main className="store-main container">
        <section className="hero-modern animate-reveal">
          <div className="hero-glass glass-panel">
            <span className="badge-vintage"><Sparkles size={14} /> Established 1920</span>
            <h1 className="hero-display-title">Imperial <br/><span>Calcutta</span> Archives</h1>
            <p className="hero-description">
              A premium repository of rare West Bengal manuscripts, real estate market insights, 
              and historical digital assets. Curated with precision, delivered with elegance.
            </p>
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
    </div>
  );
}
