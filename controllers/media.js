function MediaCtrl(req, res) {
  const config = res.app.get("config") ?? {};
  const userPrefs = res.app.get("userPrefs") ?? {};

  // Loading media
  const mediaLib = [];

  res.render("media", { config, userPrefs, mediaLib });
}

export default MediaCtrl;
