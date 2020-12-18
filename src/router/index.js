import Vue from 'vue'
import Router from 'vue-router'
import Index from '../pages/Index.vue'
import SingleGame from '../pages/SingleGame.vue'
import AgainstGame from '../pages/AgainstGame.vue'
import NotFound from '../pages/NotFound.vue'

Vue.use(Router)

const originalPush = Router.prototype.push

Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

export default new Router({
  // mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Index',
      component: Index
    },
    {
      path: '/single-game',
      name: 'SingleGame',
      component: SingleGame
    },
    {
      path: '/against-game',
      name: 'AgainstGame',
      component: AgainstGame
    },
    { 
      path: '*', 
      component: NotFound 
    }
  ]
})

