//const defaultDuration = {duration: 250, easing: 'easeInOutQuint'};
export default function(){
  // top level links
  this.transition(
    this.fromRoute('index'),
    this.toRoute('about'),
    this.use('toLeft'),
    this.reverse('toRight')
  );
}