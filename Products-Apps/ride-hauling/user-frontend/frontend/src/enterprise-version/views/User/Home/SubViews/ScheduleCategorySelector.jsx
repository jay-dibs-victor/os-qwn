import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const categories = [
  { 
    id: 'road', 
    title: 'Road Trip', 
    desc: 'Plan a long distance or multi-stop journey.', 
    icon: '🚗',
    color: '#FFB800'
  },
  { 
    id: 'flight', 
    title: 'Flight Scheduler', 
    desc: 'Book airport transfers linked to your flights.', 
    icon: '✈️',
    color: '#1e90ff'
  },
  { 
    id: 'courier_dispatch', 
    title: 'Quick Dispatch', 
    desc: 'On-demand rider for multi-stop deliveries.', 
    icon: '🛵',
    color: '#2ed573'
  },
  { 
    id: 'courier_shipping', 
    title: 'Shipping', 
    desc: 'Sea & International freight logistics.', 
    icon: '🚢',
    color: '#747d8c'
  },
  {
    id: 'train',
    title: 'Train Booking',
    desc: 'Reserve interstate rail travel seats.',
    icon: '🚆',
    color: '#ff4757'
  },
  {
    id: 'api',
    title: 'API Integration',
    desc: 'Connect your business logistics via API.',
    icon: '🔗',
    color: '#5352ed'
  },
  {
    id: 'custom',
    title: 'Custom Fleet',
    desc: 'Tailored transport solutions for events.',
    icon: '🏢',
    color: '#ffa502'
  }
];

const ITEMS_PER_PAGE = 3;

const ScheduleCategorySelector = ({ onSelect }) => {
  const [currentPage, setCurrentPage] = useState(0);
  
  const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const currentItems = categories.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="schedule-category-selector animated fadeIn">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="m-0 fw-bold text-muted small text-uppercase">Where do we schedule for?</h6>
        <span className="small text-muted fw-bold" style={{ fontSize: '10px' }}>{currentPage + 1} / {totalPages}</span>
      </div>

      <div className="category-grid d-flex flex-column gap-3" style={{ minHeight: '260px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="d-flex flex-column gap-3"
          >
            {currentItems.map((cat) => (
              <motion.div
                key={cat.id}
                className="category-card"
                whileHover={{ x: 5, backgroundColor: 'rgba(255, 184, 0, 0.05)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(cat.id)}
                style={{
                  padding: '16px',
                  borderRadius: '16px',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'all 0.2s'
                }}
              >
                <div className="cat-icon" style={{ 
                  fontSize: '28px', 
                  width: '56px', 
                  height: '56px', 
                  background: `${cat.color}15`,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {cat.icon}
                </div>
                <div className="cat-info">
                  <h6 className="m-0 fw-bold">{cat.title}</h6>
                  <p className="m-0 text-muted small">{cat.desc}</p>
                </div>
                <div className="ms-auto text-muted small">→</div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination Controls */}
      <div className="pagination-controls d-flex justify-content-end gap-2 mt-3">
        <button 
          className={`pagination-arrow ${currentPage === 0 ? 'disabled' : ''}`}
          onClick={prevPage}
          disabled={currentPage === 0}
        >
          «
        </button>
        <button 
          className={`pagination-arrow ${currentPage === totalPages - 1 ? 'disabled' : ''}`}
          onClick={nextPage}
          disabled={currentPage === totalPages - 1}
        >
          »
        </button>
      </div>
    </div>
  );
};

export default ScheduleCategorySelector;
