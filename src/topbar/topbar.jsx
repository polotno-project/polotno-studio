import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  Navbar,
  Alignment,
  AnchorButton,
  NavbarDivider,
  EditableText,
  Popover,
} from '@blueprintjs/core';

import FaGithub from '@meronex/icons/fa/FaGithub';
import FaDiscord from '@meronex/icons/fa/FaDiscord';
import FaTwitter from '@meronex/icons/fa/FaTwitter';
import BiCodeBlock from '@meronex/icons/bi/BiCodeBlock';
import MdcCloudAlert from '@meronex/icons/mdc/MdcCloudAlert';
import MdcCloudCheck from '@meronex/icons/mdc/MdcCloudCheck';
import MdcCloudSync from '@meronex/icons/mdc/MdcCloudSync';
import styled from 'polotno/utils/styled';

import { useProject } from '../project';

import { FileMenu } from './file-menu';
import { DownloadButton } from './download-button';
import { PostProcessButton } from './post-process-button';
import { UserMenu } from './user-menu';
import { CloudWarning } from '../cloud-warning';
import { useAuth } from '../hooks/useAuth';
import { signOut } from '../lib/supabase';

const NavbarContainer = styled('div')`
  white-space: nowrap;

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

const Status = observer(({ project }) => {
  const Icon = !project.cloudEnabled
    ? MdcCloudAlert
    : project.status === 'saved'
    ? MdcCloudCheck
    : MdcCloudSync;
  return (
    <Popover
      content={
        <div style={{ padding: '10px', maxWidth: '300px' }}>
          {!project.cloudEnabled && (
            <CloudWarning style={{ padding: '10px' }} />
          )}
          {project.cloudEnabled && project.status === 'saved' && (
            <>
              You data is saved with{' '}
              <a href="https://puter.com" target="_blank">
                Puter.com
              </a>
            </>
          )}
          {project.cloudEnabled &&
            (project.status === 'saving' || project.status === 'has-changes') &&
            'Saving...'}
        </div>
      }
      interactionKind="hover"
    >
      <div style={{ padding: '0 5px' }}>
        <Icon className="bp5-icon" style={{ fontSize: '25px', opacity: 0.8 }} />
      </div>
    </Popover>
  );
});

export default observer(({ store }) => {
  const project = useProject();
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = React.useState(false);

  return (
    <NavbarContainer className="bp5-navbar topbar">
      <NavInner>
        <Navbar.Group align={Alignment.LEFT}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '0 16px',
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="20" height="20" fill="white" />
            </svg>
            <span
              style={{
                fontWeight: 500,
                fontSize: '21px',
                lineHeight: '100%',
                letterSpacing: '0.25px',
              }}
            >
              Polotno
            </span>
          </div>
          <NavbarDivider />
          <FileMenu store={store} project={project} />
          <div
            style={{
              paddingLeft: '20px',
              maxWidth: '200px',
            }}
          >
            <EditableText
              value={window.project.name}
              placeholder="Design name"
              onChange={(name) => {
                window.project.name = name;
                window.project.requestSave();
              }}
            />
          </div>
        </Navbar.Group>
        <Navbar.Group align={Alignment.RIGHT}>
          {/* <Status project={project} /> */}

          <AnchorButton href="https://polotno.com" target="_blank" minimal>
            For developers
          </AnchorButton>
          {/* 
          <AnchorButton
            minimal
            href="https://github.com/lavrton/polotno-studio"
            target="_blank"
            icon={
              <FaGithub className="bp5-icon" style={{ fontSize: '20px' }} />
            }
          ></AnchorButton>
          <AnchorButton
            minimal
            href="https://twitter.com/lavrton"
            target="_blank"
            icon={
              <FaTwitter className="bp5-icon" style={{ fontSize: '20px' }} />
            }
          ></AnchorButton> */}
          <NavbarDivider />
          <PostProcessButton store={store} />
          <DownloadButton store={store} />
          
          {user ? (
            <Button
              minimal
              icon="user"
              text={user.email}
              onClick={async () => {
                await signOut();
              }}
            />
          ) : (
            <Button
              minimal
              icon="log-in"
              text="Sign In"
              onClick={() => setAuthModalOpen(true)}
            />
          )}
          
          {/* <NavbarHeading>Polotno Studio</NavbarHeading> */}
        </Navbar.Group>
      </NavInner>
      
      {/* Import AuthModal component here if needed */}
    </NavbarContainer>
  );
});
