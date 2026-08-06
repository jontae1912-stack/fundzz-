import React, { useState } from 'react';
import VouchCard from './VouchCard';
import AddVouchModal from './AddVouchModal';

export default function VouchList() {
  const [vouches, setVouches] = useState([
    { id: '#1', customer: '@alice', date: '2026-08-01 12:00', comment: 'Great', rating: 5, product: 'Loader A', bannerUrl: '', footerText: 'Cosmos • Verified Feedback • 8/1/2026' },
    { id: '#2', customer: '@bob', date: '2026-08-02 13:00', comment: 'Good', rating: 4, product: 'Loader B', bannerUrl: '', footerText: 'Cosmos • Verified Feedback • 8/2/2026' },
  ]);

  const [modalOpen, setModalOpen] = useState(false);

  const existingRatings = vouches.map(v => v.rating).filter(r => typeof r === 'number');

  const handleAddClick = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);

  const handleSubmit = (newVouch) => {
    // Double-check uniqueness
    if (existingRatings.includes(newVouch.rating)) {
      alert('That rating is already used by another staff. Each staff must have a unique rating.');
      return;
    }

    setVouches(prev => [newVouch, ...prev]);
  };

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <button onClick={handleAddClick} style={{ padding: '8px 12px', borderRadius: 8, background: '#6b34b6', color: '#fff', border: 'none', fontWeight: 700 }}>
          ⭐ Add Vouch
        </button>
      </div>

      {vouches.map(v => (
        <VouchCard key={v.id} vouch={v} onAdd={handleAddClick} />
      ))}

      <AddVouchModal isOpen={modalOpen} onClose={handleClose} onSubmit={handleSubmit} existingRatings={existingRatings} />
    </div>
  );
}
