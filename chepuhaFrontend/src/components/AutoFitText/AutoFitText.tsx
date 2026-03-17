import React, { useRef, useEffect, useState } from "react";

interface AutoFitTextProps {
    html?: string;
    text?: string;
    maxFontSize: number;
    minFontSize: number;
    className?: string;
    style?: React.CSSProperties;
}

const AutoFitText: React.FC<AutoFitTextProps> = ({
    html,
    text,
    maxFontSize,
    minFontSize,
    className,
    style
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [fontSize, setFontSize] = useState(maxFontSize);

    useEffect(() => {
        const adjustFontSize = () => {
            const container = containerRef.current;
            const content = contentRef.current;
            if (!container || !content) return;

            let currentSize = maxFontSize;
            content.style.fontSize = `${currentSize}px`;

            // Binary search or simple decrement for font size
            // Simple decrement is often fine for a small range, but let's be efficient
            let min = minFontSize;
            let max = maxFontSize;
            let bestFit = minFontSize;

            while (min <= max) {
                const mid = Math.floor((min + max) / 2);
                content.style.fontSize = `${mid}px`;

                if (content.scrollHeight <= container.clientHeight && content.scrollWidth <= container.clientWidth) {
                    bestFit = mid;
                    min = mid + 1;
                } else {
                    max = mid - 1;
                }
            }

            setFontSize(bestFit);
            content.style.fontSize = `${bestFit}px`;
        };

        // Delay slightly to ensure layout is done, but also use ResizeObserver for responsiveness
        adjustFontSize();

        const observer = new ResizeObserver(() => {
            adjustFontSize();
        });

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, [html, text, maxFontSize, minFontSize]);

    return (
        <div
            ref={containerRef}
            className={className}
            style={{
                ...style,
                overflow: 'hidden',
                height: '100%',
                width: '100%',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'flex-start'
            }}
        >
            <div
                ref={contentRef}
                style={{
                    fontSize: `${fontSize}px`,
                    width: '100%',
                    wordBreak: 'break-word',
                    hyphens: 'auto'
                }}
                {...(html ? { dangerouslySetInnerHTML: { __html: html } } : { children: text })}
            />
        </div>
    );
};

export default AutoFitText;
