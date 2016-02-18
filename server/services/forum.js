/**
 * @Description:
 * @Author: fuwensong
 * @Date: 2015/9/19
 */
var loopback = require('loopback');
var async = require('async');
var config = require('../config.json');

exports.detail = function (userId, postId, callback) {
  if (!postId) return callback(new Error('invalid param.'));
  var Post = loopback.getModel('Post');
  var PostPraise = loopback.getModel('PostPraise');
  var PostViewer = loopback.getModel('PostViewer');

  async.auto({
    loadPostViewer: function(callback) {
      PostViewer.findOne({
        where: {postId: postId, userId: userId}
      }, callback);
    },
    loadPost: function(callback) {
      Post.findById(postId, callback);
    },
    loadPostPraise: function (callback) {
      PostPraise.findOne({
        where: {postId: postId, userId: userId}
      }, callback);
    },
    updateHitNum: ['loadPostViewer', 'loadPost', function (callback, results) {
      var post = results.loadPost;
      var postViewer = results.loadPostViewer;

      if (!post) return callback(new Error('invalid post.'));
      if (!postViewer) {
        post.updateAttributes({
          hitNum: post.hitNum + 1
        }, callback);

        PostViewer.create({
          userId: userId,
          postId: postId
        }, function () {});
      } else {
        callback(null, post);
      }
    }]
  }, function (err, results) {
    if (err) return callback(err);

    callback(null, results.updateHitNum, !!results.loadPostPraise);
  })
}

exports.praisePost = function (userId, postId, callback) {
  if (!postId) return callback(new Error('invalid param.'));
  var Post = loopback.getModel('Post');
  var PostPraise = loopback.getModel('PostPraise');

  async.auto({
    loadPostPraise: function(callback) {
      PostPraise.findOne({
        where: {postId: postId, userId: userId}
      }, callback);
    },
    loadPost: function(callback) {
      Post.findById(postId, callback);
    },
    verifyPraiseInfo: ['loadPostPraise', 'loadPost', function (callback, results) {
      var post = results.loadPost;
      var postPraise = results.loadPostPraise;

      if (!post) return callback(new Error('invalid post.'));
      if (!postPraise) {
        var count = post.praiseNum + 1;

        post.updateAttributes({
          praiseNum: count
        }, function () {});

        PostPraise.create({
          userId: userId,
          postId: postId
        }, function () {});

        callback(null, count);
      } else {
        callback(new Error('has praised.'));
      }
    }]
  }, function (err, results) {
    if (err) return callback(err);
    callback(null, results.verifyPraiseInfo);
  })
}
