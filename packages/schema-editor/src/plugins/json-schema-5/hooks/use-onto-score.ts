import { useEffect, useState } from 'react';

interface OntoScoreResult {
  countSemantic: number;
  countProperties: number;
}

export function useOntoScore(jsonldContext, properties) {
  const [ontoResult, setOntoResult] = useState<OntoScoreResult>({ countSemantic: 0, countProperties: 0 });

  useEffect(() => {
    if (!jsonldContext?.entrySeq || !properties) {
      return;
    }

    const countProperties = properties.count() || 0;
    if (countProperties === 0) {
      setOntoResult({ countSemantic: 0, countProperties: 0 });
    }

    const countSemantic = jsonldContext
      .entrySeq()
      .toArray()
      .filter(([key]) => properties.get(key)).length;

    setOntoResult({ countSemantic, countProperties });
  }, [jsonldContext, properties]);

  return {
    ...ontoResult,
    score:
      ontoResult.countProperties > 0
        ? ontoResult.countSemantic / ontoResult.countProperties
        : ontoResult.countProperties,
  };
}
