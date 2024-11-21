import React from "react";
import { observer } from "mobx-react-lite";
import { SectionTab } from "polotno/side-panel";
import { Shapes } from "polotno/side-panel/elements-panel";
import FaShapes from "@meronex/icons/fa/FaShapes";
import { t } from "polotno/utils/l10n";

export const ShapesPanel = ({ store }) => {
  return <Shapes store={store} />;
};

// // define the new custom section
export const ShapesSection = {
  name: "shapes",
  Tab: observer((props) => (
    <SectionTab name={t("sidePanel.shapes")} {...props}>
      <FaShapes />
    </SectionTab>
  )),
  // we need observer to update component automatically on any store changes
  Panel: ShapesPanel,
};
