import { HomeViewModel } from './main-view-model';

function onNavigatingTo(args) {
  console.log("Navigating to the main page.");
  const page = args.object;
  page.bindingContext = new HomeViewModel();
}

export { onNavigatingTo };