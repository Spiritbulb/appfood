import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';



export async function loginWithAuth0() {
  try {
    const [request, response, promptAsync] = AuthSession.useAuthRequest(
        {
          clientId: "ZMurQ8PlcR9R3fCdAzpTKvumbD2X63Vu",
          redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
          scopes: ["openid", "profile", "email"],
          responseType: "token",
        },
        { authorizationEndpoint: "https://auth.spiritbulb.com/authorize" }
      );

    if (result.type === 'success' && result.params.access_token) {
      await SecureStore.setItemAsync('access_token', result.params.access_token);
      return true;
    }
  } catch (error) {
    console.error('Auth0 login failed:', error);
  }

  return false;
}

export async function refreshAuthToken() {
  const refreshToken = await SecureStore.getItemAsync('refresh_token');
  if (!refreshToken) return false;

  try {
    const response = await fetch(`https://auth.spiribulb.com/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: ZMurQ8PlcR9R3fCdAzpTKvumbD2X63Vu,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    const data = await response.json();
    if (data.access_token) {
      await SecureStore.setItemAsync('access_token', data.access_token);
      return true;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }

  return false;
}
