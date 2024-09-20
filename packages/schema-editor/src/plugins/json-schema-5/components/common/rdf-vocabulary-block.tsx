import { Badge, Icon } from 'design-react-kit';

interface Props {
  vocabulary: string | undefined;
  className?: string;
}

export const RDFVocabularyBlock = ({ vocabulary, className }: Props) => {
  return vocabulary ? (
    <Badge color="success" href={vocabulary} target="_blank" rel="noreferrer" className={className}>
      <span>
        Show values <Icon icon="it-external-link" size="xs" color="white" title="View vocabulary" />
      </span>
    </Badge>
  ) : null;
};
