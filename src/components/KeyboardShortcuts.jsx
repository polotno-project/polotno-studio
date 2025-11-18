import React from 'react';
import { Dialog, Classes, Icon } from '@blueprintjs/core';
import styled from 'polotno/utils/styled';

const ShortcutGrid = styled('div')`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const ShortcutCategory = styled('div')`
  h4 {
    margin-bottom: 12px;
    color: #182026;
    font-weight: 600;
  }
`;

const ShortcutItem = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  &:last-child {
    border-bottom: none;
  }
`;

const ShortcutLabel = styled('span')`
  color: #5c7080;
  font-size: 14px;
`;

const ShortcutKeys = styled('div')`
  display: flex;
  gap: 4px;
`;

const Key = styled('kbd')`
  background: #394b59;
  border: 1px solid #2f343c;
  border-radius: 4px;
  padding: 4px 8px;
  font-family: monospace;
  font-size: 12px;
  min-width: 24px;
  text-align: center;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.2);
`;

const shortcuts = {
  'General': [
    { label: 'Undo', keys: ['Ctrl', 'Z'] },
    { label: 'Redo', keys: ['Ctrl', 'Shift', 'Z'] },
    { label: 'Save', keys: ['Ctrl', 'S'] },
    { label: 'Delete selected', keys: ['Delete'] },
    { label: 'Select all', keys: ['Ctrl', 'A'] },
    { label: 'Deselect all', keys: ['Esc'] },
  ],
  'Transform': [
    { label: 'Duplicate', keys: ['Ctrl', 'D'] },
    { label: 'Copy', keys: ['Ctrl', 'C'] },
    { label: 'Paste', keys: ['Ctrl', 'V'] },
    { label: 'Cut', keys: ['Ctrl', 'X'] },
    { label: 'Bring to front', keys: ['Ctrl', ']'] },
    { label: 'Send to back', keys: ['Ctrl', '['] },
  ],
  'View': [
    { label: 'Zoom in', keys: ['Ctrl', '+'] },
    { label: 'Zoom out', keys: ['Ctrl', '-'] },
    { label: 'Fit to screen', keys: ['Ctrl', '0'] },
    { label: 'Show/Hide grid', keys: ['Ctrl', 'G'] },
    { label: 'Show/Hide rulers', keys: ['Ctrl', 'R'] },
  ],
  'Text': [
    { label: 'Bold', keys: ['Ctrl', 'B'] },
    { label: 'Italic', keys: ['Ctrl', 'I'] },
    { label: 'Underline', keys: ['Ctrl', 'U'] },
    { label: 'Align left', keys: ['Ctrl', 'Shift', 'L'] },
    { label: 'Align center', keys: ['Ctrl', 'Shift', 'C'] },
    { label: 'Align right', keys: ['Ctrl', 'Shift', 'R'] },
  ],
};

export const KeyboardShortcuts = ({ isOpen, onClose }) => {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Shortcuts"
      icon="key-tab"
      style={{ width: '700px', maxWidth: '90vw' }}
    >
      <div className={Classes.DIALOG_BODY}>
        <div style={{ marginBottom: '16px', color: '#5c7080' }}>
          <Icon icon="info-sign" style={{ marginRight: '8px' }} />
          Use these keyboard shortcuts to work faster and more efficiently.
          Mac users: use Cmd instead of Ctrl.
        </div>

        <ShortcutGrid>
          {Object.entries(shortcuts).map(([category, items]) => (
            <ShortcutCategory key={category}>
              <h4>{category}</h4>
              {items.map((shortcut, index) => (
                <ShortcutItem key={index}>
                  <ShortcutLabel>{shortcut.label}</ShortcutLabel>
                  <ShortcutKeys>
                    {shortcut.keys.map((key, i) => (
                      <React.Fragment key={i}>
                        <Key>{key}</Key>
                        {i < shortcut.keys.length - 1 && (
                          <span style={{ padding: '0 4px', color: '#5c7080' }}>+</span>
                        )}
                      </React.Fragment>
                    ))}
                  </ShortcutKeys>
                </ShortcutItem>
              ))}
            </ShortcutCategory>
          ))}
        </ShortcutGrid>
      </div>

      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <button className={Classes.BUTTON} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default KeyboardShortcuts;
