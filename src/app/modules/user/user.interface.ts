import { Model, Types } from 'mongoose';
import { IAdmin } from '../admin/admin.interface';
import { IFaculty } from '../faculty/faculty.interface';
import { IStudent } from '../student/student.interface';

// 1. Create an interface representing a document in MongoDB.
export type IUser = {
  id: string;
  role: string;
  password: string;
  student?: Types.ObjectId | IStudent;
  faculty?: Types.ObjectId | IFaculty;
  admin?: Types.ObjectId | IAdmin;
};

// 2. Create a Model.
// Create a new Model
export type UserModel = Model<IUser, Record<string, unknown>>;

// type/interface -> schema -> model
