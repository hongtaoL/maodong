//app.js
var util = require('utils/util.js')
var error = util.getError();
var data_index = require('data/data_index.js')
var url = data_index.index;
App({
  
  globalData: {
    userInfo: null,
    code: null,
    openId: null
  },
  onLaunch: function () {
    // 展示本地存储能力
    this.globalData.openId = wx.getStorageSync('openId')
   
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        this.globalData.code = res.code
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          this.getOpenId()
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  onShow: function () {
    var that = this
    this.globalData.openId = wx.getStorageSync('openId')
  },
  getOpenId: function () {
    var that = this
    wx.request({
      url: url.urlstr + 'schoolservice/getOpenIdServlet',
      data: {
        code: that.globalData.code
      },
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: {}, // 设置请求的 header
      success: function (res) {
        // success 保存用户信息
        if (res.data.userid) {//运行正常
          that.globalData.openId = res.data.userid
          wx.setStorageSync('openId', that.globalData.openId)
        } 
      },
      fail: function (res) {
        //连接服务器失败，弹出提示信息
        wx.showModal({
          title: '错误代码：' + error.errorcode[3].errorid,
          content: error.errorcode[3].errorname,
          success: function (res) {
            if (res.confirm) {
              console.log(error.errorcode[3].errorid + '用户点击确定')
            } else console.log(error.errorcode[3].errorid + '用户点击取消')
          }
        })
      }
    })
  },
})

