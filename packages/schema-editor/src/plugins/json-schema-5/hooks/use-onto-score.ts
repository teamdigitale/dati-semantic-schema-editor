import { useEffect, useState } from 'react';

export function useOntoScore(jsonldContext, properties) {
  const [score, setScore] = useState<number>(0);

  useEffect(() => {
    if (!jsonldContext?.entrySeq || !properties) {
      return;
    }

    const countProperties = properties.count() || 0;
    if (countProperties === 0) {
      setScore(0);
    }

    const countSemantic = jsonldContext
      .entrySeq()
      .toArray()
      .filter(([key]) => properties.get(key)).length;

    setScore(countSemantic / countProperties);
  }, [jsonldContext, properties]);

  return {
    score,
  };
}
