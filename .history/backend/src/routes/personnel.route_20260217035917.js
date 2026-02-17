
import { Router } from "express";
import { 
    signIn,
    signUp,

 } from "../controllers/personnel.controller.js";



const router= Router();


router.route("/signIn").post(signIn);
router.route("/signUp").post(signUp);














 export default router;