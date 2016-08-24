import Component from 'ember-component';
import get from 'ember-metal/get';
import set from 'ember-metal/set';
import hbs from 'htmlbars-inline-precompile';
import connect from 'ember-redux/components/connect';
import { makeGrantReq } from 'client/actions/grantsActions';
import { setParam } from 'client/actions/queryParamActions';

const mapStateToComponent = ({ grants, queryParams }) => ({
  grants,
  queryParams
});

const mapDispatchToComponent = (dispatch) => ({
  getData: (ajaxParams) => dispatch(makeGrantReq(ajaxParams)),
  setParam: (property, value) => dispatch(setParam(property, value))
});

const DataList = Component.extend({
  layout: hbs`
    {{#bs-form action='submit'}}
      {{#bs-form-group}}
        {{bs-input type='text' value=query placeholder='Search grants...'}}
      {{/bs-form-group}}
    {{/bs-form}}
    <ul>
      {{#each grants as |grant|}}
        <li>{{grant}}</li>
      {{/each}}
    </ul>
  `,

  actions: {
    submit() {
      this.actions.setParam('q', get(this, 'query'));
      this.actions.getData(get(this, 'queryParams'));
      set(this, 'query', null);
    }
  }
});

export default connect(mapStateToComponent, mapDispatchToComponent)(DataList);
