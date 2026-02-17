import mongoose from "mongoose";
import Personnel from "../models/common/personnel.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import {ApiResponse} from "../utils/ApiResponse";



const signIn=asyncHandler((req,res,next)=>
{

});

const signUp=asyncHandler((req,res,next)=>
{

});


export{
    signIn,
    signUp,
}