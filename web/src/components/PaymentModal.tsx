"use client";

import React, { useState } from 'react';
import styles from './PaymentModal.module.css';

interface PaymentModalProps {
  planName: string;
  price: string;
  onClose: () => void;
}

export default function PaymentModal({ planName, price, onClose }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'googleplay'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate API Call for payment intent
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Auto close after success
      setTimeout(() => {
        onClose();
      }, 3000);
    }, 2000);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modalContent} ${isSuccess ? styles.successMode : ''}`}>
        
        {!isSuccess ? (
          <>
            <button className={styles.closeButton} onClick={onClose}>✕</button>
            <div className={styles.header}>
              <h2>Completar Pago</h2>
              <p>Estás suscribiéndote al plan <span className={styles.highlight}>{planName}</span> por <span className={styles.priceHighlight}>${price}</span></p>
            </div>

            <div className={styles.paymentMethods}>
              <div 
                className={`${styles.methodCard} ${paymentMethod === 'card' ? styles.activeMethod : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                💳 Tarjeta
              </div>
              <div 
                className={`${styles.methodCard} ${paymentMethod === 'paypal' ? styles.activeMethod : ''}`}
                onClick={() => setPaymentMethod('paypal')}
              >
                🅿️ PayPal
              </div>
              <div 
                className={`${styles.methodCard} ${paymentMethod === 'googleplay' ? styles.activeMethod : ''}`}
                onClick={() => setPaymentMethod('googleplay')}
              >
                G Pay
              </div>
            </div>

            <form onSubmit={handleCheckout} className={styles.formContainer}>
              {paymentMethod === 'card' && (
                <div className={styles.cardDetailsForm}>
                  <div className={styles.inputGroup}>
                    <label>Nombre en la tarjeta</label>
                    <input type="text" placeholder="Ej. Juan Pérez" required />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Número de Tarjeta</label>
                    <input type="text" placeholder="0000 0000 0000 0000" maxLength={19} required />
                  </div>
                  <div className={styles.row}>
                    <div className={styles.inputGroup}>
                      <label>Vencimiento</label>
                      <input type="text" placeholder="MM/AA" maxLength={5} required />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>CVC</label>
                      <input type="text" placeholder="123" maxLength={4} required />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'paypal' && (
                <div className={styles.thirdPartyCheckout}>
                  <p>Serás redirigido a PayPal para completar tu compra de forma segura.</p>
                </div>
              )}

              {paymentMethod === 'googleplay' && (
                <div className={styles.thirdPartyCheckout}>
                  <p>Usa Google Pay para pagar rápido y seguro con tu cuenta de Google.</p>
                </div>
              )}

              <button 
                type="submit" 
                className={styles.payButton} 
                disabled={isProcessing}
              >
                {isProcessing ? 'Procesando...' : `Pagar $${price}`}
              </button>
              
              <p className={styles.securityNote}>
                🔒 Pago seguro encriptado.
              </p>
            </form>
          </>
        ) : (
          <div className={styles.successContainer}>
            <div className={styles.successIcon}>✅</div>
            <h2>¡Pago Exitoso!</h2>
            <p>Bienvenido a SmarTune Premium. Tu cuenta ha sido actualizada al plan <strong>{planName}</strong>.</p>
            <p className={styles.redirectText}>Serás redirigido en breve...</p>
          </div>
        )}

      </div>
    </div>
  );
}
