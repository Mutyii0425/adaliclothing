class RatingController {
  constructor(ratingModel) {
    this.ratingModel = ratingModel;
  }

  async getAllRatings(req, res) {
    try {
      const ratings = await this.ratingModel.getAllRatings();
      res.json(ratings);
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Adatbázis hiba' });
    }
  }

  async saveRating(req, res) {
    try {
      const { rating, email, velemeny } = req.body;
      const userId = await this.ratingModel.getUserIdByEmail(email);
      
      if (!userId) {
        return res.status(404).json({ error: 'Felhasználó nem található' });
      }
      
      await this.ratingModel.createRating({ userId, rating, velemeny });
      res.json({ success: true });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Mentési hiba' });
    }
  }

  async addRating(req, res) {
    try {
      const { felhasznalonev, rating, velemeny } = req.body;
      const userId = await this.ratingModel.getUserIdByUsername(felhasznalonev);
      
      if (!userId) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      await this.ratingModel.createRating({ userId, rating, velemeny });
      res.json({ success: true });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  }

  async updateRating(req, res) {
    try {
      const { rating, velemeny } = req.body;
      const ratingId = req.params.id;
      
      await this.ratingModel.updateRating(ratingId, { rating, velemeny });
      res.json({ success: true });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  }

  async deleteRating(req, res) {
    try {
      const ratingId = req.params.id;
      await this.ratingModel.deleteRating(ratingId);
      res.json({ success: true });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Adatbázis hiba' });
    }
  }
}

export default RatingController;
