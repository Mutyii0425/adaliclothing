class CategoryModel {
  constructor(db) {
    this.db = db;
  }

  async getAllCategories() {
    const [rows] = await this.db.execute('SELECT * FROM kategoriak');
    return rows;
  }
}

export default CategoryModel;
