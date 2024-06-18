interface Props {
  type: string;
  format?: string;
}

export function TypeFormat({ type, format }: Props) {
  return (
    <div className="prop-type-container">
      <span className="prop-type">{type}</span>
      {format && <span className="prop-format"> (format: {format})</span>}
    </div>
  );
}
