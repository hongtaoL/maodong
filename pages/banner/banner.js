// pages/banner/banner.js
Page({
  data:{
    img:null,
    width:null,
    height:null

  },
  onLoad:function(e){
    // 页面初始化 e为页面跳转所带来的参数
    this.setData({
      img: e.picurl1,
      width: e.width,
      height: e.height
    })
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})