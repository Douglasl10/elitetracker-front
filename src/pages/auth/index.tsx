import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { userLocalStoreKey } from "../../hooks/use-user";

export default function AuthRedirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    console.log("AuthRedirect atingida!");
    console.log("SearchParams:", searchParams.toString());

    // Se o token estiver na URL (como o GitHub redireciona diretamente)
    let token = searchParams.get("token");
    let name = searchParams.get("name");
    let avatarUrl = searchParams.get("avatarUrl");
    let id = searchParams.get("id");

    // Tentar pegar da raiz se o roteador não pegou (fallback)
    if (!token) {
        const urlParams = new URLSearchParams(window.location.search);
        token = urlParams.get("token");
        name = urlParams.get("name");
        avatarUrl = urlParams.get("avatarUrl");
        id = urlParams.get("id");
    }

    if (token) {
      console.log("Token encontrado, salvando e redirecionando...");
      localStorage.setItem(
        userLocalStoreKey,
        JSON.stringify({ token, name, avatarUrl, id })
      );
      navigate("/habits");
    } else {
      console.log("Token não encontrado em searchParams nem na window.location.search");
      // Se não houver token, mas estivermos na página de autenticação, algo deu errado
      // navigate("/"); // Comentado para não sair da tela e permitir ver os logs
    }
  }, [searchParams, navigate]);

  return <p>Autenticando...</p>;
}