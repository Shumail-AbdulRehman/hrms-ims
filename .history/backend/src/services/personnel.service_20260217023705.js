import Personnel from "../models/personnel.model.js";
import { ApiError } from "../utils/ApiError.js";


const signUpService = async (name, email, password) => {

const signInService = async (email, password) => {
  const personnel = await Personnel.findOne({ email });

  if (!personnel) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await personnel.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Password incorrect");
  }

  const accessToken = await personnel.generateAccessToken();
  const refreshToken = await personnel.generateRefreshToken();

  personnel.refreshToken = refreshToken;
  await personnel.save({ validateBeforeSave: false });

  const loggedInPersonnel = await Personnel.findById(personnel._id)
    .select("-password -refreshToken");

  return {
    personnel: loggedInPersonnel,
    accessToken,
    refreshToken,
  };
};

export { signInService };
