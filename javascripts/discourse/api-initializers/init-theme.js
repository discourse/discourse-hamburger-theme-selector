import { addGlobalNotice } from "discourse/components/global-notice";
import { apiInitializer } from "discourse/lib/api";
import getURL from "discourse/lib/get-url";

export default apiInitializer((api) => {
  if (api.getCurrentUser()?.admin) {
    const themeId = themePrefix("foo").match(
      /theme_translations\.(\d+)\.foo/
    )[1];
    const themeURL = getURL(`/admin/customize/themes/${themeId}`);

    addGlobalNotice(
      `<b>Admin notice:</b> you're using the <em><a href="https://meta.discourse.org/t/hamburger-theme-selector/61210">discourse-hamburger-theme-selector</a></em> theme component which was discontinued. ` +
        `You should <a href="${themeURL}">remove this theme component</a>.`,
      "discourse-hamburger-theme-selector",
      {
        dismissable: true,
        level: "warn",
        dismissDuration: moment.duration("1", "hour"),
      }
    );
  }
});
