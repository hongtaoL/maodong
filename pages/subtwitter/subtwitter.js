//input.js
var app = getApp()
var util = require('../../utils/util.js')
var error = util.getError();
Page({
  data: {
    focus: false,
    inputValue: '',//textarea的值
    types: ['default', 'primary', 'warn'],
    radioValue: '',//分类标签的值
    disabled: true,//提交按钮初始不可用
    loading: false,//提交动画
    lableid: null,
    userInfo: null
  },
  onLoad: function (e) {
    console.log('twitteronLoad')
    var that = this
    this.setData({
      lableid:e.typeid
    })
    //检查用户信息，判断用户发布权限 
    console.log('twitteronLoad' + wx.getStorageSync('openId'))
    if (!wx.getStorageSync('openId')) {
      console.log('openId:' + app.globalData.openId)
      //失败，弹出提示信息
      wx.showModal({
        title: '错误代码：' + error.errorcode[4].errorid,
        content: error.errorcode[4].errorname,
        confirmText: '授权',
        cancelText: '返回',
        success: function (res) {
          if (res.confirm) {
            console.log(error.errorcode[4].errorid + '用户点击授权')
            //调用授权方法
            app.getAccredit()
          } else {
            console.log(error.errorcode[4].errorid + '用户点击返回')
            //返回上一页
            wx.navigateBack({
            })
          }
        }
      })
    }
  },
  textblur: function (e) {
    this.setData({
      inputValue: e.detail.value
    });
    if (e.detail.value && this.data.lableid)
      this.setData({
        disabled: false
      }); else this.setData({
        disabled: true
      })
  },
  radioChange: function (e) {
    this.setData({
      radioValue: e.detail.value
    });
    if (this.data.inputValue && e.detail.value)
      this.setData({
        disabled: false
      }); else this.setData({
        disabled: true
      })
  },

  formSubmit: function (e) {
    var that = this
    //获取用户信息，成功则发送连接请求
    if (wx.getStorageSync('openId')) {
      wx.request({
        url: 'http://localhost:8080/schoolservice/addArticleServlet',
        data: {
          anonymous: e.detail.value.anonymous,
          content: e.detail.value.content,
          userid: wx.getStorageSync('openId'),
          lableid: that.data.lableid
        },
        method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        header: {}, // 设置请求的 header
        success: function (res) {
          // success 应返回主页面
          if (res.data.error) {//判断数据库异常
            //数据库抛出异常，弹出提示信息
            wx.showModal({
              title: '错误代码：' + error.errorcode[5].errorid,
              content: error.errorcode[5].errorname,
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  console.log(error.errorcode[5].errorid + '用户点击确定')
                }
              }
            })
          } else {//判断发布状态
            if (res.data.status == '1') {
              wx.showToast({
                title: '发布成功',
                icon: 'success',
                duration: 3000
              })
              //发布成功，返回首页
              wx.navigateBack({
                delta: 1, // 回退前 delta(默认为1) 页面
              })
            } else {//发布失败，提示
              wx.showModal({
                title: '提示',
                content: '发布失败，请重试',
                cancelText: '返回',
                success: function (res) {
                  if (res.confirm) {
                    console.log('发布失败,用户点击确定')
                  } else {
                    wx.navigateBack({
                      delta: 1, // 回退前 delta(默认为1) 页面
                    })
                  }
                }
              })
            }
          }
          console.log('status:' + res.data.status)
        },
        fail: function (res) {
          //连接服务器失败，弹出提示信息
          wx.showModal({
            title: '错误代码：' + error.errorcode[6].errorid,
            content: error.errorcode[6].errorname,
            cancelText: '返回',
            success: function (res) {
              if (res.confirm) {
                console.log(error.errorcode[6].errorid + '用户点击确定')
              } else {
                //返回首页
                wx.navigateBack({
                  delta: 1, // 回退前 delta(默认为1) 页面
                })
                console.log(error.errorcode[6].errorid + '用户点击取消')
              }
            }
          })
        }
      })
    } else {
      //获取用户数据失败，弹出提示信息
      wx.showModal({
        title: '提示',
        content: '获取用户信息失败，您不能发布',
        cancelText: '返回',
        success: function (res) {
          if (res.confirm) {
            console.log('获取用户信息失败,用户点击确定')
          } else {
            wx.navigateBack({
              delta: 1, // 回退前 delta(默认为1) 页面
            })
            console.log('获取用户信息失败，用户点击取消')
          }
        }
      })
    }
  }
})