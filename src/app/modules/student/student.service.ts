// Business Logic's are here...

/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import { SortOrder } from 'mongoose';
import ApiError from '../../../errors/ApiError';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { studentSearchableFields } from './student.constant';
import { IStudent, IStudentFilters } from './student.interface';
import { Student } from './student.model';

// Pagination Service
const getAllStudents = async (
  filters: IStudentFilters,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<IStudent[]>> => {
  // Search/filters
  const { searchTerm, ...filtersData } = filters;

  // pagination
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginationOptions);

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      $or: studentSearchableFields?.map(field => ({
        [field]: {
          $regex: searchTerm,
          $options: 'i',
        },
      })),
    });
  }

  // Exact Search
  if (Object.keys(filtersData).length) {
    andConditions.push({
      $and: Object.entries(filtersData)?.map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  const sortConditions: { [key: string]: SortOrder } = {};

  if (sortBy && sortOrder) {
    sortConditions[sortBy] = sortOrder;
  }

  const whereConditions =
    andConditions.length > 0 ? { $and: andConditions } : {};

  const result = await Student.find(whereConditions)
    .populate('academicSemester')
    .populate('academicDepartment')
    .populate('academicFaculty')
    .sort(sortConditions)
    .skip(skip)
    .limit(limit);

  const total = await Student.countDocuments(whereConditions);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

// Get Single Semester
const getSingleStudent = async (id: string): Promise<IStudent | null> => {
  const result = await Student.findById(id)
    .populate('academicSemester')
    .populate('academicDepartment')
    .populate('academicFaculty');
  return result;
};

// Update Student Service
const updateStudent = async (
  id: string,
  payload: Partial<IStudent>
): Promise<IStudent | null> => {
  // Find and update student
  const studentIsExist = await Student.findOne({ id });

  if (!studentIsExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Student not found');
  }

  // Now destructure embedded object/field [embedded shown in interface]
  const { name, guardian, localGuardian, ...studentData } = payload;

  // now copy rest student data
  const updatedStudentData: Partial<IStudent> = { ...studentData };

  // dynamically handling specefic update data
  // For name
  if (name && Object.keys(name).length > 0) {
    Object.keys(name).forEach(key => {
      const nameKey = `name.${key}`; // name.firstName --> avabe ashbe
      (updatedStudentData as any)[nameKey] = name[key as keyof typeof name];
    });
  }

  // For guardian
  if (guardian && Object.keys(guardian).length > 0) {
    Object.keys(guardian).forEach(key => {
      const guardianKey = `guardian.${key}`;
      (updatedStudentData as any)[guardianKey] =
        guardian[key as keyof typeof guardian]; // updatedStudentData[guardian.motherContactNo] = guardian[motherContactNo] --> avabe boshbe
      // updatedStudentData --> object create --> guardian : { motherContactNo: 0177}
    });
  }

  // For localGuardian
  if (localGuardian && Object.keys(localGuardian).length > 0) {
    Object.keys(localGuardian).forEach(key => {
      const localGuardianKey = `localGuardian.${key}`;
      (updatedStudentData as any)[localGuardianKey] =
        localGuardian[key as keyof typeof localGuardian];
    });
  }

  const result = await Student.findOneAndUpdate({ id }, updatedStudentData, {
    new: true,
  });
  return result;
};

// Delete Semester Service
const deleteStudent = async (id: string): Promise<IStudent | null> => {
  const result = await Student.findByIdAndDelete(id)
    .populate('academicSemester')
    .populate('academicDepartment')
    .populate('academicFaculty');
  return result;
};

export const StudentService = {
  getAllStudents,
  getSingleStudent,
  updateStudent,
  deleteStudent,
};
