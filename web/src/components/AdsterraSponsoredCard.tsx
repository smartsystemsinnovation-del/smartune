'use client';

import { useState, useEffect } from 'react';

const CAMPAIGNS = [
  {
    title: 'Pack de Loops Premium',
    description: 'Accede a samples y presets de producción de nuestros partners.',
    cta: 'Explorar',
  },
  {
    title: 'Sorteo Semanal',
    description: 'Auriculares de estudio y licencias de plugins premium.',
    cta: 'Participar',
  },
  {
    title: 'Masterclass Gratuita',
    description: 'Pases exclusivos para cursos de teoría musical avanzada.',
    cta: 'Reclamar',
  }
];

export default function AdsterraSponsoredCard({ isFeed = false }: { isFeed?: boolean }) {
  const [campaign, setCampaign] = useState(CAMPAIGNS[0]);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * CAMPAIGNS.length);
    setCampaign(CAMPAIGNS[randomIndex]);
  }, []);

  const directLinkUrl = 'https://www.effectivecpmnetwork.com/phk1ph6f?key=eb4d8fd22913b0ed673d6707ef8cbf84';

  return (
    <a
      href={directLinkUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block relative overflow-hidden transition-all duration-300"
      style={{
        borderRadius: 14,
        padding: isFeed ? '16px 18px' : '14px 16px',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.04)',
        borderLeft: '2px solid rgba(246, 51, 154, 0.35)',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: 'var(--neon-pink)',
              opacity: 0.6,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.1em',
              color: 'rgba(255, 255, 255, 0.25)',
            }}
          >
            Patrocinado
          </span>
        </div>
      </div>

      {/* Content */}
      <div>
        <h4
          className="group-hover:text-white transition-colors duration-200"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.75)',
            lineHeight: 1.4,
            marginBottom: 4,
            letterSpacing: '-0.01em',
          }}
        >
          {campaign.title}
        </h4>
        <p
          style={{
            fontSize: 11.5,
            fontWeight: 400,
            color: 'rgba(255, 255, 255, 0.3)',
            lineHeight: 1.5,
          }}
        >
          {campaign.description}
        </p>
      </div>

      {/* CTA — text only, minimal */}
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
        <span
          className="group-hover:opacity-100 transition-opacity duration-200"
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--neon-pink)',
            opacity: 0.7,
          }}
        >
          {campaign.cta}
        </span>
        <svg
          className="group-hover:translate-x-0.5 transition-transform duration-200"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--neon-pink)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: 0.5 }}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </a>
  );
}
