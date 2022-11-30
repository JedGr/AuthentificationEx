const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

var user_array = []

router.post('/sign-up',async(req,rep,next) => {
    var User = {
        "username":"",
        "password":""
    }
    const {username,password} = req.body 
    if(!user_array.find(user=>user.username === username)){
        const hashedPassword = await bcrypt.hash(password,10) 
        User.username = username; 
        User.password = hashedPassword
        user_array.push(User);
        console.log(user_array);
        return rep.json(201,{user:User})
    }else
        return rep.json(401,{msg:"Vous avez deja un compte"})
})

router.post('/sign-in',async(req,rep,next) => {
    try{
    const {username,password} = req.body

    const user = user_array?.find(user => user.username === username);
    if(user){

        const isPasswordvalid = await bcrypt.compare(password, user.password);
        const token =  jwt.sign({user:user.username},'shhhhh',{ expiresIn: '30d' });
        if(isPasswordvalid){

            return rep.json(200,{user: user,token:token});

        }else
             return rep.json(401,{msg:"password or username incorrect"});
    }else
        return rep.json(401,{msg:"vous n'avez pas un compte"});
    }catch(e){
        next(e); //
    }
})
router.post('/sign-in-token',(req,rep,next) => {
     let token =req.headers.authorization;
     if (token) {
      try { 
        const decoded_user = jwt.verify(token,'testt')
        const user = user_array.find(user=>user.username == decoded_user.user)
        if(user){
            rep.send(user)
            next()
        }
        else
            return rep.json(401,{msg:"autorization interdite"})
      }catch (err) {
        rep.status(401)
        throw new Error('Token incorrect')
      }
    }
    else {
        rep.status(401);
        throw new Error('Acces interdit');
      }
})
module.exports = router;