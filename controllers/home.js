function HomeCtrl(req, res) {
  const config = res.app.get("config") ?? {};
  const userPrefs = res.app.get("userPrefs") ?? {};

  // Loading reports and media lists
  const recentReports = [];
  const allReports = [];
  const favoriteReports = [];

  res.render("home", { config, userPrefs, recentReports, allReports, favoriteReports });
}

export default HomeCtrl;
