const CourseService = require('../../src/services/CourseService');

describe('CourseService', () => {
  let courseDao;
  let enrollmentDao;
  let courseService;

  beforeEach(() => {
    courseDao = {
      findAllForStudent: jest.fn(),
      findByTeacherId: jest.fn(),
      findById: jest.fn()
    };

    enrollmentDao = {
      findByStudentId: jest.fn(),
      findByStudentAndCourse: jest.fn(),
      createEnrollment: jest.fn()
    };

    courseService = new CourseService(courseDao, enrollmentDao);
  });

  test('should return student course catalog', async () => {
    const mockCourses = [{ id: 1, title: 'Web Development Basics' }];
    courseDao.findAllForStudent.mockResolvedValue(mockCourses);

    const result = await courseService.getStudentCourseCatalog(4);

    expect(courseDao.findAllForStudent).toHaveBeenCalledWith(4);
    expect(result).toEqual(mockCourses);
  });

  test('should return my courses', async () => {
    const mockEnrollments = [{ id: 1, title: 'Database Fundamentals' }];
    enrollmentDao.findByStudentId.mockResolvedValue(mockEnrollments);

    const result = await courseService.getMyCourses(4);

    expect(enrollmentDao.findByStudentId).toHaveBeenCalledWith(4);
    expect(result).toEqual(mockEnrollments);
  });

  test('should return teacher courses', async () => {
    const mockCourses = [{ id: 2, title: 'Node.js for Beginners' }];
    courseDao.findByTeacherId.mockResolvedValue(mockCourses);

    const result = await courseService.getTeacherCourses(2);

    expect(courseDao.findByTeacherId).toHaveBeenCalledWith(2);
    expect(result).toEqual(mockCourses);
  });

  test('should reject invalid course id on enroll', async () => {
    const result = await courseService.enrollStudent(4, 'abc');

    expect(result).toEqual({
      ok: false,
      status: 400,
      message: 'Invalid course id.'
    });

    expect(courseDao.findById).not.toHaveBeenCalled();
  });

  test('should return 404 if course does not exist', async () => {
    courseDao.findById.mockResolvedValue(null);

    const result = await courseService.enrollStudent(4, '10');

    expect(courseDao.findById).toHaveBeenCalledWith(10);
    expect(result).toEqual({
      ok: false,
      status: 404,
      message: 'Course not found.'
    });
  });

  test('should return 409 if student is already enrolled', async () => {
    courseDao.findById.mockResolvedValue({ id: 1, title: 'Web Development Basics' });
    enrollmentDao.findByStudentAndCourse.mockResolvedValue({ id: 99 });

    const result = await courseService.enrollStudent(4, '1');

    expect(enrollmentDao.findByStudentAndCourse).toHaveBeenCalledWith(4, 1);
    expect(result).toEqual({
      ok: false,
      status: 409,
      message: 'You are already enrolled in this course.'
    });
  });

  test('should create enrollment successfully', async () => {
    const mockEnrollment = {
      id: 7,
      student_id: 4,
      course_id: 1,
      status: 'enrolled'
    };

    courseDao.findById.mockResolvedValue({ id: 1, title: 'Web Development Basics' });
    enrollmentDao.findByStudentAndCourse.mockResolvedValue(null);
    enrollmentDao.createEnrollment.mockResolvedValue(mockEnrollment);

    const result = await courseService.enrollStudent(4, '1');

    expect(enrollmentDao.createEnrollment).toHaveBeenCalledWith(4, 1);
    expect(result).toEqual({
      ok: true,
      status: 201,
      enrollment: mockEnrollment
    });
  });
});