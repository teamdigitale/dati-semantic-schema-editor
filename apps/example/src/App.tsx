import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';

import {
  Collapse,
  Dropdown,
  DropdownMenu,
  DropdownToggle,
  Header,
  HeaderBrand,
  HeaderContent,
  HeaderRightZone,
  HeaderSocialsZone,
  HeaderToggler,
  Headers,
  Icon,
  LinkList,
  LinkListItem,
  Nav,
  NavItem,
} from 'design-react-kit';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { Home } from './components/home/Home';
import { Standalone } from './components/standalone/Standalone';
import { SchemaViewer } from './components/viewer/SchemaViewer';

const SamplesMenu = () => {
  const items = [
    {
      text: 'Blank Template',
      url: '/standalone?url=/schemas/blank-template.oas3.yaml',
    },
    {
      text: 'Tutorial',
      url: '/standalone?url=/schemas/tutorial.oas3.yaml',
    },
    {
      text: 'Example Schema',
      url: '/standalone?url=/schemas/example-schema.oas3.yaml',
    },
    {
      text: 'Test Schema Base',
      url: '/standalone?url=/schemas/test-schema-base.oas3.yaml',
    },
    {
      text: 'Test Schema Object',
      url: '/standalone?url=/schemas/test-schema-object.oas3.yaml',
    },
    {
      text: 'Test Schema Expanded',
      url: '/standalone?url=/schemas/test-schema-expanded.oas3.yaml',
    },
    {
      text: 'Test Context',
      url: '/standalone?url=/schemas/test-context.oas3.yaml',
    },
    {
      text: 'Test Ontoscore',
      url: '/standalone?url=/schemas/test-ontoscore.oas3.yaml',
    },
    {
      text: 'Test data.europa.eu/sparql',
      url: '/standalone?url=/schemas/europa.oas3.yaml&eu=true',
    },
  ];
  return (
    <Dropdown>
      <DropdownToggle color="primary">Standalone Samples</DropdownToggle>

      <DropdownMenu>
        <LinkList>
          {items.map(({ text, url }, index) => (
            <LinkListItem key={index} inDropdown href={url}>
              <span>{text}</span>
            </LinkListItem>
          ))}
        </LinkList>
      </DropdownMenu>
    </Dropdown>
  );
};
function App() {
  return (
    <BrowserRouter basename="/">
      <Headers>
        <Header type="center">
          <HeaderContent>
            <HeaderBrand iconAlt="it code circle icon" iconName="it-code-circle">
              <h2>Schema Editor</h2>
              <h3>Italian OpenAPI Schema Editor</h3>
            </HeaderBrand>
            <HeaderRightZone>
              <HeaderSocialsZone label="Info + Repo">
                <ul>
                  <li>
                    <a
                      aria-label="Github"
                      href="https://github.com/teamdigitale/dati-semantic-schema-editor"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Icon icon="it-github" title="Source code" />
                    </a>
                  </li>
                </ul>
              </HeaderSocialsZone>
            </HeaderRightZone>
          </HeaderContent>
        </Header>
        <Header type="navbar">
          <HeaderContent expand="lg" megamenu>
            <HeaderToggler aria-controls="nav1" aria-expanded="false" aria-label="Toggle navigation" onClick={() => {}}>
              <Icon icon="it-burger" />
            </HeaderToggler>
            <Collapse header navbar onOverlayClick={() => {}}>
              <div className="menu-wrapper">
                <Nav navbar>
                  <NavItem>
                    <Link className="nav-link" to="/">
                      Home
                    </Link>
                  </NavItem>
                  <NavItem>
                    <Link className="nav-link" to="/standalone?url=/schemas/example-schema.oas3.yaml">
                      Standalone Schema
                    </Link>
                  </NavItem>
                  <NavItem>
                    <SamplesMenu />
                  </NavItem>
                  <NavItem>
                    <Link className="nav-link" to="/schema-viewer">
                      Schema Viewer
                    </Link>
                  </NavItem>
                  <NavItem>
                    <Link className="nav-link" to="/ace">
                      ACE editor
                    </Link>
                  </NavItem>
                </Nav>
              </div>
            </Collapse>
          </HeaderContent>
        </Header>
      </Headers>

      <Routes>
        <Route path="/standalone" element={<Standalone />} />
        <Route path="/schema-viewer" element={<SchemaViewer />} />
        {/* <Route path="/ace" element={<AceTheme />} /> */}
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
