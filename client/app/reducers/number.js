export default (state = 0, action) => {
  switch (action.type) {
    case 'INCREMENT': {
      return state + 1;
    }

    case 'DECREMENT': {
      return state - 1;
    }

    case 'MODIFY_NUMBER': {
      let newState = state;
      if (parseInt(action.data)) {
        newState = parseInt(action.data);
      }
      return newState;
    }

    default: { return state; }
  }
};
