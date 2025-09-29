import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

export function getKindeToken () {
  const { getToken } = useKindeAuth();

  async function fetchToken() {
    try {
      const token = await getToken();
      return token;
    } catch (err) {
      console.error("Failed to get Kinde token", err);
      return null;
    }
  }

  return { fetchToken };
}
