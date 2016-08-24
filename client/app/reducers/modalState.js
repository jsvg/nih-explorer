import initialState from './initialStateMap';

export default (state = initialState.modals, action) => {
  switch (action.type) {
    case 'CHANGE_MODAL_STATE': {
      return action.data;
    }

    case 'TOGGLE_MODAL_STATE': {
      let targetModal = { [action.modal]: !state[action.modal] };
      let newState = Object.assign({}, state, targetModal);
      return newState;
    }

    default: { return state; }
  }
};
