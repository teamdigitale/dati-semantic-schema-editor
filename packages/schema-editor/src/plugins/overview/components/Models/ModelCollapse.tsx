import Im from 'immutable';
import { useEffect, useRef, useState } from 'react';
import { useSchemaNavigation } from '../Navigation';

export const ModelCollapse = ({
  collapsedContent,
  expanded,
  children,
  title,
  modelName,
  classes,
  onToggle,
  hideSelfOnExpand,
  layoutActions,
  layoutSelectors,
  specPath,
}) => {
  const { push } = useSchemaNavigation();
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [collapsedContentState] = useState(collapsedContent || {});
  const spanRef = useRef(null);

  useEffect(() => {
    if (hideSelfOnExpand && expanded) {
      onToggle(modelName, expanded);
    }
  }, [hideSelfOnExpand, expanded, modelName, onToggle]);

  useEffect(() => {
    setIsExpanded(expanded);
  }, [expanded]);

  const toggleCollapsed = () => {
    if (onToggle) {
      onToggle(modelName, !isExpanded);
    }
    if (modelName) {
      push({ id: modelName, title: modelName });
    }
    setIsExpanded((prevExpanded) => !prevExpanded);
  };

  const onLoad = (ref) => {
    if (ref && layoutSelectors) {
      const scrollToKey = layoutSelectors.getScrollToKey();
      if (Im.is(scrollToKey, specPath)) toggleCollapsed();
      layoutActions.readyToScroll(specPath, ref.parentElement);
    }
  };

  useEffect(() => {
    onLoad(spanRef.current);
  }, [spanRef, layoutSelectors, layoutActions, specPath]);

  if (isExpanded && hideSelfOnExpand) {
    return <span className={classes || ''}>{children}</span>;
  }

  return (
    <span className={classes || ''} ref={spanRef}>
      {!isExpanded && (
        <button aria-expanded={isExpanded} className="model-box-control" onClick={toggleCollapsed}>
          {title && <span className="pointer">{title}</span>}
          <span className={'model-toggle' + (isExpanded ? '' : ' collapsed')}></span>
          {!isExpanded && <span>{collapsedContentState}</span>}
        </button>
      )}
      {isExpanded && children}
    </span>
  );
};
