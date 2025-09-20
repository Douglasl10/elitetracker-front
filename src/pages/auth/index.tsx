import styles from './styles.module.css';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useUser } from '../../hooks/use-user';
import { useNavigate } from 'react-router-dom';

const Autenticacao = () => {
    const [searchParams] = useSearchParams()
    const {getUserInfo, userData} = useUser()
    const navigate = useNavigate()

    async function handleAuth() {
        await getUserInfo(String(searchParams.get('code')))

        navigate('/habits')
    }

    useEffect(() => {
        handleAuth()
    }, [])

  return (
    <div className={styles.container}>
      <h1>Loading...</h1>
      
    </div>
  );
};

export default Autenticacao;
