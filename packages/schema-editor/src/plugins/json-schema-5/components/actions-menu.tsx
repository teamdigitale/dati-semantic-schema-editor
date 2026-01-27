/**
 * A menu with right icons, see https://italia.github.io/design-react-kit/?path=/docs/documentazione-componenti-dropdown--documentazione#menu-icona-a-destra
 */
import { calculateSchemaSemanticScore, normalizeOpenAPISpec } from '@teamdigitale/schema-editor-utils';
import { Dropdown, DropdownMenu, DropdownToggle, Icon, LinkList, LinkListItem } from 'design-react-kit';
import yaml from 'js-yaml';
import { useConfiguration } from '../../configuration';
import { compressAndBase64UrlSafe, copyToClipboard } from '../utils';
import { LayoutTypes } from '../../layout';

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

export const createBundle = async (specJson: object, options: { sparqlUrl: string }): Promise<object> => {
  let { resolvedSpecJson } = await calculateSchemaSemanticScore(specJson, { sparqlUrl: options.sparqlUrl });
  resolvedSpecJson = normalizeOpenAPISpec(resolvedSpecJson, window.location.href);
  return resolvedSpecJson;
};

export const ActionsMenu = ({ url, ...system }) => {
  const { specSelectors, specActions, getConfigs } = system;
  const { oasCheckerUrl, schemaEditorUrl, sparqlUrl = '' } = useConfiguration();

  const isEditorLayout = getConfigs().layout === LayoutTypes.EDITOR;

  const actions = [
    ...(isEditorLayout
      ? [
          {
            id: 'NewFromTemplate',
            text: 'New from template',
            icon: 'it-pencil',
            onClick: () => {
              const template = `${window.location.origin}/${window.location.pathname}/schemas/blank-template.oas3.yaml`;
              specActions.updateUrl(template);
              specActions.download(template);
            },
          },
          {
            id: 'DownloadEditorContent',
            text: 'Download editor content',
            icon: 'it-download',
            onClick: () => downloadContent(specSelectors.specStr(), 'application/yaml', 'spec.yaml'),
          },
          {
            id: 'DownloadAsJson',
            text: 'Download as JSON',
            icon: 'it-download',
            onClick: () =>
              downloadContent(JSON.stringify(specSelectors.specJson(), null, 2), 'application/json', 'spec.json'),
          },
          {
            id: 'DownloadBundle',
            text: 'Download bundle',
            icon: 'it-download',
            onClick: async () => {
              const resolvedSpecJson = await createBundle(specSelectors.specJson().toJS(), { sparqlUrl });
              downloadContent(yaml.dump(resolvedSpecJson), 'application/yaml', 'spec.yaml');
            },
          },
          {
            id: 'CopyAsUrl',
            text: 'Copy as URL',
            icon: 'it-copy',
            onClick: () =>
              copyAsB64zipToClipboard(
                specSelectors.specStr(),
                `${window.location.origin}${window.location.pathname}#oas:`,
              ),
          },
          ...(oasCheckerUrl
            ? [
                {
                  id: 'CopyAsOasCheckerUrl',
                  text: 'Copy as OAS Checker URL',
                  icon: 'it-copy',
                  onClick: () => copyAsB64zipToClipboard(specSelectors.specStr(), `${oasCheckerUrl}#text=`),
                },
              ]
            : []),
        ]
      : [
          ...(schemaEditorUrl
            ? [
                {
                  id: 'OpenInSchemaEditor',
                  text: 'Open in Schema Editor',
                  icon: 'it-external-link',
                  href: `${schemaEditorUrl}?url=${/^http/.test(url) ? url : `${window.location.origin}/${window.location.pathname}/${url}`}`,
                },
              ]
            : []),
        ]),
  ];

  return (
    actions.length > 0 && (
      <Dropdown>
        <DropdownToggle color="primary">Action menu</DropdownToggle>

        <DropdownMenu>
          <LinkList>
            <>
              {actions.map(
                (action) =>
                  action && (
                    <LinkListItem
                      key={action.id}
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
    )
  );
};
