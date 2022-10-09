import { StatusCodes } from "http-status-codes";
import Post from "../models/post_m.js";
import User from "../models/user_m.js";

class APIfeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    paginating() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 9;
        const skip = (page - 1) * limit;
        console.log(page, limit, skip);
        this.query = this.query.skip(skip).limit(limit);
        // console.log(this.query);
        return this;
    }
}


const createPost = async (req, res) => {
    console.log('create post');
    const { content, images } = req.body;

    if (images.length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'Please add your photo' });
    }

    const newPost = new Post({
        content, images, user: req.user._id
    })
    await newPost.save()

    // console.log(newPost.images);
    // console.log(images);


    res.status(StatusCodes.OK).json({
        msg: 'Created Post!',
        newPost: {
            ...newPost._doc,
            user: req.user
        }
    });
}


const getPosts = async (req, res) => {
    console.log('getpost');
    // console.log(...req.user.following);
    // console.log(req.user._id);
    const query = Post.find({ user: [...req.user.following, req.user._id] });
    // console.log('**');
    // console.log(query);

    // console.log('///');
    // console.log(req.query);
    const features = new APIfeatures(query, req.query).paginating();

    // console.log(features);
    const posts = await features.query.sort('-createdAt')
        .populate("user likes", "avatar username fullname followers")
        .populate({
            path: "comments",
            populate: {
                path: "user likes",
                select: "-password"
            }
        })

    res.json({
        msg: 'Success!',
        result: posts.length,
        posts
    })
}

const updatePost = async (req, res) => {
    console.log('update post');
    const { content, images } = req.body;

    const post = await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
            content, images
        }
    )
        .populate("user likes", "avatar username fullname")
        .populate({
            path: "comments",
            populate: {
                path: "user likes",
                select: "-password"
            }
        })

    res.json({
        mas: "Updated Post!",
        newPost: {
            ...post._doc,
            content, images
        }
    })
}


const likePost = async (req, res) => {
    console.log('like post');
    // console.log(req.params.id);
    // console.log(req.user._id);
    const post = await Post.find({
        _id: req.params.id,
        likes: req.user._id
    });

    if (post.length > 0) {
        return res.status(400).json({ msg: "You Liked this post" })
    }

    const like = await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
            $push: { likes: req.user._id }
        },
        { new: true, runValidators: true }
    )

    if (!like) {
        return res.status(400).json({ msg: 'This post does not exist' })
    }

    res.status(200).json({ msg: 'Liked Post!' });
}

const unLikePost = async (req, res) => {
    console.log('unlike post');

    const like = await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
            $pull: { likes: req.user._id }
        },
        { new: true, runValidators: true }
    );

    if (!like) {
        return res.status(400).json({ msg: 'This post does not exist.' })
    }

    res.status(200).json({ mag: 'Unliked Post!' });
}


const getUserPosts = async (req, res) => {
    console.log('get user post');
    const query1 = Post.find({ user: req.params.id })
    // console.log(query1);
    const features = new APIfeatures(query1, req.query).paginating();
    // console.log(features);
    // console.log(features.query);
    const posts = await features.query.sort("-createdAt");

    res.status(200).json({
        posts,
        result: posts.length
    })
}

const getPost = async (req, res) => {
    console.log('Get Post');
    const post = await Post.findById(req.params.id)
        .populate("user likes", "avatar username fullname followers")
        .populate({
            path: "comments",
            populate: {
                path: "user likes",
                select: "-password"
            }
        })

    if (!post) {
        return res.status(400).json({ msg: 'This post does not exist' })
    }

    res.status(200).json({ post });
}


const getPostsDiscover = async (req, res) => {
    console.log('Get Post Discover');

    const newArr = [...req.user.following, req.user._id]

    // console.log(newArr);
    const num = req.query.num || 9

    const posts = await Post.aggregate([
        { $match: { user: { $nin: newArr } } },
        { $sample: { size: Number(num) } },
    ])

    return res.json({
        msg: 'Success!',
        result: posts.length,
        posts
    })
}

const deletePost = async (req, res) => {
    console.log('Delete Post');
    const post = await Post.findOneAndDelete(
        {
            _id: req.params.id,
            user: req.user._id
        }
    );
    await Comments.deleteMany({ _id: { $in: post.comments } })

    res.json({
        msg: 'Deleted Post!',
        newPost: {
            ...post,
            user: req.user
        }
    })
}

const savePost = async (req, res) => {
    console.log('save post');

    const user = await User.find({ _id: req.user._id, saved: req.params.id })
    console.log(user);
    if (user.length > 0) {
        return res.status(400).json({ msg: "You saved this post" })
    }

    const save = await User.findOneAndUpdate(
        { _id: req.user._id },
        {
            $push: { saved: req.params.id }
        },
        { new: true, runValidators: true }
    );

    if (!save) {
        return res.status(400).json({ msg: 'This user does not exist' })
    }

    res.status(200).json({ msg: 'Saved Post' })
}


const unSavePost = async (req, res) => {
    console.log('unsave post');

    const save = await User.findOneAndUpdate(
        { _id: req.user._id },
        {
            $pull: { saved: req.params.id }
        },
        { new: true, runValidators: true }
    );

    if (!save) {
        return res.status(400).json({ msg: 'This user does not exist' });
    }

    res.json({ msg: 'unSaved Post!' });
}

const getSavedPost = async (req, res) => {
    console.log('get save post');
    const query1 = Post.find({ _id: { $in: req.user.saved } });

    const features = new APIfeatures(query1, req.query);

    const savePosts = await features.query.sort('-creaatedAt')

    res.status(200)
        .json(
            {
                savePosts,
                result: savePosts.length
            }
        )
}

export { createPost, getPosts, updatePost, likePost, unLikePost, getUserPosts, getPost, getPostsDiscover, deletePost, savePost, unSavePost, getSavedPost };