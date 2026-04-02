const logger = require('../utils/logger');

class TeacherController {
  constructor(teacherService, viewRenderer) {
    this.teacherService = teacherService;
    this.viewRenderer = viewRenderer;
  }

  async showCourseStudents(req, res) {
    const result = await this.teacherService.getCourseStudents(
      req.user.id,
      req.params.id
    );

    if (!result.ok) {
      await this.viewRenderer.render(
        res,
        'error',
        {
          title: 'Error',
          user: req.user,
          heading: 'Error',
          message: result.message,
          backHref: '/teacher/courses',
          backLabel: 'Back to my courses'
        },
        result.status
      );
      return;
    }

    await this.viewRenderer.render(res, 'teacher/students', {
      title: 'Course Students',
      user: req.user,
      course: result.course,
      students: result.students
    });
  }

  async showEditEnrollmentForm(req, res) {
    const result = await this.teacherService.getEnrollmentForEdit(
      req.user.id,
      req.params.id
    );

    if (!result.ok) {
      await this.viewRenderer.render(
        res,
        'error',
        {
          title: 'Error',
          user: req.user,
          heading: 'Error',
          message: result.message,
          backHref: '/teacher/courses',
          backLabel: 'Back to my courses'
        },
        result.status
      );
      return;
    }

    await this.viewRenderer.render(res, 'teacher/edit-enrollment', {
      title: 'Edit Result',
      user: req.user,
      enrollment: result.enrollment,
      errorMessage: ''
    });
  }

  async updateEnrollment(req, res) {
    const result = await this.teacherService.updateEnrollmentResult(
      req.user.id,
      req.params.id,
      req.body
    );

    if (!result.ok) {
      logger.warn('Enrollment update failed', {
        teacherId: req.user.id,
        enrollmentId: req.params.id,
        reason: result.message
      });

      const reload = await this.teacherService.getEnrollmentForEdit(
        req.user.id,
        req.params.id
      );

      if (!reload.ok) {
        await this.viewRenderer.render(
          res,
          'error',
          {
            title: 'Update Error',
            user: req.user,
            heading: 'Update Error',
            message: result.message,
            backHref: '/teacher/courses',
            backLabel: 'Back to my courses'
          },
          result.status
        );
        return;
      }

      await this.viewRenderer.render(
        res,
        'teacher/edit-enrollment',
        {
          title: 'Edit Result',
          user: req.user,
          enrollment: reload.enrollment,
          errorMessage: result.message
        },
        result.status
      );
      return;
    }

    logger.info('Enrollment updated', {
      teacherId: req.user.id,
      enrollmentId: req.params.id,
      courseId: result.enrollment.course_id,
      status: req.body.status,
      grade: req.body.grade || null
    });

    res.writeHead(302, {
      Location: `/teacher/courses/${result.enrollment.course_id}/students`
    });
    res.end();
  }
}

module.exports = TeacherController;