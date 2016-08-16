// search
import Route from 'ember-route';
import get from 'ember-metal/get';
import set from 'ember-metal/set';
import RSVP from 'rsvp';

export default Route.extend({
  queryParams: {
    q: { refreshModel: true },
    offset: { refreshModel: true },
    fundingMechanism: { refreshModel: true },
    activity: { refreshModel: true },
    icName: { refreshModel: true },
    orgCountry: { refreshModel: true },
    nihSpendingCats: { refreshModel: true },
    applicationType: { refreshModel: true },
    edInstType: { refreshModel: true },
    coreProjectNum: { refreshModel: true },
    programOfficerName: { refreshModel: true },
    piNames: { refreshModel: true },
    orgDept: { refreshModel: true },
    orgState: { refreshModel: true },
    orgName: { refreshModel: true }
  },

  model(params) {
    if ( !params.q ) {
      delete params.q;
    }
    return RSVP.hash({
      grants: get(this, 'store').query('grant', params).then(result => {
        set(this, 'meta', result.get('meta'));
        return result;
      })
    });
  },

  /*
   * Small override in order to 
   * pass meta property to controller
   * for use in template and logic,
   * and reset modal showing property
   */
  setupController(controller, model) {
    this._super(...arguments);
    controller.set('meta', this.get('meta'));
    controller.set('isShowingCreateCollectionsModal', false);
  },

  /**
   * Required to drop sticky query params
   */
  resetController(controller, isExiting) {
    // isExiting would be false if only the route's model was changing
    if (isExiting) {
      controller.set('q', null);
      controller.set('offset', 0);
      controller.set('fundingMechanism', null);
      controller.set('activity', null);
      controller.set('icName', null);
      controller.set('orgCountry', null);
      controller.set('nihSpendingCats', null);
      controller.set('applicationType', null);
      controller.set('edInstType', null);
      controller.set('coreProjectNum', null);
      controller.set('programOfficerName', null);
      controller.set('piNames', null);
      controller.set('orgDept', null);
      controller.set('orgState', null);
      controller.set('orgName', null);
    }
  }
});
