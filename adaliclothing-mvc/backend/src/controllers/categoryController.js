class CategoryController {
  constructor(categoryModel) {
    this.categoryModel = categoryModel;
  }

  async getAllCategories(req, res) {
    try {
      const categories = await this.categoryModel.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Adatbázis hiba' });
    }
  }
}

export default CategoryController;
