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

export const ActionsMenu = ({ specSelectors, url, specActions }) => {
  const { oasCheckerUrl, schemaEditorUrl } = useConfiguration();

  const actions: Array<{
    text: string;
    icon: string;
    onClick?: () => void;
    href?: string;
  } | null> = [
    {
      text: 'New from template',
      icon: 'it-pencil',
      onClick: () => {
        const template = `${window.location.origin}/${window.location.pathname}/schemas/blank-template.oas3.yaml`;
        specActions.updateUrl(template);
        specActions.download(template);
      },
    },
    {
      text: 'Download editor content',
      icon: 'it-download',
      onClick: () => downloadContent(specSelectors.specStr()),
    },
    {
      text: 'Download as JSON',
      icon: 'it-download',
      onClick: () =>
        downloadContent(JSON.stringify(specSelectors.specJson(), null, 2), 'application/json', 'spec.json'),
    },
    {
      text: 'Copy as URL',
      icon: 'it-copy',
      onClick: () =>
        copyAsB64zipToClipboard(specSelectors.specStr(), `${window.location.origin}${window.location.pathname}#oas:`),
    },
    oasCheckerUrl
      ? {
          text: 'Copy as OAS Checker URL',
          icon: 'it-copy',
          onClick: () => copyAsB64zipToClipboard(specSelectors.specStr(), `${oasCheckerUrl}#text=`),
        }
      : null,
    schemaEditorUrl
      ? {
          text: 'Open in Schema Editor',
          icon: 'it-external-link',
          href: `${schemaEditorUrl}?url=${/^http/.test(url) ? url : `${window.location.origin}/${window.location.pathname}/${url}`}`,
        }
      : null,
  ];

  return (
    <Dropdown>
      <DropdownToggle color="primary">Action menu</DropdownToggle>

      <DropdownMenu>
        <LinkList>
          <>
            {actions.map(
              (action) =>
                action && (
                  <LinkListItem
                    key={action.text}
                    className="right-icon justify-content-between d-flex"
                    inDropdown
                    href={action?.href || '#'}
                    onClick={action?.onClick}
                  >
                    <span>{action?.text}</span>
                    <Icon icon={action?.icon} size="sm" className="right" />
                  </LinkListItem>
                ),
            )}
          </>
        </LinkList>
      </DropdownMenu>
    </Dropdown>
  );
};
