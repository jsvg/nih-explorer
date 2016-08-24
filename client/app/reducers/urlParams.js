import initialState from './initialStateMap';
import _ from 'lodash/lodash';
// import _set from 'lodash/set';

export default (state = initialState.urlParams, action) => {
  switch (action.type) {
    case 'SET_PARAM': {
      return Object.assign({}, state, { [action.property]: action.value });
    }

    case 'CLEAR_PARAM': {
      return _.omit(state, action.property);
    }

    default: { return state; }
  }
};
