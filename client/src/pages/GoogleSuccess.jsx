import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
// import { jwtDecode } from "jwt-decode";
import { useAuth } from "../context/useAuth";

function GoogleSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = params.get("token");
    // console.log("Token from Google:", token);
    // console.log("Decoded user:", jwtDecode(token));

    if (token) {
      login(token); // your login function stores token and decodes user
    } else {
      navigate("/login");
    }
  }, [params]);

  return <div>Signing in with Google...</div>;
}

export default GoogleSuccess;
