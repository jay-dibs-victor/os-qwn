import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page-wrapper">
      <section id="hero" className="hero hero-business section-padding">
        <h1>Page not found</h1>
        <p>Sorry, we couldn't find that page. Try going back to the homepage.</p>
        <Link className="primary-button" to="/">Return home</Link>
      </section>
    </div>
  );
}
