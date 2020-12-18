/*
* @Author: NiceMing
* @Date:   2018-04-04 16:50:34
*/
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    nickName: localStorage.nickName,
    roomId: localStorage.roomId,
  },

  mutations: {
    setNickname(state, name) {
      state.nickName = name
    },
    setRoomid(state, id) {
      state.roomId = id
    }
  }
})
