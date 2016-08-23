import Component from 'ember-component';
import hbs from 'htmlbars-inline-precompile';
import connect from 'ember-redux/components/connect';

const mapStateToComponent = (state) => ({
  number: state.number
});

const dispatchToActions = (dispatch) => ({
  plusOne: () => dispatch({ type: 'INCREMENT' }),
  minusOne: () => dispatch({ type: 'DECREMENT' }),
  modify: (number) => dispatch({ type: 'MODIFY_NUMBER', data: number })
});

const AddSubtractNumber = Component.extend({
  layout: hbs`
    <h1>{{number}}</h1>
    <p>{{input value=newNumber}}</p>
    <button {{action 'plusOne'}}>Add</button>
    <button {{action 'update'}}>Update</button>
    <button {{action 'minusOne'}}>Subtract</button>
  `,
  actions: {
    update() {
      this.actions.modify(this.get('newNumber'));
    }
  }
});

export default connect(mapStateToComponent, dispatchToActions)(AddSubtractNumber);
