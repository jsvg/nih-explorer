import Component from 'ember-component';
import { later, once, next } from 'ember-runloop';
import get from 'ember-metal/get';
import set from 'ember-metal/set';

export default Component.extend({
  tagName: 'div',
  classNames: ['loading-slider'],
  color: 'white',

  didInsertElement() {
    this.$().html('<span>');
  },

  didReceiveAttrs() {
    if ( get(this, 'isLoading') ) {
      once(this, 'animate');
    } else {
      set(this, 'isLoaded', true);
    }
  },

  didUpdateAttrs() {
    if ( get(this, 'isLoading') && !get(this, 'isLoaded') ) {
      this.$().empty();
      next(this, 'animate');
    }
  },

  animate() {
    set(this, 'isLoaded', false);
    let elapsedTime = 0,
        innerWidth = 0,
        outerWidth = this.$().width(),
        stepWidth = Math.round(outerWidth / 50);
    const inner = this.$('<span>'),
          outer = this.$(),
          color = get(this, 'color');

    outer.show(); // in case bar was faded out previously
    outer.append(inner);
    inner.css('background-color', color);

    const interval = window.setInterval(() => {
      elapsedTime = elapsedTime + 10;
      innerWidth = innerWidth + stepWidth;
      inner.width(innerWidth);
      let percentComplete = innerWidth/outerWidth;
      
      // slow animation when past 60%
      if ( percentComplete > 0.6 && !get(this, 'isLoaded') ) {
        // easing step down to 1px
        if (stepWidth > 1) {
          stepWidth = stepWidth * 0.95;
        // then gradually reduce to a halt
        } else {
          stepWidth = Math.pow(stepWidth, (1/3));
        }
        // halt at 99% completion
        if ( percentComplete > 0.99 ) {
          stepWidth = 0;
        }
      }

      // activity has finished, accelerate to completion
      if ( get(this, 'isLoaded') ) {
        if (stepWidth < 10) {
          stepWidth = 10;
        }
        stepWidth = stepWidth + stepWidth;
      }

      // activity is done, roll up animation
      if (innerWidth > outerWidth) {
        later(() => {
          outer.fadeOut({
            duration: 600,
            done() { outer.empty(); }
          });
          window.clearInterval(interval);
        }, 50);
      }

    }, 10);
  }
});
