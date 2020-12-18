<template>
    <div class="abody">
        <div class="againstBody">
            <div class="roomName">
                <p>房间号: {{roomId}}</p>
                <p>难度：{{modeItem[mode].mode}}</p>
            </div>

            <!-- 11.28 对战模式，隐去开始游戏按钮 -->
            <!-- 为测试更改显示 v-if="character === 1 && inited == true" -->
            <div class="Top">
                <div class="button-score">
                    <div class="buttonGroup">
                        <button class="start" :class="{'isdisabled': !isReady}" @click="startGame" :disabled="!isReady" v-if="character === 1 && inited == true && isStart == false">开始游戏</button>
                        <button class="back" @click="leaveRoom">退出房间</button>
                        <div class="mode-wrap" v-if="character === 1" @mouseover="hiddenMyscore()" @mouseout="showMyscore()" >
                            <div>难度设置</div>
                            <ul>
                                <li v-for="(item, index) in modeItem" :key="item.mode">
                                    <button :class="{'active': item.isModeActive}" @click="modeClick(index)">{{item.mode}}</button>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="score-wrap">
                        <div class="classic-wrap my-score" id="myScore">
                            <p>我的分数</p>
                            <p v-if="inited">{{this.$refs.gameboard.myScore}}</p>
                        </div>
                        <div class="classic-wrap your-score">
                            <p>对方分数</p>
                            <p v-if="inited">{{yourScore}}</p>
                        </div>
                        <div class="timer-wrap">
                            <div v-if="!isStart" class="limit-clock">
                                <p>设置时间</p>
                                <div>
                                    <input v-if="character ===1 " v-model="limitTime" type="text" oninput = "value=value.replace(/[^\d]/g,'')">
                                    <div v-else> 
                                        <p class="limit-clock-p">{{limitTime}}</p> 
                                    </div>
                                </div>
                            </div>
                            <div v-else class="limit-clock">
                                <p>剩余时间</p>
                                <p class="limit-clock-p">{{this.$refs.gameboard.time}}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="playerTop">
                    <div class="player1">
                        <div class="picture">
                            <div class="character">{{character === 1 ? '房客' : '房主'}}</div>
                            <div class="avatarOpponent">
                                <img src="../assets/img/boy.png" class="avatar">
                            </div>
                        </div>
                        <div class="nickname">{{yourName}}</div>
                    </div>
                    <div class="messageOpponent">
                        <div class="commentOpp">
                                <input ref="inputBox" v-model="receiveText" autofocus class="inputOpp" readonly="true">
                        </div>
                    </div>
                </div>
            </div>

            <!-- <div>等待对手。。。</div> -->
            <!-- 11.28 删除监听事件 -->
            <div class="game-wrap">
                <GameBoard :level='mode' :type='1' 
                :setTime='limitTime' :changeScore="changeScore"
                @gameOver="gameOver" 
                @newScore='sendScore'
                @scoreChange="punishment"
                @initchangeScore="initchangeScore"
                class="game" ref="gameboard" />
            </div>
            <!-- <Room /> -->
            <!-- 11.28 未做：在gameover和succes函数中控制游戏结果显示变量 
            -->

            <div class="playerDown">
                <!-- 互动动画 -->
                <transition name="showSuc">
                    <div v-show="sucShow" class="sucSyn">
                        <div class="sucSynText">
                            <p>2048!</p>
                        </div>
                    </div>
                </transition>
                <div class="player2" @click="showsuc()">
                    <div class="picture">
                        <div class="character">{{character === 1 ? '房主' : '房客'}}</div>
                        <div class="avatarMy">
                            <img src="../assets/img/girl.png" class="avatar">
                        </div>
                    </div>
                    <div class="nickname">{{myName}}</div>
                </div>
                <div class="messageMy">
                    <div class="commentMy">
                        <transition name="slide-bottom">
                            <div v-show="isShowEmoji" class="emoji-display">
                                <ul>
                                    <li @click="insertText(item)" v-for="item of emojis" :key="item">{{item}}</li>
                                </ul>
                            </div>
                        </transition>
                        <div class="emoji">
                            <i @click="showEmoji(isShowEmoji=!isShowEmoji);" class="icon-emoji"></i>
                        </div>
                            <input ref="inputBox"
                            v-model="inputText"
                            @keyup.enter="sendMsg"
                            placeholder="请输入聊天内容"
                            autofocus
                            class="inputMy">
                            <button
                            :class="{'clickable': clickable}"
                            @click="sendMsg" class="buttonInput"
                            >发送</button>
                        </div>
                    </div>
            </div>

            <div v-if="scoreShow" class="result-mask">
                <div class="result-wrap" v-if="scoreShow">
                    <div class="result-wrap-aga">
                        <p class="result-title">我的分数：{{this.$refs.gameboard.myScore}}</p> 
                        <p class="result-content">VS</p> 
                        <p class="result-title">对手的分数：{{yourScore}}</p>
                        <div>
                            <button class="back" @click="() => scoreShow = false">返回</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { alert, closewin } from '../assets/utils'
import GameBoard from '../components/Gameboard'
import io from 'socket.io-client'
// 建立socket.io通信
//const socket = io.connect('http://47.110.94.236')
const socket = io.connect('http://127.0.0.1:8081')
export default {
    components: {
        GameBoard
    },
    data () {
        return {
            roomId: 1,
            myName: '',
            yourName: '等待对手',
            character: null,   //1为房主，0为房客
            myScore: 0,
            yourScore: 0,
            limitTime: 10,
            sucShow: false, //互动动画
            isStart: false, //点击开始游戏，载入游戏前变为true
            isReady: false, //房内有两人后变为true
            emojis: ['😂', '😄', '😏', '😅' ,'🤓', '😎', '👿', '😤', '😭', '👻', '👍', '✌️', '❤️'],
            isShowEmoji: false,
            modeItem: [
                {
                    mode: '简单',
                    isModeActive: false
                }, 
                {
                  // 11.28
                    mode: '正常',
                    isModeActive: true
                }, 
                {
                    mode: '困难',
                    isModeActive: false
                }
            ],
            // 11.28 不能在一开始就展示分数，否则 this.$ref 取不到
            scoreShow: false,
            // 11.28 模式选择
            mode: 1,
            inited: false,
            inputText: '',
            receiveText: '',
            changeScore: 0
        }
    },
    mounted() {
        // this.myScore = this.$route.params.myScore
        // this.yourScore = this.$route.params.mateScore
        this.inited = true
        // this.oTextarea = document.querySelector('input');

        //发送信号加入房间
        socket.emit('joinRoom',
            { "playerName": this.myName, "roomId": this.roomId},
            (res) => {  //根据回调的power进入不同组件(房主/房客)
                res.permission === 1 
                ? this.character = 1
                : this.character = 0
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
            this.isReady = true
            if(this.character == 1){    //如果我是房主
                this.yourName = data.unholder
            }
            else {                  //如果我是房客
                this.yourName = data.holder
            }
            //将房主的当前设定时间、难度传给房客
            if(this.character == 1){
                socket.emit("changeTime",{"roomId": this.roomId,"limitTime": this.limitTime} )
                socket.emit("changeLevel",{"roomId": this.roomId, "mode": this.mode})
            }
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
        }),

        //房主接收房客离开房间的消息
        socket.on("memberleave", data => {
            if(this.character == 1){
                alert("你的对手离开了游戏")
                this.yourName = '等待对手'
            }
        }),
        //房客同步房主设定时间
        socket.on("changeT", data => {
            //alert("房主更改了时间")
            this.limitTime = data.newTime
        })

        //房客同步房主设定难度
        socket.on("changeL", data => {
            this.mode = data.mode
        })

        //所有客户端都监听服务器发送的“开始游戏”信号
        socket.on("start", data => {
            alert("Game Start!")
            this.isStart = true
            this.$nextTick(() => {
                // console.log(this.$refs)
                this.$refs.gameboard.init()
            })
        }),

        //接收服务器发来的对手的消息
        socket.on("partnerMsg", data => {
            this.receiveText = data.msg
        }),

        //接受服务器发送的对手分数的更新
        socket.on("updatescore", data =>{
            console.log("对手的新得分:",data.updatescore);
            this.yourScore = data.updatescore
        }),
        socket.on("score64", data => {
            console.log('received punishment')
          // console.log(data.score)
            // this.changeScore = data.score
        })

        window.onbeforeunload = e => {      //刷新时弹出提示
            console.log(1111, "离开页面");
            socket.emit("leaveRoom",{"roomId": this.roomId, "playerName": this.myName, "power": this.character})
        };
    },
    created() {
        //从vuex中拿到用户昵称和房间id
        this.myName = this.$store.state.nickName   
        this.roomId = this.$store.state.roomId  
    },
    watch: {
        limitTime: {
            handler(limitTime){
                socket.emit("changeTime",{"roomId": this.roomId,"limitTime": this.limitTime} )
            }
        }
    },
    computed: {
        clickable() {
            return this.inputText.length > 0
        }
    },
    methods: {
        startGame () {
            if (this.isReady) {
                this.isStart = true
                socket.emit("startGame",{"roomId": this.roomId})
            }
        },
        //向服务器发送离开房间的请求
        leaveRoom() {
            socket.emit("leaveRoom",{"roomId": this.roomId, "playerName": this.myName, "power": this.character})
        },
        modeClick (index) {
            this.modeItem.forEach((item, indx) => {
                if (index === indx) {
                    this.mode = index
                    item.isModeActive = true
                } else {
                    item.isModeActive = false
                }
            })
            socket.emit("changeLevel",{"roomId": this.roomId, "mode": this.mode})
        },
        //发送给对方自己的分数变化
        sendScore(myScore) {
            socket.emit("newscore",{"roomId": this.roomId, "score": myScore})
        },
        gameOver () {
            // 11.28 加上游戏结束动画／弹窗
            this.scoreShow = true
            this.isStart = false
            //socket.emit("gameover", {"roomId": this.roomId, "playerName": this.myName, "power": this.character})
        },
        
        // 表情
        showEmoji(flag) {
            this.isShowEmoji = flag;
            //alert(this.isShowEmoji)           
        },
        insertText(str) {
            this.inputText += str
        },

        //发送给对方消息
        sendMsg() {
            this.isShowEmoji = false;
            socket.emit("send",
                {"roomId": this.roomId, "msg": this.inputText},
                (res) => {
                    this.inputText = ''
                })
        },
        punishment(score) {
            console.log("惩罚", score);
            socket.emit("scorechange",{"roomId": this.roomId, "score": score})

        },
        initchangeScore() {
            this.changeScore = 0
        },
        closesuc(){
            this.sucShow = false;
        },
        showsuc(){
            this.sucShow = true;
            window.setTimeout(this.closesuc,1000);
        },
        hiddenMyscore(){
            myScore.style.zIndex = "-1";
        },
        showMyscore(){
            myScore.style.zIndex = "1";
        }
        
    }
}
</script>

<style lang="scss" scoped>
%default-button {
    // width: 100%;
    // height: 45px;
    // line-height: 45px;
    font-size: 24px;
    background-color: #8C7B69;
    color: #F9F6F3;
    border-radius: 5px;
    border-width: 0;
    font-weight: 700;
}
%position-center {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
}
.abody{
    width: 100%;
    height: 100%;
    background-image: url('../assets/img/bg1.jpeg');
    background-repeat: repeat;
}
.againstBody{
    width :750px;
    height: 800px;
    margin: 0 auto;
    padding-top: 100px;
}
.roomName{
    width: 120px;
    height: 40px;
    text-align: center;
    background-color: #8C7B69;
    border-radius: 5px;
    margin: 0 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    p{
        line-height: 20px;
        font-weight: 600;
        color: #F9F6F3;
        font-size: 1rem;
    }
}
.Top{
    width: 750px;
    height: 100px;
    margin-top: 50px;
    z-index: 100;
}
.button-score{
    float: right;
    height: 100px;
}
.buttonGroup{
    width: 250px;
    height: 33px;
    font-weight: 700;
    .button{
        font-weight: 700;
    }
}
.start{
    @extend %default-button;
    width: 80px;
    height: 27px;
    line-height: 21px;
    font-size: 1rem;
    display: inline;
    border-radius: 5px;
    border: 3px solid #E9CF7F;
    margin-left: 5px;
}
.start.isdisabled {
    cursor: not-allowed;
    opacity: 0.6;
} 
.back {
    @extend %default-button;
    width: 80px;
    height: 27px;
    line-height: 21px;
    font-size: 1rem;
    display: inline;
    border-radius: 5px;
    border: 3px solid #E9CF7F;
}
.mode-wrap:hover{
    height: 90px;
}
.mode-wrap {
    overflow: hidden;
    width: 74px;
    height: 21px;
    line-height: 21px;
    cursor: pointer; 
    transition: all 0.35s;
    font-size: 1rem;
    text-align: center;
    background-color: #8C7B69;
    color: #F9F6F3;
    border-radius: 5px;
    border: 3px solid #E9CF7F;
    z-index: 999;
    display: inline;
    float: left;
    div {
        box-sizing: border-box;
        height: 20px;
        padding: 0px 5px;
    }
    ul > li {
        box-sizing: border-box;
        height: 20px;
        margin: 3px 0;
        z-index: 100;
        button {
            font-size: 1rem;
            background: #766553;
            color: #EBE0CB;
            padding: 0px 5px;
        }
        button:hover {
            cursor: pointer;
            background-color: #EBE0CB;
            color: #766E66;
            font-weight: bolder;
        }
    }
    .active {
        color: red;
    }
}
.limit-clock,
.clock,
.classic-wrap {
    border-radius: 5px;
    border: 3px solid #E9CF7F;
    text-align: center;
    padding: 5px;
}
.score-wrap{
    width: 250px;
    height: 45px;
    .timer-wrap{
        width: 100%;
        height: 100%;
        .limit-clock-p{
        border-bottom:0px;
        padding-bottom:0rem;
        }
    }
    p{
        color: #E9CF7F;
        font-weight: 700;
    }
    p:nth-child(1) {
        border-bottom: 1px solid #E9CF7F;
        padding-bottom: 0.5rem;
    }
    
}
.my-score {
    width: 64px;
    position: absolute;
    overflow: hidden;
    text-overflow: ellipsis;
}
.your-score {
    width: 64px;
    position: absolute;
    margin-left: 85px;
    overflow: hidden;
    text-overflow: ellipsis;
}
.limit-clock {
    width: 64px;
    position: absolute;
    margin-left: 170px;
    input {
        width: 70px;
        text-align: center;
        font-size: 1rem;
        background-color: transparent;
        color: red;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}
.avatarOpponent{
    height: 54px;
}
.avatar{
   height: 100%;
}
.avatarMy{
    height: 54px;
}
.playerTop{
    width: 500px;
    height: 100px;
    display: inline;
    float: left;
}
.player1,
.player2 {
    box-sizing: border-box;
    border: 3px solid #efdbaa;
    width: 70px;
    text-align: center;
    border-radius: 5px;
    .picture {
        // box-sizing: border-box;
        width: 100%;
        height: 73px;
        .character{
            color:#E9CF7F;
            font-weight: 900;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }
    .nickname{
        color: #E9CF7F;
        font-weight: 900;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}
.player1 {
    height: 100px;
    width: 100px;
    display: inline;
    float: left;
}
.player2 {
    height: 100px;
    width: 100px;
    display: inline;
    float: right;
}
.game-wrap {
    height: 60%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}
.result-mask {
    // z-index: 999;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    .result-wrap {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 55%;
        text-align: center;
        .result-wrap-aga{
            padding: 3%;
            font-size: 2rem;
            color: #EBE0CB;
            font-weight: bold;
            font-style: italic;
            background-color: rgba(255,255,255,0.2);
            box-shadow: 2px 3px 28px 16px;
            border-radius: 1rem;
            .result-title {
                border-bottom: 0.1rem solid #efdbaa;
                padding: 3%;
                margin-bottom: 3%;
                background-color: rgba(0,0,0,0.5);
                border-radius: 1rem;
            }
            .result-content {
                background-color: rgba(0,0,0,0.5);
                border-radius: 1rem;
            }
            .result-content {
                margin-bottom: 3%; 
            }

            .back {
                background: transparent;
                color: #b4a799;
                margin: 10px;
                font-size: 16px;
                border: 0px;
            }
            .back::before {
                content: '';
                display: inline-block;
                width: 0;
                height: 0;
                border: 5px solid #b4a799;
                border-color: transparent transparent transparent #766E66;
            }
        }
    }
}
.playerDown{
    position: relative;
    width: 750px;
    height: 100px;
    margin-top: 50px;
}
.messageOpponent{
    width: 400px;
    height: 100px;
    display: inline;
    float: left;
    z-index: 1; 
}
.commentOpp {
    position: relative;
    width: 250px;
    height: 50px;
    background: #8C7B69;
    border-radius: 5px;
    margin-top: 25px;
    margin-left: 15px;
} 
.commentOpp:before {
    content: '';
    position:absolute;
    top: 16px;
    left: -4px;
    width: 16px;
    height: 16px;
    transform: rotate(45deg);
    background-color: #8C7B69;
}
.inputOpp{
    background:none;  
    outline:none;  
    border:none;
    width: 92%;
    margin-top: 5%;
    margin-left: 8%;
    height: 60%;
    color:#F9F6F3;
    font-size: 16px; 
}
.messageMy{
    width: 650px;
    height: 100px;  
}
.commentMy{
    position: relative;
    width: 250px;
    background: #8C7B69;
    border-radius: 5px;
    margin-top: 3%;
    float: right;
    height: 50px;
    margin-right: 15px;
}
.commentMy:before {
    content: '';
    position:absolute;
    top: 16px;
    right: -4px;
    width: 16px;
    height: 16px;
    transform: rotate(45deg);
    background-color: #8C7B69;
}
.inputMy{
    background:none;
    border:none;
    outline:none;
    color:#F9F6F3;
    margin-top: 16px;
    margin-left: 15px;
    width: 125px;
    font-size: 1rem;
    z-index: 10;
}
.inputMy::placeholder{
    color: #F9F6F3;
}
.buttonInput{
    padding: 0 3%;
    height: 30px;
    font-size: 1rem;
    background-color: #F9F6F3;
    color: #8C7B69;
    border-radius: 10px;
    border-width: 0;
    margin-top: 10px;
    margin-left: 10px;
    z-index: 10;
}
.emoji-display {
    position: absolute;
    width: 100%;
    height: 50px;
    background-color: #8C7B69;
    top: -50px;
    left: 0;
    overflow: hidden;
    ul {
        display: flex;
        flex-wrap: wrap;
        list-style: none;
        li {
            padding: 2px 3px;
            font-size: 1.2rem;
          }
        }
      }
.emoji {
    float: left;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: 5px;
    margin-top: 10px;
    width: 30px;
    height: 30px;
    background-color: #8C7B69;
    .icon-emoji {
        width: 40px;
        height: 100%;
        background: url('../assets/icons/icon-emoji.svg') no-repeat;
        background-size: contain;
        }
      }
.slide-bottom-enter-active {
  transition: all .3s ease;
}
.slide-bottom-leave-active {
  transition: all .2s ease;
}
.slide-bottom-enter {
  transform: translateY(30px);
  opacity: 0;
}
.slide-bottom-leave-active {
  transform: translateY(30px);
  opacity: 0;
}


.sucSyn{
    position: absolute;
    left: 650px;
    bottom: 300px;
    width: 100px;
    height: 100px;
    border-radius: 100px;
    .sucSynText{
        width: 100%;
        height: 100%;
        margin: 0 auto;
        p{  
            font-family: 'Audiowide';
            line-height: 100px;
            vertical-align: middle;
            text-align: center;
            font-size: 2.5rem;
            font-weight: 700;
            transition: all 1.5s ease;
            text-shadow: 0 0 0.2em rgb(240, 226, 33),0 0 0.2em rgb(240, 226, 33);   
            color:#d1d1d1;   
        }
    }
}
.showSuc-enter-active{
    transition: all .3s ease;
}
.showSuc-leave-active{
    transition: all .3s ease;
}
.showSuc-enter {
    transform: translateY(30px);
    opacity: 0;
}
.showSuc-leave-active{
    transform: translateY(-30px);
    opacity: 0;
}
@media screen and (max-height: 900px) {
    .abody{
        height: 900px;
    }
}
@media screen and (max-width: 750px){
    .abody{
        width: 750px;
    }
}

@media only screen and (max-width: 466px) {
    .abody{
        height: 100%;
        width: 100%;
    }
    .againstBody{
        width: 100%;
        height: 100%;
        padding-top: 0px;
    }
    .game-wrap{
        height: 45%;
    }
    .Top{
        width: 100%;
        height: 10%;
        margin-top: 4%;
    }
    .button-score{
        height: 80px;
        float: none;
        width: 80%;
        margin-left: 10%;
    }
    .buttonGroup,.score-wrap{
        width: 250px;
        margin-left: 8%;
    }
    .playerTop{
        width: 85%;
        height: 140%;
        margin-top: 2%;
        margin-left: 7.5%;
        margin-bottom: 3%;
    }
    .player1,.player2{
        width: 30%;
        height: 100%;
        .avatarOpponent{
            height: 75%;
        }
        .avatarMy{
            height: 75%;
        }
        .picture{
            height: 80%;
        }
    }
    .messageOpponent{
        width: 70%;
    }
    .commentOpp{
        width: 90%;
        margin-top: 10%;
    }
    .playerDown{
        width:85%;
        height: 14%;
        margin-top: 3%;
        margin-left: 7.5%;
    }
    .messageMy{
        width: 70%;
        height: 100%;
    }
    .commentMy{
        margin-top: 10%;
        width: 90%;
        z-index: 0;
    }
    .commentMy:before{
        z-index: 0;
    }
    .inputMy{
        width: 45%;
    }
    .buttonInput{
        margin-left: 0px;
        z-index: 1;
    }
    .emoji-display{
        height:40%;
        top: -40%;
    }
}
@media only screen and (max-width: 320px) {
    .Top{
        margin-top: 2%;
    }
    .buttonGroup,.score-wrap{
        margin-left: 1%;
    }
    .playerTop{
        height: 135%;
    }
    .playerDown{
        height: 13.5%
    }
    .inputMy{
        margin-left: 2%;
    }
    .emoji-display{
        height: 40%;
        top: -40%;
    }
    .buttonInput{
        margin-left: 1.5%;
    }
}

</style>