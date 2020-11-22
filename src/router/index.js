import Vue from 'vue'
import Router from 'vue-router'
import Index from '../components/Index.vue'
import Room from '../components/Room.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Index',
      component: Index
    },
    {
      path: '/room',
      name: 'Room',
      component: Room
    }

  ]
})
