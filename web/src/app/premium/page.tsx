"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import PaymentModal from '@/components/PaymentModal';
import styles from './page.module.css';

export default function PremiumPage() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState({ name: '', price: '' });

  const handleCheckout = (name: string, price: string) => {
    setSelectedPlan({ name, price });
    setShowPaymentModal(true);
  };

  return (
    <div className={styles.premiumContainer}>
      
      {showPaymentModal && (
        <PaymentModal 
          planName={selectedPlan.name} 
          price={selectedPlan.price} 
          onClose={() => setShowPaymentModal(false)} 
        />
      )}
      
      {/* HERO BANNER */}
      <section className={styles.heroBanner}>
        <div className={styles.heroContent}>
          <div className={styles.badgeTop}>
             <span className={styles.badgeIcon}>👑</span> Actualiza tu experiencia
          </div>
          <h1 className={styles.heroTitle}>Desbloquea tu <span className={styles.textGold}>Potencial Musical</span></h1>
          <p className={styles.heroSubtitle}>
            Accede a contenido ilimitado, profesores expertos y herramientas avanzadas para llevar tus habilidades al siguiente nivel
          </p>
          <div className={styles.heroActions}>
            <button className={styles.btnOutline}>Ver Planes Premium</button>
            <button className={styles.btnWhite}>Prueba Gratis 7 Días</button>
          </div>
        </div>
      </section>

      {/* POR QUÉ ELEGIR PREMIUM */}
      <section className={styles.benefitsSection}>
        <h2 className={styles.sectionTitle}>¿Por qué elegir <span className={styles.textPink}>Premium</span>?</h2>
        
        <div className={styles.benefitsGrid}>
          <div className={styles.benefitCard}>
             <div className={styles.bIconBox}>🎵</div>
             <h3>Miles de Lecciones</h3>
             <p>Accede a nuestra biblioteca completa de cursos de música</p>
          </div>
          <div className={styles.benefitCard}>
             <div className={styles.bIconBox}>👥</div>
             <h3>Profesores Expertos</h3>
             <p>Aprende de músicos profesionales y educadores certificados</p>
          </div>
          <div className={styles.benefitCard}>
             <div className={styles.bIconBox}>📈</div>
             <h3>Progreso Medible</h3>
             <p>Sigue tu evolución con análisis detallados y estadísticas</p>
          </div>
          <div className={styles.benefitCard}>
             <div className={styles.bIconBox}>🛡️</div>
             <h3>Contenido de Calidad</h3>
             <p>Material educativo curado y actualizado constantemente</p>
          </div>
        </div>
      </section>

      {/* PLANES */}
      <section className={styles.pricingSection}>
        <div className={styles.pricingHeader}>
          <h2 className={styles.sectionTitle}>Elige el plan <span className={styles.textPink}>perfecto</span> para ti</h2>
          <p>Cancela en cualquier momento. Sin compromisos.</p>
        </div>

        <div className={styles.pricingCardsContainer}>
          {/* FREE PLAN */}
          <div className={styles.pricingCard}>
             <h3>Free</h3>
             <div className={styles.priceContainer}>
                <span className={styles.currency}>$</span>
                <span className={styles.amount}>0</span>
                <span className={styles.period}>USD</span>
             </div>
             <p className={styles.priceSub}>Gratis para siempre</p>
             <p className={styles.cardDesc}>Perfecto para comenzar tu viaje musical</p>
             <button className={styles.btnCardOutline} onClick={() => handleCheckout('Free', '0')}>Plan Actual</button>
             
             <ul className={styles.featuresList}>
                <li><span className={styles.checkIcon}>☑</span> Acceso a lecciones básicas</li>
                <li><span className={styles.checkIcon}>☑</span> Comunidad limitada</li>
                <li className={styles.disabledFeature}><span className={styles.xIcon}>☐</span> Progreso básico</li>
             </ul>
          </div>

          {/* PRO PLAN */}
          <div className={`${styles.pricingCard} ${styles.proCard}`}>
             <div className={styles.popularBadge}>⭐ MÁS POPULAR</div>
             <h3>Pro</h3>
             <div className={styles.priceContainer}>
                <span className={styles.currency}>$</span>
                <span className={styles.amount}>9.99</span>
                <span className={styles.period}>USD<br/>por mes</span>
             </div>
             <p className={styles.cardDesc}>Para estudiantes serios que quieren mejorar</p>
             <button className={styles.btnCardGradient} onClick={() => handleCheckout('Pro', '9.99')}>Comenzar Prueba Gratis</button>
             
             <ul className={styles.featuresList}>
                <li><span className={styles.checkIconPink}>✓</span> Acceso ilimitado a todas las lecciones</li>
                <li><span className={styles.checkIconPink}>✓</span> Retroalimentación de profesores</li>
                <li><span className={styles.checkIconPink}>✓</span> Sin anuncios</li>
                <li><span className={styles.checkIconPink}>✓</span> Descarga de contenido offline</li>
                <li><span className={styles.checkIconPink}>✓</span> Seguimiento de progreso avanzado</li>
             </ul>
          </div>

          {/* ELITE PLAN */}
          <div className={styles.pricingCard}>
             <h3>Elite</h3>
             <div className={styles.priceContainer}>
                <span className={styles.currency}>$</span>
                <span className={styles.amount}>19.99</span>
                <span className={styles.period}>USD<br/>por mes</span>
             </div>
             <p className={styles.cardDesc}>La experiencia definitiva para músicos profesionales</p>
             <button className={styles.btnCardOutline} onClick={() => handleCheckout('Elite', '19.99')}>Actualizar a Elite</button>
             
             <ul className={styles.featuresList}>
                <li><span className={styles.goldStar}>★</span> Todo lo incluido en Pro</li>
                <li><span className={styles.goldStar}>★</span> Mentoría 1-a-1 mensual</li>
                <li><span className={styles.goldStar}>★</span> Soporte prioritario 24/7</li>
                <li><span className={styles.goldStar}>★</span> Recursos descargables premium</li>
                <li><span className={styles.goldStar}>★</span> Acceso anticipado a nuevas funciones</li>
                <li><span className={styles.goldStar}>★</span> Insignia Elite en tu perfil</li>
             </ul>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className={styles.finalCtaSection}>
         <div className={styles.finalCtaCard}>
            <div className={styles.ctaTopIcons}>⚡ 👑 ⚡</div>
            <h2>¿Listo para empezar tu<br/><span className={styles.textPinkGradient}>transformación musical?</span></h2>
            <p>Únete a miles de músicos que ya han mejorado sus habilidades con SmarTune Premium</p>
            <button className={styles.btnCtaFinal}>👑 Comenzar Ahora - 7 Días Gratis</button>
            <p className={styles.ctaDisclaimer}>Sin tarjeta de crédito requerida • Cancela en cualquier momento</p>
         </div>
      </section>

    </div>
  );
}
