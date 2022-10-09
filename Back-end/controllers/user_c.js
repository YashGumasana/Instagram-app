import User from "../models/user_m.js";
// import { UnauthenticatedError } from '../errors/index.js'
import { StatusCodes } from "http-status-codes";

const searchUser = async (req, res) => {
    console.log("searchUser");
    // console.log(req.query.username);
    const user = await User.find({ username: { $regex: req.query.username } }).limit(10).select("fullname username avatar");
    // console.log(user, '---');
    res.json({ user });
}

const getUser = async (req, res) => {
    console.log("getUser");
    const user = await User.findById(req.params.id)
        .select('-password')
        .populate("followers following", "-password")

    if (!user) return res.status(400).json({ msg: "User does not exist." })

    res.status(StatusCodes.OK).json({ user });
}

const updateUser = async (req, res) => {
    console.log("updateUser");
    const { avatar, fullname, mobile, address, story, website, gender } = req.body;

    if (!fullname) return res.status(400).json({ msg: "Please add your full name" });

    const user = await User.findOneAndUpdate(
        { _id: req.user._id },
        {
            avatar, fullname, mobile, address, story, website, gender
        }
    );

    res.status(StatusCodes.OK).json({ msg: "Update Success", user });

}

const follow = async (req, res) => {
    console.log("follow");

    let user = await User.find({ _id: req.params.id, followers: req.user._id });

    if (user.length > 0) return res.status(500).json({ msg: "You followed this user" });

    await User.findOneAndUpdate(
        { _id: req.user._id },
        {
            $push: { following: req.params.id }
        },
        { new: true, runValidators: true }
    );

    const newUser = await User.findOneAndUpdate(
        { _id: req.params.id },
        {
            $push: { followers: req.user._id }
        },
        { new: true, runValidators: true }
    )
        .populate('followers following', '-password')

    res.status(StatusCodes.OK).json({ newUser });
}

const unfollow = async (req, res) => {
    console.log("unfollow");

    await User.findOneAndUpdate(
        { _id: req.user._id },
        {
            $pull: { following: req.params.id }
        },
        { new: true, runValidators: true }
    );

    const newUser = await User.findOneAndUpdate(
        { _id: req.params.id },
        {
            $pull: { followers: req.user._id }
        },
        { new: true, runValidators: true }
    ).populate("followers following", "-password")



    res.status(StatusCodes.OK).json({ newUser });
}

const suggestionUser = async (req, res) => {
    console.log('suggestionUser');
    // console.log(req.user);
    // req.user.following = 'wah'
    // console.log(req.user.following);
    // console.log(req.user);
    const newArr = [...req.user.following, req.user._id]
    // console.log(...req.user.following);
    // console.log([...req.user.following, req.user._id]);
    // console.log(newArr + '..s');
    const num = req.query.num || 20

    const users = await User.aggregate([
        { $match: { _id: { $nin: newArr } } },
        { $sample: { size: Number(num) } },
        { $lookup: { from: 'users', localField: 'followers', foreignField: '_id', as: 'followers' } },
        { $lookup: { from: 'users', localField: 'following', foreignField: '_id', as: 'following' } }
    ]).project('-password');

    return res.json({
        users,
        result: users.length
    })
}

export { searchUser, getUser, updateUser, suggestionUser, follow, unfollow }