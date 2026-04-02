class TeacherService {
  constructor(courseDao, enrollmentDao) {
    this.courseDao = courseDao;
    this.enrollmentDao = enrollmentDao;
  }

  async getCourseStudents(teacherId, courseId) {
    const numericCourseId = Number(courseId);

    if (!Number.isInteger(numericCourseId) || numericCourseId <= 0) {
      return {
        ok: false,
        status: 400,
        message: 'Invalid course id.'
      };
    }

    const course = await this.courseDao.findByIdAndTeacherId(
      numericCourseId,
      teacherId
    );

    if (!course) {
      return {
        ok: false,
        status: 404,
        message: 'Course not found or access denied.'
      };
    }

    const students = await this.enrollmentDao.findByCourseId(numericCourseId);

    return {
      ok: true,
      status: 200,
      course,
      students
    };
  }

  async getEnrollmentForEdit(teacherId, enrollmentId) {
    const numericEnrollmentId = Number(enrollmentId);

    if (!Number.isInteger(numericEnrollmentId) || numericEnrollmentId <= 0) {
      return {
        ok: false,
        status: 400,
        message: 'Invalid enrollment id.'
      };
    }

    const enrollment = await this.enrollmentDao.findById(numericEnrollmentId);

    if (!enrollment || enrollment.teacher_id !== teacherId) {
      return {
        ok: false,
        status: 404,
        message: 'Enrollment not found or access denied.'
      };
    }

    return {
      ok: true,
      status: 200,
      enrollment
    };
  }

  async updateEnrollmentResult(teacherId, enrollmentId, formData) {
    const numericEnrollmentId = Number(enrollmentId);

    if (!Number.isInteger(numericEnrollmentId) || numericEnrollmentId <= 0) {
      return {
        ok: false,
        status: 400,
        message: 'Invalid enrollment id.'
      };
    }

    const enrollment = await this.enrollmentDao.findById(numericEnrollmentId);

    if (!enrollment || enrollment.teacher_id !== teacherId) {
      return {
        ok: false,
        status: 404,
        message: 'Enrollment not found or access denied.'
      };
    }

    const allowedStatuses = ['enrolled', 'in_progress', 'completed'];
    const status = formData.status;

    if (!allowedStatuses.includes(status)) {
      return {
        ok: false,
        status: 400,
        message: 'Invalid status.'
      };
    }

    let grade = null;

    if (formData.grade !== undefined && formData.grade !== '') {
      grade = Number(formData.grade);

      if (!Number.isInteger(grade) || grade < 0 || grade > 100) {
        return {
          ok: false,
          status: 400,
          message: 'Grade must be an integer from 0 to 100.'
        };
      }
    }

    const review =
      formData.review && formData.review.trim()
        ? formData.review.trim()
        : null;

    const updatedEnrollment = await this.enrollmentDao.updateResult(
      numericEnrollmentId,
      grade,
      review,
      status
    );

    return {
      ok: true,
      status: 200,
      enrollment: updatedEnrollment
    };
  }
}

module.exports = TeacherService;