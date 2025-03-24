class UserController {
  constructor(userModel) {
    this.userModel = userModel;
  }

  async getAllUsers(req, res) {
    try {
      const users = await this.userModel.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Adatbázis hiba' });
    }
  }

  async deleteUser(req, res) {
    try {
      const userId = req.params.id;
      await this.userModel.deleteUser(userId);
      
      res.json({ 
        message: 'Felhasználó sikeresen törölve',
        deletedUser: true
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Hiba a felhasználó törlése során' });
    }
  }

  async checkUser(req, res) {
    try {
      const username = req.params.username;
      const user = await this.userModel.findByUsername(username);
      
      if (!user) {
        return res.json({ exists: false });
      }
      
      res.json({ exists: true, email: user.email });
    } catch (error) {
      console.error('Error checking user:', error);
      res.status(500).json({ error: 'Adatbázis hiba' });
    }
  }
}

export default UserController;
