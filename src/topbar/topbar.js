import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  Button,
  Navbar,
  Alignment,
  AnchorButton,
  NavbarDivider,
  Position,
  Menu,
  MenuItem,
  EditableText,
} from '@blueprintjs/core';
import FaGithub from '@meronex/icons/fa/FaGithub';
import FaDiscord from '@meronex/icons/fa/FaDiscord';
import FaTwitter from '@meronex/icons/fa/FaTwitter';
import BiCodeBlock from '@meronex/icons/bi/BiCodeBlock';
import { Popover2 } from '@blueprintjs/popover2';
import { Tooltip2 } from '@blueprintjs/popover2';

import styled from 'polotno/utils/styled';

import { useProject } from '../project';

import { FileMenu } from './file-menu';
import { DownloadButton } from './download-button';
import { UserMenu } from './user-menu';

const NavbarContainer = styled('div')`
  @media screen and (max-width: 500px) {
    overflow-x: auto;
    overflow-y: hidden;
    max-width: 100vw;
  }
`;

const NavInner = styled('div')`
  @media screen and (max-width: 500px) {
    display: flex;
  }
`;

export default observer(({ store }) => {
  const project = useProject();

  return (
    <NavbarContainer className="bp4-navbar">
      <NavInner>
        <Navbar.Group align={Alignment.LEFT}>
          <FileMenu store={store} project={project} />
          {/* <Button
            text="My designs"
            intent="primary"
            onClick={() => {
              store.openSidePanel('my-designs');
            }}
          /> */}
        </Navbar.Group>
        <Navbar.Group align={Alignment.RIGHT}>
          {/* {project.id !== 'local' && (
            <>
              <div
                style={{
                  paddingRight: '10px',
                  maxWidth: '200px',
                }}
              >
                <EditableText
                  value={project.name}
                  placeholder="Design name"
                  onChange={(name) => {
                    project.name = name;
                    project.requestSave();
                  }}
                />
              </div>
              <Tooltip2
                content={
                  project.private
                    ? 'The design is private'
                    : 'The design is public'
                }
              >
                <Button
                  icon={project.private ? 'eye-off' : 'eye-on'}
                  onClick={() => {
                    project.private = !project.private;
                    project.requestSave();
                  }}
                />
              </Tooltip2>
              <NavbarDivider />
            </>
          )} */}

          <AnchorButton
            minimal
            href="https://polotno.com"
            target="_blank"
            icon={
              <BiCodeBlock className="bp4-icon" style={{ fontSize: '20px' }} />
            }
          >
            API
          </AnchorButton>

          <AnchorButton
            minimal
            href="https://discord.gg/W2VeKgsr9J"
            target="_blank"
            icon={
              <FaDiscord className="bp4-icon" style={{ fontSize: '20px' }} />
            }
          >
            Join Chat
          </AnchorButton>
          <AnchorButton
            minimal
            href="https://github.com/lavrton/polotno-studio"
            target="_blank"
            icon={
              <FaGithub className="bp4-icon" style={{ fontSize: '20px' }} />
            }
          ></AnchorButton>
          <AnchorButton
            minimal
            href="https://twitter.com/lavrton"
            target="_blank"
            icon={
              <FaTwitter className="bp4-icon" style={{ fontSize: '20px' }} />
            }
          ></AnchorButton>
          <NavbarDivider />
          <DownloadButton store={store} />
          <UserMenu store={store} project={project} />
          {/* <NavbarHeading>Polotno Studio</NavbarHeading> */}
        </Navbar.Group>
      </NavInner>
    </NavbarContainer>
  );
});
