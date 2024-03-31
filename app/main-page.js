import { HomeViewModel } from './main-view-model';

function onNavigatingTo(args) {
  const page = args.object;
  page.bindingContext = new HomeViewModel();
}

export { onNavigatingTo };
