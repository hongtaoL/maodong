// pages/typesin/typesin.js
var util = require('../../utils/util.js')
var error = util.getError();
var data_index = require('../../data/data_index.js')
var url = data_index.index;
Page({
  data: {
    picurl: [],
    lableid:null,
    lablename:null,
    openId: null,
    navTab: ["按时间", "按热度"],
    currentNavtab: "0",
    likeImg: [
      '../../images/like_empty.png',
      '../../images/like_full.png'
    ],
    avatarImg:[
      '../../images/F.png',
      '../../images/M.png'
    ],
    feed: [],
    feed_length: 0,
    feed1:[],
    feed1_length:0,
    currentId: 0,
    lineSize: 10,
    lineSize1: 100,
    daysbefore: 3,
    contentHeight:0,
  },
  onLoad: function (e) {
    var that = this
    this.setData({
      picurl: e.picurl,
      lableid:e.typeid,
      lablename:e.typename,
      openId: wx.getStorageSync('openId'),
    })
    if (wx.getStorageSync('openId') && wx.getStorageSync('userInfo')) {
      that.setData({
        openId: wx.getStorageSync('openId'),
        userInfo: wx.getStorageSync('userInfo'),
        hasUserInfo: true
      });
    } else {
      that.getUserInfo()
    }
    // 获取系统信息
    wx.getSystemInfo({
      success: function (res) {
        console.log(res);
        // 可使用窗口宽度、高度
        console.log('height=' + res.windowHeight);
        console.log('width=' + res.windowWidth);
        that.setData({
          // second部分高度 = 利用窗口可使用高度 - first部分高度（这里的高度单位为px）
          contentHeight: res.windowHeight - res.windowWidth / 750 * 100
        })
      }
    })
     wx.showToast({
      title: '加载中..',
      icon: 'loading',
      duration: 300
    })
    //调用网络数据，查询对应lableid的所有内容
    this.refresh();
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    var that = this
    //调用应用实例的方法获取全局数据
    //this.refresh();
    // wx.showToast({
    //   title: '加载中..',
    //   icon: 'loading',
    //   duration: 300
    // })
    this.setData({
      openId: wx.getStorageSync('openId')
    });
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  //预览图片
  previewTimeImage: function (e) {
    var that = this
    console.log(e)
    wx.previewImage({
      current: e.currentTarget.dataset.url,
      urls: that.data.feed[e.currentTarget.dataset.index].images,
      success: function (res) { }
    })
  },
  //预览图片
  previewHotImage: function (e) {
    var that = this
    console.log(e)
    wx.previewImage({
      current: e.currentTarget.dataset.url,
      urls: that.data.feed1[e.currentTarget.dataset.index].images,
      success: function (res) { }
    })
  },
    //发布按钮
  plusTap: function () {
    var that = this
    if (wx.getStorageSync('openId')) {
      wx.navigateTo({
        url: '../subtwitter/subtwitter?typeid='+that.data.lableid,
      })
    } else {
      wx.showModal({
        title: '--提醒--',
        content: error.errorcode[4].errorname,
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            console.log(error.errorcode[4].errorid + '用户点击确定')
          }
        }
      })
    }
  },
  //获取用户信息
  getUserInfo: function () {
    var that = this
    if (wx.getStorageSync('openId')){
      that.plusTap()
    }else{
      this.userRegister()
    }
  },
  //用户信息注册
  userRegister: function () {
    console.log("my_userRegister")
    var that = this
    wx.login({
      success: res => {
        that.data.code = res.code
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
                      code: that.data.code,
                      nickName: res.userInfo.nickName,
                      gender: res.userInfo.gender,
                    },
                    method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                    // header: {}, // 设置请求的 header
                    success: function (res) {
                      // success 保存用户信息
                      if (res.data.userid) {//运行正常
                        console.log(res.data.nickname)
                        wx.setStorageSync('openId', res.data.userid)
                        wx.setStorageSync('userInfo', res.data)
                        that.setData({
                          userInfo: wx.getStorageSync('userInfo'),
                          openId: wx.getStorageSync('openId'),
                          hasUserInfo: true
                        })
                        that.plusTap()
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
   //tab切换
  switchTab: function (e) {
    this.setData({
      currentNavtab: e.currentTarget.dataset.idx
    });
    this.refresh();
  },
  //评论按钮
  CommentsTap: function (res) {
    wx.navigateTo({
      url: '../content/content?articleid='+res.currentTarget.dataset.articleid,
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
      if (that.data.currentNavtab == 0) {
        this.setData({
          feed: feeds
        })
      } else {
        this.setData({
          feed1: feeds
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
      if (that.data.currentNavtab == 0) {
        this.setData({
          feed: feeds
        })
      } else {
        this.setData({
          feed1: feeds
        })
      }
      console.log("flase")
    }
    wx.request({
      url: url.urlstr +'updateFavourCountServlet',
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
          content: error.errorcode[9].errorname,
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              console.log(error.errorcode[9].errorid + '用户点击确定')
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
            url: url.urlstr +'removeArticleServlet',
            data: {
              articleid: event.currentTarget.dataset.deleteId
            },
            //header: {
            //'Content-Type': 'application/json'
            //},
            success: function (res) {
              if (res.data.status == 'success') {
                that.refresh();
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
  upper: function () {
    wx.showNavigationBarLoading()
    this.refresh();
    this.setData({
      openId: wx.getStorageSync('openId')
    });
    console.log("upper");
    setTimeout(function () { wx.hideNavigationBarLoading(); wx.stopPullDownRefresh(); }, 2000);
  },
  lower: function (e) {
    wx.showNavigationBarLoading();
    var that = this;
    setTimeout(function () { wx.hideNavigationBarLoading(); that.nextLoad(); }, 1000);
    console.log("lower")
  },
  //使用网络请求数据, 实现首页刷新(currentId==0)
  getOnLineData1: function () {
    var that = this
    var i = 0
    var j = 0
    wx.request({
      url: url.urlstr +'showArticlePageByLableServlet',
      data: {
        currentId: 0,
        lableid:that.data.lableid,
        lineSize: that.data.lineSize
      },
      //header: {
      //'Content-Type': 'application/json'
      //},
      success: function (res) {

        for (i = 0; i < res.data.length; i++) {
          for (j = 0; j < res.data[i].favourpeople.length; j++) {
            if (res.data[i].favourpeople[j] == wx.getStorageSync('openId')) {
              res.data[i].favourstatus = 'true';
              break;
            }
          }
        }
        that.setData({
          feed: res.data,
          feed_length: res.data.length
        })
        if (res.data.length > 0) {
          that.setData({
            currentId: res.data[res.data.length - 1].articleid
          })
        }
        console.log("getOnLineData1success")
      },
      fail: function (res) {
        console.log("getOnLineData1failed")
      }
    })
  },
//使用网络请求数据, 实现首页加载
  getOnLineData2: function () {
    var that = this
    var i = 0
    var j = 0
    wx.request({
      url: url.urlstr +'showArticlePageByLableServlet',
      data: {
        currentId: that.data.currentId,
        lableid:that.data.lableid,
        lineSize: that.data.lineSize
      },
      //header: {
      //'Content-Type': 'application/json'
      //},
      success: function (res) {
        if (res.data.length > 0) {
          for (i = 0; i < res.data.length; i++) {
            for (j = 0; j < res.data[i].favourpeople.length; j++) {
              if (res.data[i].favourpeople[j] == wx.getStorageSync('openId')) {
                res.data[i].favourstatus = 'true';
                break;
              }
            }
          }
          var next_data = res.data;
          that.setData({
            currentId: res.data[res.data.length - 1].articleid,
             feed: that.data.feed.concat(next_data),
             feed_length: that.data.feed_length + next_data.length
          })
        } else {
          wx.showToast({
            title: '到底了~',
            icon: 'success',
            duration: 1000
          })
        }
        
        console.log("getOnLineData2success")
      },
      fail: function (res) {
        console.log("getOnLineData2failed")
      }
    })
  },
    //使用网络请求数据, 实现首页按热度刷新
  getOnLineData3: function () {
    var that = this
    var i = 0
    var j = 0
    wx.request({
      url: url.urlstr +'showArticlePageByLableOBHotServlet',
      data: {
        linesize: that.data.lineSize1,
        daysbefore: that.data.daysbefore,
        lableid:that.data.lableid,
      },
      //header: {
      //'Content-Type': 'application/json'
      //},
      success: function (res) {

        for (i = 0; i < res.data.length; i++) {
          for (j = 0; j < res.data[i].favourpeople.length; j++) {
            if (res.data[i].favourpeople[j] == wx.getStorageSync('openId')) {
              res.data[i].favourstatus = 'true';
              break;
            }
          }
        }
        that.setData({
          feed1: res.data,
          feed1_length: res.data.length
        })
        console.log("getOnLineData3success")
      },
      fail: function (res) {
        console.log("getOnLineData3failed")
      }
    })
  },
  //页面刷新
  refresh: function () {
    var that = this
    if (that.data.currentNavtab == 0) {
      that.getOnLineData1();
    } else {
      that.getOnLineData3();
    }
  },
  //加载
  nextLoad: function () {
    var that = this
    if (that.data.currentNavtab == 0){
      this.getOnLineData2();
    }
  },
  // 分享当前页面
  onShareAppMessage: function (res) {
    var that = this
    return {
      title: '快看！#'+that.data.lablename +'#这个话题又炸了！',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
})