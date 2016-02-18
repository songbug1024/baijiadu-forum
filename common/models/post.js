module.exports = function(Post) {

  Post.beforeRemote('create', function(ctx, unused, next) {
    var session = ctx.req.session;

    if (session && session.userInfo) {
      ctx.args.data.userId = session.userInfo.userId;
      ctx.args.data.username = session.userInfo.username;
      ctx.args.data.avatar = session.userInfo.avatar;
      ctx.args.data.location = session.userInfo.location;
      next();
    } else {
      next(new Error('must be logged in to save'));
    }
  });

};
