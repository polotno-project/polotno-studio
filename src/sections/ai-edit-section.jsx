import React from 'react';
import { observer } from 'mobx-react-lite';
import { TextArea, Button, Tag } from '@blueprintjs/core';
import { Edit } from '@blueprintjs/icons';

import { SectionTab } from 'polotno/side-panel';
import { getKey } from 'polotno/utils/validate-key';

/**
 * Cleans default values from design JSON before sending to API
 * Removes properties that have default/empty values that aren't needed
 */
const cleanDesignJSON = (json) => {
  // Deep clone to avoid mutating the original
  const cleaned = JSON.parse(JSON.stringify(json));

  // Helper function to clean an element
  const cleanElement = (element) => {
    // Remove default values that are typically not needed
    const defaultsToRemove = {
      // Common defaults
      opacity: 1,
      rotation: 0,
      flipX: false,
      flipY: false,
      locked: false,
      visible: true,
      selectable: true,
      draggable: true,
      resizable: true,
      removable: true,
      // Text defaults
      textAlign: 'left',
      verticalAlign: 'top',
      lineHeight: 1.2,
      letterSpacing: 0,
      // Shadow defaults
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowColor: 'rgba(0,0,0,0)',
      // Border defaults
      strokeWidth: 0,
      stroke: '',
      // Effects defaults
      brightness: 0,
      contrast: 0,
      saturation: 0,
      hue: 0,
      sepia: 0,
      grayscale: 0,
      blur: 0,
    };

    // Remove properties that match defaults
    Object.keys(defaultsToRemove).forEach((key) => {
      if (element[key] === defaultsToRemove[key]) {
        delete element[key];
      }
    });

    // Remove empty arrays and objects
    Object.keys(element).forEach((key) => {
      if (Array.isArray(element[key]) && element[key].length === 0) {
        delete element[key];
      }
      if (
        typeof element[key] === 'object' &&
        element[key] !== null &&
        !Array.isArray(element[key]) &&
        Object.keys(element[key]).length === 0
      ) {
        delete element[key];
      }
    });

    // Recursively clean children if it's a group
    if (element.children && Array.isArray(element.children)) {
      element.children = element.children.map(cleanElement);
    }

    return element;
  };

  // Clean all pages and their children
  if (cleaned.pages && Array.isArray(cleaned.pages)) {
    cleaned.pages = cleaned.pages.map((page) => {
      const cleanedPage = { ...page };
      if (cleanedPage.children && Array.isArray(cleanedPage.children)) {
        cleanedPage.children = cleanedPage.children.map(cleanElement);
      }
      return cleanedPage;
    });
  }

  return cleaned;
};

const AIEditTab = observer(({ store }) => {
  const promptRef = React.useRef(null);
  const [loading, setLoading] = React.useState(false);
  const [prompt, setPrompt] = React.useState('');

  // Preset prompts for common design edits
  const presetPrompts = [
    {
      label: 'Corporate',
      prompt:
        'Transform this design into a clean corporate style. Use a calm, professional color palette based on blues, grays and plenty of white space. Choose simple, modern sans-serif fonts that look trustworthy and serious. Make the layout clear and tidy, with strong alignment and a clear visual hierarchy so it feels like something from a bank, consulting firm or large tech company.',
    },
    {
      label: 'Minimal',
      prompt:
        'Simplify this design into a minimal, quiet style. Reduce the number of colors and stick to one accent color with lots of white or light background. Use simple, light fonts and increase spacing between elements so everything can breathe. Remove any decorations that don’t support the message and keep only the essential text and shapes, very clean and calm.',
    },
    {
      label: 'Playful',
      prompt:
        'Turn this design into a bright and playful style. Use vivid, cheerful colors and rounded shapes that feel friendly. Choose fun, easy-to-read fonts with a bit of character. Add gentle movement in the layout with overlapping elements or angled shapes, but keep the text readable and the overall feeling light, happy and energetic.',
    },
    {
      label: 'Bold Social',
      prompt:
        'Adapt this design for bold social media use. Make the main message very large and easy to read on a phone screen. Use strong contrast between background and text, with one or two powerful accent colors. Keep the layout simple, with big shapes and clear framing around the key words or image, so it stands out while scrolling in a feed.',
    },
    {
      label: 'Elegant',
      prompt:
        'Redesign this in an elegant, premium style. Use a restrained color palette with soft neutrals, deep dark tones and maybe one metallic accent like gold or copper. Choose refined serif or thin sans-serif fonts. Add generous margins and balanced spacing, with subtle lines or shapes for structure. The overall feeling should be calm, luxurious and high-end.',
    },
    {
      label: 'Tech & Startup',
      prompt:
        'Convert this design into a modern tech and startup style. Use cool tones like blue, teal or purple with a lot of clean white space. Choose geometric sans-serif fonts that feel modern and confident. Include subtle geometric shapes or gradients to suggest innovation and motion, but keep the overall look focused, clear and product-driven.',
    },
    {
      label: 'Editorial',
      prompt:
        'Restyle this layout to look like a magazine or editorial cover. Use a strong typographic hierarchy with a mix of bold headlines and smaller supporting text. Combine a classy serif font for titles with a simple sans-serif for details if needed. Align elements into a clear grid, allow overlapping of text and image in a controlled way, and keep the result sophisticated and readable.',
    },
    {
      label: 'Friendly Educational',
      prompt:
        'Transform this into a friendly educational style that feels approachable and clear. Use soft, inviting colors and simple icons or shapes to support the content. Choose clean, readable fonts and organize information into clear sections, making key points stand out. The design should feel helpful and encouraging, like learning materials from a modern school or online course.',
    },
    {
      label: 'Event Poster',
      prompt:
        'Adapt this design into a striking event poster style. Make the event name the main hero, very large and easy to see from far away. Use a strong color palette and dynamic composition with clear sections for date, time and location. The layout should feel energetic and eye-catching, while still allowing someone to quickly find all the important details.',
    },
    {
      label: 'Seasonal Promo',
      prompt:
        'Restyle this design as a seasonal promotion. Keep the core content but adjust the colors, shapes and small decorative elements to match a specific season or holiday, such as warm cozy tones for autumn sales or bright reds and greens for winter holidays. The design should feel festive and thematic, but still clean and easy to read for offers and key information.',
    },
  ];

  const handlePresetClick = (presetPrompt) => {
    setPrompt(presetPrompt);
    // Focus the textarea after setting the prompt
    setTimeout(() => {
      if (promptRef.current) {
        promptRef.current.focus();
      }
    }, 0);
  };

  const handleEdit = async () => {
    const currentPrompt = prompt.trim();
    if (!currentPrompt) {
      alert('Please enter a prompt for editing');
      return;
    }

    setLoading(true);

    try {
      // Get the current design JSON
      const designJSON = store.toJSON();

      // Clean default values from the JSON
      const cleanedJSON = cleanDesignJSON(designJSON);

      // Make API request
      const response = await fetch(
        `http://localhost:3002/api/ai/design/edit?KEY=${getKey()}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            design: cleanedJSON,
            prompt: currentPrompt,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${errorText}`);
      }

      const data = await response.json();

      // Load the edited design back into the store
      if (data.design) {
        store.loadJSON(data.design, true);
      } else {
        alert('No design returned from API');
      }
    } catch (error) {
      console.error('Error editing design:', error);
      alert('Error editing design: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ height: '40px', paddingTop: '5px', fontWeight: 'bold' }}>
        AI Edit
      </div>

      {/* Preset Prompt Buttons */}
      <div style={{ marginBottom: '15px' }}>
        <label
          style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#5c7080',
          }}
        >
          Quick Styles
        </label>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            marginBottom: '10px',
          }}
        >
          {presetPrompts.map((preset, index) => (
            <Tag
              key={index}
              interactive
              onClick={() => handlePresetClick(preset.prompt)}
              style={{
                cursor: 'pointer',
                backgroundColor: '#f5f8fa',
                color: '#106ba3',
                fontSize: '11px',
                padding: '4px 8px',
                margin: 0,
              }}
            >
              {preset.label}
            </Tag>
          ))}
        </div>
      </div>

      {/* Prompt Input */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          Edit prompt
        </label>
        <TextArea
          placeholder="Describe how you want to edit the design... (or click a style above)"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={{
            minHeight: '80px',
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
          inputRef={promptRef}
          fill
        />
      </div>

      {/* Edit Button */}
      <Button
        onClick={handleEdit}
        intent="primary"
        loading={loading}
        style={{ width: '100%', marginBottom: '20px', borderRadius: '4px' }}
        icon={<Edit />}
      >
        Apply Edit
      </Button>

      <p
        style={{
          textAlign: 'center',
          marginBottom: '20px',
          fontSize: '12px',
          color: '#5c7080',
        }}
      >
        Describe the changes you want to make to your design
      </p>
    </>
  );
});

const AIEditPanel = observer(({ store }) => {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AIEditTab store={store} />
    </div>
  );
});

// define the new custom section
export const AIEditSection = {
  name: 'ai-edit',
  Tab: (props) => (
    <SectionTab name="AI Edit" {...props}>
      <Edit />
    </SectionTab>
  ),
  // we need observer to update component automatically on any store changes
  Panel: AIEditPanel,
};
