import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

function AuthRedirect() {
  const [params] = useSearchParams();
  const token = params.get("token");

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      window.location.href = "/dashboard"; 
    }
  }, [token]);

  return <p>Autenticando...</p>;
}

export default AuthRedirect;
