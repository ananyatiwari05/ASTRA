import React, { useEffect, useState } from 'react';

export default function CountdownTimer({ startTime }) {
  const calculateTimeLeft = () => {
    const difference = new Date(startTime) - new Date();

    if (difference <= 0) {
      return 'Live / Started';
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) /
      (1000 * 60 * 60)
    );
    const minutes = Math.floor(
      (difference % (1000 * 60 * 60)) /
      (1000 * 60)
    );

    return `${days}d ${hours}h ${minutes}m`;
  };

  const [timeLeft, setTimeLeft] = useState(
    calculateTimeLeft()
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  return (
    <p className="text-lg font-semibold text-cyan-400">
      {timeLeft}
    </p>
  );
}
