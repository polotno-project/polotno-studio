import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  Button,
  Navbar,
  Alignment,
  AnchorButton,
  Divider,
  Dialog,
  Classes,
} from '@blueprintjs/core';
import FaGithub from '@meronex/icons/fa/FaGithub';
import FaDiscord from '@meronex/icons/fa/FaDiscord';
import DownloadButton from 'polotno/toolbar/download-button';

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

  const [faqOpened, toggleFaq] = React.useState(false);

  return (
    <Navbar>
      <Navbar.Group align={Alignment.LEFT}>
        <Button
          icon="new-object"
          minimal
          onClick={() => {
            const ids = store.pages
              .map((page) => page.children.map((child) => child.id))
              .flat();
            const hasObjects = ids?.length;
            if (hasObjects) {
              if (!window.confirm('Remove all content for a new design?')) {
                return;
              }
            }
            const pagesIds = store.pages.map((p) => p.id);
            store.deletePages(pagesIds);
            store.addPage();
          }}
        >
          New
        </Button>
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
      <Navbar.Group align={Alignment.RIGHT}>
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
          href="https://discord.gg/W2VeKgsr9J"
          target="_blank"
          icon={<FaDiscord />}
        >
          Join Chat
        </AnchorButton>
        <Button icon="info-sign" minimal onClick={() => toggleFaq(true)}>
          About
        </Button>

        <Divider />
        <DownloadButton store={store} />
        {/* <NavbarHeading>Polotno Studio</NavbarHeading> */}
      </Navbar.Group>
      <Dialog
        icon="info-sign"
        onClose={() => toggleFaq(false)}
        title="About Polotno Studio"
        isOpen={faqOpened}
        style={{
          width: '80%',
          maxWidth: '700px',
        }}
      >
        <div className={Classes.DIALOG_BODY}>
          <h2>What is Polotno Studio?</h2>
          <p>
            <strong>Polotno Studio</strong> - is a web application to create
            graphical designs. You can mix image, text and illustrations to make
            social media posts, youtube previews, podcast covers, business cards
            and presentations.
          </p>
          <h2>Is it Open Source?</h2>
          <p>
            Partially. The source code is available in{' '}
            <a href="https://github.com/lavrton/polotno-studio" target="_blank">
              GitHub repository
            </a>
            . The repository doesn't have full source.{' '}
            <strong>Polotno Studio</strong> is powered by{' '}
            <a href="https://polotno.dev/" target="_blank">
              Polonto SDK project
            </a>
            . All core "canvas editor" functionality are implemented by{' '}
            <strong>polotno</strong> npm package (which is not open source at
            the time of writing this text).
          </p>
          <p>
            Polotno Studio is build on top of Polotno SDK to provide a
            desktop-app-like experience.
          </p>
          <h2>Who is making Polotno Studio?</h2>
          <p>
            My name is Anton Lavrenov{' '}
            <a href="https://twitter.com/lavrton" target="_blank">
              @lavrton
            </a>
            . I am founder of Polotno project. As the maintainer of{' '}
            <a href="https://konvajs.org/" target="_blank">
              Konva 2d canvas framework
            </a>
            , I created several similar apps for different companies around the
            world. So I decided to compile all my knowledge and experience into
            reusable Polotno project.
          </p>
          <h2>
            Why Polotno Studio has no signups and no ads? How are you going to
            support the project financially?
          </h2>
          <p>
            Instead of monetizing the end-user application{' '}
            <strong>Polotno Studio</strong> I decided to make money around
            developers tools with{' '}
            <a href="https://polotno.dev/" target="_blank">
              Polonto SDK
            </a>
            .
          </p>
          <p>
            <strong>Polotno Studio</strong> is a sandbox application and
            polished demonstration of{' '}
            <a href="https://polotno.dev/" target="_blank">
              Polonto SDK
            </a>{' '}
            usage.
          </p>
          <p>
            With{' '}
            <a href="https://polotno.dev/" target="_blank">
              Polonto SDK
            </a>{' '}
            you can build very different application with very different UI.
          </p>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button onClick={() => toggleFaq(false)}>Close</Button>
          </div>
        </div>
      </Dialog>
    </Navbar>
  );
});
