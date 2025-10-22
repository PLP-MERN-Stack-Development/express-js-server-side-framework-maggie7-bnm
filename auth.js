const authenticate = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  // In a real application, you'd validate against a database
  const validApiKey = process.env.API_KEY || 'default-secret-key';
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please provide an API key in x-api-key header'
    });
  }
  
  if (apiKey !== validApiKey) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid API key'
    });
  }
  
  next();
};

module.exports = authenticate;