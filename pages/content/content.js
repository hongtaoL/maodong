// pages/content/content.js
var util = require('../../utils/util.js')
var error = util.getError();
var data_index = require('../../data/data_index.js')
var url = data_index.index;
var app = getApp();
Page({
  data: {
    likeImg: [
      '../../images/like_empty.png',
      '../../images/like_full.png'
    ],
    avatarImg: [
      '../../images/F.png',
      '../../images/M.png'
    ],
    collectionImg: [
      '../../images/star_empty.png',
      '../../images/star_full.png'
    ],
    articleid: null,
    feed: [],
    feed_length: 2,
    content: [],
    userInfo: {},
    openId: null,
    inputValue: null,
    commhidden: true,
    tabdisable:true,
    collectionstatus: 'false',
    admin1: 'oDfPr0FviysZr4jqtsRn41LTbJmU',
    admin2: 'oDfPr0OMIfxpwLFJ-e_I8JufLOMY',
    scrollHeight:'1100rpx',
    commentAreaHeight:'100rpx',
  },
  onLoad: function (e) {
    var that = this
    // 页面初始化 e为页面跳转所带来的参数
    this.setData({
      articleid: e.articleid,
      openId: wx.getStorageSync('openId'),
      userInfo: wx.getStorageSync('userInfo'),
    })
    this.getArticle();

    // 获取系统信息
    wx.getSystemInfo({
      success: function (res) {
        console.log(res);
        // 可使用窗口宽度、高度
        console.log('height=' + res.windowHeight);
        console.log('width=' + res.windowWidth);
        that.setData({
          scrollHeight: res.windowHeight - res.windowWidth / 750 * 100 +'px',
        })
      }
    })
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
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
  //评论输入框开始输入
  textinput: function (e) {
    if (wx.getStorageSync('openId')) {
    this.setData({
      inputValue: e.detail.value
    });
    if (this.data.inputValue)
      this.setData({
        commhidden: false,
        tabdisable: false,
        commentAreaHeight:'200rpx'
      }); else this.setData({
        commhidden: true,
        tabdisable: true,
      commentAreaHeight: '100rpx'
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
  // 分享当前页面
  onShareAppMessage: function (res) {
    var that = this
    return {
      title: '快来看看猫洞里又发生了什么',
      path: 'pages/index/index?articleId=' + that.data.content[0].articleid,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  //提交评论
  formSubmit: function (e) {
    this.setData({
      commhidden: true,
    })
    var that = this
    var reply = null;
    var replyId = -1;
    var replycontent = this.data.feed;
    var replycount = this.data.content[0].reply + 1;


    //将内容组成json对象
    reply = { "anonymous": e.detail.value.switch, "articleid": that.data.articleid, "userid": that.data.openId, "gender": that.data.userInfo.gender, "nickname": that.data.userInfo.nickname, "avatar": that.data.userInfo.avatar, "content": e.detail.value.input, "pubdate": this.getNowFormatDate() };
    //加到数组中
    replycontent.push(reply);
    console.log(replycount);
    wx.request({
      url: url.urlstr +'updateReplyContentServlet',
      data: {
        articleid: that.data.articleid,
        rcontent: reply,
        replyid:replyId,
        replycount: replycount
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
          that.getArticle();
          console.log("getArticlesuccess")
        }
      },
      fail: function (res) {
        console.log("getArticlefailed")
        wx.showModal({
          title: '--提醒--',
          content: error.errorcode[10].errorname,
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              console.log(error.errorcode[10].errorid + '用户点击确定')
            }
          }
        })
      }
    })

    console.log(replycontent);
  },
  //点击回复Ta
  replyTap:function(e){
    console.log(e)
    this.setData({
      'inputValue': '@'+e.currentTarget.dataset.nickname+' ',
    })
  },
  // 清除评论框内容
  clearInputEvent: function (res) {
    this.setData({
      'inputValue': null,
      'tabdisable': true
    })
  },

  //返回首页
  backTop: function() {
    wx.switchTab({
      url: 'pages/index/index',
    })
  },
  
  //删除评论
  deleteComment: function (e) {
    var that = this
    if (e.currentTarget.dataset.userid == that.data.openId||that.data.openId==that.data.admin1||that.data.openId==that.data.admin2) {
      wx.showModal({
        title: '提示',
        content: "确认删除评论？",
        success: function (res) {
          if (res.confirm) {

            var reply = null;
            var replyId = null;
            //获得所有评论
            var replycontent = that.data.feed;
            //获得要删除的对象
            reply = replycontent[e.currentTarget.dataset.replyid];
            //获得要删除的id
            replyId = e.currentTarget.dataset.replyid;
            //删除要删除的对象
            replycontent.splice(e.currentTarget.dataset.replyid, 1);
            //评论数减一
            var replycount = that.data.content[0].reply - 1;
            //更新本地数据
            that.setData({
              feed:  replycontent
            })
            //发送删除请求
            wx.request({
              url: url.urlstr +'updateReplyContentServlet',
              data: {
                articleid: that.data.articleid,
                rcontent: reply,
                replyid: replyId,
                replycount: replycount
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
                  that.getArticle();
                  console.log("getArticlesuccess")
                }
              },
              fail: function (res) {
                console.log("getArticlefailed")
                wx.showModal({
                  title: '--提醒--' ,
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
            console.log('用户点击确定')
          }
        }
      })
    } else { }
  },
  //收藏+按钮
  AddCollectionsTap: function (e) {
    var that = this
    var feeds = e.currentTarget.dataset.updateitem;
    var id = e.currentTarget.dataset.updateid;
    var collectionstatus = null;
    var collection = feeds[id].collection;
    var articleid = feeds[id].articleid;
    //已经收藏过，收藏状态更改为0
    if (that.data.collectionstatus == 'true') {
      collectionstatus = 0;
      that.setData({
        collectionstatus: 'flase'
      })
      //更新收藏列表
      for (var i = 0; i < collection.length; i++) {
        if (collection[i] == that.data.openId) {
          collection.splice(i, 1);
        }
      }
      //更新本地数据
      this.setData({
        content: feeds
      })
      console.log("true")
    } else {//没有收藏过，收藏状态更改为1
      collectionstatus = 1;
      that.setData({
        collectionstatus: 'true'
      })
      //更新收藏列表
      collection.push(that.data.openId);
      //更新本地数据
      this.setData({
        content: feeds
      })
      console.log("flase")
    }
    wx.request({
      url: url.urlstr +'updateCollectionServlet',
      data: {
        articleid: articleid,
        status: collectionstatus,
        userid: that.data.openId
      },
      //header: {
      //'Content-Type': 'application/json'
      //},
      success: function (res) {
        if (res.data.error) {//判断数据库异常
          //数据库抛出异常，弹出提示信息
          wx.showModal({
            title: '--提醒--' ,
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
            if (that.data.collectionstatus == 'true') {
              wx.showToast({
                title: '已收藏',
                icon: 'success',
                duration: 1000
              })
            } else {
              wx.showToast({
                title: '取消收藏',
                icon: 'success',
                duration: 1000
              })
            }

          }
        }
      },
      fail: function (res) {
        console.log("updatelikecountfailed")
        wx.showModal({
          title: '--提醒--',
          content: error.errorcode[12].errorname,
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              console.log(error.errorcode[12].errorid + '用户点击确定')
            }
          }
        })
      }
    })
  },
  //点击头像跳转Ta的页面
  showTa: function (e) {
    console.log(e)
    wx.navigateTo({
      url: '/pages/Ta/Ta?open_id=' + e.currentTarget.dataset.openid,
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
      this.setData({
        content: feeds
      })
      console.log("true")
    } else {//没有点过赞，点击数量加一
      count = feeds[id].favour + 1;
      feeds[id].favourstatus = 'true';
      feeds[id].favour = count;
      //更新点赞列表
      favourpeople.push(that.data.openId);
      //更新本地数据
      this.setData({
        content: feeds
      })
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
  //获取当前时间
  getNowFormatDate: function () {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
      month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
      strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
      + " " + date.getHours() + seperator2 + date.getMinutes()
      + seperator2 + date.getSeconds();
    return currentdate;
  },
  //获取文章详情及回复
  getArticle: function () {
    var that = this
    var i = 0
    var j = 0
    wx.request({
      url: url.urlstr +'showArticleInfoServlet',
      data: {
        articleid: that.data.articleid,
      },
      //header: {
      //'Content-Type': 'application/json'
      //},
      success: function (res) {
        if (res.data.error) {//判断数据库异常
          //数据库抛出异常，弹出提示信息
          wx.showModal({
            title: '--提醒--',
            content: error.errorcode[14].errorname,
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                console.log(error.errorcode[14].errorid + '用户点击确定')
                wx.navigateBack({
                  delta: 1
                })
              }
            }
          })
        } else {
          for (i = 0; i < res.data.length; i++) {
            for (j = 0; j < res.data[i].collection.length; j++) {
              if (res.data[i].collection[j] == that.data.openId) {
                that.setData({
                  collectionstatus: 'true'
                });
                break;
              }
            }
          }
          for (i = 0; i < res.data.length; i++) {
            for (j = 0; j < res.data[i].favourpeople.length; j++) {
              if (res.data[i].favourpeople[j] == that.data.openId) {
                res.data[i].favourstatus = 'true';
                break;
              }
            }
          }
          that.setData({
            feed: res.data[0].rcontent,
            content: res.data
          })
        }
        console.log("getArticlesuccess")
      },
      fail: function (res) {
        console.log("getArticlefailed")
        wx.showModal({
          title: '--提醒--',
          content: error.errorcode[13].errorname,
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              console.log(error.errorcode[13].errorid + '用户点击确定')
            }
          }
        })
      }
    })
  },
  //下发模板消息（评论后）（只能给自己发。。。）
  sendMsg: function (e) {
    var that = this
    console.log("formid:" + e.formId)
    //获取access_token
    wx.request({
      url: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wxaca635165898a9a8&secret=2fdcf14560b8f6b314a83c5b724df921',
      method: 'GET',
      success: function (res) {
        // 获取access_token成功
        console.log(res.data.access_token)
        wx.request({
          url: 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' + res.data.access_token,
          data: {
            touser: e.userid,
            template_id: '7TmbX-HuR_l-7a9_T-M1ld4EN3_EUFz5NzoNjNioJec',
            page: '/pages/content/content?articleid=' + e.articleid,
            form_id: e.formId,
            data: {
              "keyword1": {
                "value": e.content,
              },
              "keyword2": {
                "value": e.pubdate,
              },
              "keyword3": {
                "value": e.reply,
              },
            }
          },
          method: 'POST',
          success: function (res) {
            // success
            console.log('sendsuccess')
            console.log(res)
          }
        })

      }
    })

  },
})