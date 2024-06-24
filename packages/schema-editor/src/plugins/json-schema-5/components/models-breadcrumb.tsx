import { Breadcrumb, BreadcrumbItem, Icon } from 'design-react-kit';
import React from 'react';
import { useSchemaNavigation } from '../../overview/components/Navigation';

interface Props {
  specPathBase: string[];
}

export const ModelsBreadcrumb = ({ specPathBase }: Props) => {
  const { history, go } = useSchemaNavigation();

  const handleClick = (evt, index) => {
    evt.preventDefault();
    go(index);
  };

  return (
    <Breadcrumb>
      <BreadcrumbItem className="pe-1">
        <a href="#" onClick={(e) => handleClick(e, history.length - 1)}>
          <Icon icon="it-arrow-up" size="sm" title="Go back" />
        </a>
      </BreadcrumbItem>

      <BreadcrumbItem>
        <a href="#" onClick={(e) => handleClick(e, 0)}>
          {specPathBase.map((x, i) => {
            const isLast = i === specPathBase.length - 1;
            return (
              <React.Fragment key={x}>
                {x.charAt(0).toUpperCase() + x.slice(1)}
                {!isLast && <span className="separator">/</span>}
              </React.Fragment>
            );
          })}
        </a>
        {history.length > 0 && <span className="separator">/</span>}
      </BreadcrumbItem>

      {history.map((x, i) => {
        const isLast = i === history.length - 1;
        return (
          <BreadcrumbItem key={x.id} active={isLast}>
            <a href="#" onClick={(e) => handleClick(e, i + 1)}>
              {x.title}
            </a>
            {!isLast && <span className="separator">/</span>}
          </BreadcrumbItem>
        );
      })}
    </Breadcrumb>
  );
};
