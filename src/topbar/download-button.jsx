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
  Checkbox,
  Tooltip,
} from '@blueprintjs/core';
import { ChevronDown } from '@blueprintjs/icons';
import JSZip from 'jszip';
import { downloadFile } from 'polotno/utils/download';
import * as unit from 'polotno/utils/unit';
import { t } from 'polotno/utils/l10n';
import { getKey } from 'polotno/utils/validate-key';

// Client-side video rendering
const saveAsVideoClient = async ({
  store,
  fileName,
  pixelRatio,
  fps,
  onProgress,
}) => {
  const module = await import('@polotno/video-export');
  const blob = await module.storeToVideo({
    store,
    pixelRatio,
    fps,
    onProgress: (progress, frameTime) => {
      // progress is 0-1, convert to 0-100
      onProgress(progress * 100, 'rendering');
    },
  });

  // Download the video blob
  const url = URL.createObjectURL(blob);
  downloadFile(url, fileName);
  URL.revokeObjectURL(url);
};

// Cloud-side video rendering
const saveAsVideo = async ({ store, pixelRatio, fps, onProgress }) => {
  const json = store.toJSON();
  const req = await fetch(
    'https://api.polotno.com/api/renders?KEY=' + getKey(),
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
      `https://api.polotno.com/api/renders/${job.id}?KEY=` + getKey()
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

// Cloud render for vector PDF export
const saveAsVectorPDF = async ({
  store,
  pixelRatio,
  onProgress,
  colorProfile = 'RGB',
}) => {
  const json = store.toJSON();

  const renderOptions = {
    design: json,
    pixelRatio,
    format: 'pdf',
    vector: true,
  };

  // Add CMYK color profile if selected
  if (colorProfile === 'CMYK') {
    renderOptions.color = {
      space: 'CMYK',
    };
    // Add PDF/X-1a for vector + CMYK
    renderOptions.pdfx1a = true;
  }

  const req = await fetch(
    'https://api.polotno.com/api/renders?KEY=' + getKey(),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(renderOptions),
    }
  );

  const job = await req.json();

  while (true) {
    const jobReq = await fetch(
      `https://api.polotno.com/api/renders/${job.id}?KEY=` + getKey()
    );
    const jobData = await jobReq.json();

    if (jobData.status === 'done') {
      downloadFile(jobData.output, 'polotno.pdf');
      break;
    } else if (jobData.status === 'error') {
      throw new Error('Failed to render PDF');
    } else {
      onProgress(jobData.progress, jobData.status);
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
};

// Cloud render for CMYK flattened PDF export
const saveAsCMYKPDF = async ({
  store,
  pixelRatio,
  onProgress,
  includeBleed = false,
  cropMarkSize = 0,
}) => {
  const json = store.toJSON();

  const renderOptions = {
    design: json,
    pixelRatio,
    format: 'pdf',
    color: {
      space: 'CMYK',
    },
  };

  if (includeBleed) {
    renderOptions.includeBleed = true;
  }

  if (cropMarkSize > 0) {
    renderOptions.cropMarkSize = cropMarkSize;
  }

  const req = await fetch(
    'https://api.polotno.com/api/renders?KEY=' + getKey(),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(renderOptions),
    }
  );

  const job = await req.json();

  while (true) {
    const jobReq = await fetch(
      `https://api.polotno.com/api/renders/${job.id}?KEY=` + getKey()
    );
    const jobData = await jobReq.json();

    if (jobData.status === 'done') {
      downloadFile(jobData.output, 'polotno.pdf');
      break;
    } else if (jobData.status === 'error') {
      throw new Error('Failed to render PDF');
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
  // flag for client-side video rendering
  const [clientSideVideo, setClientSideVideo] = React.useState(true);
  // PDF export options
  const [flattenPDF, setFlattenPDF] = React.useState(true);
  const [cropMarksAndBleed, setCropMarksAndBleed] = React.useState(false);
  const [colorProfile, setColorProfile] = React.useState('RGB');

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

  const handleExport = async () => {
    setSaving(true);
    try {
      if (type === 'pdf') {
        // Vector PDF (non-flattened)
        if (!flattenPDF) {
          setProgressStatus('scheduled');
          await saveAsVectorPDF({
            store,
            pixelRatio: quality * Math.sqrt(300 / 72),
            colorProfile,
            onProgress: (progress, status) => {
              setProgress(progress);
              setProgressStatus(status);
            },
          });
          setProgressStatus('done');
          setProgress(0);
          // Track vector PDF export
          window.plausible?.('export-vector-pdf');
        }
        // Flatten PDF with CMYK (always cloud render)
        else if (flattenPDF && colorProfile === 'CMYK') {
          setProgressStatus('scheduled');
          await saveAsCMYKPDF({
            store,
            pixelRatio: quality * Math.sqrt(300 / 72),
            includeBleed: cropMarksAndBleed,
            cropMarkSize: cropMarksAndBleed ? 20 : 0,
            onProgress: (progress, status) => {
              setProgress(progress);
              setProgressStatus(status);
            },
          });
          setProgressStatus('done');
          setProgress(0);
          // Track CMYK PDF export
          window.plausible?.('export-vector-pdf');
        }
        // Flatten PDF with RGB (local export)
        else if (flattenPDF) {
          const exportOptions = {
            fileName: getName() + '.pdf',
            dpi: store.dpi / pageSizeModifier,
            pixelRatio: quality * Math.sqrt(300 / 72),
          };

          if (cropMarksAndBleed) {
            exportOptions.includeBleed = true;
            exportOptions.cropMarkSize = 20;
          }

          await store.saveAsPDF(exportOptions);
          // Track flat PDF export
          window.plausible?.('export-flat-pdf');
        }
      } else if (type === 'html') {
        await store.saveAsHTML({
          fileName: getName() + '.html',
        });
        // Track HTML export
        window.plausible?.('export-html');
      } else if (type === 'svg') {
        await store.saveAsSVG({
          fileName: getName() + '.svg',
        });
        // Track SVG export
        window.plausible?.('export-svg');
      } else if (type === 'json') {
        const json = store.toJSON();

        const url =
          'data:text/json;base64,' +
          window.btoa(unescape(encodeURIComponent(JSON.stringify(json))));

        downloadFile(url, 'polotno.json');
        // Track JSON export
        window.plausible?.('export-json');
      } else if (type === 'gif') {
        await store.saveAsGIF({
          fileName: getName() + '.gif',
          pixelRatio: quality,
          fps,
        });
        // Track GIF export
        window.plausible?.('export-gif');
      } else if (type === 'pptx') {
        import('@polotno/pptx-export').then((module) => {
          module.jsonToPPTX({
            json: store.toJSON(),
            output: getName() + '.pptx',
          });
        });
        // Track PPTX export
        window.plausible?.('export-pptx');
        // await jsonToPPTX({ json: store.toJSON(), output: getName() + '.pptx' });
        // downloadFile(pptx, 'polotno.pptx');
      } else if (type === 'mp4') {
        if (clientSideVideo) {
          setProgressStatus('rendering');
          await saveAsVideoClient({
            store,
            fileName: getName() + '.mp4',
            pixelRatio: quality,
            fps: 30,
            onProgress: (progress, status) => {
              setProgress(progress);
              setProgressStatus(status);
            },
          });
          setProgressStatus('done');
          setProgress(0);
        } else {
          setProgressStatus('scheduled');
          await saveAsVideo({
            store,
            pixelRatio: quality,
            fps: 30,
            onProgress: (progress, status) => {
              setProgress(progress);
              setProgressStatus(status);
            },
          });
          setProgressStatus('done');
          setProgress(0);
        }
        // Track MP4 export
        window.plausible?.('export-mp4');
      } else {
        if (store.pages.length < 3) {
          store.pages.forEach((page, index) => {
            // do not add index if we have just one page
            const indexString = store.pages.length > 1 ? '-' + (index + 1) : '';
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
            const indexString = store.pages.length > 1 ? '-' + (index + 1) : '';

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
        // Track image exports (jpeg/png)
        window.plausible?.(`export-${type}`);
      }
    } catch (e) {
      // Track export failure
      window.plausible?.('export-failed');
      // throw into global error handler for reporting
      setTimeout(() => {
        throw e;
      });
      alert('Something went wrong. Please try again.');
    }
    setSaving(false);
  };

  const isRasterFormat = type === 'jpeg' || type === 'png';
  const maxQuality = type === 'mp4' ? 1 : 300 / 72;

  return (
    <Popover
      content={
        <Menu style={{ minWidth: '280px' }}>
          <p>File type</p>
          <HTMLSelect
            fill
            onChange={(e) => {
              setType(e.target.value);
              setQuality(1);
            }}
            value={type}
            style={{}}
          >
            <option value="jpeg">JPEG</option>
            <option value="png">PNG</option>
            <option value="pdf">PDF</option>
            <option value="html">HTML</option>
            <option value="svg">SVG</option>
            <option value="pptx">PPTX</option>
            <option value="json">JSON</option>
            <option value="gif">GIF</option>
            <option value="mp4">MP4 Video</option>
          </HTMLSelect>

          {type === 'pdf' && (
            <div style={{ paddingTop: '10px' }}>
              <Tooltip
                content="Flattening merges all design elements into a single image layer, ensuring consistent printing results. May increase file size."
                position="bottom"
              >
                <Checkbox
                  checked={flattenPDF}
                  label="Flatten PDF"
                  onChange={(e) => setFlattenPDF(e.target.checked)}
                />
              </Tooltip>
              {flattenPDF && (
                <Checkbox
                  checked={cropMarksAndBleed}
                  label="Crop marks and bleed"
                  onChange={(e) => setCropMarksAndBleed(e.target.checked)}
                />
              )}
              <div style={{ marginTop: '10px' }}>
                <p style={{ marginBottom: '5px' }}>Color Profile</p>
                <HTMLSelect
                  fill
                  value={colorProfile}
                  onChange={(e) => setColorProfile(e.target.value)}
                >
                  <option value="RGB">RGB</option>
                  <option value="CMYK">CMYK</option>
                </HTMLSelect>
              </div>
            </div>
          )}

          {type !== 'json' &&
            type !== 'html' &&
            type !== 'svg' &&
            type !== 'pptx' &&
            (type !== 'pdf' || flattenPDF) && (
              <>
                <p style={{ paddingTop: '10px' }}>Quality</p>
                <div style={{ padding: '0 10px' }}>
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
                    <div style={{ paddingTop: '10px' }}>
                      DPI: {Math.round(store.dpi * quality)}
                    </div>
                  )}
                  {type !== 'pdf' && (
                    <div style={{ paddingTop: '10px' }}>
                      {Math.round(store.activePage.computedWidth * quality)} x{' '}
                      {Math.round(store.activePage.computedHeight * quality)} px
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
                {type === 'pdf' && flattenPDF && (
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
          {type === 'html' && (
            <>
              <div style={{ padding: '10px', maxWidth: '180px', opacity: 0.8 }}>
                HTML format is used for embedding your design in web pages.
              </div>
            </>
          )}
          {type === 'svg' && (
            <>
              <div style={{ padding: '10px', maxWidth: '180px', opacity: 0.8 }}>
                SVG is a vector graphic format that can be scaled without
                quality loss.
              </div>
            </>
          )}
          {type === 'pptx' && (
            <>
              <div style={{ padding: '10px', maxWidth: '180px', opacity: 0.8 }}>
                PPTX format is for PowerPoint presentations.
              </div>
            </>
          )}
          {type === 'mp4' && (
            <div style={{ padding: '10px' }}>
              <Checkbox
                checked={clientSideVideo}
                label="Client-side rendering"
                onChange={(e) => setClientSideVideo(e.target.checked)}
              />
            </div>
          )}
          {(type === 'mp4' ||
            type === 'pptx' ||
            (type === 'pdf' && !flattenPDF) ||
            (type === 'pdf' && colorProfile === 'CMYK')) && (
            <>
              {saving &&
                (type === 'mp4' ||
                  (type === 'pdf' && !flattenPDF) ||
                  (type === 'pdf' && colorProfile === 'CMYK')) && (
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
            onClick={handleExport}
            style={{ marginTop: '10px' }}
          >
            Download {type.toUpperCase()}
          </Button>
        </Menu>
      }
      position={Position.BOTTOM_RIGHT}
    >
      <Button
        endIcon={<ChevronDown />}
        text={t('toolbar.download')}
        intent="primary"
        onClick={() => {
          setQuality(1);
        }}
      />
    </Popover>
  );
});
