/* eslint-disable no-console */
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { jwtHelpers } from '../../../helpers/jwtHelpers';
import { User } from '../user/user.model';
import { ILoginUser, ILoginUserResponse } from './auth.interface';

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

  console.log({ accessToken, refreshToken, needsPasswordChange });

  return {
    accessToken,
    refreshToken,
    needsPasswordChange,
  };
};

export const AuthService = {
  loginUser,
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
