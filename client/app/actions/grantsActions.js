import request from 'ember-ajax/request';
import config from 'client/config/environment';

export const thunkSuccess = (result) => ({
  type: 'GRANT_REQ_SUCCESS',
  result
});

export const makeGrantReq = (options) => {
  return function(dispatch) {
    let url = `${config.apiHost}/${config.apiNamespace}/grants`;
    request(url, { data: options }).then((result) => {
      let parsed = result.data.mapBy('attributes').mapBy('project-title');
      dispatch(thunkSuccess(parsed));
    });
  };
};
