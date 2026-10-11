import { useState } from 'react';
import { FaStar, FaArrowLeft, FaUser } from 'react-icons/fa';

const RATINGS_DATA = {
  average: 4.76,
  total: 342,
  breakdown: { 5: 240, 4: 72, 3: 22, 2: 6, 1: 2 },
};

const RECENT_FEEDBACK = [
  { name: 'Amara O.', rating: 5, comment: 'Great driver, very professional!', date: 'Today' },
  { name: 'Tunde B.', rating: 4, comment: 'Smooth ride, clean car.', date: 'Yesterday' },
  { name: 'Folake A.', rating: 5, comment: 'Arrived early and very courteous.', date: 'Jun 3, 2026' },
  { name: 'Chidi M.', rating: 3, comment: 'Took a slightly longer route.', date: 'Jun 2, 2026' },
  { name: 'Simi K.', rating: 5, comment: 'Best driver in Lagos!', date: 'Jun 1, 2026' },
];

export default function DriverRatings({ onBack }) {
  const [tab, setTab] = useState('all');

  const maxCount = Math.max(...Object.values(RATINGS_DATA.breakdown));
  const total = RATINGS_DATA.total;

  return (
    <div className="dms-page">
      <div className="dms-header">
        <button className="dms-back-btn" onClick={onBack}><FaArrowLeft /></button>
        <h2 className="dms-title"><FaStar /> Ratings</h2>
      </div>

      <div className="dms-rating-hero glass-card">
        <div className="dms-rating-big">{RATINGS_DATA.average}</div>
        <div className="dms-rating-stars">
          {[1, 2, 3, 4, 5].map(s => (
            <FaStar key={s} className={s <= Math.round(RATINGS_DATA.average) ? 'filled' : 'empty'} />
          ))}
        </div>
        <div className="dms-rating-total">{total} ratings</div>
      </div>

      <div className="dms-rating-breakdown">
        {[5, 4, 3, 2, 1].map(star => (
          <div key={star} className="dms-break-row">
            <span className="dms-break-label">{star}</span>
            <FaStar className="dms-break-star" />
            <div className="dms-break-bar-bg">
              <div className="dms-break-bar-fill" style={{ width: `${(RATINGS_DATA.breakdown[star] / maxCount) * 100}%` }} />
            </div>
            <span className="dms-break-count">{RATINGS_DATA.breakdown[star]}</span>
          </div>
        ))}
      </div>

      <div className="dms-section-title">Recent Feedback</div>
      <div className="dms-feedback-list">
        {RECENT_FEEDBACK.map((fb, i) => (
          <div key={i} className="dms-feedback-card glass-card">
            <div className="dms-fb-header">
              <div className="dms-fb-avatar"><FaUser /></div>
              <div>
                <div className="dms-fb-name">{fb.name}</div>
                <div className="dms-fb-date">{fb.date}</div>
              </div>
              <div className="dms-fb-rating">
                {[1, 2, 3, 4, 5].map(s => (
                  <FaStar key={s} className={s <= fb.rating ? 'filled' : 'empty'} size={12} />
                ))}
              </div>
            </div>
            {fb.comment && <div className="dms-fb-comment">"{fb.comment}"</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
