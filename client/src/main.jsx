import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { KindeProvider } from "@kinde-oss/kinde-auth-react";
import { AuthProvider } from "./providers/authContext.jsx";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(

    <KindeProvider
      clientId={import.meta.env.VITE_KINDE_CLIENT_ID}
      domain={import.meta.env.VITE_KINDE_DOMAIN}
      redirectUri={import.meta.env.VITE_KINDE_REDIRECT_URI}
      logoutUri={import.meta.env.VITE_KINDE_LOGOUT_URI}
    >
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </KindeProvider>
);
