import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { userLocalStoreKey } from "../../hooks/use-user";

export default function AuthRedirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const name = searchParams.get("name");
    const avatarUrl = searchParams.get("avatarUrl");
    const id = searchParams.get("id");

    if (token) {
      localStorage.setItem(
        userLocalStoreKey,
        JSON.stringify({ token, name, avatarUrl, id })
      );
      navigate("/habits"); // ou "/focus"
    } else {
      navigate("/");
    }
  }, [searchParams, navigate]);

  return <p>Autenticando...</p>;
}