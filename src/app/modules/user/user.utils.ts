import { IAcademicSemester } from '../academicSemester/academicSemester.interface';
import { User } from './user.model';

// Generate ID

// For Student
export const findLastStudentId = async (): Promise<string | undefined> => {
  const lastStudent = await User.findOne(
    {
      role: 'student',
    },
    { id: 1, _id: 0 }
  )
    .sort({
      createdAt: -1,
    })
    .lean();

  const result = lastStudent?.id ? lastStudent?.id.substring(4) : undefined;
  return result;
};

export const generateStudentId = async (
  academicSemester: IAcademicSemester
): Promise<string> => {
  const currentId =
    (await findLastStudentId()) || (0).toString().padStart(5, '0');

  // increment id
  let incrementId = (parseInt(currentId) + 1).toString().padStart(5, '0');
  incrementId = `${academicSemester.year.substring(2)}${
    academicSemester.code
  }${incrementId}`; // Example Student id: 250100001

  return incrementId;
};

// For Faculty
export const findLastFacultyId = async (): Promise<string | undefined> => {
  const lastFaculty = await User.findOne(
    {
      role: 'faculty',
    },
    { id: 1, _id: 0 }
  )
    .sort({
      createdAt: -1,
    })
    .lean();
  const result = lastFaculty?.id ? lastFaculty?.id.substring(2) : undefined;
  return result;
};

export const generateFacultyId = async (): Promise<string> => {
  const currentId =
    (await findLastFacultyId()) || (0).toString().padStart(5, '0');

  // increment id
  let incrementId = (parseInt(currentId) + 1).toString().padStart(5, '0');
  incrementId = `F-${incrementId}`; // Example Faculty id: F-00001

  return incrementId;
};

// For Admin
export const findLastAdminId = async (): Promise<string | undefined> => {
  const lastFaculty = await User.findOne({ role: 'admin' }, { id: 1, _id: 0 })
    .sort({
      createdAt: -1,
    })
    .lean();

  return lastFaculty?.id ? lastFaculty.id.substring(2) : undefined;
};

export const generateAdminId = async (): Promise<string> => {
  const currentId =
    (await findLastAdminId()) || (0).toString().padStart(5, '0');
  let incrementedId = (parseInt(currentId) + 1).toString().padStart(5, '0');
  incrementedId = `A-${incrementedId}`;

  return incrementedId;
};
