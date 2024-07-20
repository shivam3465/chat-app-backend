import express from "express";
import {
	getUserDetails,
	login,
	logout,
	registerUser,
	removeFriend,
	searchUsers,
} from "../controllers/user.js";

import { authenticated } from "../middleware/auth.js";

const router = express.Router();

//authentication routes
router.route("/register").post(registerUser);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/me").get(authenticated, getUserDetails);

//
router.route("/search").get(authenticated, searchUsers);
router.route("/remove-friend").post(authenticated, removeFriend);

// router.route("/user/add/desc").post(authenticated, addDesc);
// router.route("/user/add/about").post(authenticated, addAbout);
// router.route("/user/add/about/profile").post(authenticated, addProfile);

// router.route("/contact").post(contactMe);

export default router;
