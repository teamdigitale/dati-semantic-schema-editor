/**
 * A menu with right icons, see https://italia.github.io/design-react-kit/?path=/docs/documentazione-componenti-dropdown--documentazione#menu-icona-a-destra
 */
import { Dropdown, DropdownMenu, DropdownToggle, Icon, LinkList, LinkListItem } from 'design-react-kit';
import yaml from 'js-yaml';
import { useConfiguration } from '../../configuration';
import { compressAndBase64UrlSafe, copyToClipboard, normalizeOpenAPISpec } from '../utils';
import { calculateGlobalOntoscore } from '../utils/onto-score';

const copyAsB64zipToClipboard = (text: string, prefix: string = '') => {
  copyToClipboard(`${prefix}${compressAndBase64UrlSafe(text)}`);
};

const downloadContent = (content: any, mediaType: string, fileName: string) => {
  const blob = new Blob([content], { type: mediaType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const createBundle = async (specJson: object, options: { sparqlUrl: string }) => {
  let { resolvedSpecJson } = await calculateGlobalOntoscore(specJson, { sparqlUrl: options.sparqlUrl });
  resolvedSpecJson = normalizeOpenAPISpec(resolvedSpecJson);
  return resolvedSpecJson;
};

export const ActionsMenu = ({ specSelectors, url, specActions }) => {
  const { oasCheckerUrl, schemaEditorUrl, sparqlUrl = '' } = useConfiguration();

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
      onClick: () => downloadContent(specSelectors.specStr(), 'application/yaml', 'spec.yaml'),
    },
    {
      text: 'Download as JSON',
      icon: 'it-download',
      onClick: () =>
        downloadContent(JSON.stringify(specSelectors.specJson(), null, 2), 'application/json', 'spec.json'),
    },
    {
      text: 'Download bundle',
      icon: 'it-download',
      onClick: async () => {
        const { resolvedSpecJson } = await createBundle(specSelectors.specJson().toJS(), { sparqlUrl });
        downloadContent(yaml.dump(resolvedSpecJson), 'application/yaml', 'spec.yaml');
      },
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
