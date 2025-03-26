import bcrypt from 'bcrypt';
import crypto from 'crypto';

class UserModel {
  constructor(db) {
    this.db = db;
  }

  async findByEmail(email) {
    const [rows] = await this.db.execute('SELECT * FROM user WHERE email = ?', [email]);
    return rows.length > 0 ? rows[0] : null;
  }

  async findByUsername(username) {
    const [rows] = await this.db.execute('SELECT * FROM user WHERE felhasznalonev = ?', [username]);
    return rows.length > 0 ? rows[0] : null;
  }

  async findByResetToken(token) {
    const [rows] = await this.db.execute('SELECT * FROM user WHERE reset_token = ?', [token]);
    return rows.length > 0 ? rows[0] : null;
  }

  async findValidResetToken(token) {
    const [rows] = await this.db.execute(
      'SELECT * FROM user WHERE reset_token = ? AND reset_expires > NOW()',
      [token]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  
async markCouponAsUsed(email) {
  await this.db.execute(
    'UPDATE user SET kupon_hasznalva = 1 WHERE email = ?',
    [email]
  );
}


async findByEmail(email) {
  const [rows] = await this.db.execute('SELECT * FROM user WHERE email = ?', [email]);
  return rows.length > 0 ? rows[0] : null;
}


async create(userData) {
  const { name, email, password } = userData;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const [result] = await this.db.execute(
    'INSERT INTO user (felhasznalonev, email, jelszo) VALUES (?, ?, ?)', 
    [name, email, hashedPassword]
  );
  
  const userId = result.insertId;
  
  return { 
    username: name, 
    email, 
    f_azonosito: userId 
  };
}



  async updatePassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.db.execute(
      'UPDATE user SET jelszo = ? WHERE f_azonosito = ?',
      [hashedPassword, userId]
    );
  }

  async createResetToken(email) {
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetExpires = new Date(Date.now() + 7200000).toISOString().slice(0, 19).replace('T', ' ');
    
    await this.db.execute(
      'UPDATE user SET reset_token = ?, reset_expires = ? WHERE email = ?',
      [resetToken, resetExpires, email]
    );
    
    return resetToken;
  }


  async resetPasswordWithToken(token, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.db.execute(
      'UPDATE user SET jelszo = ?, reset_token = NULL, reset_expires = NULL WHERE reset_token = ?',
      [hashedPassword, token]
    );
  }

  async updateCoupon(email, coupon) {
    await this.db.execute(
      'UPDATE user SET kupon = ? WHERE email = ?',
      [coupon, email]
    );
  }

  async cleanupExpiredTokens() {
    await this.db.execute(
      'UPDATE user SET reset_token = NULL, reset_expires = NULL WHERE reset_expires < NOW()'
    );
  }

  async validatePassword(user, password) {
    return bcrypt.compare(password, user.jelszo);
  }

  async getAllUsers() {
    const [rows] = await this.db.execute('SELECT * FROM user');
    return rows;
  }

  async deleteUser(userId) {

    await this.db.execute('DELETE FROM ratings WHERE f_azonosito = ?', [userId]);
    
 
    await this.db.execute('DELETE FROM user WHERE f_azonosito = ?', [userId]);
  }
}

export default UserModel;
