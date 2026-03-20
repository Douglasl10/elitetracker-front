import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { userLocalStoreKey } from "../../hooks/use-user";

export default function AuthRedirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    console.log("AuthRedirect atingida!");
    console.log("SearchParams:", searchParams.toString());

    const token = searchParams.get("token");
    const name = searchParams.get("name");
    const avatarUrl = searchParams.get("avatarUrl");
    const id = searchParams.get("id");

    if (token) {
      console.log("Token encontrado, salvando e redirecionando...");
      localStorage.setItem(
        userLocalStoreKey,
        JSON.stringify({ token, name, avatarUrl, id })
      );
      navigate("/habits");
    } else {
      console.log("Token não encontrado, voltando para login.");
      navigate("/");
    }
  }, [searchParams, navigate]);

  return <p>Autenticando...</p>;
}