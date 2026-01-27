import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as configuration from '../../../configuration/hooks';
import OverviewContainer from './OverviewContainer';

describe('OverviewContainer', () => {
  const mockGetComponent = vi.fn((name: string) => {
    const components: Record<string, any> = {
      VersionPragmaFilter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
      Errors: () => <div>Errors</div>,
      InfoContainer: () => <div>InfoContainer</div>,
      TabHelp: () => <div>TabHelp</div>,
      TabGraph: () => <div>TabGraph</div>,
      Models: () => <div>Models</div>,
    };
    return components[name] || (() => <div>{name}</div>);
  });

  const mockSpecSelectors = {
    isSwagger2: () => false,
    isOAS3: () => true,
    specStr: () => 'openapi: 3.0.3',
    loadingStatus: () => 'success',
  };

  const mockErrSelectors = {
    lastError: () => null,
  };

  beforeEach(() => {
    vi.spyOn(configuration, 'useConfiguration').mockReturnValue({
      tabsList: undefined,
    });
  });

  describe('tabsList configuration', () => {
    it('must show all tabs if no configuration is passed', () => {
      vi.spyOn(configuration, 'useConfiguration').mockReturnValue({
        tabsList: undefined,
      });

      const { getByText } = render(
        <OverviewContainer
          errSelectors={mockErrSelectors}
          specSelectors={mockSpecSelectors}
          getComponent={mockGetComponent}
        />,
      );

      // Check that all tab titles are present in Nav
      expect(getByText('Data Models')).toBeTruthy();
      expect(getByText('Information')).toBeTruthy();
      expect(getByText('Graph')).toBeTruthy();
      expect(getByText('Help')).toBeTruthy();

      // Check that tab components are rendered
      expect(getByText('Models')).toBeTruthy();
      expect(getByText('InfoContainer')).toBeTruthy();
      expect(getByText('TabGraph')).toBeTruthy();
      expect(getByText('TabHelp')).toBeTruthy();
    });

    it('must show only provided tabs if configuration is passed', () => {
      vi.spyOn(configuration, 'useConfiguration').mockReturnValue({
        tabsList: ['Graph', 'Models'],
      });

      const { getByText, queryByText } = render(
        <OverviewContainer
          errSelectors={mockErrSelectors}
          specSelectors={mockSpecSelectors}
          getComponent={mockGetComponent}
        />,
      );

      // Check that only configured tab titles are present in Nav
      expect(getByText('Graph')).toBeTruthy();
      expect(getByText('Data Models')).toBeTruthy();

      // Check that other tab titles are not present
      expect(queryByText('Information')).toBeNull();
      expect(queryByText('Help')).toBeNull();

      // Check that only configured tab components are rendered
      expect(getByText('TabGraph')).toBeTruthy();
      expect(getByText('Models')).toBeTruthy();

      // Check that other tab components are not rendered
      expect(queryByText('InfoContainer')).toBeNull();
      expect(queryByText('TabHelp')).toBeNull();
    });

    it('must handle empty tabs list', () => {
      vi.spyOn(configuration, 'useConfiguration').mockReturnValue({
        tabsList: [],
      });

      const { queryByText, container } = render(
        <OverviewContainer
          errSelectors={mockErrSelectors}
          specSelectors={mockSpecSelectors}
          getComponent={mockGetComponent}
        />,
      );

      // When tabs list is empty, tabs array will be empty
      // Nav should not render (tabs.length > 1 is false)
      // TabContent will render but with no TabPane children
      expect(queryByText('Data Models')).toBeNull();
      expect(queryByText('Information')).toBeNull();
      expect(queryByText('Graph')).toBeNull();
      expect(queryByText('Help')).toBeNull();

      // Verify no tab components are rendered
      expect(queryByText('Models')).toBeNull();
      expect(queryByText('InfoContainer')).toBeNull();
      expect(queryByText('TabGraph')).toBeNull();
      expect(queryByText('TabHelp')).toBeNull();

      // Verify the container still renders (component doesn't return null)
      expect(container.firstChild).toBeTruthy();
    });
  });
});
