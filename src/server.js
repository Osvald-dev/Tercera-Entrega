import express from "express";
import mongoStore from 'connect-mongo';
import {product, cart, router, user} from './routes/index.js';
import session from 'express-session';
import {engine} from 'express-handlebars';
import path from 'path';
import {fileURLToPath} from 'url';
import compression from "compression";
import logger from "./loggers/log4jsLogger.js";
import loggerMiddleware from "./middlewares/routesLogger.middleware.js";
import minimist from 'minimist';



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// const PORT = 3027;
const app = express();
app.use(express.json());
app.use(loggerMiddleware);
app.use(compression());
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));

app.set('views', './src/views');
app.set('view engine', 'hbs');

app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'index.hbs',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials'
}))

app.use(
    session({
        store: mongoStore.create({
            mongoUrl: process.env.MONGO_URI,
            options: {
                userNewParser: true,
                useUnifiedTopology: true,
            }
        }),
        secret: process.env.SECRET,
        resave: true,
        saveUninitialized: true,
        cookie: {maxAge: 600000} //10 min.
        
}))



app.use('/api/productos', product);
app.use('/api/carrito', cart);
app.use('/api/usuario', user);
app.use('/test', router);
app.all("*", (req, res) => {
    res.status(404).json({"error": "ruta no existente"})
  });


/* --------------- Leer el puerto por consola o setear default -------------- */

const options = {
    alias:{
        "p": "PORT"
    },
    default: {
        "PORT": 8080
    }
};

const {PORT} = minimist(process.argv.slice(2), options);


const server = app.listen(PORT, () => {
    logger.info(` >>>>> 🚀 Server iniciado : http://localhost:${PORT}`)
    })
    
server.on('error', (err) => logger.error(err));

