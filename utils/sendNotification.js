import Notification from "../models/Notification.model";

const sendNotification = async (userId, type, message, link) => {
  try {
    await Notification.create({
      userId,
      type,
      message,
      link,
    });

    console.log(`Notification sent to user ${userId}: ${message}`);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

export default { sendNotification };
