import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "../../hooks/use-user";

export default function AuthRedirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userData } = useUser();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // salva no localStorage (sem espaço na chave)
      localStorage.setItem(
        import.meta.env.VITE_LOCALSTORAGE_KEY + ":userData",
        JSON.stringify({ token })
      );

      // redireciona para a área logada
      navigate("/habits"); // ou "/focus"
    } else {
      // se não houver token, volta para a home
      navigate("/");
    }
  }, [searchParams, navigate]);

  return <p>Autenticando...</p>;
}
