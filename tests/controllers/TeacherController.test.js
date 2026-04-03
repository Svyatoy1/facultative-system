jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

const TeacherController = require('../../src/controllers/TeacherController');

describe('TeacherController', () => {
  let teacherService;
  let viewRenderer;
  let teacherController;
  let req;
  let res;

  beforeEach(() => {
    teacherService = {
      getCourseStudents: jest.fn(),
      getEnrollmentForEdit: jest.fn(),
      updateEnrollmentResult: jest.fn()
    };

    viewRenderer = {
      render: jest.fn()
    };

    teacherController = new TeacherController(teacherService, viewRenderer);

    req = {
      user: {
        id: 2,
        role: 'teacher',
        full_name: 'Іван Петренко',
        login: 'teacher_ivan'
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

  test('showCourseStudents should render error page on failure', async () => {
    req.params = { id: '1' };

    teacherService.getCourseStudents.mockResolvedValue({
      ok: false,
      status: 404,
      message: 'Course not found or access denied.'
    });

    await teacherController.showCourseStudents(req, res);

    expect(viewRenderer.render).toHaveBeenCalledWith(
      res,
      'error',
      expect.objectContaining({
        heading: 'Error',
        message: 'Course not found or access denied.'
      }),
      404
    );
  });

  test('showCourseStudents should render students page on success', async () => {
    req.params = { id: '1' };

    teacherService.getCourseStudents.mockResolvedValue({
      ok: true,
      status: 200,
      course: { id: 1, title: 'Web Development Basics' },
      students: [{ id: 1, student_name: 'Анна Мельник' }]
    });

    await teacherController.showCourseStudents(req, res);

    expect(viewRenderer.render).toHaveBeenCalledWith(
      res,
      'teacher/students',
      expect.objectContaining({
        title: 'Course Students',
        course: { id: 1, title: 'Web Development Basics' },
        students: [{ id: 1, student_name: 'Анна Мельник' }]
      })
    );
  });

  test('showEditEnrollmentForm should render error page on failure', async () => {
    req.params = { id: '5' };

    teacherService.getEnrollmentForEdit.mockResolvedValue({
      ok: false,
      status: 404,
      message: 'Enrollment not found or access denied.'
    });

    await teacherController.showEditEnrollmentForm(req, res);

    expect(viewRenderer.render).toHaveBeenCalledWith(
      res,
      'error',
      expect.objectContaining({
        message: 'Enrollment not found or access denied.'
      }),
      404
    );
  });

  test('showEditEnrollmentForm should render edit form on success', async () => {
    req.params = { id: '5' };

    const mockEnrollment = {
      id: 5,
      course_id: 1,
      course_title: 'Web Development Basics',
      student_name: 'Анна Мельник'
    };

    teacherService.getEnrollmentForEdit.mockResolvedValue({
      ok: true,
      status: 200,
      enrollment: mockEnrollment
    });

    await teacherController.showEditEnrollmentForm(req, res);

    expect(viewRenderer.render).toHaveBeenCalledWith(
      res,
      'teacher/edit-enrollment',
      expect.objectContaining({
        title: 'Edit Result',
        enrollment: mockEnrollment,
        errorMessage: ''
      })
    );
  });

  test('updateEnrollment should render error page if update fails and reload also fails', async () => {
    req.params = { id: '5' };
    req.body = {
      status: 'wrong_status',
      grade: '90',
      review: 'Good'
    };

    teacherService.updateEnrollmentResult.mockResolvedValue({
      ok: false,
      status: 400,
      message: 'Invalid status.'
    });

    teacherService.getEnrollmentForEdit.mockResolvedValue({
      ok: false,
      status: 404,
      message: 'Enrollment not found or access denied.'
    });

    await teacherController.updateEnrollment(req, res);

    expect(viewRenderer.render).toHaveBeenCalledWith(
      res,
      'error',
      expect.objectContaining({
        heading: 'Update Error',
        message: 'Invalid status.'
      }),
      400
    );
  });

  test('updateEnrollment should re-render edit form with validation error if reload succeeds', async () => {
    req.params = { id: '5' };
    req.body = {
      status: 'completed',
      grade: '150',
      review: 'Good'
    };

    teacherService.updateEnrollmentResult.mockResolvedValue({
      ok: false,
      status: 400,
      message: 'Grade must be an integer from 0 to 100.'
    });

    const mockEnrollment = {
      id: 5,
      course_id: 1,
      course_title: 'Web Development Basics',
      student_name: 'Анна Мельник'
    };

    teacherService.getEnrollmentForEdit.mockResolvedValue({
      ok: true,
      status: 200,
      enrollment: mockEnrollment
    });

    await teacherController.updateEnrollment(req, res);

    expect(viewRenderer.render).toHaveBeenCalledWith(
      res,
      'teacher/edit-enrollment',
      expect.objectContaining({
        enrollment: mockEnrollment,
        errorMessage: 'Grade must be an integer from 0 to 100.'
      }),
      400
    );
  });

  test('updateEnrollment should redirect on success', async () => {
    req.params = { id: '5' };
    req.body = {
      status: 'completed',
      grade: '95',
      review: 'Excellent work'
    };

    teacherService.updateEnrollmentResult.mockResolvedValue({
      ok: true,
      status: 200,
      enrollment: {
        id: 5,
        course_id: 3
      }
    });

    await teacherController.updateEnrollment(req, res);

    expect(res.writeHead).toHaveBeenCalledWith(302, {
      Location: '/teacher/courses/3/students'
    });
    expect(res.end).toHaveBeenCalled();
  });
});