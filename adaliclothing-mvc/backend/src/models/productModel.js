class ProductModel {
  constructor(db) {
    this.db = db;
  }

  async getAllProducts() {
    const [rows] = await this.db.execute('SELECT * FROM termekek');
    return rows;
  }

  async getAllUserProducts() {
    const [rows] = await this.db.execute('SELECT * FROM usertermekek');
    return rows;
  }

  async getProductById(id) {
    const [rows] = await this.db.execute('SELECT * FROM termekek WHERE id = ?', [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  async getUserProductById(id) {
    const [rows] = await this.db.execute('SELECT * FROM usertermekek WHERE id = ?', [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  async createProduct(productData) {
    const { nev, ar, termekleiras, kategoria, imageUrl, kategoriaId } = productData;
    
    const [result] = await this.db.execute(
      'INSERT INTO termekek (nev, ar, termekleiras, kategoria, imageUrl, kategoriaId) VALUES (?, ?, ?, ?, ?, ?)',
      [nev, ar, termekleiras, kategoria, imageUrl, kategoriaId]
    );
    
    return result.insertId;
  }

  async createUserProduct(productData) {
    console.log('Model received data:', productData);
    
    const { kategoriaId, ar, nev, leiras, meret, imageUrl, images, feltolto } = productData;
    
    try {
      const [result] = await this.db.execute(
        'INSERT INTO usertermekek (kategoriaId, ar, nev, leiras, meret, imageUrl, images, feltolto) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [kategoriaId, ar, nev, leiras, meret, imageUrl, JSON.stringify(images || []), feltolto]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('Database error in createUserProduct:', error);
      throw error;
    }
  }

  async getAllUserProductsWithUploaderInfo() {
    const [rows] = await this.db.execute(`
      SELECT ut.*, u.profile_image as feltoltoKep
      FROM usertermekek ut
      LEFT JOIN user u ON ut.feltolto = u.felhasznalonev
    `);
    return rows;
  }

  async updateProduct(id, productData) {
    const { ar, termekleiras } = productData;
    
    await this.db.execute(
      'UPDATE termekek SET ar = ?, termekleiras = ? WHERE id = ?',
      [ar, termekleiras, id]
    );
  }

  async updateUserProduct(id, productData) {
    const { ar, nev, leiras, meret } = productData;
    
    await this.db.execute(
      'UPDATE usertermekek SET ar = ?, nev = ?, leiras = ?, meret = ? WHERE id = ?',
      [ar, nev, leiras, meret, id]
    );
  }

  async deleteProduct(id) {
    await this.db.execute('DELETE FROM termekek WHERE id = ?', [id]);
  }

  async deleteUserProduct(id) {
    await this.db.execute('DELETE FROM usertermekek WHERE id = ?', [id]);
  }
}

export default ProductModel;
