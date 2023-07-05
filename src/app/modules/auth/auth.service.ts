import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { jwtHelpers } from '../../../helpers/jwtHelpers';
import { User } from '../user/user.model';
import {
  IChangePassword,
  ILoginUser,
  ILoginUserResponse,
  IRefreshTokenResponse,
} from './auth.interface';

const loginUser = async (payload: ILoginUser): Promise<ILoginUserResponse> => {
  const { id, password } = payload;

  // Using method
  // // creating instance of user [ user instance ]
  // const user = new User(); // instance create korsi
  // // access to our instance method [ check user exist ]
  // const isUserExist = await user.isUserExist(id);

  // Using static
  const isUserExist = await User.isUserExist(id);

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
  }

  // match password
  if (
    isUserExist.password &&
    // !user.isPasswordMatched(password, isUserExist?.password) // using instance method
    !(await User.isPasswordMatched(password, isUserExist?.password)) // using static method
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password is incorrect');
  }

  // create/generate access token & refresh token
  const { id: userId, role, needsPasswordChange } = isUserExist;
  const accessToken = jwtHelpers.createToken(
    { userId, role },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.createToken(
    { userId, role },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
    needsPasswordChange,
  };
};

const refreshToken = async (token: string): Promise<IRefreshTokenResponse> => {
  // Verify Refresh Token here
  // invalid token - synchronous
  let verifiedToken = null;
  try {
    verifiedToken = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_secret as Secret
    );
  } catch (error) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid Refresh Token');
  }

  const { userId } = verifiedToken;

  // tumi delete hye gso, kintu tomar refresh token ase
  // checking deleted user's refresh token
  const isUserExist = await User.isUserExist(userId);
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
  }

  // generate new token
  const newAccessToken = jwtHelpers.createToken(
    {
      id: isUserExist?.id,
      role: isUserExist?.role,
    },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  );

  return {
    accessToken: newAccessToken,
  };
};

const changePassword = async (
  user: JwtPayload | null,
  payload: IChangePassword
): Promise<void> => {
  // payload = passwordData
  const { oldPassword, newPassword } = payload;

  // checking is user exist
  const isUserExist = await User.isUserExist(user?.userId);

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
  }

  // checking old password
  if (
    isUserExist.password &&
    !(await User.isPasswordMatched(oldPassword, isUserExist?.password))
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Old Password is incorrect');
  }

  // hash password before saving
  const newHashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  const query = { id: user?.userId };
  const updatedData = {
    password: newHashedPassword,
    needsPasswordChange: false,
    passwordChangedAt: new Date(),
  };

  // update password after hashing
  await User.findOneAndUpdate(query, updatedData);
};

export const AuthService = {
  loginUser,
  refreshToken,
  changePassword,
};

/*
    Static -> Direct access from model
    Instance -> Need to create an instance from model, then access
  */

/*
    const accessToken = jwt.sign({
      id: isUserExist?.id,
      role: isUserExist?.role
    }, config.jwt.secret as Secret, {
      expiresIn: config.jwt.expires_in
    })
  
    const refreshToken = jwt.sign({
      id: isUserExist?.id,
      role: isUserExist?.role
    }, config.jwt.refresh_secret as Secret, {
      expiresIn: config.jwt.refresh_expires_in
    })
*/
