import { z } from 'zod';

// req-validation
// body --> object
// data --> object

const createUserZodSchema = z.object({
  body: z.object({
    role: z.string({
      required_error: 'role is required',
    }),
    password: z.string().optional(),
  }),
});

// await createUserZodSchema.parseAsync(req)

export const UserValidation = {
  createUserZodSchema,
};
