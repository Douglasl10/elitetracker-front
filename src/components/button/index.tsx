import {type ComponentProps  } from "react";
import styles from './styles.module.css';
import clsx from "clsx";

type ButtonProps = ComponentProps<'button'> & {
    variant?: 'info' | 'error';
};

function Button ({ children, disabled, variant, ...props }: ButtonProps) {
    return (
        <button className={clsx(styles.container, variant === 'error' && styles.error, disabled && styles.disabled)} {...props}>
            {children}
        </button>
    );
}

export default Button;