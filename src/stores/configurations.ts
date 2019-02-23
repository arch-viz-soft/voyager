import _ from "lodash";
import Vue from "vue";
import { ActionContext, ActionTree, GetterTree, MutationTree } from "vuex";

import { Configuration } from "@/models/configuration";

export class State {
  public data: Configuration[] = [];
}

const getters = {
  configurations: (state: State): Configuration[] => {
    return state.data;
  }
} as GetterTree<State, any>;

const mutations = {
  addConfiguration: (state: State, payload: Configuration) => {
    state.data.push(payload);
  },
  addConfigurations: (state: State, payload: Configuration[]) => {
    payload.forEach((c: Configuration) => {
      const index = _.findIndex(state.data, (d) => d.id === c.id);
      if (index > -1) {
        Vue.set(state.data, index, _.merge(state.data[index], c));
      } else {
        state.data.push(c);
      }
    });
  },
  deleteConfiguration: (state: State, payload: Configuration) => {
    const index = _.findIndex(state.data, (d) => d.id === payload.id);
    state.data.splice(index, 1);
  },
  updateConfiguration: (state: State, payload: Configuration) => {
    const index = _.findIndex(state.data, (d) => d.id === payload.id);
    state.data[index] = payload;
  }
} as MutationTree<State>;

const actions = {
  addConfiguration: (store: ActionContext<State, any>, configuration: Configuration) => {
    store.commit("addConfiguration", configuration);
  },
  addConfigurations: (store: ActionContext<State, any>, configuration: Configuration[]) => {
    store.commit("addConfigurations", configuration);
  },
  deleteConfiguration: (store: ActionContext<State, any>, configuration: Configuration) => {
    store.commit("deleteConfiguration", configuration);
  },
  updateConfiguration: async (store: ActionContext<State, any>, configuration: Configuration) => {
    store.commit("updateConfiguration", configuration);
  }
} as ActionTree<State, any>;

export const configurations = {
  actions,
  getters,
  mutations,
  state: new State()
};
