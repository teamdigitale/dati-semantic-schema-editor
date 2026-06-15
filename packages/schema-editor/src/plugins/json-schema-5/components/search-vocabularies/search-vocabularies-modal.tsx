import { Button, Icon, Modal, ModalBody, ModalHeader } from 'design-react-kit';
import { AllVocabulariesBlock } from './all-vocabularies-block';
import { OneVocabularyBlock } from './one-vocabulary-block';
import { useEffect, useState } from 'react';
import { Stepper } from '../stepper/stepper';

export function SearchVocabulariesModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [selectedVocabularyUri, setSelectedVocabularyUri] = useState<string | null>(null);

  // Reset the selected vocabulary URI when the modal is closed
  useEffect(() => {
    if (!isOpen && !!selectedVocabularyUri) {
      setSelectedVocabularyUri(null);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} toggle={onClose} size="lg" centered scrollable>
      <ModalHeader toggle={onClose}>
        {selectedVocabularyUri && (
          <Button href="#" color="link" size="xs" className="p-0" onClick={() => setSelectedVocabularyUri(null)}>
            <Icon icon="it-chevron-left" />
          </Button>
        )}
        Search vocabularies
      </ModalHeader>

      <ModalBody>
        <Stepper currentIndex={selectedVocabularyUri ? 1 : 0}>
          <AllVocabulariesBlock onSelectVocabulary={(x) => setSelectedVocabularyUri(x)} />
          <OneVocabularyBlock vocabularyUri={selectedVocabularyUri || ''} />
        </Stepper>
      </ModalBody>
    </Modal>
  );
}
