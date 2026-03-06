import { Button, Icon, Modal, ModalBody, ModalFooter, ModalHeader } from 'design-react-kit';
import { useState } from 'react';
import { System } from '../../../../../models';

interface Props extends Pick<System, 'getComponent'> {
  schema: Immutable.Map<string, any>;
  classUri: string;
  inferred: boolean;
}

export function RDFHelperButtonWithModal({ classUri, inferred, schema, getComponent }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const Markdown = getComponent('Markdown', true);
  const RDFOntologicalClassHelperBlock = getComponent('RDFOntologicalClassHelperBlock', true);

  return (
    <>
      <Button color="primary" size="xs" outline onClick={toggleModal}>
        Open RDF Helper <Icon icon="it-help-circle" size="xs" color="primary" />
      </Button>

      <Modal isOpen={isModalOpen} toggle={toggleModal} size="xl" withIcon>
        <ModalHeader toggle={toggleModal} className="align-items-center">
          <Icon icon="it-help-circle" color="primary" />
          RDF Ontological Class Helper
        </ModalHeader>

        <ModalBody>
          {!classUri || !schema ? (
            <Markdown source={MARKDOWN_HELPER_SOURCE} />
          ) : (
            <RDFOntologicalClassHelperBlock classUri={classUri} inferred={inferred} />
          )}
        </ModalBody>

        <ModalFooter>
          <Button color="primary" onClick={toggleModal}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

const MARKDOWN_HELPER_SOURCE = `
###### 🇮🇹 ITALIAN


:mega: E' una funzionalità in fase di sviluppo.
Il nome provvisorio del tool è "RDF Helper", ma possiamo cambiarlo. :mega:

Questo tab ospita un tool per aiutarti a visualizzare le owl:Class e le rdfs:Property  associate presenti nei tuoi schemi dati.

Seleziona uno schema dati, quindi apri questo tab
oppure clicca su "RDF Helper" per aprire in una modale.

Troverai qui:

- una drop-down con l'elenco di tutte le superclassi ontologiche,
  ad esempio, per  "CPV:Alive" troverai "CPV:Person";
- l'elenco dei vocabolari controllati associabili alla classe selezionata,
    ad esempio, per "CLV:Feature" troverai sia il vocabolario delle città che quello delle regioni.
- una tabella filtrabile con tutte le proprietà dirette ed ereditate dalla classe selezionata,
    ad esempio, per "CPV:Alive" troverai "CPV:givenName" e "CPV:familyName" ereditate da "CPV:Person";

Cliccando su una proprietà della tabella,
vedrai le informazioni dettagliate della proprietà selezionata
e delle snippet di codice per integrarle nei tuoi schemi dati.

###### 🇬🇧 ENGLISH

TBD
`;
