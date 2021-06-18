export const loadJSONFile = (file, store) => {
  var reader = new FileReader();
  reader.onloadend = function () {
    var text = reader.result;
    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      alert('Can not load the project.');
    }

    if (json) {
      store.loadJSON(json);
    }
  };
  reader.onerror = function () {
    alert('Can not Polotno project file.');
  };
  reader.readAsText(file);
};
