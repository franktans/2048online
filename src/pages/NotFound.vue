<template>
    <div>啊哦，页面不存在！</div>
</template>

<style lang="scss" scoped>
%position-center {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
}
div {
    @extend %position-center;
    font-size: 2rem;
    border: 0.1rem solid #f1deb5;
    padding: 1rem;
}
</style>