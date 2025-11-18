import React from 'react';
import { observer } from 'mobx-react-lite';
import { Spinner } from '@blueprintjs/core';

import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno';
import { Toolbar } from 'polotno/toolbar/toolbar';
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';
import {
  SidePanel,
  DEFAULT_SECTIONS,
  SectionTab,
} from 'polotno/side-panel';
import { Workspace } from 'polotno/canvas/workspace';
import { PagesTimeline } from 'polotno/pages-timeline';
import { setTranslations } from 'polotno/config';

import { loadFile } from './file';

import { ShapesSection } from './sections/shapes-section';
import { MyLibrarySection } from './sections/my-library-section';

import { useProject } from './project';

import fr from './translations/fr';
import en from './translations/en';
import id from './translations/id';
import ru from './translations/ru';
import ptBr from './translations/pt-br';
import zhCh from './translations/zh-ch';

import Topbar from './topbar/topbar';

// import '@blueprintjs/core/lib/css/blueprint.css';

const TextIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g>
      <path
        d="M17.25 20.25V11.25H13.5V9.75H22.5V11.25H18.75V20.25H17.25Z"
        fill="white"
      />
      <path d="M8.25 20.25V6H1.5V4.5H16.5V6H9.75V20.25H8.25Z" fill="white" />
    </g>
  </svg>
);

const PhotosIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g>
      <path
        d="M14.25 10.5C14.695 10.5 15.13 10.368 15.5 10.1208C15.87 9.87357 16.1584 9.52217 16.3287 9.11104C16.499 8.69991 16.5436 8.24751 16.4568 7.81105C16.37 7.37459 16.1557 6.97368 15.841 6.65901C15.5263 6.34434 15.1254 6.13005 14.689 6.04323C14.2525 5.95642 13.8001 6.00097 13.389 6.17127C12.9778 6.34157 12.6264 6.62996 12.3792 6.99997C12.132 7.36998 12 7.80499 12 8.25C12 8.84674 12.2371 9.41903 12.659 9.84099C13.081 10.2629 13.6533 10.5 14.25 10.5ZM14.25 7.5C14.3983 7.5 14.5433 7.54399 14.6667 7.6264C14.79 7.70881 14.8861 7.82594 14.9429 7.96299C14.9997 8.10003 15.0145 8.25083 14.9856 8.39632C14.9567 8.5418 14.8852 8.67544 14.7803 8.78033C14.6754 8.88522 14.5418 8.95665 14.3963 8.98559C14.2508 9.01453 14.1 8.99968 13.963 8.94291C13.8259 8.88615 13.7088 8.79002 13.6264 8.66668C13.544 8.54334 13.5 8.39834 13.5 8.25C13.5 8.05109 13.579 7.86032 13.7197 7.71967C13.8603 7.57902 14.0511 7.5 14.25 7.5Z"
        fill="white"
      />
      <path
        d="M19.5 3H4.5C4.10218 3 3.72064 3.15804 3.43934 3.43934C3.15804 3.72064 3 4.10218 3 4.5V19.5C3 19.8978 3.15804 20.2794 3.43934 20.5607C3.72064 20.842 4.10218 21 4.5 21H19.5C19.8978 21 20.2794 20.842 20.5607 20.5607C20.842 20.2794 21 19.8978 21 19.5V4.5C21 4.10218 20.842 3.72064 20.5607 3.43934C20.2794 3.15804 19.8978 3 19.5 3ZM19.5 19.5H4.5V15L8.25 11.25L12.4425 15.4425C12.7235 15.7219 13.1037 15.8787 13.5 15.8787C13.8963 15.8787 14.2765 15.7219 14.5575 15.4425L15.75 14.25L19.5 18V19.5ZM19.5 15.8775L16.8075 13.185C16.5265 12.9056 16.1463 12.7488 15.75 12.7488C15.3537 12.7488 14.9735 12.9056 14.6925 13.185L13.5 14.3775L9.3075 10.185C9.02646 9.90562 8.64628 9.74881 8.25 9.74881C7.85372 9.74881 7.47354 9.90562 7.1925 10.185L4.5 12.8775V4.5H19.5V15.8775Z"
        fill="white"
      />
    </g>
  </svg>
);

const TemplatesIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g>
      <path
        d="M19.5 4.5V7.5H4.5V4.5H19.5ZM19.5 3H4.5C4.10218 3 3.72064 3.15804 3.43934 3.43934C3.15804 3.72064 3 4.10218 3 4.5V7.5C3 7.89782 3.15804 8.27936 3.43934 8.56066C3.72064 8.84196 4.10218 9 4.5 9H19.5C19.8978 9 20.2794 8.84196 20.5607 8.56066C20.842 8.27936 21 7.89782 21 7.5V4.5C21 4.10218 20.842 3.72064 20.5607 3.43934C20.2794 3.15804 19.8978 3 19.5 3Z"
        fill="white"
      />
      <path
        d="M7.5 12V19.5H4.5V12H7.5ZM7.5 10.5H4.5C4.10218 10.5 3.72064 10.658 3.43934 10.9393C3.15804 11.2206 3 11.6022 3 12V19.5C3 19.8978 3.15804 20.2794 3.43934 20.5607C3.72064 20.842 4.10218 21 4.5 21H7.5C7.89782 21 8.27936 20.842 8.56066 20.5607C8.84196 20.2794 9 19.8978 9 19.5V12C9 11.6022 8.84196 11.2206 8.56066 10.9393C8.27936 10.658 7.89782 10.5 7.5 10.5Z"
        fill="white"
      />
      <path
        d="M19.5 12V19.5H12V12H19.5ZM19.5 10.5H12C11.6022 10.5 11.2206 10.658 10.9393 10.9393C10.658 11.2206 10.5 11.6022 10.5 12V19.5C10.5 19.8978 10.658 20.2794 10.9393 20.5607C11.2206 20.842 11.6022 21 12 21H19.5C19.8978 21 20.2794 20.842 20.5607 20.5607C20.842 20.2794 21 19.8978 21 19.5V12C21 11.6022 20.842 11.2206 20.5607 10.9393C20.2794 10.658 19.8978 10.5 19.5 10.5Z"
        fill="white"
      />
    </g>
  </svg>
);

const UploadIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g>
      <path
        d="M8.25 13.5L9.3075 14.5575L11.25 12.6225V21.75H12.75V12.6225L14.6925 14.5575L15.75 13.5L12 9.75L8.25 13.5Z"
        fill="white"
      />
      <path
        d="M17.6254 16.4999H17.2504V14.9999H17.6254C18.5205 15.0357 19.3932 14.7145 20.0514 14.1069C20.7097 13.4992 21.0996 12.655 21.1354 11.7599C21.1712 10.8648 20.8499 9.99215 20.2423 9.3339C19.6347 8.67564 18.7905 8.28573 17.8954 8.24992H17.2504L17.1754 7.63492C17.009 6.37226 16.3893 5.21313 15.4317 4.37346C14.4741 3.53379 13.244 3.07083 11.9704 3.07083C10.6968 3.07083 9.46664 3.53379 8.50906 4.37346C7.55148 5.21313 6.93178 6.37226 6.76538 7.63492L6.75038 8.24992H6.10538C5.21028 8.28573 4.36606 8.67564 3.75844 9.3339C3.15082 9.99215 2.82958 10.8648 2.86538 11.7599C2.90119 12.655 3.2911 13.4992 3.94936 14.1069C4.60761 14.7145 5.48028 15.0357 6.37538 14.9999H6.75038V16.4999H6.37538C5.17269 16.4923 4.01526 16.0404 3.12562 15.231C2.23599 14.4216 1.67694 13.3119 1.55598 12.1153C1.43502 10.9187 1.76067 9.71961 2.47032 8.74856C3.17998 7.77752 4.22354 7.10308 5.40038 6.85492C5.72416 5.34481 6.55601 3.9914 7.75712 3.02052C8.95823 2.04965 10.456 1.52002 12.0004 1.52002C13.5448 1.52002 15.0425 2.04965 16.2436 3.02052C17.4448 3.9914 18.2766 5.34481 18.6004 6.85492C19.7772 7.10308 20.8208 7.77752 21.5304 8.74856C22.2401 9.71961 22.5657 10.9187 22.4448 12.1153C22.3238 13.3119 21.7648 14.4216 20.8751 15.231C19.9855 16.0404 18.8281 16.4923 17.6254 16.4999Z"
        fill="white"
      />
    </g>
  </svg>
);

const VideosIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g>
      <path
        d="M13.5 11.25H10.5V8.25H9V11.25H6V12.75H9V15.75H10.5V12.75H13.5V11.25Z"
        fill="white"
      />
      <path
        d="M15.75 19.5H3C2.60232 19.4995 2.22105 19.3414 1.93984 19.0602C1.65864 18.779 1.50046 18.3977 1.5 18V6C1.50046 5.60232 1.65864 5.22105 1.93984 4.93984C2.22105 4.65864 2.60232 4.50046 3 4.5H15.75C16.1477 4.50046 16.529 4.65864 16.8102 4.93984C17.0914 5.22105 17.2495 5.60232 17.25 6V9.04245L21.3142 6.13995C21.4263 6.05975 21.5583 6.01201 21.6957 6.00196C21.8332 5.99192 21.9708 6.01996 22.0933 6.08301C22.2159 6.14606 22.3187 6.24167 22.3904 6.35934C22.4622 6.47701 22.5001 6.61218 22.5 6.75V17.25C22.5001 17.3878 22.4622 17.523 22.3904 17.6407C22.3187 17.7584 22.2159 17.854 22.0933 17.9171C21.9708 17.9801 21.8332 18.0082 21.6958 17.9981C21.5583 17.9881 21.4263 17.9403 21.3142 17.8601L17.25 14.9576V18C17.2495 18.3977 17.0914 18.779 16.8102 19.0602C16.529 19.3414 16.1477 19.4995 15.75 19.5ZM3 6V18.0007L15.75 18V13.5C15.7499 13.3622 15.7878 13.227 15.8596 13.1093C15.9313 12.9916 16.0341 12.896 16.1567 12.8329C16.2792 12.7699 16.4168 12.7418 16.5542 12.7519C16.6917 12.7619 16.8237 12.8097 16.9358 12.8899L21 15.7924V8.20755L16.9358 11.1101C16.8237 11.1902 16.6917 11.238 16.5543 11.248C16.4168 11.2581 16.2793 11.23 16.1567 11.167C16.0341 11.1039 15.9313 11.0083 15.8596 10.8907C15.7878 10.773 15.7499 10.6378 15.75 10.5V6H3Z"
        fill="white"
      />
    </g>
  </svg>
);

const BackgroundIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g>
      <path d="M7.5 4.5H4.5V7.5H7.5V4.5Z" fill="white" />
      <path d="M10.5 7.5H7.5V10.5H10.5V7.5Z" fill="white" />
      <path d="M13.5 4.5H10.5V7.5H13.5V4.5Z" fill="white" />
      <path d="M19.5 4.5H16.5V7.5H19.5V4.5Z" fill="white" />
      <path d="M7.5 10.5H4.5V13.5H7.5V10.5Z" fill="white" />
      <path d="M13.5 10.5H10.5V13.5H13.5V10.5Z" fill="white" />
      <path d="M19.5 10.5H16.5V13.5H19.5V10.5Z" fill="white" />
      <path d="M7.5 16.5H4.5V19.5H7.5V16.5Z" fill="white" />
      <path d="M13.5 16.5H10.5V19.5H13.5V16.5Z" fill="white" />
      <path d="M19.5 16.5H16.5V19.5H19.5V16.5Z" fill="white" />
      <path d="M16.5 7.5H13.5V10.5H16.5V7.5Z" fill="white" />
      <path d="M10.5 13.5H7.5V16.5H10.5V13.5Z" fill="white" />
      <path d="M16.5 13.5H13.5V16.5H16.5V13.5Z" fill="white" />
    </g>
  </svg>
);

const LayersIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g>
      <path
        d="M12.0001 18.0001C11.8759 18.0001 11.7537 17.9692 11.6445 17.9101L1.89453 12.6601L2.60568 11.3401L12.0001 16.3983L21.3945 11.3401L22.1057 12.6606L12.3557 17.9106C12.2464 17.9695 12.1242 18.0002 12.0001 18.0001Z"
        fill="white"
      />
      <path
        d="M12.0001 22.5001C11.8759 22.5001 11.7537 22.4692 11.6445 22.4101L1.89453 17.1601L2.60568 15.8401L12.0001 20.8983L21.3945 15.8401L22.1057 17.1606L12.3557 22.4106C12.2464 22.4695 12.1242 22.5002 12.0001 22.5001Z"
        fill="white"
      />
      <path
        d="M11.9998 13.5001C11.8757 13.5001 11.7535 13.4692 11.6443 13.4101L1.89426 8.16011C1.77506 8.09589 1.67548 8.0006 1.60606 7.88436C1.53665 7.76811 1.5 7.63524 1.5 7.49985C1.5 7.36446 1.53665 7.23159 1.60606 7.11534C1.67548 6.99909 1.77506 6.90381 1.89426 6.83959L11.6443 1.58959C11.7535 1.53063 11.8757 1.49976 11.9998 1.49976C12.124 1.49976 12.2462 1.53063 12.3554 1.58959L22.1054 6.83959C22.2246 6.90381 22.3242 6.99909 22.3936 7.11534C22.463 7.23159 22.4997 7.36446 22.4997 7.49985C22.4997 7.63524 22.463 7.76811 22.3936 7.88436C22.3242 8.0006 22.2246 8.09589 22.1054 8.16011L12.3554 13.4101C12.2462 13.4692 12.124 13.5001 11.9998 13.5001ZM3.83188 7.50011L11.9998 11.8983L20.1678 7.50011L11.9998 3.10196L3.83188 7.50011Z"
        fill="white"
      />
    </g>
  </svg>
);

const SizeIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g>
      <path
        d="M9.75 12.75H5.25C4.85218 12.75 4.47064 12.908 4.18934 13.1893C3.90804 13.4706 3.75 13.8522 3.75 14.25V18.75C3.75 19.1478 3.90804 19.5294 4.18934 19.8107C4.47064 20.092 4.85218 20.25 5.25 20.25H9.75C10.1478 20.25 10.5294 20.092 10.8107 19.8107C11.092 19.5294 11.25 19.1478 11.25 18.75V14.25C11.25 13.8522 11.092 13.4706 10.8107 13.1893C10.5294 12.908 10.1478 12.75 9.75 12.75ZM5.25 18.75V14.25H9.75V18.75H5.25Z"
        fill="white"
      />
      <path
        d="M14.25 15.75V17.25H18.75C19.1478 17.25 19.5294 17.092 19.8107 16.8107C20.092 16.5294 20.25 16.1478 20.25 15.75V5.25C20.25 4.85218 20.092 4.47064 19.8107 4.18934C19.5294 3.90804 19.1478 3.75 18.75 3.75H8.25C7.85218 3.75 7.47064 3.90804 7.18934 4.18934C6.90804 4.47064 6.75 4.85218 6.75 5.25V9.75H8.25V5.25H18.75V15.75"
        fill="white"
      />
    </g>
  </svg>
);

// load default translations
setTranslations(en);

// replace elements section with just shapes
DEFAULT_SECTIONS.splice(3, 1, ShapesSection);

// add my library section for logged-in users
DEFAULT_SECTIONS.unshift(MyLibrarySection);

DEFAULT_SECTIONS.find((section) => section.name === 'text').Tab = (props) => (
  <SectionTab name="Text" {...props}>
    <TextIcon />
  </SectionTab>
);

DEFAULT_SECTIONS.find((section) => section.name === 'photos').Tab = (props) => (
  <SectionTab name="Photos" {...props}>
    <PhotosIcon />
  </SectionTab>
);

DEFAULT_SECTIONS.find((section) => section.name === 'templates').Tab = (
  props
) => (
  <SectionTab name="Templates" {...props}>
    <TemplatesIcon />
  </SectionTab>
);

DEFAULT_SECTIONS.find((section) => section.name === 'upload').Tab = (props) => (
  <SectionTab name="Upload" {...props}>
    <UploadIcon />
  </SectionTab>
);

DEFAULT_SECTIONS.find((section) => section.name === 'background').Tab = (
  props
) => (
  <SectionTab name="Background" {...props}>
    <BackgroundIcon />
  </SectionTab>
);

DEFAULT_SECTIONS.find((section) => section.name === 'layers').Tab = (props) => (
  <SectionTab name="Layers" {...props}>
    <LayersIcon />
  </SectionTab>
);

DEFAULT_SECTIONS.find((section) => section.name === 'size').Tab = (props) => (
  <SectionTab name="Size" {...props}>
    <SizeIcon />
  </SectionTab>
);

const isStandalone = () => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone
  );
};

const getOffsetHeight = () => {
  let safeAreaInsetBottom = 0;

  if (isStandalone()) {
    // Try to get the safe area inset using env() variables
    const safeAreaInsetBottomString = getComputedStyle(
      document.documentElement
    ).getPropertyValue('env(safe-area-inset-bottom)');
    if (safeAreaInsetBottomString) {
      safeAreaInsetBottom = parseFloat(safeAreaInsetBottomString);
    }

    // Fallback values for specific devices if env() is not supported
    if (!safeAreaInsetBottom) {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;

      if (/iPhone|iPad|iPod/i.test(userAgent) && !window.MSStream) {
        // This is an approximation; you might need to adjust this value based on testing
        safeAreaInsetBottom = 20; // Example fallback value for iPhone
      }
    }
  }

  return window.innerHeight - safeAreaInsetBottom;
};

const useHeight = () => {
  const [height, setHeight] = React.useState(getOffsetHeight());
  React.useEffect(() => {
    window.addEventListener('resize', () => {
      setHeight(getOffsetHeight());
    });
  }, []);
  return height;
};

const App = observer(({ store }) => {
  const project = useProject();
  const height = useHeight();

  React.useEffect(() => {
    if (project.language.startsWith('fr')) {
      setTranslations(fr, { validate: true });
    } else if (project.language.startsWith('id')) {
      setTranslations(id, { validate: true });
    } else if (project.language.startsWith('ru')) {
      setTranslations(ru, { validate: true });
    } else if (project.language.startsWith('pt')) {
      setTranslations(ptBr, { validate: true });
    } else if (project.language.startsWith('zh')) {
      setTranslations(zhCh, { validate: true });
    } else {
      setTranslations(en, { validate: true });
    }
  }, [project.language]);

  React.useEffect(() => {
    project.firstLoad();
  }, []);

  const handleDrop = (ev) => {
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();

    // skip the case if we dropped DOM element from side panel
    // in that case Safari will have more data in "items"
    if (ev.dataTransfer.files.length !== ev.dataTransfer.items.length) {
      return;
    }
    // Use DataTransfer interface to access the file(s)
    for (let i = 0; i < ev.dataTransfer.files.length; i++) {
      loadFile(ev.dataTransfer.files[i], store);
    }
  };

  return (
    <div
      style={{
        width: '100vw',
        height: height + 'px',
        display: 'flex',
        flexDirection: 'column',
      }}
      onDrop={handleDrop}
    >
      <Topbar store={store} />
      <div style={{ height: 'calc(100% - 50px)' }}>
        <PolotnoContainer className="polotno-app-container">
          <SidePanelWrap>
            <SidePanel store={store} sections={DEFAULT_SECTIONS} />
          </SidePanelWrap>
          <WorkspaceWrap>
            <Toolbar store={store} />
            <Workspace store={store} />
            <ZoomButtons store={store} />
            <PagesTimeline store={store} />
          </WorkspaceWrap>
        </PolotnoContainer>
      </div>
      {project.status === 'loading' && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'white',
            }}
          >
            <Spinner />
          </div>
        </div>
      )}
    </div>
  );
});

export default App;
