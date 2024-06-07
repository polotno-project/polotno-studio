import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  Button,
  Position,
  Menu,
  MenuItem,
  MenuDivider,
} from '@blueprintjs/core';
import { Clean } from '@blueprintjs/icons';
import { Popover } from '@blueprintjs/core';

import { getAPI } from 'polotno/utils/api';
import { t } from 'polotno/utils/l10n';
import { getKey } from 'polotno/utils/validate-key';

const rewrite = async ({ text, command, tone }) => {
  const req = await fetch(`${getAPI()}/ai/text?KEY=` + getKey(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, command, tone }),
  });
  const json = await req.json();
  return json.response;
};

const TONES = [
  { text: 'Persuasive' },
  { text: 'Enthusiastic' },
  { text: 'Friendly' },
  { text: 'Authoritative' },
  { text: 'Professional' },
  { text: 'Humorous' },
  { text: 'Inspirational' },
  { text: 'Urgent' },
  { text: 'Informal' },
  { text: 'Sincere' },
];

export const AIWriteMenu = observer(({ store }) => {
  const hasSelection = store.selectedElements.length > 0;
  const [loading, setLoading] = React.useState(false);

  const rewriteText = async (command, tone) => {
    setLoading(true);
    const id = store.selectedElements[0].id;
    const text = store.selectedElements[0].text;
    const newText = await rewrite({ text, command, tone });
    // while function was running text may be removed
    const el = store.getElementById(id);
    if (!el) {
      return;
    }
    el.set({ text: newText });
    setLoading(false);
  };

  if (loading) {
    return <Button icon={<Clean />} minimal text="AI write" loading />;
  }

  return (
    <Popover
      disabled={!hasSelection}
      content={
        <Menu>
          <MenuItem
            text="Rewrite"
            onClick={() => {
              rewriteText('rewrite');
            }}
          />
          <MenuItem
            text="Shorten"
            onClick={() => {
              rewriteText('shorten');
            }}
          />
          <MenuItem
            text="Continue writing"
            onClick={() => {
              rewriteText('continue');
            }}
          />
          <MenuItem
            text="Proofread"
            onClick={() => {
              rewriteText('proofread');
            }}
          />
          <MenuItem text="Tone">
            {TONES.map((tone) => (
              <MenuItem
                key={tone.text}
                text={tone.text}
                onClick={() => {
                  rewriteText('tone', tone.text);
                }}
              />
            ))}
          </MenuItem>
        </Menu>
      }
      position={Position.BOTTOM}
    >
      <Button icon={<Clean />} minimal text="AI write" />
    </Popover>
  );
});
