class ProductController {
  constructor(productModel) {
    this.productModel = productModel;
  }

  async getAllProducts(req, res) {
    try {
      const products = await this.productModel.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Adatbázis hiba' });
    }
  }

  async getAllUserProducts(req, res) {
    try {
      const products = await this.productModel.getAllUserProducts();
      res.json(products);
    } catch (error) {
      console.error('Error fetching user products:', error);
      res.status(500).json({ error: 'Adatbázis hiba' });
    }
  }

  async getProductById(req, res) {
    try {
      const product = await this.productModel.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Termék nem található' });
      }
      res.json(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ error: 'Adatbázis hiba' });
    }
  }

  async getUserProductById(req, res) {
    try {
      const product = await this.productModel.getUserProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Termék nem található' });
      }
      res.json(product);
    } catch (error) {
      console.error('Error fetching user product:', error);
      res.status(500).json({ error: 'Adatbázis hiba' });
    }
  }

  async createProduct(req, res) {
    try {
      const { nev, ar, termekleiras, kategoria, imageUrl, kategoriaId } = req.body;
      const productId = await this.productModel.createProduct({
        nev, ar, termekleiras, kategoria, imageUrl, kategoriaId
      });
      
      res.status(201).json({ 
        success: true,
        id: productId,
        message: 'Termék sikeresen létrehozva' 
      });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async createUserProduct(req, res) {
    try {
      const { kategoriaId, ar, nev, leiras, meret, imageUrl, images } = req.body;
      const productId = await this.productModel.createUserProduct({
        kategoriaId, ar, nev, leiras, meret, imageUrl, images
      });
      
      res.json({ success: true, id: productId });
    } catch (error) {
      console.error('Error creating user product:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async updateProduct(req, res) {
    try {
      const { ar, termekleiras } = req.body;
      await this.productModel.updateProduct(req.params.id, { ar, termekleiras });
      
      res.json({ message: 'Termék sikeresen frissítve' });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ error: 'Hiba a frissítés során' });
    }
  }

  async updateUserProduct(req, res) {
    try {
      const { ar, nev, leiras, meret } = req.body;
      await this.productModel.updateUserProduct(req.params.id, { ar, nev, leiras, meret });
      
      res.json({ message: 'Termék sikeresen frissítve' });
    } catch (error) {
      console.error('Error updating user product:', error);
      res.status(500).json({ error: 'Hiba a frissítés során' });
    }
  }

  async deleteProduct(req, res) {
    try {
      await this.productModel.deleteProduct(req.params.id);
      res.json({ message: 'Termék sikeresen törölve' });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: 'Hiba a törlés során' });
    }
  }

  async deleteUserProduct(req, res) {
    try {
      await this.productModel.deleteUserProduct(req.params.id);
      res.json({ message: 'Termék sikeresen törölve' });
    } catch (error) {
      console.error('Error deleting user product:', error);
      res.status(500).json({ error: 'Hiba a törlés során' });
    }
  }
}

export default ProductController;
