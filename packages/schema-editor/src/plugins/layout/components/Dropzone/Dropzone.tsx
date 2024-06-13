import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const Dropzone = ({ children, onDrop }) => {
  const handleDrop = useCallback((acceptedFiles, rejectedFiles) => {
    const someFilesWereRejected = rejectedFiles && rejectedFiles.length > 0;
    const thereIsExactlyOneAcceptedFile = acceptedFiles && acceptedFiles.length === 1;

    if (someFilesWereRejected || !thereIsExactlyOneAcceptedFile) {
      alert(
        'Sorry, there was an error processing your file.\nPlease drag and drop exactly one .yaml or .json OpenAPI definition file.',
      );
    } else {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const spec = reader.result;
        onDrop(spec, 'fileDrop');
      };
      reader.readAsText(file, 'utf-8');
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    // accept: ".yaml,application/json",
    multiple: false,
    noClick: true,
  });

  return (
    <div className="dropzone" {...getRootProps()}>
      <input data-cy="dropzone" {...getInputProps()} />
      {isDragActive ? <div className="dropzone__overlay">Please drop a .yaml or .json OpenAPI spec.</div> : children}
    </div>
  );
};

export default Dropzone;
