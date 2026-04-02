class CourseService {
  constructor(courseDao, enrollmentDao) {
    this.courseDao = courseDao;
    this.enrollmentDao = enrollmentDao;
  }

  async getStudentCourseCatalog(studentId) {
    return this.courseDao.findAllForStudent(studentId);
  }

  async getMyCourses(studentId) {
    return this.enrollmentDao.findByStudentId(studentId);
  }

  async getTeacherCourses(teacherId) {
    return this.courseDao.findByTeacherId(teacherId);
  }

  async enrollStudent(studentId, courseId) {
    const numericCourseId = Number(courseId);

    if (!Number.isInteger(numericCourseId) || numericCourseId <= 0) {
      return {
        ok: false,
        status: 400,
        message: 'Invalid course id.'
      };
    }

    const course = await this.courseDao.findById(numericCourseId);

    if (!course) {
      return {
        ok: false,
        status: 404,
        message: 'Course not found.'
      };
    }

    const existingEnrollment = await this.enrollmentDao.findByStudentAndCourse(
      studentId,
      numericCourseId
    );

    if (existingEnrollment) {
      return {
        ok: false,
        status: 409,
        message: 'You are already enrolled in this course.'
      };
    }

    const enrollment = await this.enrollmentDao.createEnrollment(
      studentId,
      numericCourseId
    );

    return {
      ok: true,
      status: 201,
      enrollment
    };
  }
}

module.exports = CourseService;