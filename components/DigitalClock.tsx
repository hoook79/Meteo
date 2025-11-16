import React, { useState, useEffect } from 'react';

export const DigitalClock: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => {
            clearInterval(timerId);
        };
    }, []);

    const formatTime = (date: Date) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    return (
        <div aria-label="Orologio digitale">
            <p className="text-5xl md:text-6xl font-mono font-bold text-white/90 tracking-widest bg-black/20 px-6 py-3 rounded-lg shadow-lg border border-white/10" role="timer" aria-live="off">
                {formatTime(time)}
            </p>
        </div>
    );
};