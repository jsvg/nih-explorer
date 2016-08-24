import initialState from './initialStateMap';

export default (state = initialState.grants, action) => {
  switch (action.type) {
    case 'GRANT_REQ_SUCCESS': {
      return action.result;
    }

    default: { return state; }
  }
};
