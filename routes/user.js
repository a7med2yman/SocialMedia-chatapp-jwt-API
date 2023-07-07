const router = require('express').Router();
const User = require('../models/User')
const bcrypt = require('bcrypt')
const {verifyToken , verifyTokenAndAuthorization , verifyTokenAndAdmin} = require('./verifyToken')

//UPDATE USER
router.put('/:id' , verifyTokenAndAuthorization ,async (req ,res)=>{
    if(req.body.password){
        try{
            const salt = await bcrypt.genSalt(10)
            req.body.password = await bcrypt.hash( req.body.password , salt)
            }catch(err){
                return res.status(500).json(err)
            }
        }

        try{
            const updatedUser = await User.findByIdAndUpdate(req.params.id ,
                {$set : req.body} ,
                {new :true})
                res.status(200).json(updatedUser)
        }catch(err){
            return res.status(500).json(err)
        }
})

//DELETE USER
router.delete('/:id' , verifyTokenAndAuthorization , async (req ,res)=>{
    try{
        await User.findByIdAndDelete(req.params.id)
            res.status(200).json('user is deleted')
    }catch(err){
        return res.status(500).json(err)
    }
})

//GET USER
router.get('/:id' , async (req,res)=>{
        try{
            const user = await User.findOne({_id : req.params.id})
            const {password , updatedAt , ...others} = user._doc
            res.status(200).json(others)
        }catch(err){
            res.status(500).json(err)
        
    }
})

//FOLLOW USER
router.put('/:id/follow' , verifyToken , async (req,res)=>{
    if(req.user.id !== req.params.id){
        try{
            const user = await User.findById(req.params.id)
            const currentUser = await User.findById(req.user.id)
            if(!user.followers.includes(req.user.id)){
                await user.updateOne({$push : {followers : req.user.id} })
                await currentUser.updateOne({$push : {followings : req.params.id} })
                res.status(200).json('user has been followed')
            }else{
                res.status(403).json('you allready follow this user ')
            }
        }catch(err){
            res.status(500).json(err)
        }
    }else{
        res.status(403).json('you can not follow your self')
    }
})

//UNFOLLOW USER
router.put('/:id/unfollow' , verifyToken , async (req,res)=>{
    if(req.user.id !== req.params.id){
        try{
            const user = await User.findById(req.params.id)
            const currentUser = await User.findById(req.user.id)
            if(user.followers.includes(req.user.id)){
                await user.updateOne({$pull : {followers : req.user.id} })
                await currentUser.updateOne({$pull : {followings : req.params.id} })
                res.status(200).json('user has been unfollowed')
            }else{
                res.status(403).json('you do not follow this user ')
            }
        }catch(err){
            res.status(500).json(err)
        }
    }else{
        res.status(403).json('you can not unfollow your self')
    }
})


module.exports = router ;