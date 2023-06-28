import { Request, Response } from 'express';
import httpStatus from 'http-status';
import config from '../../../config';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ILoginUserResponse } from './auth.interface';
import { AuthService } from './auth.service';

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { ...loginData } = req.body;
  const result = await AuthService.loginUser(loginData);
  const { refreshToken, ...others } = result;

  // set refresh token into cookie
  const cookieOptions = {
    secure: config.env === 'Production',
    httpOnly: true,
  };
  // res.cookie("refreshToken", result.refreshToken, cookieOptions)
  res.cookie('refreshToken', refreshToken, cookieOptions);
  // we dont send refresh token into response after set. for this,
  // delete refresh token
  // delete result.refreshToken --> is not recommended this way

  sendResponse<ILoginUserResponse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User Logged In Successfully !',
    data: others,
    // data: result,
  });
});

export const AuthController = {
  loginUser,
};