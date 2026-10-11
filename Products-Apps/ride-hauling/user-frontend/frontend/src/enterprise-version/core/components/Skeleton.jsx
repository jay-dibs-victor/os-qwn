import React from 'react';
import './Skeleton.css';

const Skeleton = ({ width, height, borderRadius, className = '' }) => {
  const style = {
    width: width || '100%',
    height: height || '20px',
    borderRadius: borderRadius || '4px',
  };

  return <div className={`skeleton-box ${className}`} style={style}></div>;
};

export const CardSkeleton = () => (
  <div className="skeleton-card">
    <Skeleton height="150px" borderRadius="16px" className="mb-3" />
    <Skeleton width="60%" height="24px" className="mb-2" />
    <Skeleton width="90%" height="16px" className="mb-2" />
    <Skeleton width="40%" height="16px" />
  </div>
);

export const ListSkeleton = ({ count = 5 }) => (
  <div className="skeleton-list">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="skeleton-list-item mb-4" style={{ display: 'flex', gap: '20px', alignItems: 'center', background: 'white', padding: '15px', borderRadius: '16px' }}>
        <Skeleton width="60px" height="60px" borderRadius="12px" />
        <div style={{ flex: 1 }}>
          <Skeleton width="30%" height="20px" className="mb-2" />
          <Skeleton width="60%" height="16px" />
        </div>
        <Skeleton width="80px" height="30px" borderRadius="15px" />
      </div>
    ))}
  </div>
);

export const ProfileSkeleton = () => (
  <div className="container-fluid dashboard-modern py-4" style={{ marginTop: '70px' }}>
    <div className="container px-lg-3">
      <div className="mb-5">
        <Skeleton width="150px" height="18px" className="mb-2" />
        <Skeleton width="250px" height="36px" />
      </div>
      <div className="row g-4">
        <div className="col-lg-7">
           <div className="pro-card p-4 h-100 shadow-sm border-0 bg-white" style={{ borderRadius: '24px' }}>
              <div className="d-flex align-items-center mb-5 pb-4 border-bottom">
                 <Skeleton width="100px" height="100px" borderRadius="50%" className="me-4" />
                 <div style={{ flex: 1 }}>
                    <Skeleton width="40%" height="20px" className="mb-2" />
                    <Skeleton width="70%" height="14px" />
                 </div>
              </div>
              <div className="row g-4">
                 {[...Array(6)].map((_, i) => (
                    <div key={i} className="col-md-6 mb-3">
                       <Skeleton width="100px" height="12px" className="mb-2" />
                       <Skeleton height="45px" borderRadius="8px" />
                    </div>
                 ))}
              </div>
           </div>
        </div>
        <div className="col-lg-5">
           <Skeleton height="550px" borderRadius="24px" />
        </div>
      </div>
    </div>
  </div>
);

export const RideHistorySkeleton = () => (
  <div className="container py-4">
    <Skeleton width="200px" height="32px" className="mb-4" />
    <div className="row g-4">
      {[...Array(6)].map((_, i) => (
         <div key={i} className="col-md-4">
            <CardSkeleton />
         </div>
      ))}
    </div>
  </div>
);

export const NotificationSkeleton = () => (
  <div className="container py-4">
    <Skeleton width="220px" height="32px" className="mb-4" />
    <ListSkeleton count={6} />
  </div>
);

export default Skeleton;
