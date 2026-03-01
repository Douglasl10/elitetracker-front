import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
// import { useUser } from "../../hooks/use-user"; // removido

export default function AuthRedirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      localStorage.setItem(
        import.meta.env.VITE_LOCALSTORAGE_KEY + ":userData",
        JSON.stringify({ token })
      );
      navigate("/habits"); // ou "/focus"
    } else {
      navigate("/");
    }
  }, [searchParams, navigate]);

  return <p>Autenticando...</p>;
}