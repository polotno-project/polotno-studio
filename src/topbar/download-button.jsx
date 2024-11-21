import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  Button,
  Position,
  Menu,
  HTMLSelect,
  Slider,
  Popover,
  ProgressBar,
} from '@blueprintjs/core';
import JSZip from 'jszip';
import { downloadFile } from 'polotno/utils/download';
import * as unit from 'polotno/utils/unit';
import { t } from 'polotno/utils/l10n';

const saveAsVideo = async ({ store, pixelRatio, fps, onProgress }) => {
  const json = store.toJSON();
  const req = await fetch(
    'https://api.polotno.dev/api/renders?KEY=nFA5H9elEytDyPyvKL7T',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        design: json,
        pixelRatio,
        format: 'mp4',
      }),
    }
  );
  const job = await req.json();
  while (true) {
    const jobReq = await fetch(
      `https://api.polotno.dev/api/renders/${job.id}?KEY=nFA5H9elEytDyPyvKL7T`
    );
    const jobData = await jobReq.json();
    if (jobData.status === 'done') {
      downloadFile(jobData.output, 'polotno.mp4');
      break;
    } else if (jobData.status === 'error') {
      throw new Error('Failed to render video');
    } else {
      onProgress(jobData.progress, jobData.status);
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
};

export const DownloadButton = observer(({ store }) => {
  const [saving, setSaving] = React.useState(false);
  const [quality, setQuality] = React.useState(1);
  const [pageSizeModifier, setPageSizeModifier] = React.useState(1);
  const [fps, setFPS] = React.useState(10);
  const [type, setType] = React.useState('png');
  const [progress, setProgress] = React.useState(0);
  const [progressStatus, setProgressStatus] = React.useState('scheduled');

  const getName = () => {
    const texts = [];
    store.pages.forEach((p) => {
      p.children.forEach((c) => {
        if (c.type === 'text') {
          texts.push(c.text);
        }
      });
    });
    const allWords = texts.join(' ').split(' ');
    const words = allWords.slice(0, 6);
    return words.join(' ').replace(/\s/g, '-').toLowerCase() || 'polotno';
  };

  const maxQuality = type === 'mp4' ? 1 : 300 / 72;
  return (
    <Popover
      content={
        <Menu>
          <li className="bp5-menu-header">
            <h6 className="bp5-heading">File type</h6>
          </li>
          <HTMLSelect
            fill
            onChange={(e) => {
              setType(e.target.value);
              setQuality(1);
            }}
            value={type}
          >
            <option value="jpeg">JPEG</option>
            <option value="png">PNG</option>
            <option value="pdf">PDF</option>
            <option value="html">HTML</option>
            <option value="svg">SVG</option>
            <option value="json">JSON</option>
            <option value="gif">GIF</option>
            <option value="mp4">MP4 Video (Beta)</option>
          </HTMLSelect>

          {type !== 'json' && type !== 'html' && type !== 'svg' && (
            <>
              <li className="bp5-menu-header">
                <h6 className="bp5-heading">Quality</h6>
              </li>
              <div style={{ padding: '10px' }}>
                <Slider
                  value={quality}
                  labelRenderer={false}
                  onChange={(quality) => {
                    setQuality(quality);
                  }}
                  stepSize={0.2}
                  min={0.2}
                  max={maxQuality}
                  showTrackFill={false}
                />
                {type === 'pdf' && (
                  <div>DPI: {Math.round(store.dpi * quality)}</div>
                )}
                {type !== 'pdf' && (
                  <div>
                    {Math.round(store.width * quality)} x{' '}
                    {Math.round(store.height * quality)} px
                  </div>
                )}
                {type === 'gif' && (
                  <>
                    <li className="bp5-menu-header">
                      <h6 className="bp5-heading">FPS</h6>
                    </li>
                    <div style={{ padding: '10px' }}>
                      <Slider
                        value={fps}
                        // labelRenderer={false}
                        labelStepSize={5}
                        onChange={(fps) => {
                          setFPS(fps);
                        }}
                        stepSize={1}
                        min={5}
                        max={30}
                        showTrackFill={false}
                      />
                    </div>
                  </>
                )}
              </div>
              {type === 'pdf' && (
                <>
                  <li className="bp5-menu-header">
                    <h6 className="bp5-heading">Page Size</h6>
                  </li>
                  <div style={{ padding: '10px' }}>
                    <Slider
                      value={pageSizeModifier}
                      labelRenderer={false}
                      onChange={(pageSizeModifier) => {
                        setPageSizeModifier(pageSizeModifier);
                      }}
                      stepSize={0.2}
                      min={0.2}
                      max={3}
                      showTrackFill={false}
                    />

                    <div>
                      {unit.pxToUnitRounded({
                        px: store.width * pageSizeModifier,
                        dpi: store.dpi,
                        precious: 0,
                        unit: 'mm',
                      })}{' '}
                      x{' '}
                      {unit.pxToUnitRounded({
                        px: store.height * pageSizeModifier,
                        dpi: store.dpi,
                        precious: 0,
                        unit: 'mm',
                      })}{' '}
                      mm
                    </div>
                  </div>
                </>
              )}
            </>
          )}
          {type === 'json' && (
            <>
              <div style={{ padding: '10px', maxWidth: '180px', opacity: 0.8 }}>
                JSON format is used for saving and loading projects. You can
                save your project to a file and load it later via "File" {'->'}{' '}
                "Open" menu.
              </div>
            </>
          )}
          {type === 'mp4' && (
            <>
              <div style={{ padding: '10px', maxWidth: '180px', opacity: 0.8 }}>
                <strong>Beta feature.</strong>{' '}
                <a href="mailto:anton@polotno.com">
                  Let us know what you think!
                </a>
              </div>
              {saving && (
                <div
                  style={{ padding: '10px', maxWidth: '180px', opacity: 0.8 }}
                >
                  <ProgressBar value={Math.max(3, progress) / 100} />
                </div>
              )}
            </>
          )}
          <Button
            fill
            intent="primary"
            loading={saving}
            onClick={async () => {
              setSaving(true);
              try {
                if (type === 'pdf') {
                  await store.saveAsPDF({
                    fileName: getName() + '.pdf',
                    dpi: store.dpi / pageSizeModifier,
                    pixelRatio: 2 * quality,
                  });
                } else if (type === 'html') {
                  await store.saveAsHTML({
                    fileName: getName() + '.html',
                  });
                } else if (type === 'svg') {
                  await store.saveAsSVG({
                    fileName: getName() + '.svg',
                  });
                } else if (type === 'json') {
                  const json = store.toJSON();

                  const url =
                    'data:text/json;base64,' +
                    window.btoa(
                      unescape(encodeURIComponent(JSON.stringify(json)))
                    );

                  downloadFile(url, 'polotno.json');
                } else if (type === 'gif') {
                  await store.saveAsGIF({
                    fileName: getName() + '.gif',
                    pixelRatio: quality,
                    fps,
                  });
                } else if (type === 'mp4') {
                  setProgressStatus('scheduled');
                  await saveAsVideo({
                    store,
                    pixelRatio: quality,
                    onProgress: (progress, status) => {
                      setProgress(progress);
                      setProgressStatus(status);
                    },
                  });
                  setProgressStatus('done');
                  setProgress(0);
                } else {
                  if (store.pages.length < 3) {
                    store.pages.forEach((page, index) => {
                      // do not add index if we have just one page
                      const indexString =
                        store.pages.length > 1 ? '-' + (index + 1) : '';
                      store.saveAsImage({
                        pageId: page.id,
                        pixelRatio: quality,
                        mimeType: 'image/' + type,
                        fileName: getName() + indexString + '.' + type,
                      });
                    });
                  } else {
                    const zip = new JSZip();
                    for (const page of store.pages) {
                      const index = store.pages.indexOf(page);
                      const indexString =
                        store.pages.length > 1 ? '-' + (index + 1) : '';

                      const url = await store.toDataURL({
                        pageId: page.id,
                        pixelRatio: quality,
                        mimeType: 'image/' + type,
                      });
                      const fileName = getName() + indexString + '.' + type;
                      const base64Data = url.replace(
                        /^data:image\/(png|jpeg);base64,/,
                        ''
                      );
                      zip.file(fileName, base64Data, { base64: true });
                    }

                    const content = await zip.generateAsync({ type: 'base64' });
                    const result = 'data:application/zip;base64,' + content;
                    console.log(content);
                    downloadFile(result, getName() + '.zip');
                  }
                }
              } catch (e) {
                // throw into global error handler for reporting
                setTimeout(() => {
                  throw e;
                });
                alert('Something went wrong. Please try again.');
              }
              setSaving(false);
            }}
          >
            Download {type.toUpperCase()}
          </Button>

          {/* <MenuItem
            icon="media"
            text={t('toolbar.saveAsImage')}
            onClick={async () => {
              store.pages.forEach((page, index) => {
                // do not add index if we have just one page
                const indexString =
                  store.pages.length > 1 ? '-' + (index + 1) : '';
                store.saveAsImage({
                  pageId: page.id,
                  fileName: getName() + indexString + '.png',
                });
              });
            }}
          />
          <MenuItem
            icon="document"
            text={t('toolbar.saveAsPDF')}
            onClick={async () => {
              setSaving(true);
              await store.saveAsPDF({
                fileName: getName() + '.pdf',
              });
              setSaving(false);
            }}
          /> */}
        </Menu>
      }
      position={Position.BOTTOM_RIGHT}
    >
      <Button
        icon="import"
        text={t('toolbar.download')}
        intent="primary"
        // loading={saving}
        onClick={() => {
          setQuality(1);
        }}
      />
    </Popover>
  );
});
