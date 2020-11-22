<template>
  <div>
    <div>
      <button class="new-game" @click="init()">重新游戏</button>
      <p>score:<span>{{score}}</span></p>
      <p>距离比赛结束还有：{{time}}</p>
    </div>
    <div class="container grid-container" ref='gridRef'>
      <div class="container number-container" ref='numberRef'>
      </div>
      <div class="cell grid-cell"></div>
      <div class="cell grid-cell"></div>
      <div class="cell grid-cell"></div>
      <div class="cell grid-cell"></div>
      <div class="cell grid-cell"></div>
      <div class="cell grid-cell"></div>
      <div class="cell grid-cell"></div>
      <div class="cell grid-cell"></div>
      <div class="cell grid-cell"></div>
      <div class="cell grid-cell"></div>
      <div class="cell grid-cell"></div>
      <div class="cell grid-cell"></div>
      <div class="cell grid-cell"></div>
      <div class="cell grid-cell"></div>
      <div class="cell grid-cell"></div>
      <div class="cell grid-cell"></div>
    </div>
  </div>
</template>

<script>
import { numberInit, clearPoint, getRandom, getNum, canMoveLeft, canMoveRight, canMoveUp, canMoveDown, noBlockHorizontal, noBlockVertical, generateOneNum, showMoveAnimation } from '../assets/utils'
export default {
  name: 'drawing',
  //changeScore是接收对面给自己的惩罚，scoreChange是记录自己要给对手的惩罚
  props: ['level','changeScore'],
  data: () => {
    return {
      gridRef: null,
      numberRef: null,
      point: [],
      score: 0,
      scoreChange: 0,
      // 计时变量
      time: null,
      // 保存定时器
      timer: null

    }
  },
  created () {
    // 注意：这里箭头函数和普通函数的区别（this指向）
  },
  // 钩子函数
  mounted () {
    this.gridRef = this.$refs.gridRef
    this.numberRef = this.$refs.numberRef
    this.init()
  },
  watch: {
    scoreChange: {
      handler(scoreChange) {
        // ------- 在这里添加合成某个数字的通信
        // 注意：scoreChange是改变的值，比如合成128发出惩罚
        // 那么是 scoreChange === 64 的时候发出
        if(scoreChange == 64) {
          this.$emit('scoreChange', scoreChange)
        }
      }
    },
    time: {
      handler(time) {
        if(time <= 0) {
          alert('Time is out!')
          document.removeEventListener('keydown', this.keydown)
          clearInterval(this.timer)
          // ------ 这里考虑如何对比两个人的分数
          // 显示胜利／失败
          // ======= 添加动画
        }
      }
    },
    score: {
      handler(score) {
        this.$emit("newScore",score)
      }
    },
    changeScore: {
       handler(newval, oldval){
         if(newval == 64 ) {
            console.log("接受128块的惩罚")
            console.log(newval)
            console.log(oldval);
            alert("接受128块的惩罚！")
         }
         this.$emit('initchangeScore')
       },
       immediate: true

    }
  },
  methods: {
    keydown (event) {
      event = event || window.event
      this.move(event)
    },
    init () {
      // 所有归零
      
      document.addEventListener("keydown", this.keydown)
      clearPoint(this.point, this.numberRef)
      numberInit(this.point, this.numberRef)
      // ----- 设置计时时间
      this.time = 600000
      this.score = 0

      var x1 = getRandom()
      var y1 = getRandom()
      var x2 = getRandom()
      var y2 = getRandom()

      this.point[x1][y1] = getNum(1)
      this.point[x2][y2] = getNum(1)

      if (!(x1 === x2) || y1 !== y2) {
        //  注意：childNodes（NodeList类） 和 children（HTMLCollection） 的区别
        this.numberRef.children[x1 * 4 + y1].innerHTML = this.point[x1][y1]
        this.numberRef.children[x1 * 4 + y1].setAttribute('class', 'cell number-cell' + this.point[x1][y1])
        this.numberRef.children[x2 * 4 + y2].innerHTML = this.point[x2][y2]
        this.numberRef.children[x2 * 4 + y2].setAttribute('class', 'cell number-cell' + this.point[x2][y2])
        // ------ 开始计时
        this.timer = setInterval(() => {
          this.time = this.time - 1
        }, 1000)
      } else {
        this.init()
      }
    },
    move (event) {
      event = event || window.event
      switch (event.which) {
        case 37:
          if (canMoveLeft(this.point)) {
            this.moveLeft()
            this.freshGrid()
            // ====== 新增一个值时，添加动画
            generateOneNum(this.point, this.numberRef, this.level)
          } else {
            this.isGameOver()
          }
          break
        case 38:
          if (canMoveUp(this.point)) {
            this.moveUp()
            this.freshGrid()
            generateOneNum(this.point, this.numberRef, this.level)
          } else {
            this.isGameOver()
          }
          break
        case 39:
          if (canMoveRight(this.point)) {
            // 1. 同一列的要可以同时被加，如[2,2,2,2]
            this.moveRight()
            this.freshGrid()
            // 生成新值的时候，加个动画
            generateOneNum(this.point, this.numberRef, this.level)
          } else {
            this.isGameOver()
          }
          break
        case 40:
          if (canMoveDown(this.point)) {
            this.moveDown()
            this.freshGrid()
            generateOneNum(this.point, this.numberRef, this.level)
          } else {
            this.isGameOver()
          }
          break
        default: break
      }
    },
    moveLeft () {
      for (var i = 0; i < 4; i++) {
        for (var j = 1; j < 4; j++) {
          if (this.point[i][j] !== 0) {
            for (var k = 0; k < j; k++) {
              if (this.point[i][k] === 0 && noBlockHorizontal(this.point, i, k, j)) {
                // move
                // ====== 添加从[i,j]移动到[i,k]的动画

                showMoveAnimation(this.numberRef, i, j, i, k)
                // 将[i，j]的值赋给[i,k]
                this.point[i][k] = this.point[i][j]
                // [i,j]的值归零
                this.point[i][j] = 0
                // 跳出这个点的移动循环，因为此时这个点已经移动过
                // 移动方式二：如果在[i,k]位置上的数字与[i,j]的数字相同，且从[i,k]到[i,j]之间没有障碍物
              } else if (this.point[i][k] === this.point[i][j] && noBlockHorizontal(this.point, i, k, j)) {
                // 这里还是有bug，继续调试
                // ====== 添加从[i,j]移动到[i,k]的动画
                this.score += this.point[i][j]
                this.scoreChange = this.point[i][j]
                showMoveAnimation(this.numberRef, i, j, i, k)
                this.point[i][k] += this.point[i][j]
                this.point[i][j] = 0
              }
              continue
            }
          }
        }
      }
    },
    moveUp () {
      for (var j = 0; j < 4; j++) {
        for (var i = 1; i < 4; i++) {
          if (this.point[i][j] !== 0) {
            for (var k = 0; k < i; k++) {
              if (this.point[k][j] === 0 && noBlockVertical(this.point, j, k, i)) {
                showMoveAnimation(this.numberRef, i, j, k, j)
                // move
                this.point[k][j] = this.point[i][j]
                this.point[i][j] = 0
                continue
              } else if (this.point[k][j] === this.point[i][j] && noBlockVertical(this.point, j, k, i)) {
                showMoveAnimation(this.numberRef, i, j, k, j)
                // move
                // add
                this.scoreChange = this.point[i][j]
                this.score += this.point[i][j]
                this.point[k][j] += this.point[i][j]
                this.point[i][j] = 0
                continue
              }
            }
          }
        }
      }
    },
    moveRight () {
      for (var i = 0; i < 4; i++) {
        for (var j = 2; j >= 0; j--) {
          if (this.point[i][j] !== 0) {
            for (var k = 3; k > j; k--) {
              if (this.point[i][k] === 0 && noBlockHorizontal(this.point, i, j, k)) {
                showMoveAnimation(this.numberRef, i, j, i, k)
                this.point[i][k] = this.point[i][j]
                this.point[i][j] = 0
                continue
              } else if (this.point[i][k] === this.point[i][j] && noBlockHorizontal(this.point, i, j, k)) {
                this.scoreChange = this.point[i][j]
                this.score += this.point[i][j]
                showMoveAnimation(this.numberRef, i, j, i, k)
                this.point[i][k] += this.point[i][j]
                this.point[i][j] = 0               
                continue
              }
            }
          }
        }
      }
    },
    moveDown () {
      for (var j = 0; j < 4; j++) {
        for (var i = 2; i >= 0; i--) {
          if (this.point[i][j] !== 0) {
            for (var k = 3; k > i; k--) {
              if (this.point[k][j] === 0 && noBlockVertical(this.point, j, i, k)) {
                showMoveAnimation(this.gridRef, i, j, i, k)
                this.point[k][j] = this.point[i][j]
                this.point[i][j] = 0
                continue
              } else if (this.point[k][j] === this.point[i][j] && noBlockVertical(this.point, j, i, k)) {
                this.scoreChange = this.point[i][j]
                this.score += this.point[i][j]
                showMoveAnimation(this.gridRef, i, j, i, k)
                this.point[k][j] += this.point[i][j]
                this.point[i][j] = 0
                continue
              }
            }
          }
        }
      }
    },
    freshGrid () {
      for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
          const grid = this.numberRef.children[i * 4 + j]
          if (this.point[i][j] === 0) {
            grid.innerHTML = ''
            grid.setAttribute('class', 'number-cell')
          } else {
            grid.innerHTML = this.point[i][j]
            grid.setAttribute('class', 'cell number-cell' + this.point[i][j])
          }
        }
      }
    },
    isGameOver () {
      if(!canMoveLeft(this.point) && !canMoveRight(this.point) && !canMoveUp(this.point) && !canMoveDown(this.point)) {
        console.log("isGameOver")
        // ====== 增加 游戏结束 动画
        // ------- 对战模式下，通知对方对战已结束，判定对方胜利
      }
    }
  }
}
</script>

<style>
* {
  padding: 0;
  margin: 0;
}
header {
  display: flex;
  flex-direction: column;
  align-items: center;
}
h1 {
  font-weight: bold;
}
button {
  background-color: #F8A;
  color:#FFF;
  border-radius: 6px;
}
.container {
  width: 460px;
  height: 460px;
  padding: 20px;
  border-radius: 10px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
   /* 让矩阵的多根轴线同样均匀分布 */
  align-content: space-between;
}
.number-container {
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.2);
}
.grid-container {
  margin: auto;
  background-color: #F84;
  position: relative;
}
.cell {
  width: 100px;
  height: 100px;
  border-radius:10px;
  background-color: rgba(0,0,0,1);
  font-size: 40px;
  /* 文字居中 */
  text-align: center;
  line-height: 100px;
  transition: all 0.25s ease-in-out;
  /* position: relative; */
  /* animation: generateNum 0.25 ease-in-out; */
}
/* ????? 这里的尺寸要做成自适应 */
@keyframes generateNum {
  from {width: 0; height: 0; margin: 50;}
  50% {width: 50px; height: 50px; margin: 25px;}
  to {width: 100px; height: 100px; margin: 0;}
}
.grid-cell {
  background-color: rgb(172, 187, 161);
}
.number-cell {
  width: 100px;
  height: 100px;
}
.number-cell2 {
  color: #000;
  background-color: #199;
}
.number-cell4{
color: #000;
background-color: #459;

}
.number-cell8{
color: #FFF;
background-color: #46A;

}
.number-cell16 {
color: #FFF;
background-color: #561;
}
.number-cell32 {
color: #FFF;
background-color: #565;
}
.number-cell64 {
color: #FFF;
background-color: #568;
}
.number-cell128 {
color: #FFF;
background-color: #56A;
}
.number-cell256 {
color: #FFF;
background-color: #56F;
}
.number-cell512 {
color: #FFF;
background-color: #572;
}
.number-cell1024 {
color: #FFF;
background-color: #578;
}
.number-cell2048 {
color: #FFF;
background-color: #57F;
}
</style>
