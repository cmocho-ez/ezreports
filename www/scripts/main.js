import { EzAppLogo } from "./components/ez-applogo.js";
import { EzCompanyLogo } from "./components/ez-companylogo.js";
import { EzUserInfo } from "./components/ez-userinfo.js";
import { EzBadge } from "./components/ez-badge.js";
import { EzDateSelector } from "./components/ez-dateselector.js";
import { EzCalendar } from "./components/ez-calendar.js";
import { EzAlert } from "./components/ez-alert.js";
import { EzDialog } from "./components/ez-dialog.js";
import { EzCard } from "./components/ez-card.js";
import { EzCopyButton } from "./components/ez-copybutton.js";
import { EzSwitch } from "./components/ez-switch.js";
import { EzFloatingMenu } from "./components/ez-floatingmenu.js";
import { EzTable } from "./components/ez-table.js";

(function () {
  // Registering custom elements
  customElements.define("ez-applogo", EzAppLogo);
  customElements.define("ez-companylogo", EzCompanyLogo);
  customElements.define("ez-userinfo", EzUserInfo);
  customElements.define("ez-badge", EzBadge);
  customElements.define("ez-dateselector", EzDateSelector);
  customElements.define("ez-calendar", EzCalendar);
  customElements.define("ez-alert", EzAlert);
  customElements.define("ez-dialog", EzDialog);
  customElements.define("ez-card", EzCard);
  customElements.define("ez-copybutton", EzCopyButton);
  customElements.define("ez-switch", EzSwitch);
  customElements.define("ez-floatingmenu", EzFloatingMenu);
  customElements.define("ez-table", EzTable);

  // Handling user events
  const mnu = document.createElement("ez-floatingmenu");
  document.body.appendChild(mnu);

  mnu.addEventListener("menuclick", (e) => {
    switch (e.detail.menuName) {
      case "mnuUserProfile":
        location.href = "/tenant";
        break;

      default:
        alert("Clicked " + e.detail.menuName);
        break;
    }
  });

  const userMenu = [
    { icon: "account_circle", label: "My profile", name: "mnuUserProfile" },
    { icon: "corporate_fare", label: "My company", name: "mnuCompanyProfile" },
    { type: "divider" },
    { icon: "power_settings_new", label: "Logout", name: "mnuLogout" },
  ];

  const userInfo = document.querySelector("ez-userinfo");
  userInfo.addEventListener("userinfoclick", (e) => {
    e.preventDefault();
    e.stopPropagation();

    mnu.options = userMenu;
    mnu.showMenu(16, e.detail.y + 30, "right");
  });
})();
