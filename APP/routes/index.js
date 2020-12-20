const Router = require('express').Router()
const User = require('../model/user-config')
const bcrypt = require('bcrypt')

const { app} = require('../../Server')

const Post = require('../model/post-config')


require('dotenv').config()
//PASSPORT __STARTS___ 

const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

// For persistant state
const MongoStore = require('connect-mongo')(session);


const getUserById = async (id) =>{
  const user =await User.findOne({_id:id})
  return user
}

const initializePassport = require('./passport-config')
initializePassport(
  passport,
  async(email) => {
      try{
        user = await User.findOne({email:email})
        return user
      }catch(err){
        console.log(err)
      }
  },
  getUserById
)


// PASSPORT __ENDS__
// FOR PERSISTANAT STATE


// Middleware for passport
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({url:process.env.MONGO_DB_URI})
  /* store: new MongoStore({url:'mongodb://localhost:27017/Authenticate'})*/
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))



Router.get('/',checkAuthenticated, async (req,res)=>{
    const user =await getUserById(req.session.passport.user)
    const posts = await Post.find().sort({timestamp:-1})
    
    const context = {
              name:user.username,
              title:'Home',
              isLogged:true,
              posts:posts
            }
   
      res.render('index',context)
})

// FOR LOGIN
Router.get('/login',checkNotAuthenticated,(req,res)=>{
    res.render('login',{title:'Login',isLogged:false})
})

Router.post('/login',checkNotAuthenticated,passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  }))

// FOR REGISTER
Router.get('/signup',checkNotAuthenticated,(req,res)=>{
    res.render('register',{title:'Register',isLogged:false,message:''})
})

Router.post('/signup',checkNotAuthenticated,async(req,res)=>{
    const user = req.body.username
    const hashedPassword = await bcrypt.hash(req.body.password, 10) 
    const email = req.body.email

    const exist_user = await User.findOne({email:email})

    if(exist_user){
      err = `Already User Exists with email ${email}`
      res.render('register',{
        message:err,
        title:"Signup | Blog application",
        isLogged:false
      })
    }

    const userObj = { username:user, password:hashedPassword , email:email}

    try{
        const newUser = await new User(userObj)
        await newUser.save()
        res.redirect('/login')
    }
    catch(err){
      
       err = 'something went Wrong'
       res.render('register',{
         message:err,
         title:"Signup | Blog application",
         isLogged:false
       })
   }
})

Router.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})


// 
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
  
    res.redirect('/login')
  }
  
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    next()
  }
  


 



module.exports = Router
