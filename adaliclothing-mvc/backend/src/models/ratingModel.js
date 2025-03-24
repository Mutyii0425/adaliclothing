class RatingModel {
  constructor(db) {
    this.db = db;
  }

  async getAllRatings() {
    const [rows] = await this.db.execute(`
      SELECT r.rating_id, r.rating, r.date, r.velemeny, u.felhasznalonev 
      FROM ratings r 
      JOIN user u ON r.f_azonosito = u.f_azonosito 
      ORDER BY r.date DESC
    `);
    return rows;
  }

  async createRating(ratingData) {
    const { userId, rating, velemeny } = ratingData;
    const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    await this.db.execute(
      'INSERT INTO ratings (f_azonosito, rating, velemeny, date) VALUES (?, ?, ?, ?)',
      [userId, rating, velemeny, currentDate]
    );
  }

  async updateRating(ratingId, ratingData) {
    const { rating, velemeny } = ratingData;
    
    await this.db.execute(
      'UPDATE ratings SET rating = ?, velemeny = ? WHERE rating_id = ?',
      [rating, velemeny, ratingId]
    );
  }

  async deleteRating(ratingId) {
    await this.db.execute('DELETE FROM ratings WHERE rating_id = ?', [ratingId]);
  }

  async getUserIdByEmail(email) {
    const [rows] = await this.db.execute('SELECT f_azonosito FROM user WHERE email = ?', [email]);
    return rows.length > 0 ? rows[0].f_azonosito : null;
  }

  async getUserIdByUsername(username) {
    const [rows] = await this.db.execute('SELECT f_azonosito FROM user WHERE felhasznalonev = ?', [username]);
    return rows.length > 0 ? rows[0].f_azonosito : null;
  }
}

export default RatingModel;
