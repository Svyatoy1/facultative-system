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
      courses
    });
  }

  async enroll(req, res) {
    const result = await this.courseService.enrollStudent(
      req.user.id,
      req.params.id
    );

    if (!result.ok) {
      await this.viewRenderer.render(
        res,
        'error',
        {
          title: 'Enrollment error',
          user: req.user,
          heading: 'Enrollment error',
          message: result.message,
          backHref: '/courses',
          backLabel: 'Back to courses'
        },
        result.status
      );
      return;
    }

    res.writeHead(302, { Location: '/my-courses' });
    res.end();
  }

  async showMyCourses(req, res) {
    const enrollments = await this.courseService.getMyCourses(req.user.id);

    await this.viewRenderer.render(res, 'student/my-courses', {
      title: 'My Courses',
      user: req.user,
      enrollments
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
}

module.exports = CourseController;