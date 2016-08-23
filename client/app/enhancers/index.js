import Redux from 'npm:redux';
import createLogger from 'npm:redux-logger';

const { applyMiddleware } = Redux;

export default Redux.compose(
  applyMiddleware(createLogger({
    label: 'log',
    duration: true,
    collapsed: true
  })),
  window.devToolsExtension ? window.devToolsExtension() : (f) => f
);
