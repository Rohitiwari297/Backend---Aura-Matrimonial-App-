import axios from "axios";
import { getAccessToken } from "./getAccessToken.js";

const PROJECT_ID = "shyamaura-app";

export const sendNotification = async ( title, message) => {
  const accessToken = await getAccessToken();
  //console.log('accessToken:', accessToken)

  const url = `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`;

  const payload = {
    message: {
    //   token: fcmToken,
      topic:"newmatch",
      notification: {
        title: title,
        body: message,
      },
      data: {
        type: "chat",
        userId: "123",
      },
    },
  };

  console.log('payload:', payload)

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.post(url, payload, { headers });
    console.log("Notification sent:", response.data);
  } catch (error) {
    console.error("Error sending notification:", error.response?.data || error.message);
  }
};
