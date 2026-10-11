import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page-wrapper not-found">
      <h1>Page not found</h1>
      <p>Sorry, we couldn't find that page. Try going back to the homepage.</p>
      <Link className="primary-button" to="/">Return home</Link>
    </div>
  );
}
