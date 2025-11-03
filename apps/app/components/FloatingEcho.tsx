'use client';

import React from 'react';

interface FloatingEchoProps {
  message: string;
}

export default function FloatingEcho({ message }: FloatingEchoProps) {
  return <div className="whisper-message floating-echo">{message}</div>;
}
