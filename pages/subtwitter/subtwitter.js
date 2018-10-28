//input.js
var app = getApp()
var util = require('../../utils/util.js')
var error = util.getError();
var data_index = require('../../data/data_index.js')
var url = data_index.index;
Page({
  data: {
    anonymous:false,
    showAnonymous:0,
    focus: false,
    inputValue: null,//textarea的值
    types: ['default', 'primary', 'warn'],
    radioValue: '',//分类标签的值
    disabled: true,//提交按钮初始不可用
    loading: false,//提交动画
    typeitems:null,
    lableid: null,
    images: [],
    imagesCount: 0,
    imageInfos: [],
    temp: {},
    keys: []
  },
  onLoad: function (e) {
    console.log('twitteronLoad')
    var that = this
    this.getLables();
    this.setData({
      lableid:e.typeid
    })
    //检查用户信息，判断用户发布权限 
    console.log('twitteronLoad' + wx.getStorageSync('openId'))
    if (!wx.getStorageSync('openId')) {
      console.log('openId:' + app.globalData.openId)
      //失败，弹出提示信息
      wx.showModal({
        title: '--提醒--',
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
  //是否匿名
  switchChange: function (e) {
    console.log(e)
    this.setData({
      anonymous: e.detail.value
    })
  },
  //输入框失去焦点
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
  //预览图片
  previewImage: function (e) {
    var that = this
    console.log(e)
    wx.previewImage({
      current: e.currentTarget.dataset.url,
      urls: that.data.images,
      success: function (res) { }
    })
  },
  //选择图片
  chooseImg: function () {
    var that = this
    wx.chooseImage({
      count: 3,
      sizeType: ['compressed'],
      success: function (res) {
        console.log(res)
        var images = res.tempFilePaths
        that.setData({
          images: images,
          imagesCount: images.length
        })
        var length = that.data.images.length
        that.getImageInfo(0, length)
      },
    })
  },
  //删除图片
  imgDel: function (res) {
    var that = this
    console.log(res)
    var index = res.currentTarget.dataset.index
    that.data.images.splice(index, 1);
    that.data.imageInfos.splice(index, 1);
    that.setData({
      images: that.data.images,
      imagesCount: that.data.images.length,
      imageInfos: that.data.imageInfos
    })
  },
  //获取图片信息
  getImageInfo: function (i, l) {
    var that = this
    wx.getImageInfo({
      src: that.data.images[i],
      success: function (res, index = i, length = l) {
        console.log("index" + index)
        var t = {}
        t.path = res.path
        if (res.width <= res.height) {
          t.width = "200rpx"
          t.height = 200 * res.height / res.width + "rpx"
        } else {
          t.height = "200rpx"
          t.width = 200 * res.width / res.height + "rpx"
        }
        that.setData({
          temp: t
        })
        var info = "imageInfos[" + i + "]"
        console.log(info)
        console.log(that.data.temp)
        that.setData({
          [info]: that.data.temp
        })
        console.log(that.data.imageInfos[i])
        index++
        if (index < length) {
          that.getImageInfo(index, length)
        }
      }
    })
  },
  //上传图片
  uploadOneByOne(imgPaths, successUp, failUp, count, length, userid) {
    var that = this;
    wx.showLoading({
      title: '正在上传第' + count + '张',
    })
    wx.uploadFile({
      url: url.urlstr + 'uploadImagesServlet',
      filePath: imgPaths[count],
      name: 'image',//示例，使用顺序给文件命名
      header: {
        "Content-Type": "multipart/form-data"
      },
      formData: {
        'userid': userid
      },
      success: function (e) {
        console.log(e)
        that.data.keys[successUp] = e.data
        successUp++;//成功+1
        console.log('上传成功')
      },
      fail: function (e) {
        failUp++;//失败+1
        console.log('上传失败')
        console.log(e)
      },
      complete: function (e) {
        count++;//下一张
        if (count == length) {
          //上传完毕，作一下提示
          console.log('上传成功' + successUp + ',' + '失败' + failUp);
          wx.showToast({
            title: '上传成功' + successUp,
            icon: 'success',
            duration: 2000
          })
          that.formSubmit()
        } else {
          //递归调用，上传下一张
          that.uploadOneByOne(imgPaths, successUp, failUp, count, length, userid);
          console.log('正在上传第' + count + '张');
        }
      }
    })
  },
  //点击上传
  uploadImg: function () {
    var that = this
    var imgPaths = that.data.images
    var count = 0
    var successUp = 0
    var failUp = 0
    var length = that.data.images.length
    if (wx.getStorageSync('openId')) {
      var userid = wx.getStorageSync('openId')
      if (count < length) {
        that.uploadOneByOne(imgPaths, successUp, failUp, count, length, userid)
      } else {
        that.formSubmit()
      }
    }
  },
  //获取类别
  getLables: function () {
    var that = this
    wx.request({
      url: url.urlstr + 'showLablesServlet',
      success: function (res) {
        that.setData({
          typeitems: res.data,
          showAnonymous: res.data[that.data.lableid-1].canAnonymous
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
          anonymous: that.data.anonymous,
          content: that.data.inputValue,
          userid: wx.getStorageSync('openId'),
          lableid: that.data.lableid,
          images: that.data.keys
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