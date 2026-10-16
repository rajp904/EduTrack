export function errorHandler(err, req, res, next) {
  console.error(' [Error Middleware]', err);

  // 1. Mongoose / MongoDB Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const fields = Object.keys(err.keyPattern || err.keyValue || {});
    let message = `Duplicate key error: A record with that ${fields.join(', ')} already exists.`;
    if (fields.includes('studentId') && fields.includes('courseId') && fields.includes('date')) {
      message = 'Duplicate Attendance: An attendance record already exists for this student, course, and date.';
    } else if (fields.includes('registrationNumber')) {
      message = 'Duplicate Registration Number: A student with this registration number already exists.';
    } else if (fields.includes('email')) {
      message = 'Duplicate Email: A student with this email address already exists.';
    } else if (fields.includes('courseCode')) {
      message = 'Duplicate Course Code: A course with this code already exists.';
    }
    return res.status(409).json({
      success: false,
      error: message,
      details: err.keyValue
    });
  }

  // 2. MongoDB $jsonSchema Validation Error (Code 121)
  if (err.code === 121) {
    return res.status(400).json({
      success: false,
      error: 'Database-Level Validation Failure: The document violated MongoDB $jsonSchema constraints.',
      details: err.errInfo?.details || err.message
    });
  }

  // 3. Mongoose Schema Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      messages: messages
    });
  }

  // 4. Mongoose CastError (e.g. malformed ObjectId or invalid Number)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: `Invalid ${err.path}: '${err.value}'`
    });
  }

  // Default Internal Server Error
  return res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
}
