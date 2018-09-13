//input.js
var app = getApp()
var util = require('../../utils/util.js')
var error = util.getError();
var data_index = require('../../data/data_index.js')
var url = data_index.index;
Page({
  data: {
    focus: false,
    inputValue: '写下此刻的想法...',//textarea的值
    types: ['default', 'primary', 'warn'],
    radioValue: '',//分类标签的值
    disabled: true,//提交按钮初始不可用
    loading: false,//提交动画
    typeitems: [],
    userInfo: null
  },
  onLoad: function () {
    this.getLables();
    console.log('twitteronLoad')
    var that = this
    //检查用户信息，判断用户发布权限 
    console.log('twitteronLoad' + wx.getStorageSync('openId'))
    if (!wx.getStorageSync('openId')) {
      console.log('openId:' + app.globalData.openId)
      //失败，弹出提示信息
      wx.showModal({
        title: '--提醒--',
        content: error.errorcode[4].errorname,
        confirmText: '好的',
        cancelText: '返回',
        success: function (res) {
          if (res.confirm) {
            console.log(error.errorcode[4].errorid + '用户点击授权')
            //调用授权方法
            app.getAccredit()
          } else {
            console.log(error.errorcode[4].errorid + '用户点击返回')
            //返回首页
            wx.redirectTo({
              url: '../index/index'
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
    if (e.detail.value && this.data.radioValue)
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
  //获取类别
  getLables: function () {
    var that = this 
    wx.request({
      url: url.urlstr +'showLablesServlet',
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
  formSubmit: function (e) {
    var that = this
    //获取用户信息，成功则发送连接请求
    if (wx.getStorageSync('openId')) {
      wx.request({
        url: url.urlstr +'addArticleServlet',
        data: {
          anonymous: e.detail.value.anonymous,
          content: e.detail.value.content,
          userid: wx.getStorageSync('openId'),
          lableid: e.detail.value.lableid
        },
        method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        header: {}, // 设置请求的 header
        success: function (res) {
          // success 应返回主页面
          if (res.data.error) {//判断数据库异常
            //数据库抛出异常，弹出提示信息
            wx.showModal({
              title: '--提醒--',
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
            } else if (res.data.status == '3') {//发布失败，提示
              wx.showModal({
                title: '提示',
                content: '请注意维护文明网络环境~',
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
            }else{
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
            title: '--提醒--',
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