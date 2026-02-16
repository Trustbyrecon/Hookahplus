import React, { useState, useEffect } from 'react';

const SessionTimer = () => {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <h2 className="font-display">
      Session Time: {Math.floor(seconds / 60)} min {seconds % 60} sec
    </h2>
  );
};

export default SessionTimer;
