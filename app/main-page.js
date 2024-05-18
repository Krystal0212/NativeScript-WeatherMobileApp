import { HomeViewModel } from './main-view-model';

function onPageLoaded(args) {
  const component = args.object;
  component.bindingContext = new HomeViewModel();

  component.bindingContext.loadingWeather();

  const listView = component.getViewById("listViewCapitals");
  listView.on("itemTap", function (args) {
      console.log("Item tapped");
      const selectedItem = component.bindingContext.capitalsList[args.index];
      console.log("Selected item:", selectedItem);
      component.bindingContext.onSelectCapital(selectedItem);
  });
}

export { onPageLoaded };