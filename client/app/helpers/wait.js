/**
 * Helper for testing async delays
 */
import RSVP from 'rsvp';

export default function wait(value, delay) {
  const promise = value.then && typeof value.then === 'function' ?
        value :
        RSVP.resolve(value);

  return new RSVP.Promise(resolve => {
    setTimeout(() => {
      promise.then(result => {
        resolve(result);
      });
    }, delay);
  });
}
