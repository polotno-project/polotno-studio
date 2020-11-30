import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  Button,
  Navbar,
  Alignment,
  NavbarHeading,
  AnchorButton,
  Divider,
  Position,
  Popover,
  Menu,
  MenuItem,
} from '@blueprintjs/core';
import { FaGithub, FaDiscord } from 'react-icons/fa';

import { downloadFile } from 'polotno/utils/download';

export default observer(({ store }) => {
  // const oneSelected = store.selectedElements.length === 1;
  // const firstSelected = store.selectedElements[0];
  // const isTextSelected = oneSelected && firstSelected.type === 'text';
  // const isImageSelected = oneSelected && firstSelected.type === 'image';
  // const isSvgSelected = oneSelected && firstSelected.type === 'svg';
  // const noSelection = store.selectedElements.length === 0;

  // const index = store.activePage?.children.indexOf(firstSelected) || 0;
  // const canMoveUp =
  //   store.activePage && index < store.activePage.children.length - 1;
  // const canMoveDown = index > 0;

  const inputRef = React.useRef();

  return (
    <Navbar>
      <Navbar.Group align={Alignment.LEFT}>
        <label htmlFor="load-project">
          <Button
            icon="folder-open"
            minimal
            onClick={() => {
              document.querySelector('#load-project').click();
            }}
          >
            Open
          </Button>
          <input
            type="file"
            id="load-project"
            ref={inputRef}
            style={{ width: '180px', display: 'none' }}
            onChange={(e) => {
              var input = e.target;

              var reader = new FileReader();
              reader.onload = function () {
                var text = reader.result;
                const json = JSON.parse(text);
                store.loadJSON(json);
              };
              reader.readAsText(input.files[0]);
            }}
          />
        </label>
        <Button
          icon="floppy-disk"
          minimal
          onClick={() => {
            const json = store.toJSON();
            const url = 'data:text/json,' + JSON.stringify(json);
            downloadFile(url, 'polotno.json');
          }}
        >
          Save
        </Button>
      </Navbar.Group>
      <Navbar.Group
        align={Alignment.LEFT}
        style={{
          paddingLeft: '30px',
          fontSize: '10px',
          maxWidth: 'calc(100% - 300px)',
        }}
      >
        <span>
          Hey, because of high-load from the reddit some search functions are
          not working correctly. I hope to recover soon.
        </span>
      </Navbar.Group>
      <Navbar.Group align={Alignment.RIGHT}>
        {/* <AnchorButton
          // icon="undo"
          minimal
          href="https://github.com/lavrton/polotno-studio"
          target="_blank"
        >
          About
        </AnchorButton> */}
        <AnchorButton
          minimal
          href="https://github.com/lavrton/polotno-studio"
          target="_blank"
          icon={<FaGithub />}
        >
          Github
        </AnchorButton>
        <AnchorButton
          minimal
          href="https://discord.gg/7eagv9PG"
          target="_blank"
          icon={<FaDiscord />}
        >
          Discord
        </AnchorButton>

        <Divider />
        {/* <NavbarHeading>Polotno Studio</NavbarHeading> */}
      </Navbar.Group>

      {/* {oneSelected && (
        <Navbar.Group align={Alignment.LEFT} style={{ marginRight: '15px' }}>
          <Popover
            content={
              <Menu>
                <MenuItem
                  icon="chevron-up"
                  text="Up"
                  disabled={!canMoveUp}
                  onClick={() => {
                    firstSelected.moveUp();
                  }}
                />
                <MenuItem
                  icon="chevron-down"
                  text="Down"
                  disabled={!canMoveDown}
                  onClick={() => {
                    firstSelected.moveDown();
                  }}
                />
                <MenuItem
                  icon="alignment-top"
                  text="Align top"
                  onClick={() => {
                    firstSelected.set({
                      y: 0,
                    });
                  }}
                />
                <MenuItem
                  icon="alignment-left"
                  text="Align left"
                  onClick={() => {
                    firstSelected.set({
                      x: 0,
                    });
                  }}
                />
                <MenuItem
                  icon="alignment-right"
                  text="Align rigth"
                  onClick={() => {
                    firstSelected.set({
                      x: store.width - firstSelected.width,
                    });
                  }}
                />
              </Menu>
            }
            position={Position.BOTTOM}
          >
            <Button icon="move" minimal />
          </Popover>
        </Navbar.Group>
      )}

      {isTextSelected && <TextToolbar store={store} />}
      {isImageSelected && <ImageToolbar store={store} />}
      {isSvgSelected && <SvgToolbar store={store} />}
      <Navbar.Group align={Alignment.RIGHT}>
        <Button
          icon="trash"
          minimal
          onClick={() => {
            store.deleteElements(store.selectedElementsIds);
          }}
          disabled={store.selectedElementsIds.length === 0}
          style={{ marginLeft: 'auto' }}
        />
        <Divider style={{ height: '100%', margin: '0 15px' }} />
        <Popover
          content={
            <Menu>
              <MenuItem
                icon="media"
                text="Save as Image"
                onClick={() => {
                  store.saveAsImage();
                }}
              />
              <MenuItem
                icon="document"
                text="Save as PDF"
                onClick={() => {
                  store.saveAsPDF();
                }}
              />
              <MenuItem
                icon="document"
                text="Save as High Quality PDF"
                onClick={() => {
                  store.saveAsPDF({ pixelRatio: 3 });
                }}
              />
            </Menu>
          }
          position={Position.BOTTOM}
        >
          <Button icon="export" text="Export" minimal />
        </Popover>
      </Navbar.Group> */}
    </Navbar>
  );
});
