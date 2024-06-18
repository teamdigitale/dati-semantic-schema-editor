import { useState } from 'react';
import { useSchemaNavigation } from '../../overview/components/Navigation';

export function ModelCollapse({ children, modelName, expanded }) {
  const { push } = useSchemaNavigation();
  const [isExpanded, setIsExpanded] = useState<boolean>(expanded);
  const title = modelName || 'Show';

  const handleClick = (): void => {
    if (modelName) {
      push({ id: modelName, title: modelName });
    } else {
      setIsExpanded(!expanded);
    }
  };

  return (
    <span className="model-collapse">
      {!isExpanded ? (
        <a href="#" className="text-primary" onClick={handleClick}>
          {title && <strong>{title}</strong>}
          <span className="model-toggle collapsed"></span>
        </a>
      ) : (
        children
      )}
    </span>
  );
}
