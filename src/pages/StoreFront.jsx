import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { Download, Eye, Loader2, Sparkles, BookOpen, FileText, Share2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { CalcuttaTram, HowrahBridge } from '../components/HeritageIcons';
import './StoreFront.css';

export default function StoreFront() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssets();
  }, []);

  async function fetchAssets() {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching assets:', error);
    else setAssets(data);
    setLoading(false);
  }

  const handleOpenReader = (id) => navigate(`/reader/${id}`);

  const handleDownloadDirect = async (url, e) => {
    e.stopPropagation();
    window.open(url, '_blank');
  };

  const handleShare = (id, e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/reader/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  return (
    <div className="store-bg">
      <div className="bg-grain"></div>
      <Header />
      
      <main className="store-container animate-reveal">
        <section className="hero-ios">
          <div className="hero-content-premium">
            <HowrahBridge size={160} color="var(--color-accent-amber)" className="bridge-silhouette" />
            <div className="hero-badge">
              <Sparkles size={14} /> <span>ESTD. 1925</span>
            </div>
            <h1 className="hero-title-premium">Imperial Calcutta <span>Archives</span></h1>
            <p className="hero-subtitle-premium">Preserving the high-society history and documented heritage of the 20th-century capital.</p>
          </div>
        </section>

        <section className="archives-grid-ios">
          <div className="section-header-ios">
            <h2>The Collection</h2>
            <div className="header-meta">{assets.length} Manuscripts Found</div>
          </div>

          {loading ? (
            <div className="store-loader">
              <Loader2 className="animate-spin" size={48} color="gold" />
            </div>
          ) : (
            <div className="ios-grid">
              {assets.map((asset) => (
                <div 
                  key={asset.id} 
                  className="ios-asset-tile animate-reveal"
                  onClick={() => handleOpenReader(asset.id)}
                >
                  <div className="tile-cover-wrapper">
                    <button 
                      className={`btn-tile-share ${copiedId === asset.id ? 'active' : ''}`}
                      onClick={(e) => handleShare(asset.id, e)}
                    >
                      <Share2 size={18} />
                    </button>
                    {copiedId === asset.id && <div className="toast-mini">Copied!</div>}
                    
                    {asset.cover_url ? (
                      <img src={asset.cover_url} className="tile-cover" alt={asset.title} />
                    ) : (
                      <div className="tile-placeholder">
                        <ArchivePlaceholder type={asset.content_json ? 'HTML' : 'PDF'} />
                      </div>
                    )}
                    <div className="tile-badge-type">
                      {asset.content_json ? <BookOpen size={14} /> : <FileText size={14} />}
                      {asset.content_json ? 'Interactive' : 'Archive'}
                    </div>
                  </div>

                  <div className="tile-info">
                    <h3 className="tile-title">{asset.title}</h3>
                    <div className="tile-meta">
                      <span>{asset.author || 'Imperial Correspondent'}</span>
                      <span className="meta-dot"></span>
                      <span>{asset.year || '1942'}</span>
                    </div>
                    
                    <div className="tile-actions">
                      <button className="btn-tile-primary">
                        <Eye size={16} /> Open Manuscript
                      </button>
                      {asset.pdf_url && (
                        <button className="btn-tile-secondary" onClick={(e) => handleDownloadDirect(asset.pdf_url, e)}>
                          <Download size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="ios-store-footer">
          <CalcuttaTram className="tram-animated-ios" size={100} />
          <p>© 2025 Imperial Calcutta Archives. High-Society Digital Preservation.</p>
        </footer>
      </main>
    </div>
  );
}

function ArchivePlaceholder({ type }) {
  return (
    <div className="placeholder-content">
      <div className="placeholder-icon-ring">
        {type === 'HTML' ? <BookOpen size={40} /> : <FileText size={40} />}
      </div>
      <span className="placeholder-label">Imperial Document</span>
    </div>
  );
}
