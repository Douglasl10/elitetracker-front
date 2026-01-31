import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { userLocalStoreKey } from "../../hooks/use-user";

function AuthRedirect() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");

  useEffect(() => {
    if (token) {
      localStorage.setItem(userLocalStoreKey, JSON.stringify({ token }));
      navigate("/habits");
    }
  }, [token, navigate]);

  return <p>Autenticando...</p>;
}

export default AuthRedirect;
