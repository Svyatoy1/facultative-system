jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

const CourseController = require('../../src/controllers/CourseController');

describe('CourseController', () => {
  let courseService;
  let viewRenderer;
  let courseController;
  let req;
  let res;

  beforeEach(() => {
    courseService = {
      getStudentCourseCatalog: jest.fn(),
      getMyCourses: jest.fn(),
      getTeacherCourses: jest.fn(),
      enrollStudent: jest.fn(),
      createCourseByTeacher: jest.fn()
    };

    viewRenderer = {
      render: jest.fn()
    };

    courseController = new CourseController(courseService, viewRenderer);

    req = {
      user: {
        id: 4,
        role: 'student',
        full_name: 'Анна Мельник',
        login: 'student_anna'
      },
      params: {},
      body: {}
    };

    res = {
      writeHead: jest.fn(),
      end: jest.fn()
    };

    jest.clearAllMocks();
  });

  test('showAllCourses should render student courses page', async () => {
    const mockCourses = [{ id: 1, title: 'Web Development Basics' }];
    courseService.getStudentCourseCatalog.mockResolvedValue(mockCourses);

    await courseController.showAllCourses(req, res);

    expect(courseService.getStudentCourseCatalog).toHaveBeenCalledWith(4);
    expect(viewRenderer.render).toHaveBeenCalledWith(
      res,
      'student/courses',
      expect.objectContaining({
        title: 'All Courses',
        user: req.user,
        courses: mockCourses
      })
    );
  });

  test('enroll should render error page if enrollment fails', async () => {
    req.params = { id: '1' };

    courseService.enrollStudent.mockResolvedValue({
      ok: false,
      status: 409,
      message: 'You are already enrolled in this course.'
    });

    await courseController.enroll(req, res);

    expect(viewRenderer.render).toHaveBeenCalledWith(
      res,
      'error',
      expect.objectContaining({
        title: 'Enrollment error',
        message: 'You are already enrolled in this course.',
        backHref: '/courses'
      }),
      409
    );
  });

  test('enroll should redirect to my-courses on success', async () => {
    req.params = { id: '1' };

    courseService.enrollStudent.mockResolvedValue({
      ok: true,
      status: 201,
      enrollment: { id: 8 }
    });

    await courseController.enroll(req, res);

    expect(res.writeHead).toHaveBeenCalledWith(302, { Location: '/my-courses' });
    expect(res.end).toHaveBeenCalled();
  });

  test('showMyCourses should render my-courses page', async () => {
    const mockEnrollments = [{ id: 1, title: 'Database Fundamentals' }];
    courseService.getMyCourses.mockResolvedValue(mockEnrollments);

    await courseController.showMyCourses(req, res);

    expect(courseService.getMyCourses).toHaveBeenCalledWith(4);
    expect(viewRenderer.render).toHaveBeenCalledWith(
      res,
      'student/my-courses',
      expect.objectContaining({
        title: 'My Courses',
        enrollments: mockEnrollments
      })
    );
  });

  test('showTeacherCourses should render teacher courses page', async () => {
    req.user = {
      id: 2,
      role: 'teacher',
      full_name: 'Іван Петренко',
      login: 'teacher_ivan'
    };

    const mockCourses = [{ id: 1, title: 'Node.js for Beginners' }];
    courseService.getTeacherCourses.mockResolvedValue(mockCourses);

    await courseController.showTeacherCourses(req, res);

    expect(courseService.getTeacherCourses).toHaveBeenCalledWith(2);
    expect(viewRenderer.render).toHaveBeenCalledWith(
      res,
      'teacher/courses',
      expect.objectContaining({
        title: 'Teacher Courses',
        courses: mockCourses
      })
    );
  });

  test('showCreateTeacherCourseForm should render create-course page', async () => {
    req.user.role = 'teacher';

    await courseController.showCreateTeacherCourseForm(req, res);

    expect(viewRenderer.render).toHaveBeenCalledWith(
      res,
      'teacher/create-course',
      expect.objectContaining({
        title: 'Create Course',
        errorMessage: '',
        formValues: {}
      })
    );
  });

  test('createCourseByTeacher should render form with error on failure', async () => {
    req.user = {
      id: 2,
      role: 'teacher',
      full_name: 'Іван Петренко',
      login: 'teacher_ivan'
    };

    req.body = {
      title: '',
      description: 'Course description'
    };

    courseService.createCourseByTeacher.mockResolvedValue({
      ok: false,
      status: 400,
      message: 'Course title is required.'
    });

    await courseController.createCourseByTeacher(req, res);

    expect(viewRenderer.render).toHaveBeenCalledWith(
      res,
      'teacher/create-course',
      expect.objectContaining({
        errorMessage: 'Course title is required.',
        formValues: req.body
      }),
      400
    );
  });

  test('createCourseByTeacher should redirect on success', async () => {
    req.user = {
      id: 2,
      role: 'teacher',
      full_name: 'Іван Петренко',
      login: 'teacher_ivan'
    };

    req.body = {
      title: 'Advanced JS',
      description: 'Deep dive'
    };

    courseService.createCourseByTeacher.mockResolvedValue({
      ok: true,
      status: 201,
      course: {
        id: 15,
        title: 'Advanced JS'
      }
    });

    await courseController.createCourseByTeacher(req, res);

    expect(res.writeHead).toHaveBeenCalledWith(302, {
      Location: '/teacher/courses'
    });
    expect(res.end).toHaveBeenCalled();
  });
});