//my.js
var util = require('../../utils/util.js')
var error = util.getError();
var data_index = require('../../data/data_index.js')
var url = data_index.index;
//获取应用实例
const app = getApp()
Page({
  data: {
    userInfo: null,
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    // navTab: ["我的发言", "我的收藏","精彩推荐"],
    navTab: ["Ta的发言"],
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
    hot:0,
  },
  onLoad: function (option) {
    var that = this
    that.setData({
      openId:option.open_id
    })
    console.log('onLoad')
    that.getUserInfo()
    this.getMyArticleList();

  },
  getUserInfo: function () {
    var that = this
    if (that.data.openId) {//运行正常
      wx.request({
        url: url.urlstr + 'showUserInfoServlet',
        data: {
          openId: that.data.openId
        },
        method: 'GET',
        header: {
          'Content-Type': 'application/json'
        },
        success: function (res) {
          if (res.data) {
            console.log("openId" + res.data.userid)
            console.log(res.data.nickname)
            that.setData({
              userInfo: res.data,
              hasUserInfo:true
            })
          } else {
            console.log("获取Ta失败...")
          }
        }
      })
    }
  },
  //预览我的发言图片
  previewImage: function (e) {
    var that = this
    console.log(e)
    wx.previewImage({
      current: e.currentTarget.dataset.url,
      urls: that.data.PPA[e.currentTarget.dataset.index].images,
      success: function (res) { }
    })
  },
  onShow: function () {
    // var that = this
    // if (that.data.currentNavtab == '0') {
    //   that.getMyArticleList();
    // } else if (that.data.currentNavtab == '1') {
    //   that.getCollectionList();
    // } else {
    //   that.getRecommendList();
    // }
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
      url: url.urlstr + 'showMyArticleServlet',
      data: {
        userid: that.data.openId
      },
      //header: {
      //'Content-Type': 'application/json'
      //},
      success: function (res) {
        var hot = 0
        for (i = 0; i < res.data.length; i++) {
          if (res.data[i].anonymous=='false'){
            hot = hot + res.data[i].favour + res.data[i].reply
          }
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
          hot:hot
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
      url: url.urlstr + 'showCollectionArticleServlet',
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
      url: url.urlstr + 'showRecommendArticleServlet',
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
      url: url.urlstr + 'updateFavourCountServlet',
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
            title: '--提醒--',
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
          title: '--提醒--',
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
