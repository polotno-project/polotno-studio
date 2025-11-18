import React from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Tooltip } from '@blueprintjs/core';
import styled from 'polotno/utils/styled';

const ControlsWrapper = styled('div')`
  display: flex;
  gap: 4px;
  margin-right: 8px;

  @media (max-width: 500px) {
    gap: 2px;
  }
`;

export const UndoRedoControls = observer(({ store }) => {
  const canUndo = store.history.canUndo;
  const canRedo = store.history.canRedo;

  const handleUndo = () => {
    if (canUndo) {
      store.history.undo();
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      store.history.redo();
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Z or Cmd+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Ctrl+Shift+Z or Cmd+Shift+Z or Ctrl+Y for redo
      if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') ||
        (e.ctrlKey && e.key === 'y')
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo]);

  return (
    <ControlsWrapper>
      <Tooltip content="Undo (Ctrl+Z)" position="bottom">
        <Button
          icon="undo"
          minimal
          disabled={!canUndo}
          onClick={handleUndo}
          aria-label="Undo last action"
        />
      </Tooltip>
      <Tooltip content="Redo (Ctrl+Shift+Z)" position="bottom">
        <Button
          icon="redo"
          minimal
          disabled={!canRedo}
          onClick={handleRedo}
          aria-label="Redo last undone action"
        />
      </Tooltip>
    </ControlsWrapper>
  );
});

export default UndoRedoControls;
