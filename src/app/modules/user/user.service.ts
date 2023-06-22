// database/business logic

import httpStatus from 'http-status';
import mongoose from 'mongoose';
import config from '../../../config/index';
import ApiError from '../../../errors/ApiError';
import { AcademicSemester } from '../academicSemester/academicSemester.model';
import { IStudent } from '../student/student.interface';
import { Student } from '../student/student.model';
import { IUser } from './user.interface';
import { User } from './user.model';
import { generateStudentId } from './user.utils';

const createStudent = async (
  student: IStudent,
  user: IUser
): Promise<IUser | null> => {
  // auto generated incremental id
  // default password
  if (!user.password) {
    user.password = config.default_student_password as string;
  }

  // set role
  user.role = 'student';

  // Finding Academic Semester
  const academicSemester = await AcademicSemester.findById(
    student.academicSemester
  );

  // transaction and rollback [1. start session, 2. start transaction]
  let newUserAllData = null;
  const session = await mongoose.startSession();
  try {
    // Database operation start
    // Start Session
    session.startTransaction();

    // Generate Student Id
    const id = await generateStudentId(academicSemester);
    user.id = id;
    student.id = id;

    // Create student
    const newStudent = await Student.create([student], { session });

    if (!newStudent.length) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Failed to create a new student'
      );
    }

    // set student -->  _id into user.student
    user.student = newStudent[0]._id;

    // Create User
    const newUser = await User.create([user], { session });

    if (!newUser.length) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to create a new user');
    }

    newUserAllData = newUser[0];
    // Database operation end

    // Commit Transaction
    await session.commitTransaction();

    // End Session
    await session.endSession();
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }

  // user er moddhe reference field --> student er moddhe reference field---> academicSemester, academicDepartment , academicFaculty

  if (newUserAllData) {
    newUserAllData = await User.findOne({ id: newUserAllData.id }).populate({
      path: 'student',
      populate: [
        {
          path: 'academicSemester',
        },
        {
          path: 'academicDepartment',
        },
        {
          path: 'academicFaculty',
        },
      ],
    });
  }

  return newUserAllData;
};

export const UserService = {
  createStudent,
};

// service -> controller -> route
