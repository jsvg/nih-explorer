import Component from 'ember-component';
import { oneWay } from 'ember-computed';
import hbs from 'htmlbars-inline-precompile';
import connect from 'ember-redux/components/connect';

const mapStateToComponent = ({ modals: { isShowingSearchTableModal } }) => ({
  isShowing: isShowingSearchTableModal
});

const Modal = Component.extend({
  show: oneWay('isShowing'),
  layout: hbs`
    <button {{action 'toggleModal'}}>Show Modal</button>
    {{#bs-modal open=show title='Quick grants search' footer=false}}
      {{index.info-modal.data-list}}
    {{/bs-modal}}
  `,

  actions: {
    toggleModal() {
      this.toggleProperty('show');
    }
  }
});

export default connect(mapStateToComponent)(Modal);
