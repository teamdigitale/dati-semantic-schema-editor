import { UncontrolledTooltip } from 'design-react-kit';

interface Props {
  targetId: string;
  score?: number;
}

export function SemanticScoreTooltip({ targetId, score }: Props) {
  const hasScore = score !== undefined;

  return (
    <UncontrolledTooltip placement="top" target={targetId}>
      {hasScore ? (
        <>
          <strong>Semantic score: {score}</strong>
          <br />
          Indicates the completeness of semantic annotations.
        </>
      ) : (
        <>
          <strong>Semantic score not available</strong>
          <br />
          Scores are calculated only for schema elements of type object.
        </>
      )}
    </UncontrolledTooltip>
  );
}
