//index.js
var util = require('../../utils/util.js')
var error = util.getError();
var data_index = require('../../data/data_index.js')
var url = data_index.index;
Page({
  data: {
    contentHeight:0,
    navTab: ["按时间", "按热度",],
    currentNavtab: "0",
    imgUrls: [],
    likeImg: [
      '../../images/like_empty.png',
      '../../images/like_full.png'
    ],
    avatarImg: [
      '../../images/F.png',
      '../../images/M.png'
    ],
    indicatorDots: true,
    autoplay: true,
    id: 1,
    interval: 5000,
    duration: 1000,
    feed: [],
    feed_length: 0,
    feed1: [],
    feed1_length: 0,
    currentId: "0",
    lineSize: 10,
    lineSize1: 100,
    daysbefore: 3,
    openId: null,
    admin1:'oDfPr0FviysZr4jqtsRn41LTbJmU',
    admin2:'oDfPr0OMIfxpwLFJ-e_I8JufLOMY',
    showTips: true,
  },
  onLoad: function (options) {
    console.log('onLoad')
    if (options.articleId) {
      wx.navigateTo({
        url: '../content/content?articleid=' + options.articleId,
      })
    }
    var that = this
    //调用应用实例的方法获取全局数据
    wx.showToast({
      title: '加载中..',
      icon: 'loading',
      duration: 300
    })
    this.refresh();
    this.getBanners();
    this.setData({
      openId: wx.getStorageSync('openId')
    });
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
    setTimeout(function () {
      this.showTips = false;
      this.setData({
        showTips: this.showTips
      });
    }.bind(this), 3000);
  },
  onShow: function () {
    var that = this
    //调用应用实例的方法获取全局数据
    // this.refresh();
    // wx.showToast({
    //   title: '加载中..',
    //   icon: 'loading',
    //   duration: 600
    // })
    console.log('onshow')
    this.setData({
      openId: wx.getStorageSync('openId')
    });
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
  //tab切换
  switchTab: function (e) {
    this.setData({
      currentNavtab: e.currentTarget.dataset.idx
    });
    this.refresh();
  },
  showTa:function(e){
    console.log(e)
    wx.navigateTo({
      url: '/pages/Ta/Ta?open_id=' + e.currentTarget.dataset.openid,
    })
  },
  // 分享当前页面
  onShareAppMessage: function (res) {
    return {
      title: '快来看看猫洞里又发生了什么',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  //发布按钮
  plusTap: function () {
    if (wx.getStorageSync('openId')) {
      wx.navigateTo({
        url: '../twitter/twitter',
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
  // banner详情
  banner: function (e) {
    var that = this
    var index = e.currentTarget.dataset.index
    var urll = '../banner/banner?url=' + escape(that.data.imgUrls[index].picurl1);
    console.log(urll)
    wx.navigateTo({
      url: urll,
    })
  },
  //评论按钮
  CommentsTap: function (res) {
    wx.navigateTo({
      url: '../content/content?articleid=' + res.currentTarget.dataset.articleid,
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
              articleid: event.currentTarget.dataset.deleteId,
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

  //使用网络请求数据, 实现Banner加载
  getBanners: function () {
    var that = this
    wx.request({
      url: url.urlstr +'showBannersServlet',
      success: function (res) {
        that.setData({
          imgUrls: res.data
        })
        console.log("getBannerDatasuccess")
      },
      fail: function (res) {
        console.log("getBannerDatafailed")
      }
    })
  },
  //使用网络请求数据, 实现首页刷新(currentId==0)
  getOnLineData1: function () {
    var that = this
    var i = 0
    var j = 0
    wx.request({
      url: url.urlstr +'showArticlePageServlet',
      data: {
        currentId: "0",
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
            currentId: res.data[res.data.length - 1].updatetime
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
      url: url.urlstr +'showArticlePageServlet',
      data: {
        currentId: that.data.currentId,
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
            currentId: res.data[res.data.length - 1].updatetime,
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
  //使用网络请求数据, 实现首页按热度刷新(currentId==0)
  getOnLineData3: function () {
    var that = this
    var i = 0
    var j = 0
    wx.request({
      url: url.urlstr +'showArticlePageOBHotServlet',
      data: {
        linesize: that.data.lineSize1,
        daysbefore: that.data.daysbefore
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
  //页面加载
  nextLoad: function () {
    var that =this
    if(that.data.currentNavtab == 0){
      that.getOnLineData2();
    }
  },

});

