
import { Router } from "express";

import { 
    signIn,
    signUp,

 } from "../controllers/personnel.controller";

 const router= Router();


 router.route("/signIn").post(signIn);













 export default router;