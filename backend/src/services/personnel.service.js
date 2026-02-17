import Personnel from "../models/common/personnel.model";
import { ApiError } from "../utils/ApiError";

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
