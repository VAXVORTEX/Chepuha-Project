import React, { useState, useEffect, useRef } from "react";
import styles from "./Timer.module.scss";
interface TimerProps {
    roundStartedAt: string | null;
    serverTimeOffset: number;
    onTimeUp: () => void;
    className?: string;
}
const Timer: React.FC<TimerProps> = ({ roundStartedAt, serverTimeOffset, onTimeUp, className }) => {
    const [timeLeft, setTimeLeft] = useState(120);
    const onTimeUpRef = useRef(onTimeUp);

    useEffect(() => {
        onTimeUpRef.current = onTimeUp;
    }, [onTimeUp]);

    useEffect(() => {
        if (!roundStartedAt) return;

        const calcTime = () => {
            const startMs = new Date(roundStartedAt).getTime();
            const nowMs = Date.now() - serverTimeOffset;
            const elapsed = Math.floor((nowMs - startMs) / 1000);
            return Math.max(0, 120 - elapsed);
        };

        const initialTime = calcTime();
        setTimeLeft(initialTime);

        if (initialTime <= 0) {
            onTimeUpRef.current();
            return;
        }
        const intervalId = setInterval(() => {
            const remaining = calcTime();
            setTimeLeft(remaining);
            if (remaining <= 0) {
                clearInterval(intervalId);
                onTimeUpRef.current();
            }
        }, 1000);
        return () => clearInterval(intervalId);
    }, [roundStartedAt, serverTimeOffset]);
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    };
    return (
        <div className={`${styles["timer-container"]} ${className}`}>
            {formatTime(timeLeft)}
        </div>
    );
};
export default Timer;
