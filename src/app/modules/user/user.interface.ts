import { Model } from 'mongoose';

// 1. Create an interface representing a document in MongoDB.
export type IUser = {
  id: string;
  role: string;
  password: string;
};

// 2. Create a Model.
// Create a new Model
export type UserModel = Model<IUser, Record<string, unknown>>;

// type/interface -> schema -> model
