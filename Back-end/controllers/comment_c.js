import Comment from "../models/comment_m.js";
import Post from "../models/post_m.js";
import { BadRequestError } from '../errors/index.js'

const commentCtrl = {

    createComment: async (req, res) => {
        console.log('Create Comment');
        const { postId, content, tag, reply, postUserId } = req.body;

        const post = await Post.findById(postId)
        if (!post) {
            throw new BadRequestError({ msg: "This post does not exist" })
        }

        if (reply) {
            const cmReply = await Comment.findById(reply);

            if (!cmReply) {
                throw new BadRequestError({ msg: "This comment does not exist" });
            }
        }

        const newComment = await Comment.create({
            user: req.user._id,
            content,
            tag,
            reply,
            postUserId,
            postId
        });

        await Post.findOneAndUpdate(
            { _id: postId },
            {
                $push: { comments: newComment._id }
            },
            { new: true, runValidators: true }
        );

        await newComment.save();
        res.status(200).json({ newComment });
    },


    updateComment: async (req, res) => {
        console.log('Update Comment');

        const { content } = req.body;

        await Comment.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.user._id,
            },
            { content }
        );

        res.status(200).json({ msg: "Update Success" })
    },

    likeComment: async (req, res) => {
        console.log('Like Comment');

        const comment = await Comment.find(
            {
                _id: req.params.id,
                likes: req.user._id
            }
        );
        if (comment.length > 0) {
            throw new BadRequestError({ msg: "You liked this post" })
        }

        const co = await Comment.findOneAndUpdate(
            { _id: req.params.id },
            {
                $push: { likes: req.user._id }
            },
            { new: true, runValidators: true }
        );

        if (!co) {
            throw new BadRequestError("Comment not exist")
        }

        res.status(200).json({ msg: 'Liked Comment!' })
    },


    unlikeComment: async (req, res) => {
        console.log('Unlike Comment');

        const comment = await Comment.findOneAndUpdate(
            { _id: req.params.id },
            {
                $pull: { likes: req.user._id }
            },
            { new: true, runValidators: true }
        );

        if (!comment) {
            throw new BadRequestError('Comment not exist')
        }

        res.status(200).json({ msg: 'Unliked comment!' })
    },

    deleteComment: async (req, res) => {
        console.log('delete Comment');

        console.log(req.params.id);

        const comment = await Comment.findOneAndDelete(
            {
                _id: req.params.id,
                $or:
                    [
                        { user: req.user._id },
                        { postUserId: req.user._id }
                    ]
            }
        );


        await Post.findByIdAndUpdate(
            { _id: comment.postId },
            {
                $pull: { comments: req.params.id }
            }
        );

        res.status(200).json({ msg: 'Deleted Comment!' });

    }

}



export default commentCtrl;