function TenantCtrl(req, res) {
  const { config, userPrefs } = res.locals;

  // Loading tenant information
  const tenant = {};

  res.render("tenant", { config, userPrefs, tenant });
}

export default TenantCtrl;
