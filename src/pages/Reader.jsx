import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Languages } from 'lucide-react';
import './Reader.css';

const CONTENT = {
  en: {
    title: "Tramways of Old Calcutta",
    chapter: "Chapter I: The Arrival of the Steel Giants",
    body: "In the late 19th century, Calcutta witnessed a revolution in public transport...",
    infographicLabel: "Timeline of First Trams"
  },
  bn: {
    title: "পুরানো কলকাতার ট্রামওয়ে",
    chapter: "প্রথম অধ্যায়: ইস্পাতের দৈত্যের আগমন",
    body: "ঊনবিংশ শতাব্দীর শেষের দিকে, কলকাতা গণপরিবহনে এক বিপ্লবের সাক্ষী হয়েছিল...",
    infographicLabel: "প্রথম ট্রামের সময়রেখা"
  },
  hi: {
    title: "पुराने कलकत्ता के ट्रामवे",
    chapter: "अध्याय I: स्टील दिग्गजों का आगमन",
    body: "19वीं सदी के अंत में, कलकत्ता ने सार्वजनिक परिवहन में एक क्रांति देखी...",
    infographicLabel: "पहली ट्राम की समयरेखा"
  }
};

export default function Reader() {
  const { id } = useParams();
  const [lang, setLang] = useState('en');

  const content = CONTENT[lang];

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
            <p>{content.body.substring(1)} The horse-drawn trams paved the way for the electric networks we see today. The streets buzzed with the sound of the bell, echoing through the colonial architecture of Dalhousie Square.</p>
            <p>This digital asset brings to light previously unseen sketches of the early routes mapping Esplanade to Sealdah.</p>
          </div>

          <figure className="infographic zoom-in-animate">
            <div className="interactive-timeline">
              <div className="timeline-item">
                <span className="year">1873</span>
                <span className="event">First Horse Tram</span>
              </div>
              <div className="timeline-item">
                <span className="year">1902</span>
                <span className="event">Electric Tramways</span>
              </div>
            </div>
            <figcaption>{content.infographicLabel}</figcaption>
          </figure>
          
        </article>
      </main>
    </div>
  );
}
