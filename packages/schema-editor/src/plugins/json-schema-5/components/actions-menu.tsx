/**
 * A menu with right icons, see https://italia.github.io/design-react-kit/?path=/docs/documentazione-componenti-dropdown--documentazione#menu-icona-a-destra
 */
import { Dropdown, DropdownToggle } from 'design-react-kit';

import { DropdownMenu, Icon, LinkList, LinkListItem } from 'design-react-kit';
import { fromJS, Map } from 'immutable';
import yaml from 'js-yaml';
import { useConfiguration } from '../../configuration';
import { resolveJsonldContext } from '../../jsonld-context/resolve-jsonld-context';
import {
  buildOntoScoreSparqlQuery,
  compressAndBase64UrlSafe,
  copyToClipboard,
  determinePropertiesToValidate,
  fetchValidOntoScorePropertiesCount,
  normalizeOpenAPISpec,
  resolveOpenAPISpec,
} from '../utils';

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
  // Resolve openapi spec with external references
  let resolvedSpecJson = await resolveOpenAPISpec(specJson);
  const resolvedSpecOrderedMap = fromJS(resolvedSpecJson);

  // Extract all data models from spec
  const dataModels = resolvedSpecOrderedMap.getIn(['components', 'schemas']) as Map<any, any> | undefined;
  if (!dataModels) {
    return 'No #/components/schemas models provided';
  }

  // Calculate specific and global ontoscores
  let globalOntoScoreModels = 0;
  let globalOntoScoreSum = 0;

  const setOntoscoreValue = (dataModelKey: string, value: number) => {
    resolvedSpecJson['components']['schemas'][dataModelKey]['x-ontoscore'] = value;
    globalOntoScoreSum += value;
    globalOntoScoreModels++;
  };

  // Process every datamodel
  for (const [dataModelKey, dataModel] of dataModels.entries()) {
    // Filter only data models with type "object"
    const isObject = (dataModel.get('type', '') as string | undefined)?.toLowerCase() === 'object';
    if (!isObject) {
      continue;
    }

    // Extract x-jsonld-context if present
    if (!dataModel.has('x-jsonld-context')) {
      setOntoscoreValue(dataModelKey, 0);
      continue;
    }

    // Resolve x-jsonld-context
    const jsonldContext = resolveJsonldContext(dataModel)?.get('@context');
    if (!jsonldContext) {
      setOntoscoreValue(dataModelKey, 0);
      continue;
    }

    // Determine data model's properties to use for ontoscore calculation
    const propertiesPaths: string[][] =
      dataModel
        .get('properties')
        ?.keySeq()
        .toArray()
        .map((x) => [x]) || [];

    // Determine properties to validate
    const { valid: validPropertiesPaths, unknown: unknownPropertiesPaths } = await determinePropertiesToValidate(
      jsonldContext,
      propertiesPaths,
    );

    // Execute sparql fetch to check if mapped onto-properties are correct
    const sparqlResultCount = await fetchValidOntoScorePropertiesCount(unknownPropertiesPaths, {
      sparqlUrl: options.sparqlUrl,
    });
    const semanticPropertiesCount = validPropertiesPaths.length + sparqlResultCount;
    const rawPropertiesCount = propertiesPaths?.length;
    const score = rawPropertiesCount > 0 ? semanticPropertiesCount / rawPropertiesCount : 0;

    setOntoscoreValue(dataModelKey, score);
  }

  // Setting global onto score (calculated as an average ontoscore value)
  if (!resolvedSpecJson['info']) {
    resolvedSpecJson['info'] = {};
  }
  resolvedSpecJson['info']['x-ontoscore'] = globalOntoScoreSum / globalOntoScoreModels;

  // Normalize x-ref elements
  resolvedSpecJson = normalizeOpenAPISpec(resolvedSpecJson);

  return resolvedSpecJson;
};

export const ActionsMenu = ({ specSelectors, url, specActions }) => {
  const { oasCheckerUrl, schemaEditorUrl, sparqlUrl } = useConfiguration();

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
        const resolvedSpec = await createBundle(specSelectors.specJson().toJS(), { sparqlUrl: sparqlUrl as string });
        downloadContent(yaml.dump(resolvedSpec), 'application/yaml', 'spec.yaml');
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
