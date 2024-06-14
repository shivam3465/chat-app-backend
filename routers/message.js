import express from "express";
import { getAllMessage } from "../controllers/message.js";
import { authenticated } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticated)

//get all message of a particular conversationId 
router.route("/:conversationId").get(getAllMessage);

export default router;