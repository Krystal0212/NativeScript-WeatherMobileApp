import { createViewModel } from './main-view-model';

export function onNavigatingTo(args) {
  const page = args.object;
  page.bindingContext = createViewModel();
}

export function onLocationCheckTap(args) {
  const page = args.object.page;
  viewModel.showSearchLocationPage();
  
}

export function onMainPageTap(args) {
  const viewModel = args.object.bindingContext;
  viewModel.onMainPageTap();
}

export function onSettingsTap(args) {
  const page = args.object.page;
  viewModel.showSettingsPage();
}