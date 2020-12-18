<template>
    <div class="singel-wrapper" :class="{'fancy-skin': isFancySkin}">
        <div class="all-wrapper">
            <div class="btn-wrapper">

                <div class="title-func-wrapper">
                    <div class="title-wrapper">
                        <div class="title" @click="() => {isFancySkin = !isFancySkin; isShowTip = false}">
                            <span>2</span><span>0</span><span>4</span><span>8</span>
                            <div v-if="isShowTip" :class="{'skin-tip': isShowTip}">点我</div>
                        </div>
                    </div>

                    <div class="func-wrapper">
                        <div class="func-btn-wrap">
                            <div class="mode-wrap">
                                <div v-if="![0,1,2].includes(type)">模式选择</div>
                                <div v-else>{{modeItem[type].mode}}</div>
                                <ul>
                                    <li v-for="(item, index) in modeItem" :key="item.mode">
                                        <button :class="{'active': item.isModeActive}" @click="modeClick(index)">{{item.mode}}</button>
                                    </li>
                                </ul>
                            </div>

                            <button class="start" @click="startGame">开始游戏</button>
                            <button class="back" @click="() => this.$router.replace('/')">返回菜单</button>
                        </div>
                    </div>
                </div>

                <div class="score-wrap">
                    <div class="classic-wrap score">
                        <p>分数</p>
                        <p v-if="inited">{{this.$refs.gameboard.myScore}}</p>
                    </div>
                    <div class="classic-wrap best-score">
                        <p>历史最高</p>
                        <p>{{bestScore}}</p>
                    </div>

                    <div v-if="modeItem[1].isModeActive || modeItem[2].isModeActive" class="classic-wrap timer-wrap">
                        <div v-if="modeItem[1].isModeActive" class="limit-clock">
                            <p>限时时间</p>
                            <p>{{this.$refs.gameboard.time}}</p>
                        </div>
                        <div v-if="modeItem[2].isModeActive" class="clock">
                            <p>计时时间</p>
                            <p>{{this.$refs.gameboard.count}}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="game-wrapper">
                <GameBoard :type="type" class="game" @gameOver="gameOver" ref="gameboard" />
            </div>
        </div>
        <div v-if="scoreShow" class="result-mask">
            <div class="result-wrap">
                <div class="my-result-wrapper">
                    <p class="result-title" v-if="this.$refs.gameboard.winFlag">Win!</p> 
                    <p class="result-title">我的分数</p> 
                    <p class="result-content">{{this.$refs.gameboard.myScore}}</p>
                    <div>
                        <button class="back" @click="() => scoreShow = false">返回</button>
                    </div>
                </div>
            </div>
        </div>    
    </div>
</template>

<script>
import GameBoard from '../components/Gameboard'
export default {
    components: {
        GameBoard,
    },
    data () {
        return {
            modeItem: [
                {
                  // 11.28 默认经典模式
                    mode: '经典模式',
                    isModeActive: true
                }, 
                {
                    mode: '限时模式',
                    isModeActive: false
                }, 
                {
                  // 11.28 
                    mode: '速度模式',
                    isModeActive: false
                }
            ],
            bestScore: localStorage.getItem('bestScore') || 0,
            isGameover: true,
            scoreShow: false,
            type: 0,
            inited: false,
            isFancySkin: false,
            isShowTip: true
        }
    },
    mounted() {
        this.inited = true
    },
    methods: {
        modeClick (index) {
            this.modeItem.forEach((item, indx) => {
                if (index === indx) {
                    this.type = index
                    console.log(this.type)
                    item.isModeActive = true
                } else {
                    item.isModeActive = false
                }
            })
        },
        startGame () {
            this.$refs.gameboard.init()
        }, 
        gameOver () {
            this.scoreShow = true
            this.setBestScore()
        },
        setBestScore () {
            let curScore = this.$refs.gameboard.myScore
            let oldScore = (localStorage.getItem('bestScore')) || 0
            if (curScore > Number(oldScore)) {
                localStorage.setItem('bestScore', curScore)
                this.bestScore = curScore
            }
        }
    }
}
</script>

<style lang="scss" scoped>
%default-button {
    font-size: 24px;
    background-color: #8C7B69;
    color: #F9F6F3;
    border-radius:1rem;
    border-width: 0;
}
%position-center {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
}
$content-width: 55vw;
%content-wrap {
    background-color: rgba(0,0,0,0.5);
    border-radius: 1rem;
}

.singel-wrapper {
    width: 100%;
    height: 100%;
    position: relative;

    .all-wrapper {
        position: relative;
        
        .btn-wrapper {
            position: relative;
            height: 40%;

            .title-func-wrapper {
                position: absolute;
                width: 100%;
                height: 70%;
                top: 0;

                .title-wrapper {
                    position: absolute;
                    height: 100%;
                    width: 50%;
                    left: 0;
                    .title {
                        position: absolute;
                        text-align: center;
                        font-weight: 700;
                        border: 3px solid #E9CF7F;
                        border-radius: 1rem;
                        box-sizing: border-box;
                        cursor: pointer;

                        span:nth-child(1) {
                            color: #F59563;
                        }
                        span:nth-child(2) {
                            color: #F65E3B;
                        }
                        span:nth-child(3) {
                            color: #EDCD61;
                        }
                        span:nth-child(4) {
                            color: rgb(255, 187, 85);
                        }
                        .skin-tip {
                            font-size: 1rem;
                            position: absolute;
                            color: #f59563;
                            line-height: 1rem;
                            top: 0.5rem;
                            margin-left: -1rem;
                        }
                    }
                }

                .func-wrapper {
                    position: absolute;
                    height: 100%;
                    width: 50%;
                    right: 0;
                    .func-btn-wrap {
                        position: absolute;
                        width: 100px;
                        height: 100px;
                        text-align: center;

                        .mode-wrap:hover{
                            height: 100px;
                            position: absolute;
                        }
                        .mode-wrap > div::before {
                            content: '';
                            display: inline-block;
                            width: 0;
                            height: 0;
                            border: 5px solid #766E66;
                            border-color: transparent transparent transparent #F67D60;
                        }
                        .mode-wrap {
                            overflow: hidden;
                            height: 26px;
                            cursor: pointer; 
                            transition: all 0.35s;
                            font-size: 14px;
                            background-color: #8C7B69;
                            color: #F9F6F3;
                            padding: 0px 5px;
                            border-radius: 8px;
                            border: 3px solid #E9CF7F;
                            z-index: 999;
                            box-sizing: border-box;
                            width: 100px;

                            div {
                                box-sizing: border-box;
                                height: 20px;
                                padding: 0px 5px;
                            }
                            ul > li {
                                box-sizing: border-box;
                                height: 20px;
                                margin: 5px 0;
                                button {
                                    font-size: 14px;
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
                                font-weight: 700;
                                color: #F67D60;
                            }
                        }
                        .start,
                        .back {
                            @extend %default-button;
                            width: 100%;
                            font-size: 16px;
                            display: block;
                            margin-top: 15px;
                        }
                        .start:hover,
                        .back:hover {
                            background-color: #EBE0CB;
                            color: #766E66;
                            font-weight: bolder;
                        }
                    }
                }
            
            }

            .score-wrap {
                width: 100%;
                height: 30%;
                position: absolute;
                bottom: 0;
                display: flex;
                justify-content: space-around;
                

                .classic-wrap {
                    border: 3px solid #E9CF7F;
                    border-radius: 8px;
                    text-align: center;

                    p:nth-child(1) {
                        border-bottom: 1px solid #E9CF7F;
                        padding-bottom: 0.5rem;
                    }
                }
                .score {
                    color: #EDCD61;
                }
                .best-score {
                    color: #ffbb55
                }
                .timer-wrap {
                    color: #F65E3B;
                }
            }
        }
        .game-wrapper {
            position: relative;
            height: 60%;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }

    .result-mask {
        position: absolute;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.6);

        .result-wrap {
            @extend %position-center;
            width: $content-width;
            text-align: center;

            .my-result-wrapper {
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
                    @extend %content-wrap;
                }
                .result-content {
                    @extend %content-wrap;
                }
                .result-content {
                    margin-bottom: 3%; 
                }

                .back {
                    background: transparent;
                    color: #b4a799;
                    margin: 10px;
                    font-size: 16px;
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
}

@media only screen and (max-width: 466px){
    .singel-wrapper {

        .all-wrapper {
            width: 100%;
            height: 100%;
            
            .btn-wrapper {

                .title-func-wrapper {

                    .title-wrapper {

                        .title {
                            width: 10rem;
                            height: 10rem;
                            line-height: 10rem;
                            font-size: 4rem;
                            right: 5vh;
                            bottom: 5vh;
                            .skin-tip {
                                left: 5rem;
                            }
                        }
                    }

                    .func-wrapper {
                        .func-btn-wrap {
                            left: 5vh;
                            bottom: 5vh;
                        }
                    }
                
                }
                .score-wrap {

                    .classic-wrap {
                        font-size: 2rem;
                        padding: 0.5rem;
                        min-width: 8rem;
                    }
                }
            }
        }
    }
}

@media only screen and (min-width: 466px){
    .singel-wrapper {
        .all-wrapper {
            width: 466px;
            height: 789px;
            margin: auto;

            .btn-wrapper {

                .title-func-wrapper {

                    .title-wrapper {

                        .title {
                            width: 100px;
                            height: 100px;
                            line-height: 100px;
                            font-size: 40px;
                            right: 26%;
                            bottom: 18%;
                            .skin-tip {
                                left: 50px;
                            }
                        }
                    }
                    .func-wrapper {
                        .func-btn-wrap {
                            left: 26%;
                            bottom: 18%;
                        }
                    }
                
                }
                .score-wrap {

                    .classic-wrap {
                        font-size: 24px;
                        padding: 5px;
                        min-width: 4em;
                    }
                }
            }
        }
    }
}

.fancy-skin {

    .title {
        box-shadow: 0px 0px 20px 3px #E9CF7F;
    }

    /deep/ .game {
        .grid-container {
            
            background-color: rgba(255,255,255, 0.2);
            .grid-cell {
                background-color: rgba(0, 0, 0, 0.1);
            }
            .number-cell2 {
                color: #EBE0CA;
                background-color: rgba(247, 236, 236, 0.2);
                box-shadow: 0px 0px 4px 1px #EBE0CA;
            }
            .number-cell4 {
                color: #f1cf83;
                background-color: rgba(241, 205, 111, 0.2);
                box-shadow: 0px 0px 6px 3px #fcda90;
            }
            .number-cell8 {
                color: #f5f2e7;
                background-color: rgba(241, 207, 130, 0.33);
                box-shadow: 0px 0px 7px 4px #eddea5;
            }
            .number-cell16 {
                color: #f5f2e7;
                background-color: #eddea5c2;
                box-shadow: 0px 0px 7px 4px #eddea5;
            }
            .number-cell32 {
                color: #F9F6F2;
                background-color: #f67d6078;
                box-shadow: 0px 0px 15px 4px #e0765d;
            }
            .number-cell64 {
                color: #F9F6F2;
                background-color: #f67d60;
                box-shadow: 0px 0px 30px 13px #fe9b83;
            }
            .number-cell128 {
                color: #F9F6F2;
                background-color: #ff1616ab;
                box-shadow: 0px 0px 15px 4px #f31818ab;
            }
            .number-cell256 {
                color: #F9F6F2;
                background-color: #d88dde75;
                box-shadow: 0px 0px 10px 2px #d88ddef7;
            }
            .number-cell512 {
                color: #F9F6F2;
                background-color: #2482ef8f;
                box-shadow: 0px 0px 10px 2px #2482efeb;
            }
            .number-cell1024 {
                color: #F9F6F2;
                background-color: #8c88de7d;
                box-shadow: 0px 0px 10px 2px #a39ff1bf;
            }
            .number-cell2048 {
                color: #F9F6F2;
                background-color: #f5da74;
                box-shadow: 0px 0px 35px 22px #fade76eb;
            }
        }
    }
}

</style>