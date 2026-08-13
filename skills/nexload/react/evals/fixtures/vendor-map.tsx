"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window { VendorMap: any }
}

export function VendorMap({ lat, lng }: { lat: number; lng: number }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!root.current) return;
    const map = new window.VendorMap(root.current, { lat, lng });
    map.setCenter(lat, lng);
  }, [lat, lng]);

  return <div ref={root} />;
}
