"use client";

import { useEffect } from 'react';

export default function FlavorMix() {
  useEffect(() => {
    console.log("runs on client");
  }, []);
  return <div>Flavor Mix Page</div>;
}
