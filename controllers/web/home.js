function HomeCtrl(req, res) {
  const { config, userPrefs } = res.locals;

  // Loading reports and media lists
  const recentReports = [];
  const allReports = [];
  const favoriteReports = [];

  res.render("home", { config, userPrefs, recentReports, allReports, favoriteReports });
}

export default HomeCtrl;
