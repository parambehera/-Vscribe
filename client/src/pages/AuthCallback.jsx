import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get("error");

    if (error === "user_exists") {
      alert("This email is already registered. Please log in instead.");
      navigate("/login"); // redirect user to login page
    }
  }, [location, navigate]);

  return <p>Redirecting...</p>;
}
