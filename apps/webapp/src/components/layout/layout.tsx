import cx from 'classnames';
import {
  Col,
  Header,
  HeaderBrand,
  HeaderContent,
  HeaderRightZone,
  HeaderSocialsZone,
  HeaderToggler,
  Icon,
  Row,
} from 'design-react-kit';
import { useState } from 'react';

import './layout.scss';
import { SideMenu } from './side-menu';

export function Layout({ children }: { children: JSX.Element }) {
  const [showMenu, setShowMenu] = useState(false);
  const toggleMenu = () => setShowMenu(!showMenu);

  const menuLayoutClasses = {
    'col-0 col-sm-1': !showMenu,
    'col-12 col-lg-4 col-xxl-3': showMenu,
  };

  return (
    <div className="layout">
      <header>
        <Row className="g-0 position-relative bg-primary text-white">
          <Col className={cx(menuLayoutClasses, { 'bg-white': showMenu }, 'hamburger-button-wrapper', 'animate')}>
            <HeaderToggler onClick={toggleMenu}>
              <Icon
                role="button"
                className={cx({ 'icon-white': !showMenu, 'icon-primary': showMenu })}
                icon="it-burger"
              />
            </HeaderToggler>
          </Col>

          <Col className="flex-grow-1 animate">
            <Header type="center" small className="inner-header">
              <HeaderContent>
                <HeaderBrand iconAlt="it code circle icon" iconName="it-code-circle">
                  <h2>Schema Editor - 0.0.2 beta</h2>
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
          </Col>
        </Row>
      </header>

      <Row className="g-0">
        <Col className={cx(menuLayoutClasses, 'animate')}>
          <SideMenu />
        </Col>

        <Col className="flex-grow-1 animate">
          <div className="app-container">{children}</div>
        </Col>
      </Row>
    </div>
  );
}
