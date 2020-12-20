const Router = require('express').Router()
const User = require('../model/user-config')
const Post = require('../model/post-config')
const passport = require('passport')


const getUserById = async (id) =>{
    return await User.findOne({_id:id})
}

const getPostOfUser = async (email) =>{
    return await Post.find({email:email}).sort({timestamp:-1})
}

const getPostById = async (id) =>{
    return await Post.findById(id)
}

//  Retrive post of Ourself
Router.get('/myposts',async(req,res)=>{
    const user =await getUserById(req.session.passport.user)
    const posts = await getPostOfUser(user.email)
    const context = {
                title:'My Posts',
                isLogged:true,
                posts:posts
            }

    res.render('myposts',context)
})


// New Post

Router.get('/new',(req,res)=>{
    const context = {
        title:'New Post',
        isLogged:true,
    }
    res.render('newpost',context)
})


Router.post('/new',async (req,res)=>{
    const data = req.body
    const user =await getUserById(req.session.passport.user)

    const newPost =await new Post({
        username: user.username,
        email:user.email,
        title:data.title,
        content: data.content
    });
    await newPost.save()
    // console.log(`NewPost --> ${newPost.title}`)
    
    res.redirect('/')  
})

// edit posts
Router.get("/edit/:id",async (req,res)=>{
    // console.log(req.params.id)
    const user  =await getUserById(req.session.passport.user)
    const post =await getPostById(req.params.id)
    
    if(user.email === post.email){
            const context = {
                post:post,
                title:'Edit Post | Blog Appliation',
                isLogged:true
            }
            res.render('editpost',context)
    }else{
        res.send('You not authorized !!')
    }

})

Router.post("/edit/:id",async (req,res)=>{
    const id = req.params.id
    const user  =await getUserById(req.session.passport.user)
    const post =await getPostById(id)
    
    const postTitle = req.body.title
    const postContent = req.body.content
    
    if(user.email === post.email){
        await Post.updateOne({ _id: id }, {
            title: postTitle,
            content:postContent
            });
            
        res.redirect('/post/myposts')
    }else{
        res.send('You not authorized !!')
    }

})



// For Deleting Post

Router.get("/delete/:id",async (req,res)=>{
    const user  =await getUserById(req.session.passport.user)
    const post =await getPostById(req.params.id)
    
    if(user.email === post.email){
        Post.deleteOne({_id:req.params.id},()=>{
            console.log('success')
        })
    }

    // res.send('data received ')
    res.redirect('/post/myposts')
})



module.exports = Router