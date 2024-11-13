import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SchemaEditor } from './SchemaEditor';

const updateUrlSpy = vi.fn();
const updateSpecSpy = vi.fn();

vi.mock('swagger-ui', async (importOriginal) => {
  const actual: any = await importOriginal();
  const customDefault = (...args) => {
    const originalInstance = actual.default(...args);
    return {
      ...originalInstance,
      specActions: {
        ...originalInstance.specActions,
        updateUrl: updateUrlSpy,
        updateSpec: updateSpecSpy,
      },
      getComponent: () => () => <div>Test</div>,
      getSystem: (...args2) => {
        console.log('Gennaro');
        return originalInstance.getSystem(...args2);
      },
    };
  };
  customDefault.config = actual.default.config;
  customDefault.presets = actual.default.presets;
  customDefault.plugins = actual.default.plugins;
  return {
    ...actual,
    default: customDefault,
  };
});

describe('<SchemaEditor />', () => {
  it('should render', async () => {
    render(<SchemaEditor />);
    expect(screen.getByText('Test')).toBeTruthy();
  });

  it('should update url if changed', async () => {
    const { rerender } = render(<SchemaEditor url="https://test.com/1" />);
    rerender(<SchemaEditor url="https://test.com/2" />);
    expect(updateUrlSpy).toHaveBeenCalled();
  });

  it('should update spec if changed', async () => {
    const { rerender } = render(<SchemaEditor spec="test_1" />);
    rerender(<SchemaEditor spec="test_2" />);
    expect(updateSpecSpy).toHaveBeenCalled();
  });
});
