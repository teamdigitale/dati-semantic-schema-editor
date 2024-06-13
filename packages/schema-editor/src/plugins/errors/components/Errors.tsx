import { Alert } from 'design-react-kit';
import { List } from 'immutable';

export const Errors = ({ editorActions, errSelectors, layoutSelectors, layoutActions, getComponent }) => {
  const Collapse = getComponent('Collapse');

  const jumpToLine = editorActions?.jumpToLine;

  const errors = errSelectors.allErrors();

  const allErrorsToDisplay = errors.filter((err) => err.get('type') === 'thrown' || err.get('level') === 'error');

  if (!allErrorsToDisplay || allErrorsToDisplay.count() < 1) {
    return null;
  }

  const isVisible = layoutSelectors.isShown(['errorPane'], true);
  const toggleVisibility = () => layoutActions.show(['errorPane'], !isVisible);

  const sortedJSErrors = allErrorsToDisplay.sortBy((err) => err.get('line'));

  return (
    <Alert color="danger" toggle={toggleVisibility}>
      <h4 className="alert-heading mb-0">Errors</h4>

      <Collapse isOpened={isVisible} animated>
        <div className="errors text-break">
          {sortedJSErrors.map((err, i) => {
            const type = err.get('type');
            if (type === 'thrown' || type === 'auth') {
              return <ThrownErrorItem key={i} error={err.get('error') || err} jumpToLine={jumpToLine} />;
            }
            if (type === 'spec') {
              return <SpecErrorItem key={i} error={err} jumpToLine={jumpToLine} />;
            }
            return null;
          })}
        </div>
      </Collapse>
    </Alert>
  );
};

const ThrownErrorItem = ({ error, jumpToLine }) => {
  if (!error) {
    return null;
  }
  const errorLine = error.get('line');

  return (
    <div className="error-wrapper mt-4">
      <div>
        <h6>
          {error.get('source') && error.get('level') ? `${toTitleCase(error.get('source'))} ${error.get('level')}` : ''}
          {error.get('path') && <small> at {error.get('path')}</small>}
        </h6>
        <span className="message thrown">{error.get('message')}</span>
        <div className="error-line">
          {errorLine && jumpToLine && (
            <a href="#" onClick={() => jumpToLine(errorLine)}>
              Jump to line {errorLine}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const SpecErrorItem = ({ error, jumpToLine }) => {
  let locationMessage: JSX.Element | null = null;

  if (error.get('path')) {
    if (List.isList(error.get('path'))) {
      locationMessage = <small>at {error.get('path').join('.')}</small>;
    } else {
      locationMessage = <small>at {error.get('path')}</small>;
    }
  } else if (error.get('line') && !jumpToLine) {
    locationMessage = <small>on line {error.get('line')}</small>;
  }

  return (
    <div className="error-wrapper mt-4">
      <div>
        <h6>
          {toTitleCase(error.get('source'))} {error.get('level')}&nbsp;
          {locationMessage}
        </h6>
        <span className="message">{error.get('message')}</span>
        <div className="error-line">
          {jumpToLine && (
            <a href="#" onClick={() => jumpToLine(error.get('line'))}>
              Jump to line {error.get('line')}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

function toTitleCase(str) {
  return (str || '')
    .split(' ')
    .map((substr) => substr[0].toUpperCase() + substr.slice(1))
    .join(' ');
}
