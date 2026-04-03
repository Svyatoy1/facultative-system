jest.mock('../../src/config/db', () => ({
  query: jest.fn()
}));

const pool = require('../../src/config/db');
const EnrollmentDao = require('../../src/dao/EnrollmentDao');

describe('EnrollmentDao', () => {
  let enrollmentDao;

  beforeEach(() => {
    enrollmentDao = new EnrollmentDao();
    jest.clearAllMocks();
  });

  test('findByStudentAndCourse should return enrollment if found', async () => {
    const mockEnrollment = {
      id: 5,
      student_id: 4,
      course_id: 1,
      status: 'enrolled'
    };

    pool.query.mockResolvedValue({ rows: [mockEnrollment] });

    const result = await enrollmentDao.findByStudentAndCourse(4, 1);

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('WHERE student_id = $1 AND course_id = $2'),
      [4, 1]
    );
    expect(result).toEqual(mockEnrollment);
  });

  test('findByStudentAndCourse should return null if not found', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const result = await enrollmentDao.findByStudentAndCourse(4, 99);

    expect(result).toBeNull();
  });

  test('createEnrollment should create and return enrollment', async () => {
    const mockEnrollment = {
      id: 8,
      student_id: 4,
      course_id: 3,
      status: 'enrolled'
    };

    pool.query.mockResolvedValue({ rows: [mockEnrollment] });

    const result = await enrollmentDao.createEnrollment(4, 3);

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO enrollments'),
      [4, 3]
    );
    expect(result).toEqual(mockEnrollment);
  });

  test('findByStudentId should return student enrollments', async () => {
    const mockEnrollments = [
      {
        id: 1,
        status: 'completed',
        grade: 95,
        review: 'Great job',
        course_id: 1,
        title: 'Web Development Basics',
        teacher_name: 'Іван Петренко'
      }
    ];

    pool.query.mockResolvedValue({ rows: mockEnrollments });

    const result = await enrollmentDao.findByStudentId(4);

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('WHERE e.student_id = $1'),
      [4]
    );
    expect(result).toEqual(mockEnrollments);
  });

  test('findByCourseId should return enrolled students for a course', async () => {
    const mockStudents = [
      {
        id: 1,
        student_id: 4,
        student_name: 'Анна Мельник',
        student_login: 'student_anna',
        status: 'in_progress'
      }
    ];

    pool.query.mockResolvedValue({ rows: mockStudents });

    const result = await enrollmentDao.findByCourseId(1);

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('WHERE e.course_id = $1'),
      [1]
    );
    expect(result).toEqual(mockStudents);
  });

  test('findById should return enrollment if found', async () => {
    const mockEnrollment = {
      id: 1,
      student_id: 4,
      course_id: 1,
      status: 'completed',
      grade: 95,
      review: 'Excellent',
      student_name: 'Анна Мельник',
      course_title: 'Web Development Basics',
      teacher_id: 2
    };

    pool.query.mockResolvedValue({ rows: [mockEnrollment] });

    const result = await enrollmentDao.findById(1);

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('WHERE e.id = $1'),
      [1]
    );
    expect(result).toEqual(mockEnrollment);
  });

  test('findById should return null if enrollment not found', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const result = await enrollmentDao.findById(999);

    expect(result).toBeNull();
  });

  test('updateResult should update and return enrollment', async () => {
    const mockUpdatedEnrollment = {
      id: 1,
      course_id: 3,
      status: 'completed',
      grade: 98,
      review: 'Excellent progress'
    };

    pool.query.mockResolvedValue({ rows: [mockUpdatedEnrollment] });

    const result = await enrollmentDao.updateResult(
      1,
      98,
      'Excellent progress',
      'completed'
    );

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE enrollments'),
      [1, 98, 'Excellent progress', 'completed']
    );
    expect(result).toEqual(mockUpdatedEnrollment);
  });
});