import cx from 'classnames';
import { version } from '../../../package.json';
import {
  Chip,
  ChipLabel,
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
import { ReactNode, useState } from 'react';

import './layout.scss';
import { SideMenu } from './side-menu';

export function Layout({ children }: { children: ReactNode }) {
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
                <HeaderBrand>
                  <div className="d-flex align-items-center gap-2">
                    <img src="logo.svg" className="icon" alt="Italian OpenAPI Schema Editor" />
                    <h2>Italian OpenAPI Schema Editor</h2>
                    <Chip simple disabled className="my-0" style={{ minWidth: 'unset' }}>
                      <ChipLabel className="text-primary">{version}</ChipLabel>
                    </Chip>
                  </div>
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
                          className={cx({ 'text-white': !showMenu, 'text-primary': showMenu })}
                        >
                          <Icon icon="it-github" title="Source code" />
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
