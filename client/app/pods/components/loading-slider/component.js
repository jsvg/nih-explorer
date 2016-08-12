import Component from 'ember-component';
import { later, once } from 'ember-runloop';
import get from 'ember-metal/get';
import set from 'ember-metal/set';

export default Component.extend({
  tagName: 'div',
  classNames: ['loading-slider'],
  classNameBindings: 'expanding',
  duration: 300,
  speed: 800,
  color: '#2CFF00',

  didReceiveAttrs() {
    if ( get(this, 'isLoading') ) {
      console.log('loading die');
      once(this, function() {
        console.log('loading once die');
        this.animate();
      });
    } else {
      console.log('stop die');
      set(this, 'isLoaded', true);
    }
  },

  didInsertElement() {
    this.$().html('<span>');
  },

  animate() {
    set(this, 'isLoaded', false);
    let elapsedTime = 0,
        innerWidth = 0,
        outerWidth = this.$().width(),
        stepWidth = Math.round(outerWidth / 50);
    const self = this,
        inner = this.$('<span>'),
        outer = this.$(),
        duration = get(this, 'duration'),
        color = get(this, 'color');

    outer.append(inner);
    inner.css('background-color', color);

    const interval = window.setInterval(() => {
      //console.log('int', elapsedTime);
      elapsedTime = elapsedTime + 10;
      inner.width(innerWidth = innerWidth + stepWidth);

      // slow the animation if we used more than 75% the estimated duration
      // or 66% of the animation width
      if (elapsedTime > (duration * 0.75) || innerWidth > (outerWidth * 0.66)) {
        // don't stop the animation completely
        if (stepWidth > 1) {
          stepWidth = stepWidth * 0.95;
        }
      }

      if (innerWidth > outerWidth) {
        later(() => {
          outer.empty();
          window.clearInterval(interval);
        }, 50);
      }

      // the activity has finished
      if (get(self, 'isLoaded')) {
        // start with a sizable pixel step
        if (stepWidth < 10) {
          stepWidth = 10;
        }
        // accelerate to completion
        stepWidth = stepWidth + stepWidth;
      }
    }, 10);
  }
});
