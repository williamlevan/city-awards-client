"use client";
import { useState, useEffect } from "react";

export default function Countdown() {
    const targetDate = new Date("March 2, 2025 18:00:00 GMT-0600");

    const calculateTimeLeft = () => {
        const now = new Date();
        const difference = targetDate - now;

        if (difference <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }

        return {
            days: Math.max(Math.floor(difference / (1000 * 60 * 60 * 24)), 0),
            hours: Math.max(Math.floor((difference / (1000 * 60 * 60)) % 24), 0),
            minutes: Math.max(Math.floor((difference / (1000 * 60)) % 60), 0),
            seconds: Math.max(Math.floor((difference / 1000) % 60), 0)
        };
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="countdown">
            <h2>OSCARS COUNTDOWN</h2>
            <div className="countdown-body">
                <div className="timer-element">
                    <h4>{timeLeft.days}</h4>
                    <p>DAYS</p>
                </div>
                <div className="timer-element">
                    <h4>{timeLeft.hours}</h4>
                    <p>HRS</p>
                </div>
                <div className="timer-element">
                    <h4>{timeLeft.minutes}</h4>
                    <p>MINS</p>
                </div>
                <div className="timer-element">
                    <h4>{timeLeft.seconds}</h4>
                    <p>SECS</p>
                </div>
            </div>
        </div>
    );
}