import mongoose from 'mongoose';

export function validateObjectId(paramName = 'id') {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (id && !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: `Invalid MongoDB ObjectId format for parameter '${paramName}': ${id}`
      });
    }
    next;
    return next();
  };
}
