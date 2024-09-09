import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-lora';
import 'typeface-roboto-mono';
import 'typeface-titillium-web';

import {
  Collapse,
  Header,
  HeaderBrand,
  HeaderContent,
  HeaderRightZone,
  HeaderSocialsZone,
  HeaderToggler,
  Headers,
  Icon,
  Nav,
  NavItem,
} from 'design-react-kit';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { Home } from './components/home/Home';
import { Standalone } from './components/standalone/Standalone';
import { SwaggerUIPluginsCollection } from './components/swaggerui-plugins-collection/SwaggerUIPluginsCollection';

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
                    <a aria-label="Github" href="#" target="_blank">
                      <Icon icon="it-github" />
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
                    <Link className='nav-link' to="/">Home</Link>
                  </NavItem>
                  <NavItem>
                    <Link className='nav-link' to="/standalone?url=/schemas/example-schema.oas3.yaml">
                      Standalone Schema
                    </Link>
                  </NavItem>
                  <NavItem>
                    <Link className='nav-link' to="/standalone?url=/schemas/blank-template.yaml">
                      Standalone Template
                    </Link>
                  </NavItem>
                  <NavItem>
                    <Link className='nav-link' to="/standalone?url=/schemas/help.yaml">
                      Standalone Help
                    </Link>
                  </NavItem>
                  <NavItem>
                    <Link className='nav-link' to="/swaggerui">SwaggerUI</Link>
                  </NavItem>
                  <NavItem>
                    <Link className='nav-link' to="/ace">ACE editor</Link>
                  </NavItem>
                </Nav>
              </div>
            </Collapse>
          </HeaderContent>
        </Header>
      </Headers>

      <Routes>
        <Route path="/standalone" element={<Standalone />} />
        <Route path="/swaggerui" element={<SwaggerUIPluginsCollection />} />
        {/* <Route path="/ace" element={<AceTheme />} /> */}
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
