import { findMessagesForRecipient } from "../db/messageRepository.js";

export async function listMessages(req, res, next) {
  try {
    const messages = await findMessagesForRecipient(req.session.userId);

    res.render("messages", {
      title: "Inbox",
      messages,
    });
  } catch (error) {
    next(error);
  }
}
