import express from "express";
import { authenticated } from "../middleware/auth.js";
import { addConversation, addNewMemberInConversation, getAllConversations } from "../controllers/conversation.js";

const router = express.Router();

router.route("/all").get(authenticated,getAllConversations);
router.route("/create").post(authenticated,addConversation);
router.route("/add-member").post(authenticated,addNewMemberInConversation);

export default router;