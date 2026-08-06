import React from 'react';
import './VouchCard.css';

// Simple star SVG used by component
const Star = ({ filled = false }) => (
  <svg className="vv-star" viewBox="0 0 24 24" width="18" height="18" aria-hidden>
    <path
      fill={filled ? '#e13bd6' : 'rgba(255,255,255,0.12)'}
      d="M12 .587l3.668 7.431L23.5 9.75l-5.75 5.6L19.334 24 12 20.017 4.666 24l1.584-8.65L0.5 9.75l7.832-1.732L12 .587z"
    />
  </svg>
);

export default function VouchCard({ vouch = {} }) {
  // Use exactly what the user provides. No placeholder text shown when the field is absent.
  const {
    id,
    customer,
    date,
    comment,
    rating,
    product,
    bannerUrl,
    footerText,
    appName,
    appAvatar,
    createdAt,
  } = vouch;

  const hasAnyField = id || customer || date || comment || rating || product || bannerUrl || footerText;

  return (
    <div className="vv-wrapper">
      <div className="vv-header">
        <div className="vv-app">
          {appAvatar ? (
            <img className="vv-app-avatar" src={appAvatar} alt="app avatar" />
          ) : (
            <div className="vv-app-avatar vv-app-avatar-fallback" aria-hidden />
          )}

          <div className="vv-app-info">
            {appName && (
              <div className="vv-app-name">{appName} {appName && <span className="vv-app-badge">APP</span>}</div>
            )}
            {createdAt && <div className="vv-app-time">{createdAt}</div>}
          </div>
        </div>
      </div>

      <div className="vv-card">
        <div className="vv-card-inner">
          {(id || comment || customer || date) && (
            <>
              <div className="vv-title">
                <div className="vv-star-badge">⭐ New Vouch Received</div>
              </div>

              {comment && (
                <div className="vv-comment">
                  <span className="vv-comment-emoji">💬</span>
                  <div className="vv-comment-text">{comment}</div>
                </div>
              )}

              <div className="vv-fields">
                {id && (
                  <div className="vv-field">
                    <div className="vv-field-label">Vouch ID</div>
                    <div className="vv-field-value">{id}</div>
                  </div>
                )}

                {customer && (
                  <div className="vv-field">
                    <div className="vv-field-label">Customer</div>
                    <div className="vv-field-value vv-mention">{customer}</div>
                  </div>
                )}

                {date && (
                  <div className="vv-field">
                    <div className="vv-field-label">Date</div>
                    <div className="vv-field-value">{date}</div>
                  </div>
                )}
              </div>
            </>
          )}

          {typeof rating === 'number' && (
            <div className="vv-rating">
              <div className="vv-rating-label">Rating</div>
              <div className="vv-rating-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} filled={i < rating} />
                ))}
                <span className="vv-rating-text">{rating}/5</span>
              </div>
            </div>
          )}

          {product && (
            <div className="vv-product">
              <div className="vv-product-label">Product</div>
              <div className="vv-product-value">{product}</div>
            </div>
          )}

          {bannerUrl ? (
            <div className="vv-banner-wrap">
              <img className="vv-banner" src={bannerUrl} alt="vouch banner" />
            </div>
          ) : null}

          {footerText && <div className="vv-footer">{footerText}</div>}

          {/* Actions: always shown so user can interact */}
          <div className="vv-actions">
            <button className="vv-btn vv-btn-primary">⭐ Add Vouch</button>
            <button className="vv-btn vv-btn-ghost">🌐 View Website</button>
          </div>

          {!hasAnyField && (
            <div className="vv-empty" style={{ color: 'var(--muted)', marginTop: 8 }}>
              No vouch data provided.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
