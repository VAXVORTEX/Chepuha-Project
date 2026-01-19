import React from 'react';
import styles from './Button.module.scss';


interface ButtonSet{
    label: string;
    variant: 'primary' | 'secondary';
    phase: 'main' | 'waiting' | 'end';
    onClick: ()=> void;
}

const Button: React.FC<ButtonSet> = ({label, variant, phase, onClick }) =>{
    const combClasses = `${styles.button} ${styles[variant]} ${styles[phase]}`;
    return (
        <button className = {combClasses} onClick = {onClick}>
            {label}
        </button>
    );
};

export default Button;