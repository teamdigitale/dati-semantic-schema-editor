import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon } from 'design-react-kit';
import { RDFOntologicalClassHelperBlock } from './rdf-helper-block';

interface RDFOntologicalClassModalProps {
  getComponent: (name: string, isStatic?: boolean) => any;
  classUri: string;
  schema: any;
}

export const RDFHelperButtonWithModal: React.FC<RDFOntologicalClassModalProps> = ({
  getComponent,
  classUri,
  schema,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <>
      <Button color="primary" onClick={toggleModal} style={{ marginLeft: '10px' }}>
        Open RDF Helper <Icon icon="it-help-circle" size="xs" />
      </Button>

      <Modal isOpen={isModalOpen} toggle={toggleModal} size="xl" style={{ height: '90%' }}>
        <ModalHeader toggle={toggleModal}>
          <Icon icon="it-help-circle" title="TODO: mostra help.md" size="xs" color="primary" />
          RDF Ontological Class Helper
        </ModalHeader>
        <ModalBody>
          <RDFOntologicalClassHelperBlock getComponent={getComponent} classUri={classUri} schema={schema} />
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleModal}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};
