import React from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { Download, Eye } from 'lucide-react';
import './StoreFront.css';

const MOCK_PDFS = [
  { id: 1, title: 'The Bengal Renaissance', author: 'S. Bandyopadhyay', year: '1924', cover: 'bengal-ren.jpg' },
  { id: 2, title: 'Tramways of Old Calcutta', author: 'J. Smith', year: '1930', cover: 'tramways.jpg' },
  { id: 3, title: 'Poetry of Tagore', author: 'R. Tagore', year: '1913', cover: 'tagore.jpg' },
];

export default function StoreFront() {
  const navigate = useNavigate();

  return (
    <div className="store-layout animate-fade-in-up">
      <Header />
      
      <main className="store-main">
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title animate-float">Curated Digital Archives</h1>
            <p className="hero-subtitle">
              Explore rare manuscripts, historical documents, and literature from the golden era of Calcutta.
            </p>
          </div>
        </section>

        <section className="pdf-grid-section">
          <div className="container">
            <div className="pdf-grid">
              {MOCK_PDFS.map(pdf => (
                <article key={pdf.id} className="pdf-card glass-panel">
                  <div className="pdf-cover-placeholder">
                    <span className="cover-title-overlay">{pdf.title}</span>
                  </div>
                  <div className="pdf-info">
                    <h3 className="pdf-title">{pdf.title}</h3>
                    <p className="pdf-meta">By {pdf.author} • {pdf.year}</p>
                    
                    <div className="pdf-actions">
                      <button className="btn-secondary action-btn" onClick={() => alert('Downloading PDF...')}>
                        <Download size={18} /> Download
                      </button>
                      <button className="btn-primary action-btn" onClick={() => navigate(`/reader/${pdf.id}`)}>
                        <Eye size={18} /> View Online
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
