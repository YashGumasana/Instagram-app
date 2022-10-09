import express from "express";
const router = express.Router();

import { createPost, getPosts, updatePost, likePost, unLikePost, getUserPosts, getPost, getPostsDiscover, deletePost, savePost, unSavePost, getSavedPost } from "../controllers/post_c.js";

import { authenticateUser } from "../middleware/authentication.js";

router.route('/posts')
    .post(authenticateUser, createPost)
    .get(authenticateUser, getPosts);

router.route('/post/:id')
    .patch(authenticateUser, updatePost)
    .get(authenticateUser, getPost)
    .delete(authenticateUser, deletePost)

router.route('/post/:id/like').patch(authenticateUser, likePost)
router.route('/post/:id/unlike').patch(authenticateUser, unLikePost)

router.route('/user_posts/:id').get(authenticateUser, getUserPosts)

router.route('/post_discover').get(authenticateUser, getPostsDiscover)

router.route('/savePost/:id').patch(authenticateUser, savePost)
router.route('/unSavePost/:id').patch(authenticateUser, unSavePost)
router.route('/getSavePosts').get(authenticateUser, getSavedPost)

export default router;