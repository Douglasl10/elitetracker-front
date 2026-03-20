import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import Button from '../../components/button';
import api from '../../services/api';
import styles from './styles.module.css'
import { GithubLogo } from '@phosphor-icons/react'



function Login () {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            console.log("Token detectado na URL da raiz, redirecionando para /autenticacao");
            navigate(`/autenticacao?${searchParams.toString()}`);
        }
    }, [searchParams, navigate]);

    async function handleAuth () {
        console.log("Iniciando autenticação com a API:", api.defaults.baseURL);
        try {
            const { data } = await api.get('/auth')
            console.log("Resposta da API recebida:", data);

            if (data.redirectUrl) {
                console.log("Redirecionando para:", data.redirectUrl);
                window.location.href = data.redirectUrl
            } else {
                console.error('Redirect URL not found in API response')
                alert('A API não retornou a URL de redirecionamento do GitHub.')
            }
        } catch (error: any) {
            console.error('Error during authentication request:', error)
            alert(`Erro ao conectar com a API: ${error.message}. Verifique se o backend está online.`)
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
