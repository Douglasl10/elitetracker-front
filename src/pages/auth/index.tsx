import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "../../hooks/use-user";

function AuthRedirect() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { getUserInfo } = useUser();
  const code = params.get("code");

  useEffect(() => {
    async function handleAuth() {
      if (code) {
        await getUserInfo(code);
        navigate("/habits");
      }
    }
    handleAuth();
  }, [code, getUserInfo, navigate]);

  return <p>Autenticando...</p>;
}

export default AuthRedirect;
