import './overview-container.scss';

import { Nav, NavItem, NavLink, TabContent, TabPane } from 'design-react-kit';
import { useState } from 'react';
import { SchemaNavigationProvider } from '../Navigation';

const OverviewContainer = ({ errSelectors, specSelectors, getComponent }) => {
  const VersionPragmaFilter = getComponent('VersionPragmaFilter');
  const Errors = getComponent('Errors', true);
  const InfoContainer = getComponent('InfoContainer', true);
  const TabOperations = getComponent('TabOperations', true);
  const TabWebhooks = getComponent('TabWebhooks', true);
  const Models = getComponent('Models', true);

  const isSwagger2 = specSelectors.isSwagger2();
  const isOAS3 = specSelectors.isOAS3();
  const isOAS31 = specSelectors.isOAS31();

  const [activeTab, toggleTab] = useState('informations');

  const isSpecEmpty = !specSelectors.specStr();
  const loadingStatus = specSelectors.loadingStatus();

  let loadingMessage: JSX.Element | null = null;

  if (loadingStatus === 'loading') {
    loadingMessage = (
      <div className="info">
        <div className="loading-container">
          <div className="loading"></div>
        </div>
      </div>
    );
  }

  if (loadingStatus === 'failed') {
    loadingMessage = (
      <div className="info">
        <div className="loading-container">
          <h4 className="title">Failed to load API definition.</h4>
          <Errors />
        </div>
      </div>
    );
  }

  if (loadingStatus === 'failedConfig') {
    const lastErr = errSelectors.lastError();
    const lastErrMsg = lastErr ? lastErr.get('message') : '';
    loadingMessage = (
      <div className="info failed-config">
        <div className="loading-container">
          <h4 className="title">Failed to load remote configuration.</h4>
          <p>{lastErrMsg}</p>
        </div>
      </div>
    );
  }

  if (!loadingMessage && isSpecEmpty) {
    loadingMessage = <h4>No API definition provided.</h4>;
  }

  if (loadingMessage) {
    return <div className="loading-container">{loadingMessage}</div>;
  }

  const tabs = [
    { id: 'informations', title: 'Informations', Component: InfoContainer },
    { id: 'operations', title: 'Operations', Component: TabOperations },
    ...(isOAS31 ? [{ id: 'webhooks', title: 'Webhooks', Component: TabWebhooks }] : []),
    { id: 'models', title: 'Models', Component: Models },
  ];

  return (
    <SchemaNavigationProvider>
      <div className="overview-container">
        <VersionPragmaFilter isSwagger2={isSwagger2} isOAS3={isOAS3} alsoShow={<Errors />}>
          <Errors />

          <div>
            {tabs.length > 0 && (
              <Nav pills className="mb-3">
                {tabs.map((x) => (
                  <NavItem key={x.id}>
                    <NavLink
                      href="#"
                      active={activeTab === x.id}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleTab(x.id);
                      }}
                    >
                      {x.title}
                    </NavLink>
                  </NavItem>
                ))}
              </Nav>
            )}
            <div className="swagger-ui">
              <TabContent activeTab={activeTab}>
                {tabs.map((x) => (
                  <TabPane key={x.id} tabId={x.id}>
                    <x.Component />
                  </TabPane>
                ))}
              </TabContent>
            </div>
          </div>
        </VersionPragmaFilter>
      </div>
    </SchemaNavigationProvider>
  );
};

export default OverviewContainer;
