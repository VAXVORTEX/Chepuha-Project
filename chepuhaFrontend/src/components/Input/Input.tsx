import React from 'react';
import styles from './Input.module.scss';

interface InputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
    maxLength?: number;
    autoFocus?: boolean;
    className?: string;
}

const Input: React.FC<InputProps> = ({
    value,
    onChange,
    placeholder,
    type = 'text',
    maxLength,
    autoFocus,
    className = ''
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <input
            className={`${styles.input} ${className}`}
            type={type}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            maxLength={maxLength}
            autoFocus={autoFocus}
        />
    );
};

export default Input;