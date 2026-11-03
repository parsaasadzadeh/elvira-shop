const notFoundMiddleware = (req, res) => {
  res.status(404).json({
    success: false,
    message: "مسیر مورد نظر یافت نشد",
  });
};

module.exports = notFoundMiddleware;
