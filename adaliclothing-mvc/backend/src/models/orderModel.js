class OrderModel {
  constructor(db) {
    this.db = db;
  }

  async createCustomer(customerData) {
    const { nev, telefonszam, email, irsz, telepules, kozterulet } = customerData;
    
    const [result] = await this.db.execute(
      'INSERT INTO vevo (nev, telefonszam, email, irsz, telepules, kozterulet) VALUES (?, ?, ?, ?, ?, ?)',
      [nev, telefonszam, email, irsz, telepules, kozterulet]
    );
    
    return result.insertId;
  }

  async createOrder(orderData) {
    const { termek, statusz, mennyiseg, vevo_id, ar } = orderData;
    
    const [result] = await this.db.execute(
      'INSERT INTO rendeles (termek, statusz, mennyiseg, vevo_id, ar) VALUES (?, ?, ?, ?, ?)',
      [termek, statusz, mennyiseg, vevo_id, ar]
    );
    
    return result.insertId;
  }

  async getOrderStats(userId) {
    const [results] = await this.db.execute(`
      SELECT r.*, v.id as vevo_id, r.ar, r.mennyiseg, r.date
      FROM rendeles r
      JOIN vevo v ON r.vevo_id = v.id
      WHERE r.vevo_id IN (
        SELECT id FROM vevo WHERE email = (
          SELECT email FROM user WHERE f_azonosito = ?
        )
      )
    `, [userId]);

    return {
      totalOrders: results.length,
      totalAmount: results.reduce((sum, order) => sum + (Number(order.ar) * order.mennyiseg), 0),
      lastOrderDate: results.length > 0 ? results[results.length - 1].date : null
    };
  }
}

export default OrderModel;
