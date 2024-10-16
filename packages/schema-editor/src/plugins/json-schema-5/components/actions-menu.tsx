/**
 * A menu with right icons, see https://italia.github.io/design-react-kit/?path=/docs/documentazione-componenti-dropdown--documentazione#menu-icona-a-destra
 */
import { Dropdown, DropdownToggle } from 'design-react-kit';

import { DropdownMenu, Icon, LinkList, LinkListItem } from 'design-react-kit';
import { compressAndBase64UrlSafe, copyToClipboard } from '../utils';
import { useConfiguration } from '../../configuration';
const copyAsB64zipToClipboard = (text: string, prefix: string = '') => {
  copyToClipboard(`${prefix}${compressAndBase64UrlSafe(text)}`);
};

const downloadContent = (specStr, mediaType = 'application/yaml', fileName = 'spec.yaml') => {
  const blob = new Blob([specStr], { type: mediaType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const ActionsMenu = ({ specSelectors, url }) => {
  const { oasCheckerUrl, schemaEditorUrl } = useConfiguration();

  return (
    <Dropdown>
      <DropdownToggle color="primary">Action menu</DropdownToggle>

      <DropdownMenu>
        <LinkList>
          <LinkListItem
            className="right-icon justify-content-between d-flex"
            inDropdown
            href="#"
            onClick={() => downloadContent(specSelectors.specStr())}
          >
            <span>Download editor content</span>
            <Icon icon="it-download" size="sm" className="right" />
          </LinkListItem>

          <LinkListItem
            className="right-icon justify-content-between d-flex"
            inDropdown
            href="#"
            onClick={() =>
              downloadContent(JSON.stringify(specSelectors.specJson(), null, 2), 'application/json', 'spec.json')
            }
          >
            <span>Download as JSON</span>
            <Icon icon="it-download" size="sm" className="right" />
          </LinkListItem>

          <LinkListItem
            className="right-icon justify-content-between d-flex"
            inDropdown
            href="#"
            onClick={() =>
              copyAsB64zipToClipboard(
                specSelectors.specStr(),
                `${window.location.origin}${window.location.pathname}#oas:`,
              )
            }
          >
            <span>Copy as URL</span>
            <Icon icon="it-copy" size="sm" className="right" />
          </LinkListItem>

          {oasCheckerUrl && (
            <LinkListItem
              className="right-icon justify-content-between d-flex"
              inDropdown
              href="#"
              onClick={() => copyAsB64zipToClipboard(specSelectors.specStr(), `${oasCheckerUrl}?text=`)}
            >
              <span>Copy as OAS Checker URL</span>
              <Icon icon="it-copy" size="sm" className="right" />
            </LinkListItem>
          )}

          {schemaEditorUrl && (
            <LinkListItem
              className="right-icon justify-content-between d-flex"
              inDropdown
              href={`${schemaEditorUrl}?url=${/^http/.test(url) ? url : `${window.location.origin}${url}`}`}
            >
              <span>Open in Schema Editor</span>
              <Icon icon="it-external-link" size="sm" className="right" />
            </LinkListItem>
          )}
        </LinkList>
      </DropdownMenu>
    </Dropdown>
  );
};
