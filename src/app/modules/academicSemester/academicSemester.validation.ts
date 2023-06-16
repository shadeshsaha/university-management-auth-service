import { z } from 'zod';
import {
  academicSemesterCodes,
  academicSemesterMonths,
  academicSemesterTitles,
} from './academicSemester.constant';

// request-validation
const createAcademicSemesterZodSchema = z.object({
  body: z.object({
    title: z.enum(
      [...academicSemesterTitles] as [string, ...string[]],
      { required_error: 'Title is required' } // error message
    ),

    year: z.string({
      required_error: 'Year is required',
    }),

    code: z.enum([...academicSemesterCodes] as [string, ...string[]]),

    startMonth: z.enum([...academicSemesterMonths] as [string, ...string[]], {
      required_error: 'Start month is required',
    }),
    endMonth: z.enum([...academicSemesterMonths] as [string, ...string[]], {
      required_error: 'End month is required',
    }),
  }),
});

// Update validation
const updateAcademicSemesterZodSchema = z
  .object({
    body: z.object({
      title: z
        .enum(
          [...academicSemesterTitles] as [string, ...string[]],
          { required_error: 'Title is required' } // error message
        )
        .optional(),

      year: z
        .string({
          required_error: 'Year is required',
        })
        .optional(),

      code: z
        .enum([...academicSemesterCodes] as [string, ...string[]])
        .optional(),

      startMonth: z
        .enum([...academicSemesterMonths] as [string, ...string[]], {
          required_error: 'Start month is required',
        })
        .optional(),
      endMonth: z
        .enum([...academicSemesterMonths] as [string, ...string[]], {
          required_error: 'End month is required',
        })
        .optional(),
    }),
  })
  .refine(
    data =>
      (data.body.title && data.body.code) ||
      (!data.body.title && !data.body.code),
    {
      message: 'Either both title and code should be provided or neither',
    }
  );

export const AcademicSemesterValidation = {
  createAcademicSemesterZodSchema,
  updateAcademicSemesterZodSchema,
};
