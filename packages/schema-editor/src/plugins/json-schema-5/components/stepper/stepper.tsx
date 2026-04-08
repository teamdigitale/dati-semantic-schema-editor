import { ReactNode, useEffect, useRef, useState } from 'react';
import { usePrevious } from '../../../../hooks';

interface StepperProps {
  currentIndex: number;
  children: ReactNode;
}

export function Stepper({ currentIndex, children }: StepperProps) {
  const steps = Array.isArray(children) ? children : [children];
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(currentIndex ?? 0);
  const previousStepIndex = usePrevious(currentStepIndex);
  const [containerHeight, setContainerHeight] = useState<number | undefined>(undefined);
  const [isAnimating, setIsAnimating] = useState(false);

  const getStepHeight = (index: number) => {
    return stepRefs.current[index]?.scrollHeight ?? 0;
  };

  // When currentIndex changes performs the following operations in order:
  // - get current step height
  // - set containerHeight to current step height
  // - request animation frame to set containerHeight to new step height
  // - update currentStepIndex and previousStepIndex
  // - setAnimate to true
  // - set translate
  // - wait for animation to finish
  // - then setContainerHeight to new step height
  // - when animation finishes again
  // - set animate to false and setContainerHeight to undefined

  useEffect(() => {
    if (currentIndex === currentStepIndex) {
      return;
    }

    // Blocks the current height
    const currentContainerHeight = getStepHeight(currentStepIndex);
    setContainerHeight(currentContainerHeight);

    // Allow the render of the next step by setting isAnimating to true
    setIsAnimating(true);

    // Updates the current step index
    const newStepIndex = Math.max(0, Math.min(currentIndex ?? 0, steps.length - 1));
    setCurrentStepIndex(newStepIndex);

    // Await the next frame to update the container height
    requestAnimationFrame(() => {
      // Updates the container height
      const newContainerHeight = getStepHeight(newStepIndex);
      setContainerHeight(newContainerHeight);

      requestAnimationFrame(() => {
        // Unblocks the container height
        setContainerHeight(undefined);

        requestAnimationFrame(() => {
          setIsAnimating(false);
        });
      });
    });
  }, [currentIndex]);

  return (
    <div className="w-100 overflow-hidden">
      <div
        style={{
          display: 'flex',
          height: containerHeight ? `${containerHeight}px` : undefined,
          transition: 'transform 250ms ease',
          transform: `translateX(-${(currentStepIndex * 100).toFixed(2)}%)`,
        }}
      >
        {steps.map((step, index) => {
          const shouldRender = index === currentStepIndex || (isAnimating && index === previousStepIndex);

          return (
            <div
              key={index}
              ref={(node) => (stepRefs.current[index] = node)}
              style={{
                flexShrink: 0,
                flexBasis: `${100}%`,
                width: `${100}%`,
              }}
            >
              {shouldRender ? step : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
