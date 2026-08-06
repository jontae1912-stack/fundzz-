import React from 'react';
import './VouchEmbed.css';

const StarIcon = ({ filled = false }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill={filled ? '#D45CF0' : 'rgba(255,255,255,0.12)'} />
  </svg>
);

export default function VouchEmbed({ vouch = {}, onClose }) {
  const {
    id,
    customer,
    date,
    comment,
    rating,
    product,
    bannerUrl,
    footerText,
    appName = 'fundzz Vouch',
    appAvatar,
  } = vouch;

  return (
    <div className="ve-wrapper">
      <div className="ve-card">
        <div className="ve-left-stripe" />
        <div className="ve-header">
          <div className="ve-app">
            {appAvatar ? <img src={appAvatar} alt="app avatar" className="ve-app-avatar" /> : <div className="ve-app-avatar ve-fallback" />}
            <div className="ve-app-meta">
              <div className="ve-app-name">{appName} <span className="ve-badge">APP</span></div>
              <div className="ve-time">{date}</div>
            </div>
          </div>
          <button className="ve-close" onClick={() => onClose && onClose()} aria-label="Close">✕</button>
        </div>

        <div className="ve-body">
          <div className="ve-title">New Vouch Received</div>

          {comment && <div className="ve-comment">{comment}</div>}

          <div className="ve-grid">
            {id && (
              <div className="ve-field">
                <div className="ve-field-label">Vouch ID</div>
                <div className="ve-field-value">{id}</div>
              </div>
            )}

            {customer && (
              <div className="ve-field">
                <div className="ve-field-label">Customer</div>
                <div className="ve-field-value ve-mention">{customer}</div>
              </div>
            )}

            {date && (
              <div className="ve-field">
                <div className="ve-field-label">Date</div>
                <div className="ve-field-value">{date}</div>
              </div>
            )}

            {typeof rating === 'number' && (
              <div className="ve-field ve-rating-field">
                <div className="ve-field-label">Rating</div>
                <div className="ve-rating-row">
                  <div className="ve-stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon key={i} filled={i < rating} />
                    ))}
                  </div>
                  <div className="ve-field-value ve-rating-text">{rating}/5</div>
                </div>
              </div>
            )}

            {product && (
              <div className="ve-field">
                <div className="ve-field-label">Product</div>
                <div className="ve-field-value">{product}</div>
              </div>
            )}
          </div>

          {bannerUrl && (
            <div className="ve-banner-wrap">
              <img src={bannerUrl} alt="banner" className="ve-banner" />
            </div>
          )}

          {footerText && <div className="ve-footer">{footerText}</div>}
        </div>

      </div>
    </div>
  );
}
