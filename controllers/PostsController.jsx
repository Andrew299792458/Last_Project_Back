const Post = require("../models/posts.jsx")
const fs = require('fs');
const path = require('path');

exports.GetPosts = (req, res) => {
    const userId = req.user.id
    Post.find({ userId: userId })
        .then(async (posts) => {
            console.log("posts get")
            return res.status(200).json({ posts })
        })
}

exports.CreatePost = async (req, res) => {
    const data = req.body;
    const userId = req.user.id
    const imageFile = req.file

    const ImageName = "post" + Date.now() + imageFile.originalname

    const imagePath = path.join("images", ImageName);

    const newImagePath = path.join("public", imagePath);
    console.log(req.file)
    fs.copyFileSync(imageFile.path, newImagePath);

    const post = new Post({
        ...data,
        image: imagePath,
        userId
    });
    await post
        .save()
        .then((result) => {
            console.log("post created")
            res.status(201).json(result)
        })
        .catch((error) => {
            console.log(error)
            res.status(500).json({ message: "error create post" })
        })
}

exports.UpdatePost = async (req, res) => {
    const { title, description, id, updateAt } = req.body
    Post.findOne({ _id: id })
        .then(async (post) => {
            if (!post) {
                return res.status(402).json({ message: "Wrong changes" })
            }
            Post.findByIdAndUpdate(id, {
                title,
                description,
                updateAt
            }, { new: true })
                .then((post) => {
                    console.log("post updated")
                    res.status(200).json({ post })
                })
                .catch((err) => {
                    console.log(err)
                    res.status(500).json({ message: "Error Updating post" })
                })
        })
        .catch((err) => {
            console.log(err)
            res.status(500).json({ message: "Post changing failed" })
        })
}

exports.DeletePost = async (req, res) => {
    const { id } = req.body
    Post.findOne({ _id: id })
        .then(async (post) => {
            if (!post) {
                return res.status(402).json({ message: "this post is not exist" })
            }

            fs.unlink("C:/Users/Asus/Desktop/LastPro/last-pro-back/public/" + post.image, (err) => {
                if (err) {
                    throw err;
                }
                console.log("Delete File successfully.");
            });

            Post.deleteOne({ _id: id })
                .then(post => {
                    console.log("post deleted")
                    res.status(200).json({ message: "post deleted" })
                })
                .catch(err => {
                    res.status(500).json({ message: "Error deleting post" })
                })
        })
        .catch((err) => {
            console.log(err)
            res.status(500).json({ message: "Post deleting failed" })
        })
}

exports.AllPosts = (req, res) => {
    Post.find()
        .then(async (posts) => {
            console.log("posts get")
            return res.status(200).json({ posts })
        })
}

exports.LikePost = (req, res) => {
    const userId = req.user.id
    const { postId } = req.body

    Post.findOne({ _id: postId })
        .then(async (post) => {
            if (post.likes.includes(userId)) {
                const Likes = post.likes.filter(e => e !== userId)
                Post.findByIdAndUpdate(postId, {
                    likes: Likes
                }, { new: true })
                    .then((post) => {
                        console.log(userId, "disliked>>>", post.likes)
                        res.send({ post })
                    })
                    .catch((err) => {
                        console.log(err)
                        res.status(500).json({ message: "Error Liking post" })
                    })
            } else {
                Post.findByIdAndUpdate(postId, {
                    likes: [...post.likes, userId]
                }, { new: true })
                    .then((post) => {
                        console.log(userId, "liked>>>", post)
                        res.send({ post })
                    })
                    .catch((err) => {
                        console.log(err)
                        res.status(500).json({ message: "Error Liking post" })
                    })
            }

        })
        .catch((err) => {
            console.log(err)
            res.status(500).json({ message: "Post liking failed" })
        })




}