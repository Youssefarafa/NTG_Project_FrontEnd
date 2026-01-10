import { trigger, transition, style, animate, query } from '@angular/animations';

export const slideInAnimation = trigger('routeAnimations', [
  transition(':enter, * <=> *', [
    query(':enter', [
      style({
        opacity: 0,
        transform: 'translateY(60px)',
        display: 'block'
      }),
      animate(
        '600ms cubic-bezier(0.35, 0, 0.25, 1)',
        style({
          opacity: 1,
          transform: 'translateY(0)'
        })
      )
    ], { optional: true })
  ])
]);
