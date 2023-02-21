import React from 'react';

import { SectionTab } from 'polotno/side-panel';
import { Shapes } from 'polotno/side-panel/elements-panel';
import FaShapes from '@meronex/icons/fa/FaShapes';

export const ShapesPanel = ({ store }) => {
  return <Shapes store={store} />;
};

// // define the new custom section
export const ShapesSection = {
  name: 'shapes',
  Tab: (props) => (
    <SectionTab name="Shapes" {...props}>
      <FaShapes />
    </SectionTab>
  ),
  // we need observer to update component automatically on any store changes
  Panel: ShapesPanel,
};
