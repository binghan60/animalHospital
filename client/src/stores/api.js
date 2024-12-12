import { defineStore } from 'pinia'

export default defineStore('apiStore', {
  //data, methods, computed
  //state, action, getter
  state: () => ({
    apipath: 'http://localhost:3000',
  }),
  action: {},
  getters: {},
})
