jest.mock('../../src/config/db', () => ({
  query: jest.fn()
}));

const pool = require('../../src/config/db');
const CourseDao = require('../../src/dao/CourseDao');

describe('CourseDao', () => {
  let courseDao;

  beforeEach(() => {
    courseDao = new CourseDao();
    jest.clearAllMocks();
  });

  test('findAllForStudent should return course catalog for student', async () => {
    const mockCourses = [
      {
        id: 1,
        title: 'Web Development Basics',
        teacher_name: 'Іван Петренко',
        enrollment_id: 5,
        enrollment_status: 'enrolled'
      }
    ];

    pool.query.mockResolvedValue({ rows: mockCourses });

    const result = await courseDao.findAllForStudent(4);

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('LEFT JOIN enrollments e'),
      [4]
    );
    expect(result).toEqual(mockCourses);
  });

  test('findByTeacherId should return teacher courses', async () => {
    const mockCourses = [
      { id: 1, title: 'Node.js for Beginners', description: 'Intro course' }
    ];

    pool.query.mockResolvedValue({ rows: mockCourses });

    const result = await courseDao.findByTeacherId(2);

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('WHERE c.teacher_id = $1'),
      [2]
    );
    expect(result).toEqual(mockCourses);
  });

  test('findById should return course if found', async () => {
    const mockCourse = {
      id: 1,
      title: 'Database Fundamentals',
      description: 'SQL basics',
      teacher_id: 3,
      teacher_name: 'Олена Коваль'
    };

    pool.query.mockResolvedValue({ rows: [mockCourse] });

    const result = await courseDao.findById(1);

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('WHERE c.id = $1'),
      [1]
    );
    expect(result).toEqual(mockCourse);
  });

  test('findById should return null if course not found', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const result = await courseDao.findById(999);

    expect(result).toBeNull();
  });

  test('findByIdAndTeacherId should return course if ownership matches', async () => {
    const mockCourse = {
      id: 1,
      title: 'UI/UX Basics',
      description: 'Design basics',
      teacher_id: 2
    };

    pool.query.mockResolvedValue({ rows: [mockCourse] });

    const result = await courseDao.findByIdAndTeacherId(1, 2);

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('WHERE c.id = $1 AND c.teacher_id = $2'),
      [1, 2]
    );
    expect(result).toEqual(mockCourse);
  });

  test('createCourse should create and return course', async () => {
    const mockCourse = {
      id: 11,
      title: 'Advanced JS',
      description: 'Deep dive',
      teacher_id: 2,
      created_at: '2026-04-03T00:00:00.000Z'
    };

    pool.query.mockResolvedValue({ rows: [mockCourse] });

    const result = await courseDao.createCourse({
      title: 'Advanced JS',
      description: 'Deep dive',
      teacherId: 2
    });

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO courses'),
      ['Advanced JS', 'Deep dive', 2]
    );
    expect(result).toEqual(mockCourse);
  });

  test('findAllWithTeacherAndStudentCount should return all courses with stats', async () => {
    const mockCourses = [
      {
        id: 1,
        title: 'Web Development Basics',
        teacher_name: 'Іван Петренко',
        student_count: 3
      }
    ];

    pool.query.mockResolvedValue({ rows: mockCourses });

    const result = await courseDao.findAllWithTeacherAndStudentCount();

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('COUNT(e.id)::int AS student_count')
    );
    expect(result).toEqual(mockCourses);
  });
});