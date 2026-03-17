import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ModelCollapseRoot } from './model-collapse-root';
import * as Navigation from '../../overview/components/Navigation';
import * as SemanticScore from './semantic-score';

describe('ModelCollapseRoot', () => {
  const defaultTitle = 'Microsoft.AspNetCore.Mvc.ProblemDetails';
  const defaultSpecPath = ['components', 'schemas', 'Microsoft.AspNetCore.Mvc.ProblemDetails'];
  const defaultSchema = { type: 'object' };

  beforeEach(() => {
    vi.spyOn(Navigation, 'useSchemaNavigation').mockReturnValue({
      push: vi.fn(),
      history: [],
      go: vi.fn(),
      back: vi.fn(),
    });

    vi.spyOn(SemanticScore, 'useGlobalSemanticScore').mockReturnValue({
      data: { score: 0, timestamp: 0, sparqlEndpoint: '', models: [] },
      status: 'fulfilled',
      error: undefined,
      calculate: vi.fn(),
    } as any);
  });

  it('renders with title and specPath', () => {
    render(<ModelCollapseRoot title={defaultTitle} specPath={defaultSpecPath} schema={defaultSchema} />);

    expect(screen.getByText(defaultTitle)).toBeTruthy();
  });

  it('renders card with correct title when using Microsoft.AspNetCore.Mvc.ProblemDetails params', () => {
    const title = 'Microsoft.AspNetCore.Mvc.ProblemDetails';
    const specPath = ['components', 'schemas', 'Microsoft.AspNetCore.Mvc.ProblemDetails'];

    render(<ModelCollapseRoot title={title} specPath={specPath} schema={defaultSchema} />);

    const heading = screen.getByRole('heading', { level: 5 });
    expect(heading.textContent).toContain(title);
  });
});
