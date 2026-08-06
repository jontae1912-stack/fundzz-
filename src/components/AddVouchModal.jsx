import React, { useState } from 'react';
import './AddVouchModal.css';

export default function AddVouchModal({ isOpen, onClose, onSubmit, existingRatings = [] }) {
  const [product, setProduct] = useState('');
  const [rating, setRating] = useState('');
  const [feedback, setFeedback] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [customer, setCustomer] = useState('');
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const reset = () => {
    setProduct('');
    setRating('');
    setFeedback('');
    setImageUrl('');
    setCustomer('');
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose && onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const r = Number(rating);
    if (!product.trim()) return setError('Product is required.');
    if (!feedback.trim()) return setError('Feedback is required.');
    if (!Number.isInteger(r) || r < 1 || r > 5) return setError('Rating must be an integer between 1 and 5.');
    if (existingRatings.includes(r)) return setError('That rating is already used by another staff. Each staff must have a different rating (1-5).');

    // Build vouch object
    const vouch = {
      id: `#${Math.floor(Math.random() * 9000) + 1}`,
      customer: customer || undefined,
      date: new Date().toLocaleString(),
      comment: feedback,
      rating: r,
      product,
      bannerUrl: imageUrl || undefined,
      footerText: `Cosmos • Verified Feedback • ${new Date().toLocaleDateString()}`,
      appName: 'Cosmos Vouch',
      createdAt: new Date().toLocaleString(),
    };

    onSubmit && onSubmit(vouch);
    reset();
    onClose && onClose();
  };

  return (
    <div className="av-modal-backdrop" role="dialog" aria-modal="true">
      <div className="av-modal">
        <div className="av-header">
          <div className="av-title">Add Vouch</div>
          <button className="av-close" onClick={handleClose} aria-label="Close">×</button>
        </div>

        <form className="av-form" onSubmit={handleSubmit}>
          <div className="av-note">This form will be submitted to Cosmos Vouch. Do not share passwords or other sensitive information.</div>

          <label className="av-label">Product *</label>
          <input className="av-input" value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Enter the product name" />

          <label className="av-label">Rating (1-5) *</label>
          <input className="av-input" value={rating} onChange={(e) => setRating(e.target.value)} placeholder="Enter a number from 1 to 5" />

          <label className="av-label">Feedback *</label>
          <textarea className="av-textarea" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Share your experience with the product" />

          <label className="av-label">Image URL (Optional)</label>
          <input className="av-input" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Paste an image URL or leave empty" />

          <label className="av-label">Customer (Optional)</label>
          <input className="av-input" value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Enter customer name or mention" />

          {error && <div className="av-error">{error}</div>}

          <div className="av-actions">
            <button type="button" className="av-btn av-btn-ghost" onClick={handleClose}>Cancel</button>
            <button type="submit" className="av-btn av-btn-primary">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
}
