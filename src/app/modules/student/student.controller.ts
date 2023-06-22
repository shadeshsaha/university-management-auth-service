import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/pagination';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { studentFilterableFields } from './student.constant';
import { IStudent } from './student.interface';
import { StudentService } from './student.service';

// Pagination
const getAllStudents = catchAsync(async (req: Request, res: Response) => {
  // filters/search
  const filters = pick(req.query, studentFilterableFields);

  // pagination
  const paginationOptions = pick(req.query, paginationFields);

  const result = await StudentService.getAllStudents(
    filters,
    paginationOptions
  );

  sendResponse<IStudent[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Students Retrived Successfully',
    meta: result.meta,
    data: result.data,
  });
});

// Get Single Student
const getSingleStudent = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;

  const result = await StudentService.getSingleStudent(id);

  sendResponse<IStudent>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student Retrived Successfully',
    data: result,
  });
});

// Update Student
const updateStudent = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const updatedData = req.body;

  const result = await StudentService.updateStudent(id, updatedData);

  sendResponse<IStudent>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student Updated Successfully',
    data: result,
  });
});

// Delete a Student
const deleteStudent = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;

  const result = await StudentService.deleteStudent(id);

  sendResponse<IStudent>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student Deleted Successfully',
    data: result,
  });
});

export const StudentController = {
  getAllStudents,
  getSingleStudent,
  updateStudent,
  deleteStudent,
};
