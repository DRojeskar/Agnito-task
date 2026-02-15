
import * as productService from '../services/productService.js';

export const listProducts = async (req, res) => {
  console.log(listProducts,"listProduct")
  const products = await productService.listActiveProducts();
  console.log(products,"prdio")
 return res.json({ success: true, products });
};

export const getProduct = async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  console.log(product,"product")
return  res.json({ success: true, product });
};
