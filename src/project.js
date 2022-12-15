import * as mobx from 'mobx';
import { createContext, useContext } from 'react';
import * as api from './api';

export const ProjectContext = createContext({});

export const useProject = () => useContext(ProjectContext);

class Project {
  id = '';
  name = '';
  authToken = '';
  private = false;
  user = {};
  skipSaving = false;

  constructor({ store }) {
    mobx.makeAutoObservable(this);
    this.store = store;

    store.on('change', () => {
      this.requestSave();
    });
  }

  requestSave() {
    if (this.saveTimeout) {
      return;
    }
    this.saveTimeout = setTimeout(() => {
      this.saveTimeout = null;
      // skip autosave if no project opened
      this.save();
    }, 5000);
  }

  async loadById(id) {
    this.id = id;
    this.updateUrlWithProjectId();
    try {
      const { store, name } = await api.getDesignById({
        id,
        authToken: this.authToken,
      });
      this.store.loadJSON(store);
      this.name = name;
    } catch (e) {
      alert("Project can't be loaded");
    }
  }

  updateUrlWithProjectId() {
    if (!this.id || this.id === 'local') {
      window.history.replaceState({}, null, `/`);
      return;
    }
    let url = new URL(window.location.href);
    let params = new URLSearchParams(url.search);
    params.set('id', this.id);
    window.history.replaceState({}, null, `/design/${this.id}`);
  }

  // async loadProject(dataJSON) {
  //   this.name = dataJSON.name || '';
  //   this.templateid = dataJSON.templateid || '';
  //   this.productconfiguration = dataJSON.productconfiguration || {};

  //   this.editorFunctions = await api.getEditorFunctions({
  //     templateid: this.templateid,
  //   });
  //   const req = await fetch(dataJSON.project + '?timestamp=' + Date.now());
  //   const json = await req.json();
  //   json.pages.forEach((page) => {
  //     page.children.forEach((element) => {
  //       if (element.custom?.logoBlock) {
  //         element.selectable = this.role === 'admin' ? true : false;
  //       }
  //     });
  //   });
  //   this.skipSaving = true;
  //   this.store.loadJSON(json);
  //   await this.store.waitLoading();
  //   await new Promise((resolve) => setTimeout(resolve, 50));
  //   this.store.history.clear();
  //   this.skipSaving = false;
  // }

  async save() {
    const json = this.store.toJSON();
    const maxWidth = 400;
    const preview = await this.store.toDataURL({
      pixelRatio: maxWidth / json.width,
      mimeType: 'image/jpeg',
    });
    // if (this.authToken && this.id === 'local') {
    //   this.id = '';
    // }
    const res = await api.saveDesign({
      store: json,
      preview,
      id: this.id,
      isPrivate: this.private,
      name: this.name,
      authToken: this.authToken,
    });
    if (res.status === 'saved') {
      this.id = res.id;
      this.updateUrlWithProjectId();
    }
  }

  async duplicate() {
    this.id = '';
    this.save();
  }
}

export const createProject = (...args) => new Project(...args);
export default createProject;
