import { Link } from 'react-router-dom';

export default function Newsroom() {
  return (
    <div className="page-wrapper">
      <section id="hero" className="hero hero-business section-padding" style={{minHeight: '40vh', display: 'flex', alignItems: 'center'}}> 
        <div className="hero-copy">
          <span className="eyebrow">Newsroom</span>
          <h1 style={{fontSize: '56px', marginBottom: '24px'}}>Latest news & announcements.</h1>
        </div>
      </section>

      {/* Featured Story */}
      <section className="section-padding" style={{paddingTop: '0'}}>
        <div style={{display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '48px', backgroundColor: 'var(--color-surface-card)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--color-border-gold)'}}>
          <div style={{minHeight: '400px', backgroundColor: '#000', backgroundImage: 'radial-gradient(circle at center, rgba(255,184,0,0.2) 0%, transparent 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="var(--color-gold)"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM5 15h14v2H5zM5 11h14v2H5zM5 7h14v2H5z"/></svg>
          </div>
          <div style={{padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
            <span style={{color: 'var(--color-gold)', fontWeight: 'bold', fontSize: '14px', marginBottom: '16px', display: 'block'}}>Press Release</span>
            <h2 style={{fontSize: '32px', marginBottom: '16px', lineHeight: '1.2'}}>Queens OS launches Freight globally, revolutionizing long-haul logistics.</h2>
            <p style={{color: 'var(--color-text-muted)', marginBottom: '32px'}}>We are thrilled to announce the global expansion of our Freight division, connecting shippers with carriers through our industry-leading matching technology.</p>
            <Link to="/freight" style={{fontWeight: 'bold', color: 'var(--color-white)', borderBottom: '1px solid var(--color-gold)', alignSelf: 'flex-start', paddingBottom: '4px'}}>Read full story</Link>
          </div>
        </div>
      </section>

      {/* Article Grid */}
      <section className="section-padding" style={{backgroundColor: 'var(--color-surface)'}}>
        <div className="section-copy" style={{marginBottom: '48px'}}>
          <h2>Recent articles</h2>
        </div>
        <div className="feature-grid">
          <div className="article-card" style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
            <div style={{height: '200px', backgroundColor: 'var(--color-black)', borderRadius: '12px', border: '1px solid var(--color-border-gold)'}}></div>
            <span style={{color: 'var(--color-gold)', fontSize: '12px', fontWeight: 'bold'}}>Company</span>
            <h3 style={{fontSize: '20px'}}>Q3 Financial Results highlight record revenue</h3>
            <p style={{color: 'var(--color-text-muted)', fontSize: '14px'}}>A detailed breakdown of our robust performance this past quarter.</p>
            <Link to="/contact-sales" style={{fontSize: '13px', color: 'var(--color-gold)', fontWeight: 600}}>Contact us for details →</Link>
          </div>
          <div className="article-card" style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
            <div style={{height: '200px', backgroundColor: 'var(--color-black)', borderRadius: '12px', border: '1px solid var(--color-border-gold)'}}></div>
            <span style={{color: 'var(--color-gold)', fontSize: '12px', fontWeight: 'bold'}}>Product</span>
            <h3 style={{fontSize: '20px'}}>Introducing the new Ride app dashboard</h3>
            <p style={{color: 'var(--color-text-muted)', fontSize: '14px'}}>We've redesigned our booking interface to make finding a ride faster than ever.</p>
            <Link to="/ride" style={{fontSize: '13px', color: 'var(--color-gold)', fontWeight: 600}}>Try it now →</Link>
          </div>
          <div className="article-card" style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
            <div style={{height: '200px', backgroundColor: 'var(--color-black)', borderRadius: '12px', border: '1px solid var(--color-border-gold)'}}></div>
            <span style={{color: 'var(--color-gold)', fontSize: '12px', fontWeight: 'bold'}}>Sustainability</span>
            <h3 style={{fontSize: '20px'}}>Our progress towards zero-emissions</h3>
            <p style={{color: 'var(--color-text-muted)', fontSize: '14px'}}>Read our annual report detailing our commitment to 100% electric rides.</p>
            <Link to="/resources/carbon-footprint" style={{fontSize: '13px', color: 'var(--color-gold)', fontWeight: 600}}>Read more →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
