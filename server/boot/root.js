var ForumService = require('../services/forum');

module.exports = function(server) {
  var router = server.loopback.Router();

  router.get('/login', function (req, res) {

    var userInfo = req.query['user-info'];

    if (!userInfo) return res.json({err: 'invalid param.'});

    try {
      userInfo = JSON.parse(decodeURIComponent(userInfo))
    } catch (e) {
      return res.json({err: 'invalid param.'});
    }

    if (!req.session) return res.json({err: 'server err.', code: 500});

    if (!req.session.userInfo) {
      req.session.userInfo = {
        userId: userInfo.userId,
        username: userInfo.username,
        avatar: userInfo.avatar,
        location: userInfo.location
      };
    }
    res.redirect('/');
  });

  router.get('/', __userInfoMiddleware, function (req, res) {
    res.render('forum/index');
  });

  router.get('/none', function (req, res) {
    res.send('none');
  });

  router.get('/cross-site', function (req, res) {
    var data = req.query.data;
    if (!data) return res.json({err: 'param invalid.'});

    res.render('forum/cross-site', {data: data});
  });

  router.get('/post-detail', __userInfoMiddleware, function (req, res) {
    var id = req.query.id;
    if (!id) return res.json({err: 'param invalid.'});

    ForumService.detail(req.session.userInfo.userId, id, function (err, post, isPraised) {
      if (err) return res.json({err: 'server err.', code: 500});

      post.cat = post.category;
      post.catName = post.cat === 'jsjl' ? '技术交流' : '综合论坛';
      post.createdStr = __parseDateStr(post.created);
      post.modifiedStr = __parseDateStr(post.modified);
      post.isPraised = isPraised;

      if (post.uploadImages) {
        var uploadImagesJSON = JSON.parse(post.uploadImages);
        if (uploadImagesJSON && uploadImagesJSON.length > 0) {
          post.hasImage = true;
          post.uploadImagesJSON = uploadImagesJSON;
        }
      }
      res.render('forum/post-detail', {post: post});
    })
  });

  router.post('/praise-post', __userInfoMiddleware, function (req, res) {
    var postId = req.body['post-id'];
    if (!postId) return res.json({err: 'param invalid.'});

    ForumService.praisePost(req.session.userInfo.userId, postId ,function (err, praiseCount) {
      if (err) return res.json({err: 'server err.', code: 500});

      res.json({err: null, code: 200, count: praiseCount});
    });
  })

  router.get('/test', function (req, res) {
    var token = req.query['token'];
    if (token !== 'slevp') return res.send('no token.');

    var userInfo = {
      userId: 'baijiadu',
      username: '百家渡',
      avatar: 'http://182.92.224.147:3002/uploads/2015930/da-_68ktO2mO0qQlBS9Y6s21.png',
      location: '中国·上海'
    };

    res.redirect('/login?user-info=' + encodeURIComponent(JSON.stringify(userInfo)));
  });

  server.use(router);

  function __userInfoMiddleware(req, res, next) {
    if (!req.session) return res.json({err: 'server err.', code: 500});

    if (!req.session.userInfo) {
      return res.json({err: 'please login.'});
    }
    res.locals.userInfo = req.session.userInfo;
    res.locals.navData = [
      {
        title: '百家功能',
        icon: 'ion-earth',
        subs: [
          {
            title: '全球花圃',
            url: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx12a9be97e2e7170b&redirect_uri=http://www.baijiadu.com/TurnPage/WXGardenList&response_type=code&scope=snsapi_base&state=1234567890#wechat_redirect'
          },
          {
            title: '全球市场',
            url: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx12a9be97e2e7170b&redirect_uri=http://www.baijiadu.com/TurnPage/WXPlant&response_type=code&scope=snsapi_base&state=1234567890#wechat_redirect'
          },
          {
            title: '花圃论坛',
            url: '#'
          }/*,
          {
            title: '花币充值',
            url: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx12a9be97e2e7170b&redirect_uri=http://www.baijiadu.com/TurnPage/WXPayMent&response_type=code&scope=snsapi_base&state=1234567890#wechat_redirect'
          }*/
        ]
      },
      {
        title: '服务支持',
        icon: 'ion-paper-airplane',
        subs: [
          /*{
            title: '操作说明',
            url: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx12a9be97e2e7170b&redirect_uri=http://www.baijiadu.com/TurnPage/UploadBug&response_type=code&scope=snsapi_base&state=1234567890#wechat_redirect'
          },*/
          {
            title: '福利回馈',
            url: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx12a9be97e2e7170b&redirect_uri=http://www.baijiadu.com/TurnPage/WXRed&response_type=code&scope=snsapi_base&state=1234567890#wechat_redirect'
          },
          {
            title: '我要套现',
            url: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx12a9be97e2e7170b&redirect_uri=http://www.baijiadu.com/TurnPage/WXCash&response_type=code&scope=snsapi_base&state=1234567890#wechat_redirect'
          }
        ]
      },
      {
        title: '用户中心',
        icon: 'ion-person',
        subs: [
          {
            title: '个人中心',
            url: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx12a9be97e2e7170b&redirect_uri=http://www.baijiadu.com/TurnPage/WXPersonalInfo&response_type=code&scope=snsapi_base&state=1234567890#wechat_redirect'
          },
          {
            title: '我要赚钱',
            url: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx12a9be97e2e7170b&redirect_uri=http://www.baijiadu.com/TurnPage/WXCardForCode&response_type=code&scope=snsapi_base&state=1234567890#wechat_redirect'
          },
          {
            title: '我的花圃',
            url: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx12a9be97e2e7170b&redirect_uri=http://www.baijiadu.com/TurnPage/WXMyGarden&response_type=code&scope=snsapi_base&state=1234567890#wechat_redirect'
          },
          {
            title: '我的伙伴',
            url: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx12a9be97e2e7170b&redirect_uri=http://www.baijiadu.com/TurnPage/WXFamliy&response_type=code&scope=snsapi_base&state=1234567890#wechat_redirect'
          }
        ]
      }
    ];
    next();
  }

  function __parseDateStr(date) {
    var times = date.getTime();
    var now = new Date().getTime();
    var diff = parseInt((now - times) / 1000);

    if (diff <= 10) {
      return '刚刚';
    }
    if (diff <= 60) {
      return '1分钟前';
    }
    diff /= 60;
    if (diff <= 60) {
      return parseInt(diff) + '分钟前';
    }
    diff /= 60;
    if (diff <= 24) {
      return parseInt(diff) + '小时前';
    }
    diff /= 24;
    if (diff <= 30) {
      return parseInt(diff) + '天前';
    }
    diff /= 30;
    if (diff <= 12) {
      return parseInt(diff) + '个月前';
    }
    return Util.dateFormat(date, 'yy-MM-dd hh:mm');
  }
};
