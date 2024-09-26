import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'design-react-kit';
import { RDFOntologicalClassHelperBlock } from './rdf-ontological-class-helper-block';

interface RDFOntologicalClassModalProps {
  getComponent: (name: string, isStatic?: boolean) => any;
  isOpen: boolean;
  toggle: () => void;
  classUri: string;
  schema: any;
}

const RDFOntologicalClassModal: React.FC<RDFOntologicalClassModalProps> = ({
  getComponent,
  isOpen,
  toggle,
  classUri,
  schema,
}) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle} size="xl" style={{ height: '90%' }}>
      <ModalHeader toggle={toggle}>RDF Ontological Class Helper</ModalHeader>
      <ModalBody>
        <RDFOntologicalClassHelperBlock getComponent={getComponent} classUri={classUri} schema={schema} />
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default RDFOntologicalClassModal;
