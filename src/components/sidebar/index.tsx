import { Link, useLocation } from 'react-router-dom';
import styles from './styles.module.css';
import { ClockClockwiseIcon, ListBulletsIcon, SignOutIcon } from '@phosphor-icons/react';
import { useUser } from '../../hooks/use-user';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';


const Sidebar = () => {
    const { userData, logout } = useUser();
    const navigator = useNavigate();
    const {pathname} = useLocation();

    function handleLogout() {
        logout();

        navigator('/');
    }

    return (
        <div className={styles.container}>
            <img src={userData.avatarUrl} alt={userData.name} />
            <div className={styles.link}>
                <Link to="/habits" className={clsx(pathname === '/habits' && styles.active)}>
                    <ListBulletsIcon size={24}                    />
                </Link>
                <Link to="/focus" className={clsx(pathname === '/focus' && styles.active)}>
                    <ClockClockwiseIcon size={24} />
                </Link>
            </div>
            <SignOutIcon size={24} className={styles.signOutIcon} onClick={handleLogout} />
        </div>
    );
}

export default Sidebar;