const router = require('express').Router();
const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {verifyToken } = require('./verifyToken')

//REGISTER
router.post('/register' , async (req ,res)=>{
    try{
        //generate new passsword
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.password , salt)
        //create new user
        const newUser = await new User({
            username : req.body.username ,
            email : req.body.email ,
            password : hashedPass
        })
        //save user and response
        const user = await newUser.save()
        res.status(200).json(user)
    }catch(err){
        res.status(500).json(err)
    }
})

//Refresh token
let refreshTokens = [];

router.post("/refresh", (req, res) => {
  //take the refresh token from the user
    const refreshToken = req.body.token;

  //send error if there is no token or it's invalid
    if (!refreshToken) return res.status(401).json("You are not authenticated!");
    if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json("Refresh token is not valid!");
}
    jwt.verify(refreshToken, process.env.REFRESH_SEC , (err, user) => {
    err && console.log(err);
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
    
    //if everything is ok, create new access token, refresh token and send to user
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    refreshTokens.push(newRefreshToken);

    res.status(200).json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    });
});

});

const generateAccessToken = (user) => {
    return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, process.env.JWT_SEC , {
        expiresIn: "15m",
    });
};

const generateRefreshToken = (user) => {
    return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, process.env.REFRESH_SEC);
};

//LOGIN
router.post('/login' , async (req ,res)=>{
    try{
        const user = await User.findOne({email : req.body.email})
        !user && res.status(400).json('user is not found')

        const validPassword = await bcrypt.compare(req.body.password , user.password)
        !validPassword && res.status(400).json(' wrong password ')

    if(user){
    //Generate an access token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    refreshTokens.push(refreshToken);
    
    const {password , ...others} = user._doc
    res.status(200).json({...others ,accessToken ,refreshToken })

        }else{
        res.status(400).json("Username or password incorrect!");
            }
            
    }catch(err){
        res.status(500).json(err)
    }
})

//log out 
router.post("/logout", verifyToken, (req, res) => {
    const refreshToken = req.body.token;
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
    res.status(200).json("You logged out successfully.");
});

module.exports = router ;