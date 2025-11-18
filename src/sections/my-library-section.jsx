import React from 'react';
import { observer } from 'mobx-react-lite';
import { SectionTab } from 'polotno/side-panel';
import { Button, InputGroup } from '@blueprintjs/core';
import { t } from 'polotno/utils/l10n';
import * as api from '../api';
import { showError, showSuccess } from '../notifications';

const MyLibrarySection = {
  name: 'my-library',
  Tab: (props) => (
    <SectionTab name="My Designs" {...props}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.5 10C9.32843 10 10 9.32843 10 8.5C10 7.67157 9.32843 7 8.5 7C7.67157 7 7 7.67157 7 8.5C7 9.32843 7.67157 10 8.5 10Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M21 15L16 10L5 21"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </SectionTab>
  ),
  Panel: observer(({ store }) => {
    const [designs, setDesigns] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState('');

    const loadDesigns = React.useCallback(async () => {
      try {
        setLoading(true);
        const designList = await api.listDesigns();
        setDesigns(designList);
      } catch (error) {
        console.error('Failed to load designs:', error);
      } finally {
        setLoading(false);
      }
    }, []);

    React.useEffect(() => {
      if (api.isSignedIn()) {
        loadDesigns();
      } else {
        setLoading(false);
      }
    }, [loadDesigns]);

    const handleLoadDesign = async (designId) => {
      try {
        const { storeJSON, name } = await api.loadById({ id: designId });
        store.loadJSON(storeJSON);
        window.project.id = designId;
        window.project.name = name;
        showSuccess(`Design "${name}" loaded successfully`);
      } catch (error) {
        showError('Failed to load design');
      }
    };

    const handleDeleteDesign = async (designId) => {
      if (!confirm('Are you sure you want to delete this design?')) {
        return;
      }

      try {
        await api.deleteDesign({ id: designId });
        showSuccess('Design deleted successfully');
        loadDesigns();
      } catch (error) {
        showError('Failed to delete design');
      }
    };

    const filteredDesigns = designs.filter((design) =>
      design.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!api.isSignedIn()) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            style={{ margin: '0 auto 16px', opacity: 0.5 }}
          >
            <path
              d="M12 14C14.7614 14 17 11.7614 17 9C17 6.23858 14.7614 4 12 4C9.23858 4 7 6.23858 7 9C7 11.7614 9.23858 14 12 14Z"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M3 20C3 16.6863 5.68629 14 9 14H15C18.3137 14 21 16.6863 21 20"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          <h3 style={{ marginBottom: '8px' }}>Sign In Required</h3>
          <p style={{ color: '#5c7080', marginBottom: '16px' }}>
            Please sign in to access your design library
          </p>
          <Button
            intent="primary"
            onClick={() => {
              const loginUrl = window.polotnoStudio?.loginUrl || '/wp-login.php';
              window.location.href = loginUrl;
            }}
          >
            Sign In
          </Button>
        </div>
      );
    }

    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '15px' }}>
          <InputGroup
            leftIcon="search"
            placeholder="Search designs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '0 15px 15px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div className="bp5-spinner bp5-small">
                <div className="bp5-spinner-svg-container">
                  <svg viewBox="0 0 100 100">
                    <path
                      className="bp5-spinner-track"
                      d="M 50,50 m 0,-44.5 a 44.5,44.5 0 1 1 0,89 a 44.5,44.5 0 1 1 0,-89"
                    />
                    <path
                      className="bp5-spinner-head"
                      d="M 50,50 m 0,-44.5 a 44.5,44.5 0 1 1 0,89 a 44.5,44.5 0 1 1 0,-89"
                      pathLength="280"
                      strokeDasharray="280 280"
                      strokeDashoffset="210"
                    />
                  </svg>
                </div>
              </div>
              <div style={{ marginTop: '12px', color: '#5c7080' }}>
                Loading designs...
              </div>
            </div>
          ) : filteredDesigns.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#5c7080' }}>
              {searchQuery ? (
                <>
                  <div style={{ marginBottom: '8px' }}>No designs found</div>
                  <div style={{ fontSize: '13px' }}>
                    Try adjusting your search
                  </div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: '8px' }}>No saved designs yet</div>
                  <div style={{ fontSize: '13px' }}>
                    Create a design and save it to see it here
                  </div>
                </>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {filteredDesigns.map((design) => (
                <div
                  key={design.id}
                  style={{
                    border: '1px solid #394b59',
                    borderRadius: '8px',
                    padding: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#2b95d6';
                    e.currentTarget.style.backgroundColor = 'rgba(43, 149, 214, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#394b59';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  onClick={() => handleLoadDesign(design.id)}
                >
                  <div style={{ fontWeight: 500, marginBottom: '4px' }}>
                    {design.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#5c7080', marginBottom: '8px' }}>
                    ID: {design.id}
                  </div>
                  <Button
                    small
                    intent="danger"
                    minimal
                    icon="trash"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDesign(design.id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }),
};

export { MyLibrarySection };
