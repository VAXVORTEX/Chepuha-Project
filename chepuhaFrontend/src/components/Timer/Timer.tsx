import React, { useState, useEffect, useRef } from "react";
import styles from "./Timer.module.scss";

interface TimerProps {
    initialSeconds?: number;
    onTimeUp: () => void;
    className?: string;
}

const Timer: React.FC<TimerProps> = ({ initialSeconds = 120, onTimeUp, className }) => {
    const [timeLeft, setTimeLeft] = useState(initialSeconds);
    const onTimeUpRef = useRef(onTimeUp);

    useEffect(() => {
        onTimeUpRef.current = onTimeUp;
    }, [onTimeUp]);

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUpRef.current();
            return;
        }

        const intervalId = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(intervalId);
                    onTimeUpRef.current();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

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
