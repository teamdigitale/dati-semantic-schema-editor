import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { Dropzone } from './Dropzone';

describe('<Dropzone />', () => {
  afterEach(cleanup);

  test('it should render', async () => {
    const { container } = render(<Dropzone onDrop={() => {}}>Test</Dropzone>);
    expect(container.innerHTML).toContain('Test');
  });

  test('it should accept .yaml or .json files', async () => {
    const validFile = new File([], 'file.yaml', { type: 'application/yaml' });
    const evt = createDataTransferEvent([validFile]);
    const onDropSpy = vi.fn();

    const { container } = render(<Dropzone onDrop={onDropSpy}>Test</Dropzone>);
    const dropzoneInput = container.querySelector('.dropzone > input') as HTMLDivElement;
    expect(dropzoneInput).toBeDefined();

    await act(() => fireEvent.dragEnter(dropzoneInput, evt));
    expect(container.querySelector('.dropzone__overlay')).toBeTruthy();

    await act(() => fireEvent.drop(dropzoneInput, evt));
    await waitFor(() => expect(onDropSpy).toHaveBeenCalledWith('', 'fileDrop'));
  });

  test('it should reject invalid files', async () => {
    const invalidFile = new File([], 'file.jpg', { type: 'image/jpeg' });
    const evt = createDataTransferEvent([invalidFile]);
    const onDropSpy = vi.fn();

    const { container } = render(<Dropzone onDrop={onDropSpy}>Test</Dropzone>);
    const dropzoneInput = container.querySelector('.dropzone > input') as HTMLDivElement;
    expect(dropzoneInput).toBeDefined();

    await act(() => fireEvent.dragEnter(dropzoneInput, evt));
    expect(container.querySelector('.dropzone__overlay')).toBeTruthy();

    await act(() => fireEvent.drop(dropzoneInput, evt));
    expect(onDropSpy).not.toHaveBeenCalled();
  });
});

function createDataTransferEvent(files: File[] = []) {
  return {
    dataTransfer: {
      files,
      items: files.map((file) => ({
        kind: 'file',
        size: file.size,
        type: file.type,
        getAsFile: () => file,
      })),
      types: ['Files'],
    },
  };
}
