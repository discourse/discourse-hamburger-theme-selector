import $ from "jquery";
import { h } from "virtual-dom";
import { apiInitializer } from "discourse/lib/api";
import { i18n } from "discourse-i18n";

export default apiInitializer((api) => {
  let themeSelector = require("discourse/lib/theme-selector");

  api.createWidget("theme-selector", {
    buildKey: () => `theme-selector`,

    defaultState() {
      return { currentThemeId: themeSelector.currentThemeId() };
    },

    click(event) {
      let $target = $(event.target);
      let id = $target.data("id");
      let user = api.getCurrentUser();

      if (user) {
        user.findDetails().then((detailedUser) => {
          let seq = detailedUser.get("user_option.theme_key_seq");
          this.setTheme(id, seq);
        });
      } else {
        this.setTheme(id);
      }

      return true;
    },

    setTheme(themeId, seq = 0) {
      if (themeId == null) {
        return;
      }
      themeSelector.setLocalTheme([themeId], seq);
      this.state.currentThemeId = themeId;
      if (settings.immediate_reload) {
        window.location.reload();
      } else {
        themeSelector.previewTheme([themeId]);
      }
      this.scheduleRerender();
    },

    themeHtml(currentThemeId) {
      let themes = themeSelector.listThemes(this.site);
      if (themes && themes.length > 1) {
        return themes.map((theme) => {
          let name = [theme.name];
          if (theme.id === currentThemeId) {
            name.push("\xa0" + "*");
          }
          return h(
            "li",
            { attributes: { "data-name": theme.name } },
            h("a.widget-link", { attributes: { "data-id": theme.id } }, name)
          );
        });
      }
    },

    html(attrs, state) {
      let themeHtml = this.themeHtml(state.currentThemeId);
      let sectionHeader = null;
      const sectionHeaderText = i18n(
        themePrefix("hamburger_menu.theme_selector")
      );

      if (!themeHtml) {
        return;
      }

      if (settings.show_section_header) {
        let user = api.getCurrentUser();
        let sectionHeaderLink = null;
        if (user) {
          sectionHeaderLink = h(
            "a.widget-link",
            { href: "/my/preferences/interface" },
            sectionHeaderText
          );
        } else {
          sectionHeaderLink = h("span", {}, sectionHeaderText);
        }
        sectionHeader = h(
          "li",
          {
            style:
              "width: 100%;" + (user == null ? "padding: 0.25em 0.5em;" : null),
          },
          sectionHeaderLink
        );
      }

      return [
        h("ul.menu-links.columned", [sectionHeader, themeHtml]),
        h(".clearfix"),
        h("hr"),
      ];
    },
  });

  api.decorateWidget("menu-links:before", (helper) => {
    if (helper.attrs.name === "footer-links") {
      return [helper.widget.attach("theme-selector")];
    }
  });
});
