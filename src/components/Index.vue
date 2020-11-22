<template>
<div>
    <input v-model="nickName" placeholder="请输入个人昵称">
    <br>
    <input v-model="roomId" placeholder="请输入房间名">
    <button :class="{'clickable': clickable}" @click="enterRoom">创建/加入房间</button>
</div>
</template>

<script>

export default {
    data() {
        return{
            nickName:'',
            roomId: ''
        }
    },
    methods: {
        
        enterRoom() {
            if(!this.nickName || !this.roomId){
                alert("请补充完整信息！")
                return
            }
            
            localStorage.nickName = this.nickName
            localStorage.roomId = this.roomId
            this.$store.commit('setNickname', this.nickName)
            this.$store.commit('setRoomid', this.roomId)

            this.$router.push({
                path: "/room"
            })
        }
        
    },
 
    computed: {
        clickable() {
            return this.nickName!=undefined && this.roomId!=undefined && this.nickName.length>0 && this.roomId.length > 0
        }
    }

}
</script>