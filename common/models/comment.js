var loopback = require('loopback');

module.exports = function(Comment) {

  Comment.beforeRemote('create', function(ctx, unused, next) {
    var session = ctx.req.session;

    if (session && session.userInfo) {
      ctx.args.data.userId = session.userInfo.userId;
      ctx.args.data.username = session.userInfo.username;
      ctx.args.data.avatar = session.userInfo.avatar;
      ctx.args.data.location = session.userInfo.location;

      if (!ctx.args.data.parentId) ctx.args.data.parentId = 0;
      next();
    } else {
      next(new Error('must be logged in to save'));
    }
  });

  Comment.afterRemote('create', function(ctx, comment, next) {
    var Post = loopback.getModel('Post');

    if (comment && comment.id && comment.postId) {
      if (!comment.parentId) {
        Post.findById(comment.postId, function (err, post) {
          if (err || !post) {
            next(new Error('post is invalid.'));
          } else {
            post.updateAttribute('commentNum', post.commentNum + 1, next);
          }
        });
      } else {
        next();
      }
    } else {
      next(new Error('post is invalid.'));
    }
  });
};
