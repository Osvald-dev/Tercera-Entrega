import express from "express";
import { CarritoDao } from "../dao/CarritoDao.js";
import ProductDao  from "../dao/ProductoDao.js";

const cart = express.Router();
const carritoDao = new CarritoDao();

// POST /api/carrito
cart.post('/', async (_req, res) => {
    const newCart = await carritoDao.createCart();
    
    newCart
        ? res.status(200).json({"success": "Producto agregado " + newCart._id})
        : res.status(500).json({"error": "Hubo un error"})
    
})

// DELETE /api/carrito/id
cart.delete('/:id', async(req,res) => {
    const { id } = req.params;
    const wasDeleted = await carritoDao.deleteCartById(id);
    
    wasDeleted 
        ? res.status(200).json({"success": "carro eliminado con éxito"})
        : res.status(404).json({"error": "Error en carrito"})
     
})

// POST /api/carrito/:id/productos

cart.post('/:id/productos', async(req,res) => {
    const { id } = req.params;
    const { body } = req;
    
    const productExists = await ProductDao.exists(body.productId);
    
    if(productExists) {
        await carritoDao.saveProductToCart(id, body)
    } else {
        res.status(404).json({"error": "Product not found"});
    }
    
})

// GET /api/carrito/:id/productos
cart.get('/:id/productos', async(req,res)=>{
    const { id } = req.params;
    const cartProducts = await carritoDao.getAllProductsFromCart(id);
    
    cartProducts
        ? res.status(200).json(cartProducts)
        : res.status(404).json({"error": "cart not found"})
})


// DELETE /api/carrito/:id/productos/:id_prod
cart.delete('/:id/productos/:id_prod', async(req, res) => {
    const {id, id_prod } = req.params;
    
    const wasDeleted = await carritoDao.deleteProductFromCart(id, id_prod);
    
    wasDeleted 
        ? res.status(200).json({"success": "ese producto ya no esta en el carrito"})
        : res.status(400).json({"error": "Hubo un problema"})
    
})

export {cart};