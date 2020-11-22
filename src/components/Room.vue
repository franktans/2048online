<template>
<div>
    <div v-if="!this.showGame">
        <div>房间号 :{{roomId}}</div>
        <br>
        <div>我的昵称 :{{myName}}</div>
        <br>
        <div>我的权限:
            <div v-if="this.power == 1"> 房主</div>
            <div v-else>房客</div>
        </div>
        <br>
        <div>
            <div v-if="mateName === ''">
                    正在对待对手...
            </div>
            <div v-else>
                    对手昵称: {{ mateName }}
            </div>
        </div>
        <br>
        <!-- 这里棋盘显示的逻辑可以再优化一下 -->
        <button v-if="this.power == 1 && this.mateName" @click="startGame">开始游戏</button>
        <br>
        <button v-if="this.power == 1 && !this.level" @click="changeLevel(1)">难度设置</button>
        <div v-if="this.level && !this.showGame">
            <!-- 这里可以给被选择的按钮加个高亮什么的 -->
            <button @click="changeLevel(1)">easy</button>
            <button @click="changeLevel(2)">middle</button>
            <button @click="changeLevel(3)">high</button>
        </div>
        <br>
        <button v-if="!this.showGame" @click="leaveRoom">退出房间</button>
    </div>
    <Game v-if="this.showGame" :level="level" :changeScore="changeScore" 
            @scoreChange="punishment" @initchangeScore="initchangeScore"
            @newScore="sendScore">
        
    </Game>
    <div v-if="this.showGame">
        <div>
            房间名称：{{roomId}}
        </div>
        <div> 
            对手昵称：{{mateName}}
        </div>
        <div>
            对手得分：{{mateScore}}
        </div>
        <div>
            来自对手的消息：
            <input ref="inputBox" v-model="receiveText" autofocus>
        </div>

        <div>
            我的得分：{{myScore}}
        </div>
        <button> 大拇指 </button>
        <button> 66666 </button>
        <button> 扔鸡蛋 </button>
        <div>
            <input ref="inputBox"
                v-model="inputText"
                @keyup.enter="sendMsg"
                placeholder="请输入聊天内容"
                autofocus>
            <button
            :class="{'clickable': clickable}"
            @click="sendMsg"
            >发送</button>
        </div>
    </div>
</div>
</template>

<script>
import Game from '../components/Game'
import io from 'socket.io-client'

// 建立socket.io通信
const socket = io.connect('http://127.0.0.1:8081')

export default {
    data() {
        return {
            myName: '',
            mateName: '',
            roomId: '',
            power: null,     //1为房主，0为房客
            showGame: false,
            // ------ 用level作为选择难度的变量，这里直接用的父子组件间的传值
            // ---- 是只有房主有权利选择难度吗？
            level: 0,
            inputText: '',
            receiveText: '',
            mateScore: 0,
            myScore: 0,
            changeScore: 0  //接收对方的惩罚块
        }
    },
    components: {
        Game
    },
    beforeRouterEnter(to, from, next) {
        if (!localStorage.nickName || !localStorage.roomId) {
        next('/')
        } else {
        next()
        }
    },
    mounted() {
        //加入房间
        socket.emit('joinRoom',
            { "playerName": this.myName, "roomId": this.roomId},
            (res) => {  //根据回调的power进入不同组件(房主/房客)
                res.permission === 1 
                ? this.power = 1
                : this.power = 0
            }
        ),

        //房间已满，无法加入
        socket.on("full", data => {
            
            this.$router.push({
                path: "/"   
            })
            alert(data.roomId + "房间已满，无法加入！")
        }),

        //房间内有两个人时，获取两个人的消息
        socket.on("findmate", data => {
            console.log("match！");
            if(this.power == 1){    //如果我是房主
                this.mateName = data.unholder
            }
            else {                  //如果我是房客
                this.mateName = data.holder
            }

        }),

        socket.on("memberleave", data => {
            if(this.power == 1){
                alert("你的对手离开了游戏")
                this.mateName = ''
            }
        }),

        //所有客户端都监听服务器发送的“开始游戏”信号
        socket.on("start", data => {
            this.showGame = 1
            alert("Game Start!")
        }),

        //接收服务器发来的对手的消息
        socket.on("partnerMsg", data => {
            this.receiveText = data.msg
        }),

        //接受服务器发送的对手分数的更新
        socket.on("updatescore", data =>{
            console.log(data.updatescore);
            this.mateScore = data.updatescore
        })

        //接受服务器传达的，来自对手的消块信息
        socket.on("score64", data => {
            this.changeScore = 64
        }),

        //接收服务端离开房间的信号，执行离开房间
        socket.on("quit", data => {
            if(data.power == 1){    //房主解散了房间
                
                this.$router.push({
                    path: "/"
                })
                alert("房主已解散该房间！")
            }
            else{   //房客退出了房间
                
                this.$router.push({
                    path: "/"
                })
                alert("退出了该房间！")
            }
        })

    },

    created() {
        //从vuex中拿到用户昵称和房间id
        this.myName = this.$store.state.nickName   
        this.roomId = this.$store.state.roomId  
    },

    computed: {
        clickable() {
            return this.inputText.length > 0
        }
    },

    methods: {
        //向服务器发送离开房间的请求
        leaveRoom() {
            socket.emit("leaveRoom",{"roomId": this.roomId, "playerName": this.myName, "power": this.power})
        },
        //只有房主才有此方法。点击开始游戏，让服务端向所有房间内客户端发送一个开始游戏的命令
        startGame() {
            socket.emit("startGame",{"roomId": this.roomId})
        },
        changeLevel(level) {
          this.level = level
        },

        //发送给对方自己的分数变化
        sendScore(score) {
            socket.emit("newscore",{"roomId": this.roomId, "score": score})
        },

        //A完成了一个大块，发送惩罚消息给B执行
        punishment(score) {
            console.log("惩罚");
            socket.emit("scorechange",{"roomId": this.roomId, "score": score})

        },
        //当完成一次惩罚后，重置changeScore
        initchangeScore() {
            this.changeScore = 0
        },

        sendMsg() {
            socket.emit("send",
                {"roomId": this.roomId, "msg": this.inputText},
                (res) => {
                    this.inputText = ''
                })
        }
    }
    
}
</script>