import { Router } from "express";
import { signIn, signUp } from "../controllers/personnel.controller.js";

const router = Router();

router.route("/sign--In").post(signIn);
//this is he route for signing up a new user, it will be used by the admin to create new personnel accounts
// the signUp function will be responsible for creating a new user in the database, it will take the user details from the request body and create a new user in the database, it will also hash the password before saving it to the database for security reasons
router.route("/sign--up").post(signUp);

export default router;
