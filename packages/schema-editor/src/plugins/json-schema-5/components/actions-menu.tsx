/**
 * A menu with right icons, see https://italia.github.io/design-react-kit/?path=/docs/documentazione-componenti-dropdown--documentazione#menu-icona-a-destra
 */
import { calculateSchemaSemanticScore, normalizeOpenAPISpec } from '@teamdigitale/schema-editor-utils';
import { Button, Dropdown, DropdownMenu, DropdownToggle, Icon, LinkList, LinkListItem } from 'design-react-kit';
import yaml from 'js-yaml';
import { useConfiguration } from '../../configuration';
import { LayoutTypes } from '../../layout';
import { copyToClipboard, encodeOAS } from '../utils';
import { useState } from 'react';

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

export const ActionsMenu = (system) => {
  const { specSelectors, specActions, getConfigs } = system;
  const { oasCheckerUrl, schemaEditorUrl, sparqlUrl = '' } = useConfiguration();
  const { url, layout } = getConfigs();

  const actions = [
    ...(layout === LayoutTypes.EDITOR
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
            onClick: () => {
              const encodedOAS = encodeOAS(specSelectors.specStr());
              copyToClipboard(`${window.location.origin}${window.location.pathname}#oas:${encodedOAS}`);
            },
          },
          ...(oasCheckerUrl
            ? [
                {
                  id: 'CopyAsOasCheckerUrl',
                  text: 'Copy as OAS Checker URL',
                  icon: 'it-copy',
                  onClick: () => {
                    const encodedOAS = encodeOAS(specSelectors.specStr());
                    copyToClipboard(`${oasCheckerUrl}#text=${encodedOAS}`);
                  },
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

  const [clickedAction, setClickedAction] = useState<string | undefined>();
  const handleClick = (action: (typeof actions)[number]) => {
    if (!action.onClick) {
      return;
    }
    action.onClick();
    setClickedAction(action.id);
    setTimeout(() => {
      setClickedAction(undefined);
    }, 5000);
  };

  const isOnlyOpenInSchemaEditor = actions.length === 1 && actions[0]?.id === 'OpenInSchemaEditor';

  return (
    actions.length > 0 &&
    (isOnlyOpenInSchemaEditor ? (
      <Button color="primary" tag="a" href={actions[0].href}>
        {actions[0].text}
        <Icon icon={actions[0].icon} size="sm" className="ms-2" fill="currentColor" />
      </Button>
    ) : (
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
                      onClick={() => handleClick(action)}
                    >
                      <span>{action?.text}</span>
                      <Icon icon={clickedAction === action.id ? 'it-check' : action.icon} size="sm" className="right" />
                    </LinkListItem>
                  ),
              )}
            </>
          </LinkList>
        </DropdownMenu>
      </Dropdown>
    ))
  );
};
