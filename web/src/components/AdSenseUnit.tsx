'use client';

import { useEffect } from 'react';

interface AdSenseUnitProps {
  client: string;
  slot: string;
  format?: string;
  layoutKey?: string;
  className?: string;
}

export default function AdSenseUnit({ client, slot, format = 'auto', layoutKey, className }: AdSenseUnitProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        {...(layoutKey ? { 'data-ad-layout-key': layoutKey } : {})}
      />
    </div>
  );
}
