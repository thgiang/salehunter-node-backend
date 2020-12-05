const { isEmpty } = require('lodash')
const axois = require('axios')

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

  requestFb: async function (method, url, accessToken, params = {}) {
    if (!url.startsWith('/')) {
      url = '/' + url
    }
    url = 'https://graph.facebook.com' + url
    params.access_token = accessToken

    if (method.toUpperCase() === 'GET') {
      const response = await axois.get(url, {
        params: params
      }).catch((error) => {
        const errorMessage = this.translateError(error.response.status)
        return { success: false, message: errorMessage }
      })

      if (response) {
        return { success: true, data: response.data }
      } else {
        return { success: false, msg: 'Lỗi gì đó' }
      }
    }

    if (method.toUpperCase() === 'POST') {
      const response = await axois.post(url, params).catch((error) => {
        const errorMessage = this.translateError(error.response.status)
        return { success: false, message: errorMessage }
      })

      if (response) {
        return { success: true, data: response.data }
      } else {
        return { success: false, msg: 'Lỗi gì đó' }
      }
    }
  },

  longLiveAccessToken: async function (shortToken) {
    const urlRequest = 'oauth/access_token?grant_type=fb_exchange_token&fb_exchange_token=' + shortToken +
        '&client_id=' + process.env.FB_APP_ID + '&client_secret=' + process.env.FB_APP_SECRET

    return await this.requestFb('GET', urlRequest, shortToken)
  },

  getInfoUserFb: async function (fid, accessToken) {
    const urlRequest = '/' + fid + '?fields=name,picture.width(320).height(320)'

    const response = await this.requestFb('get', urlRequest, accessToken)

    if (response.success === false) {
      response.data = { profile_pic: '', name: 'Người dùng Facebook' }
    } else {
      const responseData = response.data
      response.data = {
        profile_pic: responseData.picture.data.url,
        name: responseData.name
      }
    }

    return response
  },
  getInfoUserCommentFb: async function (fid, accessToken) {
    const urlRequest = '/' + fid + '/picture?type=normal'

    const response = await this.requestFb('get', urlRequest, accessToken)

    if (response.success === false) {
      response.data = {
        profile_pic: '',
        name: 'Người dùng Facebook'
      }
    }

    response.data = {
      profile_pic: response.data
    }

    return response
  },
  sendMessage: async function (params, pageAccessToken) {
    const urlRequest = '/me/messages'
    const response = await this.requestFb('post', urlRequest, pageAccessToken, params)

    if (response.success == true) {
      response.data.mid = $response.data.message_id
      delete (response.data.message_id)
    }

    return response
  },
  sendTyping: async function (params, pageAccessToken) {
    const urlRequest = '/me/messages'

    return await this.requestFb('post', urlRequest, pageAccessToken, params)
  },
  me: async function (accessToken) {
    const urlRequest = '/me'

    return await this.requestFb('get', urlRequest, accessToken)
  },
  getPages: async function (accessToken) {
    let isNext = true
    let after = null

    let returnData = []

    while (isNext) {
      let urlRequest = ''
      if (!isEmpty(after)) {
        urlRequest = '/me/accounts' + '?after=' + after + '&limit=10'
      } else {
        urlRequest = '/me/accounts?limit=10'
      }

      const response = await this.requestFb('get', urlRequest, accessToken)

      if (!response.success) {
        return response
      }

      const resData = response.data

      returnData = [...returnData, ...resData.data]

      if (!resData.paging || isEmpty(resData.paging.next)) {
        isNext = false
      } else {
        after = resData.paging.cursors.after
      }
    }

    return {
      success: true,
      data: returnData
    }
  },
  checkSubscribeLivestream: async function (pid, pageAccessToken) {
    const urlRequest = '/' + pid + '/subscribed_apps'
    return await this.requestFb('get', urlRequest, pageAccessToken, {})
  },
  subscribePages: async function (pid, pageAccessToken) {
    const urlRequest = '/' + pid + '/subscribed_apps'
    const params = {
      subscribed_fields: ['messages', 'message_echoes', 'feed', 'messaging_postbacks', 'message_reads', 'live_videos']
    }

    return await this.requestFb('post', urlRequest, pageAccessToken, params)
  },
  unsubscribePage: async function (pid, pageAccessToken) {
    const urlRequest = '/' + pid + '/subscribed_apps'
    const params = {
      subscribed_fields: ['messages', 'message_echoes', 'feed', 'messaging_postbacks', 'message_reads', 'live_videos']
    }

    return await this.requestFb('delete', urlRequest, pageAccessToken, params)
  },

  getPostDetail: async function (postId, pageAccessToken) {
    const urlRequest = '/' + postId + '?fields=message,created_time,full_picture,picture,permalink_url,attachments'

    return await this.requestFb('get', urlRequest, pageAccessToken)
  },

  getCommentDetail: async function (commentId, pageAccessToken) {
    const urlRequest = '/' + commentId + '?fields=attachment,message,is_hidden,from,created_time'

    return await this.requestFb('get', urlRequest, pageAccessToken)
  },

  sendComment: async function (commentId, params, pageAccessToken) {
    const urlRequest = '/' + commentId + '/comments'

    return await this.requestFb('post', urlRequest, pageAccessToken, params)
  },

  checkComment: async function (commentId, pageAccessToken) {
    const urlRequest = '/' + commentId + '?fields=can_hide,can_like,can_reply_privately,can_remove,can_comment'

    return await this.requestFb('get', urlRequest, pageAccessToken)
  },

  likeComment: async function (commentId, pageAccessToken) {
    const urlRequest = '/' + commentId + '/likes'

    return await this.requestFb('post', urlRequest, pageAccessToken)
  },

  unlikeComment: async function (commentId, pageAccessToken) {
    const urlRequest = '/' + commentId + '/likes'

    return await this.requestFb('delete', urlRequest, pageAccessToken)
  },

  hideComment: async function (commentId, pageAccessToken) {
    const urlRequest = '/' + commentId

    const params = {
      is_hidden: true
    }

    return await this.requestFb('post', urlRequest, pageAccessToken, params)
  },
  unhideComment: async function (commentId, pageAccessToken) {
    const urlRequest = '/' + commentId

    const params = {
      is_hidden: false
    }
    return await this.requestFb('post', urlRequest, pageAccessToken, params)
  },
  deleteComment: async function (commentId, pageAccessToken) {
    const urlRequest = '/' + commentId
    return await this.requestFb('delete', urlRequest, pageAccessToken)
  },
  privateReply: async function (commentId, pageAccessToken, params) {
    const urlRequest = '/' + commentId + '/private_replies'
    return await this.requestFb('post', urlRequest, pageAccessToken, params)
  },

  getAttachmentComment: async function (commentId, pageAccessToken) {
    const urlRequest = '/' + commentId + '?fields=attachment'

    return await this.requestFb('get', urlRequest, pageAccessToken)
  },

  removePermissionApp: async function (fid, accessToken) {
    const urlRequest = '/' + fid + '/permissions'

    return await this.requestFb('delete', urlRequest, accessToken)
  },

  getConversationId: async function (pid, fid, pageAccessToken) {
    const urlRequest = '/' + pid + '/conversations?user_id=' + fid

    return await this.requestFb('get', urlRequest, pageAccessToken)
  },
  sendMessageViaConversationId: async function (conversationId, params, pageAccessToken) {
    const urlRequest = '/' + conversationId + '/messages'

    const response = await this.requestFb('post', urlRequest, pageAccessToken, params)

    if (response.success === true) {
      response.data.mid = response.data.id
      // delete(response['data']['uuid']);
    }

    return response
  },

  getConversationDetail: async function (conversationId, pageAccessToken, skip = 0, limit = 10) {
    let urlRequest = '/' + conversationId + '/messages?limit=' + skip + '&pretty=0'
    if (skip !== 0) {
      urlRequest = '/' + conversationId + '/messages?limit=' + skip + '&pretty=0'

      const response = await this.requestFb('get', urlRequest, pageAccessToken)

      if (isEmpty(response.data.paging.next)) {
        return {
          success: false,
          message: 'Not have next page'
        }
      }

      urlRequest = '/' + conversationId + '/messages?fields=message,attachments,from,created_time,sticker&limit='
        .limit + '&pretty=0&after=' + response.data.paging.cursors.after
    } else {
      urlRequest = '/' + conversationId + '/messages?fields=message,attachments,from,created_time,sticker&limit='
        .limit + '&pretty=0'
    }

    return this.requestFb('get', urlRequest, pageAccessToken)
  },

  checkTokenValid: async function (id, accessToken) {
    const urlRequest = '/' + id + '/permissions'

    return await this.requestFb('get', urlRequest, accessToken)
  },
  getPostLiveStreamDetail: async function (postId, pageAccessToken) {
    const urlRequest = '/' + postId + '?fields=description,live_views,status,permalink_url,creation_time,id'

    return await this.requestFb('get', urlRequest, pageAccessToken)
  },

  getViewsLivestream: async function (liveId, pageAccessToken) {
    const urlRequest = '/' + liveId + '?fields=live_views'

    return await this.requestFb('get', urlRequest, pageAccessToken)
  }
}
