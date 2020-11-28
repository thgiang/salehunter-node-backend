import axois from 'axios'
module.exports = {
  translateError: function (code) {
    if (code === 999) {
      return 'Phiên làm việc của page đã hết hạn trên ứng dụng, vui lòng liên kết lại Facebook với ứng dụng để tiếp tục sử dụng'
    } else if (code === 551) {
      return 'Người này hiện không có mặt để nhận tin nhắn, hãy nhắn thông qua inbox trên bình luận của người dùng'
    } else if (code === 10 || (code >= 200 && code <= 299)) {
      return 'Bạn vui lòng liên kết lại Facebook cho ứng dụng và chấp nhận đủ quyền để thực hiện hành động này'
    } else if (code === 10901) {
      return 'Bạn không thể gửi tin nhắn phản hồi bình luận từ hơn 7 ngày trước do chính sách Facebook'
    } else if (code === 10900) {
      return 'Bình luận này đã được gửi tin nhắn phản hồi, vui lòng kiểm tra trong mục Tin nhắn'
    } else if (code === 1) {
      return 'Lỗi không xác định'
    }

    return 'Có lỗi xảy ra, mã lỗi ' + code
  },

  requestFb: function (method, url, accessToken, params = []) {
    if (!url.startsWith('/')) {
      url = '/' + url
    }
    url = 'https://graph.facebook.com' + url
    params.access_token = accessToken

    if (method.toUpperCase() === 'GET') {
      axois.get(url, {
        params: params
      }).then((response) => {
        return { success: true, data: response.data }
      }).catch((error) => {
        const errorMessage = this.translateError(error.response.status)
        return { success: false, message: errorMessage }
      })
    }

    if (method.toUpperCase() === 'POST') {
      axois.post(url, params).then((response) => {
        return { success: true, data: response.data }
      }).catch((error) => {
        const errorMessage = this.translateError(error.response.status)
        return { success: false, message: errorMessage }
      })
    }
  },

  longLiveAccessToken: function (shortToken) {
    const urlRequest = 'oauth/access_token?grant_type=fb_exchange_token&fb_exchange_token=' + shortToken +
          '&client_id=' + process.env.FB_APP_ID + '&client_secret=' + process.env.FB_APP_SECRET

    return this.requestFb('GET', urlRequest, shortToken)
  }
}
