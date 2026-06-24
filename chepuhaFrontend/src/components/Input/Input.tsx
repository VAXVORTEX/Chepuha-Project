import React from 'react';
import styles from './Input.module.scss';
interface InputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: 'text' | 'textarea' | string;
    maxLength?: number;
    autoFocus?: boolean;
    onKeyDown?: (e: any) => void;
    className?: string;
    disabled?: boolean;
    style?: React.CSSProperties;
}
const Input: React.FC<InputProps> = React.memo(({
    value,
    onChange,
    placeholder,
    type = 'text',
    maxLength,
    autoFocus,
    onKeyDown,
    className = '',
    disabled,
    style
}) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    React.useEffect(() => {
        if (type !== 'text' && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [value, type]);

    if (type === 'text') {
        return (
            <input
                className={`${styles.input} ${className}`}
                style={style}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                maxLength={maxLength || 500}
                autoFocus={autoFocus}
                onKeyDown={onKeyDown}
                disabled={disabled}
            />
        );
    }

    return (
        <textarea
            ref={textareaRef}
            className={`${styles.input} ${className}`}
            style={{ ...style, resize: 'none', overflow: 'hidden' }}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            maxLength={maxLength || 500}
            autoFocus={autoFocus}
            onKeyDown={onKeyDown}
            disabled={disabled}
            rows={1}
        />
    );
});
export default Input;