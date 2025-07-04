export const errorHandler = (err, req, res, next) => {
  console.error('Server error:', err);
  
  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ 
      error: 'File too large, maximum size is 10MB' 
    });
  }
  
  if (err.message === 'Only PDF and image files are allowed') {
    return res.status(400).json({ 
      error: err.message 
    });
  }
  
  // MongoDB validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: Object.values(err.errors).map(val => val.message).join(', ')
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  // Default error response
  res.status(err.statusCode || 500).json({ 
    error: err.message || 'Internal server error' 
  });
};