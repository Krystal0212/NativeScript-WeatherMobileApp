import { createViewModel } from './main-view-model';

export function onNavigatingTo(args) {
  const page = args.object;
  page.bindingContext = createViewModel();
}

export function onLocationCheckTap(args) {
  const page = args.object.page;
  page.bindingContext.set("alignment", "left");
}

export function onSettingsTap(args) {
  const page = args.object.page;
  page.bindingContext.set("alignment", "right");
}