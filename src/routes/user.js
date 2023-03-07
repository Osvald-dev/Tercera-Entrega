import express from 'express';
import {sendGmail} from '../notifications/EmailSender.js';
import {htmlNewUserTemplate} from '../notifications/htmltemplates/NewUserCreatedTemplate.js';
import { UsuarioDao } from '../dao/UsuarioDao.js';

const user = express.Router();
const userDao = new UsuarioDao();

user.get('/login', async(req, res)=>{
    if(req.session.login){
        res.redirect('/api/usuario')
    }else{
        res.render('pages/login', {status:false})
    }
})

user.get('/signup', (req, res)=>{
    if (req.session.login){
        res.redirect('/api/usuario')
    }else{
        res.render('pages/signup', {status: false})
    }
})

user.post('/signup', async (req, res)=>{
    const {body} = req;
    const newUser = await userDao.createUser(body);

    if(newUser){
        const now = new Date();
        const newUserTemplateEmail = htmlNewUserTemplate(newUser._id, now.toLocaleString())
        await sendGmail('Nuevo usuario creado', newUserTemplateEmail);
        res.status(200).json ({'sucess': 'User added with ID: ' + newUser._id})
    }else{
        res.status(400).json({'error': 'there was an error, please verify the body content match the schema'})
    }
})

user.post('/login', async(req, res)=>{
    const {user, pass} = req.body;
    const loggedUser = await userDao.loginUser({
        username: user,
        password: pass
    })
    if(loggedUser){
        req.session.login = true;
        res.redirect('/api/usuario')
    }else{
        req.session.login = false;
        res.redirect('/api/usuario/login')
    }
})


user.get('/logout', async(req, res)=>{
    if(!req.session.login){
        res.redirect('/api/usuario')
    }else{
        req.session.destroy((err)=>{
            if(err){
                res.json(err);
            }
            res.render('pages/logout', {status:false})
        })
    }
})

export {user};

