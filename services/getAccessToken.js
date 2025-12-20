import { GoogleAuth } from "google-auth-library";
const  serviceAccount ="./services/serviceAccountKey.json";
console.log(serviceAccount)

export const getAccessToken = async () => {
  const auth = new GoogleAuth({
    keyFile: serviceAccount,
    scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
  });

  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();

  return accessToken.token;
};
