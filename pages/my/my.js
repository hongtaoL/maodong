//my.js
var util = require('../../utils/util.js')
var error = util.getError();
//获取应用实例
const app = getApp()
Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    code: null,
    navTab: ["我的发言", "我的收藏","精彩推荐"],
    currentNavtab: "0",
    likeImg: [
      '../../images/like_empty.png',
      '../../images/like_full.png'
    ],
    avatarImg: [
      '../../images/F.png',
      '../../images/M.png'
    ],
    PPA: [],
    PPA_length: 0,
    MYC: [],
    MYC_length: 0,
    PRC: [],
    PRC_length: 0,
    openId: null,
  },
  onLoad: function () {
    console.log('onLoad')
    this.setData({
      code: app.globalData.code,
    })
    this.setData({
      openId: wx.getStorageSync('openId')
    });
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    }
    //  else {
    //   // 在没有 open-type=getUserInfo 版本的兼容处理
    //   wx.getUserInfo({
    //     success: res => {
    //       app.globalData.userInfo = res.userInfo
    //       this.setData({
    //         userInfo: res.userInfo,
    //         hasUserInfo: true
    //       })
    //     }
    //   })
    // }
    this.getMyArticleList();
  },
  getRegister: function () {
    var that = this
    console.log("avatarUrl=" + that.data.userInfo.avatarUrl)
    wx.request({
      url: 'http://localhost:8080/schoolservice/registerServlet',
      data: {
        avatar: that.data.userInfo.avatarUrl,
        code: that.data.code,
        nickName: that.data.userInfo.nickName,
        gender: that.data.userInfo.gender,
      },
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: {}, // 设置请求的 header
      success: function (res) {
        // success 保存用户信息
        if (res.data.userid) {//运行正常
          that.data.openId = res.data.userid
          console.log("openid=" + that.data.openId)
          wx.setStorageSync('openId', that.data.openId)
        } else {//用户id为空，数据库插入操作失败
          wx.showModal({
            title: '错误代码：' + error.errorcode[2].errorid,
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
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
    console.log('getRegister')
    this.getRegister()
  },
  onShow: function () {
    var that = this
    if (that.data.currentNavtab == '0') {
      that.getMyArticleList();
    } else if (that.data.currentNavtab == '1') {
      that.getCollectionList();
    } else {
      that.getRecommendList();
    }
  },
  //标签切换
  switchTab: function (e) {
    var that = this
    this.setData({
      currentNavtab: e.currentTarget.dataset.idx
    });
    if (this.data.currentNavtab == '0') {
      that.getMyArticleList();
    } else if (this.data.currentNavtab == '1') {
      that.getCollectionList();
    } else {
      that.getRecommendList();
    }
  },
  //获取个人发布列表
  getMyArticleList: function () {
    var that = this
    var i = 0
    var j = 0
    wx.request({
      url: 'http://localhost:8080/schoolservice/showMyArticleServlet',
      data: {
        userid: that.data.openId
      },
      //header: {
      //'Content-Type': 'application/json'
      //},
      success: function (res) {

        for (i = 0; i < res.data.length; i++) {
          for (j = 0; j < res.data[i].favourpeople.length; j++) {
            if (res.data[i].favourpeople[j] == that.data.openId) {
              res.data[i].favourstatus = 'true';
              break;
            }
          }
        }
        that.setData({
          PPA: res.data,
          PPA_length: res.data.length,
        })
        console.log("getOnLineDatasuccess")
      },
      fail: function (res) {
        console.log("getOnLineDatafailed")
      }
    })
  },
  //获取收藏列表
  getCollectionList: function () {
    var that = this
    var i = 0
    var j = 0
    wx.request({
      url: 'http://localhost:8080/schoolservice/showCollectionArticleServlet',
      data: {
        userid: that.data.openId
      },
      //header: {
      //'Content-Type': 'application/json'
      //},
      success: function (res) {

        for (i = 0; i < res.data.length; i++) {
          for (j = 0; j < res.data[i].favourpeople.length; j++) {
            if (res.data[i].favourpeople[j] == that.data.openId) {
              res.data[i].favourstatus = 'true';
              break;
            }
          }
        }
        that.setData({
          MYC: res.data,
          MYC_length: res.data.length,
        })
        console.log("getOnLineDatasuccess")
      },
      fail: function (res) {
        console.log("getOnLineDatafailed")
      }
    })
  },
  //获取精彩推荐列表
  getRecommendList: function () {
    var that = this
    var i = 0
    var j = 0
    wx.request({
      url: 'http://localhost:8080/schoolservice/showRecommendArticleServlet',
      data: {
        userid: that.data.openId
      },
      //header: {
      //'Content-Type': 'application/json'
      //},
      success: function (res) {

        for (i = 0; i < res.data.length; i++) {
          for (j = 0; j < res.data[i].favourpeople.length; j++) {
            if (res.data[i].favourpeople[j] == that.data.openId) {
              res.data[i].favourstatus = 'true';
              break;
            }
          }
        }
        that.setData({
          PRC: res.data,
          PRC_length: res.data.length,
        })
        console.log("getOnLineDatasuccess")
      },
      fail: function (res) {
        console.log("getOnLineDatafailed")
      }
    })
  },
  //点赞+按钮
  AddLikeTap: function (e) {
    var that = this
    var feeds = e.currentTarget.dataset.updateitem;
    var id = e.currentTarget.dataset.updateid;
    var count = null;
    var favourpeople = feeds[id].favourpeople;
    var articleid = feeds[id].articleid;
    //已经点过赞，点击数量减一
    if (feeds[id].favourstatus == 'true') {
      count = feeds[id].favour - 1;
      feeds[id].favourstatus = 'flase';
      feeds[id].favour = count;
      //更新点赞列表
      for (var i = 0; i < feeds[id].favourpeople.length; i++) {
        if (feeds[id].favourpeople[i] == that.data.openId) {
          favourpeople.splice(i, 1);
        }
      }
      //更新本地数据
      if (this.data.currentNavtab == '0') {
        this.setData({
          PPA: feeds
        })
      } else if (this.data.currentNavtab == '1') {
        this.setData({
          MYC: feeds
        })
      } else {
        this.setData({
          PRC: feeds
        })
      }
      console.log("true")
    } else {//没有点过赞，点击数量加一
      count = feeds[id].favour + 1;
      feeds[id].favourstatus = 'true';
      feeds[id].favour = count;
      //更新点赞列表
      favourpeople.push(that.data.openId);
      //更新本地数据
      if (this.data.currentNavtab == '0') {
        this.setData({
          PPA: feeds
        })
      } else if (this.data.currentNavtab == '1') {
        this.setData({
          MYC: feeds
        })
      } else {
        this.setData({
          PRC: feeds
        })
      }
      console.log("flase")
    }
    wx.request({
      url: 'http://localhost:8080/schoolservice/updateFavourCountServlet',
      data: {
        articleid: articleid,
        count: count,
        fp: that.data.openId
      },
      //header: {
      //'Content-Type': 'application/json'
      //},
      success: function (res) {
        if (res.data.error) {//判断数据库异常
          //数据库抛出异常，弹出提示信息
          wx.showModal({
            title: '错误代码：' + error.errorcode[7].errorid,
            content: error.errorcode[7].errorname,
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                console.log(error.errorcode[7].errorid + '用户点击确定')
              }
            }
          })
        } else {
          if (res.data.status == 'success') {
            //that.refresh();
            console.log("updatelikecountsuccess")
          }
        }
      },
      fail: function (res) {
        console.log("updatelikecountfailed")
        wx.showModal({
          title: '错误代码：' + error.errorcode[11].errorid,
          content: error.errorcode[11].errorname,
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              console.log(error.errorcode[11].errorid + '用户点击确定')
            }
          }
        })
      }
    })
  },
  //删除按钮
  deleteTap: function (event) {
    var that = this
    wx.showModal({
      title: '提示',
      content: '确定要删除本条信息？',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: 'http://localhost:8080/schoolservice/removeArticleServlet',
            data: {
              articleid: event.currentTarget.dataset.deleteId
            },
            //header: {
            //'Content-Type': 'application/json'
            //},
            success: function (res) {
              if (res.data.status == 'success') {
                if (that.data.currentNavtab == '0') {
                  that.getMyArticleList();
                } else if (that.data.currentNavtab == '1') {
                  that.getCollectionList();
                } else {
                  that.getRecommendList();
                }
                console.log('用户点击确定，消息被删除')
              }
            },
            fail: function (res) {
              console.log("deletearticlefailed")
            }
          })

        }
      }
    })
  },
  //跳转文章详情页-评论按钮
  CommentsTap: function (res) {
    wx.navigateTo({
      url: '../content/content?articleid=' + res.currentTarget.dataset.articleid,
    })
  },
  //上拉刷新(未实现)
  upper: function () {
    var that = this
    wx.showNavigationBarLoading()
    if (that.data.currentNavtab == '0') {
      that.getMyArticleList();
    } else if (that.data.currentNavtab == '1') {
      that.getCollectionList();
    } else {
      that.getRecommendList();
    }
    console.log("upper");
    setTimeout(function () { wx.hideNavigationBarLoading(); wx.stopPullDownRefresh(); }, 2000);
  },
})
