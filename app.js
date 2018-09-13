//app.js
var util = require('utils/util.js')
var error = util.getError();
var data_index = require('data/data_index.js')
var url = data_index.index;
App({
  
  globalData: {
    code: null,
  },
  onLaunch: function () {
    var that = this
    if (wx.getStorageSync('openId') && wx.getStorageSync('userInfo')){
      
    }else{
      that.getUserInfo()
    }
  },
  onShow: function () {
   
  },
  getUserInfo: function () {
    console.log("app_getUserInfo")
    var that = this
    wx.login({
      success: res => {
        console.log(res.code)
        wx.request({
          url: url.urlstr + 'getOpenIdServlet',
          data: {
            code: res.code
          },
          method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
          // header: {}, // 设置请求的 header
          success: function (res) {
            console.log(res)
            // success 保存用户信息
            if (res.data.userid) {//运行正常
              wx.request({
                url: url.urlstr + 'showUserInfoServlet',
                data: {
                  openId: res.data.userid
                },
                method: 'GET', 
                header: {
                'Content-Type': 'application/json'
                },
                success: function (res) {
                  if (res.data){
                    wx.setStorageSync("openId", res.data.userid)
                    console.log("openId" + res.data.userid)
                    console.log(res.data.nickname)
                    wx.setStorageSync('userInfo', res.data)
                    console.log(wx.getStorageSync('userInfo'))
                  }else{
                    that.userRegister()
                  }
                }
              })
            }
          },
          fail: function (res) {
            //连接服务器失败，弹出提示信息
            wx.showModal({
              title: '--提示--' + error.errorcode[3].errorid,
              content: error.errorcode[3].errorname,
              success: function (res) {
                if (res.confirm) {
                  console.log(error.errorcode[3].errorid + '用户点击确定')
                } else console.log(error.errorcode[3].errorid + '用户点击取消')
              }
            })
          }
        })
      }
    })
    
  },
  //用户信息注册
  userRegister: function (openId) {
    console.log("app_userRegister")
    var that = this
    wx.login({
      success: res => {
        that.globalData.code = res.code
        //获取失败则调用用户注册
        wx.getSetting({
          success: res => {
            if (res.authSetting['scope.userInfo']) {
              // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
              wx.getUserInfo({
                success: res => {
                  wx.request({
                    url: url.urlstr + 'registerServlet',
                    data: {
                      avatar: res.userInfo.avatarUrl,
                      code: that.globalData.code,
                      nickName: res.userInfo.nickName,
                      gender: res.userInfo.gender,
                    },
                    method: 'POSt', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                    // header: {}, // 设置请求的 header
                    success: function (res) {
                      // success 保存用户信息
                      if (res.data.userid) {//运行正常
                        wx.setStorageSync('openId', res.data.userid)
                        wx.setStorageSync('userInfo', res.data)
                      } else {//用户id为空，数据库插入操作失败
                        wx.showModal({
                          title: '--提醒--',
                          content: error.errorcode[2].errorname,
                          success: function (res) {
                            if (res.confirm) {
                              console.log(error.errorcode[2].errorid + '用户点击确定')
                            } else console.log(error.errorcode[2].errorid + '用户点击取消')
                          }
                        })
                      }
                    },
                    fail: function (res) {
                      //连接服务器失败，弹出提示信息
                      wx.showModal({
                        title: '--提醒--',
                        content: error.errorcode[3].errorname,
                        success: function (res) {
                          if (res.confirm) {
                            console.log(error.errorcode[3].errorid + '用户点击确定')
                          } else console.log(error.errorcode[3].errorid + '用户点击取消')
                        }
                      })
                    }
                  })
                }
              })
            } else {
              console.log("没有授权")
            }
          }
        })
      }
    })
  },
})
