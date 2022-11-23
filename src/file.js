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
    alert('Can not load Polotno project file.');
  };
  reader.readAsText(file);
};

export const loadImageFile = (file, store) => {
  var reader = new FileReader();
  reader.onloadend = function () {
    var url = reader.result;
    const img = new Image();
    img.src = url;
    img.onload = () => {
      const scale = Math.min(
        1,
        store.width / img.width,
        store.height / img.height
      );
      const type = file.type.indexOf('svg') > -1 ? 'svg' : 'image';
      store.activePage.addElement({
        type,
        width: img.width * scale,
        height: img.height * scale,
        src: url,
      });
    };
  };
  reader.onerror = function () {
    alert('Can not load image.');
  };
  reader.readAsDataURL(file);
};

export const loadFile = (file, store) => {
  if (file.type.indexOf('image') >= 0) {
    loadImageFile(file, store);
  } else {
    loadJSONFile(file, store);
  }
};
