import styles from './styles.module.css';
import { type  ReactNode } from 'react';

type AppContainerProps = {
    children: ReactNode;
};

export function AppContainer({ children }: AppContainerProps) {
  return (
   <div className={styles.container}>
    {children}
   </div>
  );
}
