// pages/banner/banner.js
Page({
  data:{
    url:null
  },
  onLoad:function(e){
    // 页面初始化 e为页面跳转所带来的参数
    this.setData({
      url: unescape(e.url)
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