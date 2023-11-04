module.exports = (req, res, next) => {
  if (req.user.division_id == 1) {
    return next();
  }
  return res.redirect("/");
};
