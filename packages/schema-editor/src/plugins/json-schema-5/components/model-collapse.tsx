import { ReactNode } from 'react';
import { useSchemaNavigation } from '../../overview/components/Navigation';
import { Icon } from 'design-react-kit';

interface Props {
  title: string;
  children?: ReactNode;
  expanded?: boolean;
  specPath?: any;
  schema?: any;
}

/**
 * The collapsed visualization for object models (or root model only)
 */
export function ModelCollapse({ children, expanded, title, specPath, schema }: Props) {
  const { jsonldContextFullPath, push } = useSchemaNavigation();
  const specPathArray: string[] = specPath ? Array.from(specPath) : [];

  const handleClick = (): void => {
    const hasParentJsonldContextFullPath = !!jsonldContextFullPath;
    const hasJsonldContextFullPath = schema.has('x-jsonld-context');
    push({
      id: specPathArray.join('-'),
      title,
      fullPath: specPathArray,
      jsonldContextFullPath: !hasParentJsonldContextFullPath && hasJsonldContextFullPath ? specPathArray : undefined,
    });
  };

  return (
    <span className="model-collapse">
      {!expanded ? (
        <>
          {title && (
            <a href="#" className="d-flex justify-content-between text-primary" onClick={handleClick}>
              <strong>{title || 'Show'}</strong>
              <Icon icon="it-chevron-right" size="sm" />
            </a>
          )}
        </>
      ) : (
        children
      )}
    </span>
  );
}
