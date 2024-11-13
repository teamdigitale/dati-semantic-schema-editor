import './split-pane.scss';

import { useEffect, useRef, useState } from 'react';

export function SplitPane({ children }: { children: JSX.Element[] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isDragging = useRef<boolean>(false);
  const [leftPercent, setLeftPercent] = useState<number>(50);

  const handleStart = () => {
    isDragging.current = true;
  };

  const handleMove = (evt) => {
    evt.preventDefault();
    if (!ref.current || !isDragging.current) {
      return;
    }
    const containerRect = ref.current.getBoundingClientRect(); // x e width
    const currentPosition = evt.clientX;
    const currentPositionPercent = ((currentPosition - containerRect.x) / containerRect.width) * 100;
    setLeftPercent(Math.min(Math.max(0, currentPositionPercent), 100));
  };

  const handleStop = () => {
    isDragging.current = false;
  };

  const handleReset = () => {
    setLeftPercent(50);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleStop);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleStop);
    };
  }, []);

  return (
    <div ref={ref} className="split-pane">
      <div className="split-pane-pane" style={{ flexBasis: `${leftPercent.toFixed(2)}%` }}>
        {children[0]}
      </div>

      <div
        className="split-pane-divider"
        title="Drag to resize panes. Double click to restore."
        onMouseDown={handleStart}
        onDoubleClick={handleReset}
      >
        <div className="split-pane-divider-touch" />
        <div className="split-pane-divider-bar" />
      </div>

      <div className="split-pane-pane" style={{ flexBasis: `${(100 - leftPercent).toFixed(2)}%` }}>
        {children[1]}
      </div>
    </div>
  );
}
