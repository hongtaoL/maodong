// types.js

Page({
  data: {
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    typeitems: [],
    openId:null,
  },
onLoad: function () {
console.log('onLoad')
    var that = this
     //调用应用实例的方法获取全局数据
    wx.showToast({
      title: '加载中..',
      icon: 'loading',
      duration: 300
    })
    this.refresh();
    this.setData({
      openId: wx.getStorageSync('openId')
    });

  },
  //页面重新显示
  onShow: function () {
    var that = this
    //调用应用实例的方法获取全局数据
    this.refresh();
    wx.showToast({
      title: '加载中..',
      icon: 'loading',
      duration: 300
    })
     console.log('onshow')
  },
  //使用网络请求数据, 实现首页刷新
  refresh: function () {
    var that = this
    wx.request({
      url: 'https://maodong.yunzjin.com/schoolservice/showLablesServlet',
      success: function (res) {
        that.setData({
          typeitems: res.data
        })
        console.log("getOnLineDatasuccess")
      },
      fail: function (res) {
        console.log("getOnLineDatafailed")
      }
    })
  },
  //事件处理函数
  typesIn: function (res) {
    wx.navigateTo({
      url: '../typesin/typesin?typeid=' + res.typeid,
      success: function (res) {
        // success
        wx.showModal({
          title: '提示',
          content: res.typeid,
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定')
            }
          }
        })
      },
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      }
    })
  },
  typesOff: function () {
    wx.showModal({
      title: '提示',
      content: '敬请期待',
      showCancel: false,
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        }
      }
    })
  }



}
)