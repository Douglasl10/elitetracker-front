import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { userLocalStoreKey } from "../../hooks/use-user";

function AuthRedirect() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const hasRun = useRef(false);

  const token = params.get("token");

  useEffect(() => {
    if (!token || hasRun.current) return;

    hasRun.current = true;

    localStorage.setItem(
      userLocalStoreKey,
      JSON.stringify({ token })
    );

    // limpa a URL e redireciona
    navigate("/habits", { replace: true });
  }, [token, navigate]);

  return <p>Autenticando...</p>;
}

export default AuthRedirect;
