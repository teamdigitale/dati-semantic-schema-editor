import './models.scss';

import { Dropdown, DropdownMenu, DropdownToggle, Icon, LinkList, LinkListItem } from 'design-react-kit';
import { useSchemaNavigation } from '../../overview/components/Navigation';
import { compressAndBase64UrlSafe, copyToClipboard } from '../utils';
import type { ModelCollapse as ModelCollapseComponent } from './model-collapse';
import type { ModelRoot as ModelRootComponent } from './model-root';
import type { ModelsBreadcrumb as ModelsBreadcrumbComponent } from './models-breadcrumb';

export function Models({ getComponent, specSelectors, getConfigs }) {
  const { history, jsonldContextFullPath } = useSchemaNavigation();
  const currentHistoryItem = history[history.length - 1];

  const isOAS3 = specSelectors.isOAS3();
  const specPathBase = isOAS3 ? ['components', 'schemas'] : ['definitions'];

  const definitions = specSelectors.definitions();
  const { defaultModelsExpandDepth, oasCheckerUrl, schemaEditorUrl, url } = getConfigs();
  if (!definitions.size || defaultModelsExpandDepth < 0) {
    return null;
  }

  const copyAsB64zipToClipboard = (text: string, prefix: string = '') => {
    copyToClipboard(`${prefix}${compressAndBase64UrlSafe(text)}`);
  };

  const downloadContent = (specSelectors) => {
    const specStr = specSelectors.specStr();

    const blob = new Blob([specStr], { type: 'application/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spec.yaml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const ModelsBreadcrumb: typeof ModelsBreadcrumbComponent = getComponent('ModelsBreadcrumb', true);
  const ModelCollapse: typeof ModelCollapseComponent = getComponent('ModelCollapse', true);
  const ModelRoot: typeof ModelRootComponent = getComponent('ModelRoot', true);

  const ActionsMenu = () => {
    return (
      <Dropdown>
        <DropdownToggle color="primary">Menu azioni</DropdownToggle>

        <DropdownMenu>
          <LinkList>
            <LinkListItem inDropdown href="#" onClick={() => downloadContent(specSelectors)}>
              <span>Download editor content</span>
              <Icon icon="it-download" size="sm" />
            </LinkListItem>

            <LinkListItem
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
              <Icon icon="it-copy" size="sm" />
            </LinkListItem>

            {oasCheckerUrl && (
              <LinkListItem
                inDropdown
                href="#"
                onClick={() => copyAsB64zipToClipboard(specSelectors.specStr(), `${oasCheckerUrl}?text=`)}
              >
                <span>Copy as OAS Checker URL</span>
                <Icon icon="it-download" size="sm" />
              </LinkListItem>
            )}

            {schemaEditorUrl && (
              <LinkListItem
                inDropdown
                href={`${schemaEditorUrl}?url=${/^http/.test(url) ? url : `${window.location.origin}${url}`}`}
              >
                <span>Open in Schema Editor</span>
                <Icon icon="it-external-link" size="sm" />
              </LinkListItem>
            )}
          </LinkList>
        </DropdownMenu>
      </Dropdown>
    );
  };

  return (
    <div className="modelli">
      <div className="d-flex flex-row justify-between">
        <ModelsBreadcrumb specPathBase={specPathBase} />
        <ActionsMenu />
      </div>

      {/* Root */}
      {history.length === 0 &&
        definitions
          .entrySeq()
          .map(([key, schema]) => (
            <div key={key} className="d-block neutral-2-bg p-3 mb-3">
              <ModelCollapse title={key} specPath={[...specPathBase, key]} schema={schema} />
            </div>
          ))
          .toArray()}

      {/* Schema model */}
      {currentHistoryItem && (
        <ModelRoot
          name={currentHistoryItem.title}
          fullPath={currentHistoryItem.fullPath}
          jsonldContextFullPath={jsonldContextFullPath}
        />
      )}
    </div>
  );
}
