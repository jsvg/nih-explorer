import Redux from 'npm:redux';
import createLogger from 'npm:redux-logger';
import reduxImmutableStateInvariant from 'npm:redux-immutable-state-invariant';
import config from 'client/config/environment';

const { applyMiddleware } = Redux;

const logger = createLogger({
  label: 'log',
  duration: true,
  collapsed: true
});

// only use immutable state in development env
const middleware = [logger];
if (config.environment === 'development') {
  middleware.push(reduxImmutableStateInvariant());
}

export default Redux.compose(
  applyMiddleware(...middleware),
  window.devToolsExtension ? window.devToolsExtension() : (f) => f
);
