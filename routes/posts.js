const router = require('express').Router()
const User = require('../models/User');
const Post = require('../models/Post');
const {verifyToken , verifyTokenAndAuthorization , verifyTokenAndAdmin} = require('./verifyToken')

// Create Post
router.post('/' , verifyToken , async(req ,res)=>{
    const newPost = new Post(req.body)
    try{
        const savedPost = await newPost.save()
        res.status(200).json(savedPost);
    }catch(err){
        res.status(500).json(err)
    }
})

// Update Post
router.put('/:id' , verifyToken , async(req ,res)=>{
    try{
        const post = await Post.findById(req.params.id)
        if(post.userId === req.user.id){
            await post.updateOne({$set : req.body })
            res.status(200).json('the post has been updated');
        }else{
            res.status(403).json('you can update only your post');
        }
    }catch(err){
        res.status(500).json(err)
    }
})

// Delete Post
router.delete('/:id' , verifyToken , async(req ,res)=>{
    try{
        const post = await Post.findById(req.params.id)
        if(post.userId === req.user.id){
            await post.deleteOne()
            res.status(200).json('the post has been deleted');
        }else{
            res.status(403).json('you can delete only your post');
        }
    }catch(err){
        res.status(500).json(err)
    }
})

// Like & disLike Post
router.put('/:id/like' , verifyToken ,async(req ,res)=>{
    try{
        const post = await Post.findById(req.params.id)
        if(!post.likes.includes(req.user.id)){
            await post.updateOne({$push : {likes : req.user.id} })
            res.status(200).json('post has been liked')
        }else{
            await post.updateOne({$pull : {likes : req.user.id} })
            res.status(200).json('post has been disliked')
        }
    }catch(err){
        res.status(500).json(err)
    }
})

// Get Post
router.get('/:id' , async(req ,res)=>{ 
    try{
        const post = await Post.findById(req.params.id)
        res.status(200).json(post);
    }catch(err){
        res.status(500).json(err)
    }
})

// Get timeline Posts
router.get('/timeline/all' , verifyToken , async(req ,res)=>{ 
    try{
        const currentUser = await User.findById(req.user.id);
        const userPosts = await Post.find({userId :currentUser._id})
        const friendPosts = await Promise.all(
            currentUser.followings.map((friendId)=>{
                return Post.find({userId : friendId })
            })
        )
        res.status(200).json(userPosts.concat(...friendPosts));
    }catch(err){
        res.status(500).json(err)
    }
})


module.exports = router