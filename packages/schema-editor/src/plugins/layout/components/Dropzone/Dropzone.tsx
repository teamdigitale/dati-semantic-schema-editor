import { useCallback } from 'react';
import { type FileRejection, useDropzone } from 'react-dropzone';
import './dropzone.scss';

export const Dropzone = ({ children, onDrop }) => {
  const handleDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    const someFilesWereRejected = rejectedFiles && rejectedFiles.length > 0;
    const thereIsExactlyOneAcceptedFile = acceptedFiles && acceptedFiles.length === 1;
    if (someFilesWereRejected || !thereIsExactlyOneAcceptedFile) {
      alert(
        'Sorry, there was an error processing your file.\nPlease drag and drop exactly one .yaml or .json OpenAPI definition file.',
      );
      return;
    }

    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const spec = reader.result;
      onDrop(spec, 'fileDrop');
    };
    reader.readAsText(file, 'utf-8');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'application/yaml': ['.yaml', '.yml'],
      'application/json': ['.json'],
    },
    multiple: false,
    noClick: true,
  });

  return (
    <div className="dropzone" {...getRootProps()}>
      <input {...getInputProps()} />
      {children}
      {isDragActive && (
        <div className="dropzone__overlay">
          <div>
            <strong>Please drop a .yaml or .json OpenAPI spec.</strong>
          </div>
        </div>
      )}
    </div>
  );
};
