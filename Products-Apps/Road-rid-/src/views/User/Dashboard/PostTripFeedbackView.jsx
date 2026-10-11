import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * PostTripFeedbackView — Premium Feedback Experience
 * @param {string} rideId - The ID of the completed ride
 * @param {string} driverName - Name of the driver
 * @param {function} onSubmit - Callback after submission
 * @param {function} onSkip - Callback to skip
 */
const PostTripFeedbackView = ({ rideId, driverName = 'Driver', onSubmit, onSkip }) => {
   const [rating, setRating] = useState(0);
   const [hover, setHover] = useState(0);
   const [selectedTags, setSelectedTags] = useState([]);
   const [comment, setComment] = useState('');

   const tags = [
      'Clean Car', 'Professional', 'Smooth Driving', 
      'Good Music', 'Punctual', 'Great Conversation'
   ];

   const toggleTag = (tag) => {
      setSelectedTags(prev => 
         prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
      );
   };

   const handleSubmit = () => {
      if (rating === 0) return;
      onSubmit({
         ride_id: rideId,
         rating,
         feedback_tags: selectedTags,
         feedback_comment: comment
      });
   };

   return (
      <motion.div 
         initial={{ opacity: 0, y: 50 }}
         animate={{ opacity: 1, y: 0 }}
         exit={{ opacity: 0, scale: 0.9 }}
         className="feedback-overlay"
      >
         <div className="feedback-card pro-card glass p-4 text-center">
            <div className="feedback-header mb-4">
               <div className="driver-avatar-ring mx-auto mb-3">
                  <div className="driver-avatar-placeholder bg-primary text-white">
                     <i className="bi bi-person-fill fs-2"></i>
                  </div>
               </div>
               <h3 className="h5 fw-bold text-dark">How was your trip with {driverName}?</h3>
               <p className="text-muted small">Your feedback helps us keep Queens premium.</p>
            </div>

            {/* STAR RATING */}
            <div className="star-rating-v2 mb-4">
               {[1, 2, 3, 4, 5].map((star) => (
                  <button
                     key={star}
                     className={`btn btn-link fs-1 p-1 star-btn ${star <= (hover || rating) ? 'active' : ''}`}
                     onMouseEnter={() => setHover(star)}
                     onMouseLeave={() => setHover(0)}
                     onClick={() => setRating(star)}
                  >
                     <i className={`bi bi-star${star <= (hover || rating) ? '-fill' : ''}`}></i>
                  </button>
               ))}
            </div>

            {/* FEEDBACK TAGS */}
            <AnimatePresence>
               {rating > 0 && (
                  <motion.div 
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: 'auto' }}
                     className="feedback-tags-container mb-4"
                  >
                     <p className="fw-bold small mb-2 text-dark">What stood out?</p>
                     <div className="d-flex flex-wrap justify-content-center gap-2">
                        {tags.map(tag => (
                           <button
                              key={tag}
                              onClick={() => toggleTag(tag)}
                              className={`btn btn-xs rounded-pill tag-btn ${selectedTags.includes(tag) ? 'btn-primary' : 'btn-light border text-muted'}`}
                           >
                              {tag}
                           </button>
                        ))}
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>

            <div className="form-group mb-4">
               <textarea 
                  className="form-control pro-input text-center"
                  rows="2"
                  placeholder="Anything else you'd like to share?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
               ></textarea>
            </div>

            <div className="feedback-actions d-grid gap-2">
               <button 
                  disabled={rating === 0}
                  className="btn btn-pro-dark w-100"
                  onClick={handleSubmit}
               >
                  Submit Feedback
               </button>
               <button className="btn btn-link text-muted small" onClick={onSkip}>
                  Maybe Later
               </button>
            </div>
         </div>

         <style>{`
            .feedback-overlay {
               position: fixed;
               top: 0; left: 0; right: 0; bottom: 0;
               background: rgba(0,0,0,0.4);
               backdrop-filter: blur(8px);
               z-index: 2000;
               display: flex;
               align-items: center;
               justify-content: center;
               padding: 20px;
            }
            .feedback-card {
               max-width: 400px;
               width: 100%;
               background: white !important;
               border-radius: 32px;
               box-shadow: 0 20px 60px rgba(0,0,0,0.2) !important;
            }
            .star-btn {
               color: #e4e6eb;
               transition: all 0.2s;
               border: none;
               background: none;
            }
            .star-btn.active {
               color: #FFB800;
               transform: scale(1.15);
            }
            .driver-avatar-ring {
               width: 80px; height: 80px;
               border-radius: 50%;
               padding: 4px; border: 2px solid #FFB800;
            }
            .driver-avatar-placeholder {
               width: 100%; height: 100%;
               border-radius: 50%;
               display: flex; align-items: center; justify-content: center;
               background: #1A1A1A;
            }
            .tag-btn {
               transition: all 0.2s;
               font-size: 11px;
               font-weight: 600;
            }
            .btn-pro-dark {
               background: #1A1A1A; color: white; border-radius: 16px; padding: 14px;
               transition: all 0.2s;
               border: none;
            }
            .btn-pro-dark:disabled { opacity: 0.5; cursor: not-allowed; }
            .btn-pro-dark:hover:not(:disabled) { background: #000; transform: translateY(-2px); }
         `}</style>
      </motion.div>
   );
};

export default PostTripFeedbackView;
