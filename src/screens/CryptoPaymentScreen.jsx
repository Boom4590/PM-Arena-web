import React from 'react';
import { useLocation } from 'react-router-dom';

export default function CryptoPaymentScreen() {
  const location = useLocation();
  const invoiceUrl = location.state?.invoiceUrl;

  if (!invoiceUrl) {
    return <div>URL не передан</div>;
  }

  return (
    <div style={{ flex: 1, height: '100vh' }}>
      <iframe
        src={invoiceUrl}
        title="Crypto Payment"
        style={{ width: '100%', height: '100%', border: 'none' }}
        allowFullScreen
      />
    </div>
  );
}
