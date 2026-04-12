const logger = require('../utils/logger');

class CourseController {
  constructor(courseService, viewRenderer) {
    this.courseService = courseService;
    this.viewRenderer = viewRenderer;
  }

  async showAllCourses(req, res) {
    const courses = await this.courseService.getStudentCourseCatalog(req.user.id);

    await this.viewRenderer.render(res, 'student/courses', {
      title: 'All Courses',
      user: req.user,
      courses,
      requiresWindowAuth: true
    });
  }

  async enroll(req, res) {
    const result = await this.courseService.enrollStudent(
      req.user.id,
      req.params.id
    );

    if (!result.ok) {
      logger.warn('Enrollment failed', {
        userId: req.user.id,
        courseId: req.params.id,
        reason: result.message
      });

      await this.viewRenderer.render(
        res,
        'error',
        {
          title: 'Enrollment error',
          user: req.user,
          heading: 'Enrollment error',
          message: result.message,
          backHref: '/courses',
          backLabel: 'Back to courses',
          requiresWindowAuth: true
        },
        result.status
      );
      return;
    }

    logger.info('Student enrolled in course', {
      userId: req.user.id,
      courseId: req.params.id,
      enrollmentId: result.enrollment.id
    });

    res.writeHead(302, { Location: '/my-courses' });
    res.end();
  }

  async showMyCourses(req, res) {
    const enrollments = await this.courseService.getMyCourses(req.user.id);

    await this.viewRenderer.render(res, 'student/my-courses', {
      title: 'My Courses',
      user: req.user,
      enrollments,
      requiresWindowAuth: true
    });
  }

  async showTeacherCourses(req, res) {
    const courses = await this.courseService.getTeacherCourses(req.user.id);

    await this.viewRenderer.render(res, 'teacher/courses', {
      title: 'Teacher Courses',
      user: req.user,
      courses
    });
  }

  async showCreateTeacherCourseForm(req, res) {
    await this.viewRenderer.render(res, 'teacher/create-course', {
      title: 'Create Course',
      user: req.user,
      errorMessage: '',
      formValues: {},
      requiresWindowAuth: true
    });
  }

  async createCourseByTeacher(req, res) {
    const result = await this.courseService.createCourseByTeacher(
      req.user.id,
      req.body
    );

    if (!result.ok) {
      logger.warn('Course creation failed', {
        teacherId: req.user.id,
        reason: result.message
      });

      await this.viewRenderer.render(
        res,
        'teacher/create-course',
        {
          title: 'Create Course',
          user: req.user,
          errorMessage: result.message,
          formValues: req.body
        },
        result.status
      );
      return;
    }

    logger.info('Course created by teacher', {
      teacherId: req.user.id,
      courseId: result.course.id,
      title: result.course.title
    });

    res.writeHead(302, { Location: '/teacher/courses' });
    res.end();
  }
}

module.exports = CourseController;