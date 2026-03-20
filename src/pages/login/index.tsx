import Button from '../../components/button';
import api from '../../services/api';
import styles from './styles.module.css'
import { GithubLogo } from '@phosphor-icons/react'



function Login () {
    
    async function handleAuth () {
        try {
            const { data } = await api.get('/auth')

            if (data.redirectUrl) {
                window.location.href = data.redirectUrl
            } else {
                console.error('Redirect URL not found in API response')
            }
        } catch (error) {
            console.error('Error during authentication request:', error)
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1>Entre com </h1>
                <Button onClick={handleAuth}><GithubLogo /> GitHub</Button>
                <p>Ao entrar você concorda o termos de serviço e política de privacidade. </p>
            </div>
        </div>
    );
}

export default Login;
