function TenantCtrl(req, res) {
  const config = res.app.get("config") ?? {};
  const userPrefs = res.app.get("userPrefs") ?? {};

  // Loading tenant information
  const tenant = {};

  res.render("tenant", { config, userPrefs, tenant });
}

export default TenantCtrl;
