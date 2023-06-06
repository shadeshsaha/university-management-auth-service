import { Model, Schema, model } from 'mongoose'
import { IUser } from './users.interface'

// 2. Create a Model.
// Create a new Model
type UserModel = Model<IUser, object>

// 3. Create a Schema corresponding to the document type/interface.
const userSchema = new Schema<IUser>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// creating a model
export const User = model<IUser, UserModel>('User', userSchema)
