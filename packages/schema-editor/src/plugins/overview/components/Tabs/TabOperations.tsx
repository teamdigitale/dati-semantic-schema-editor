import { Col } from 'design-react-kit';

export function TabOperations({ specSelectors, getComponent }) {
  const Operations = getComponent('operations', true);
  const ServersContainer = getComponent('ServersContainer', true);
  const SchemesContainer = getComponent('SchemesContainer', true);
  const AuthorizeBtnContainer = getComponent('AuthorizeBtnContainer', true);
  const FilterContainer = getComponent('FilterContainer', true);

  const servers = specSelectors.servers();
  const schemes = specSelectors.schemes();

  const hasServers = servers && servers.size;
  const hasSchemes = schemes && schemes.size;
  const hasSecurityDefinitions = !!specSelectors.securityDefinitions();

  return (
    <div>
      {hasServers || hasSchemes || hasSecurityDefinitions ? (
        <div className="scheme-container">
          <Col className="schemes wrapper" mobile={12}>
            {hasServers || hasSchemes ? (
              <div className="schemes-server-container">
                {hasServers ? <ServersContainer /> : null}
                {hasSchemes ? <SchemesContainer /> : null}
              </div>
            ) : null}
            {hasSecurityDefinitions ? <AuthorizeBtnContainer /> : null}
          </Col>
        </div>
      ) : null}

      <FilterContainer />

      <Operations />
    </div>
  );
}
