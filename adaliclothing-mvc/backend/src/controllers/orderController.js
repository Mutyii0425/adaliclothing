import sgMail from '../config/email.js';

class OrderController {
  constructor(orderModel) {
    this.orderModel = orderModel;
  }

  async createCustomer(req, res) {
    try {
      const { nev, telefonszam, email, irsz, telepules, kozterulet } = req.body;
      const customerId = await this.orderModel.createCustomer({
        nev, telefonszam, email, irsz, telepules, kozterulet
      });
      
      res.json({ 
        success: true,
        id: customerId 
      });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async createOrder(req, res) {
    try {
      const { termek, statusz, mennyiseg, vevo_id, ar } = req.body;
      const orderId = await this.orderModel.createOrder({
        termek, statusz, mennyiseg, vevo_id, ar
      });
      
      res.json({ 
              success: true,
              orderId: orderId
            })
          } catch (error) {
            console.error('Database error:', error)
            res.status(500).json({ error: error.message })
          }
        }

        async getOrderStats(req, res) {
          try {
            const userId = req.params.userId
            const stats = await this.orderModel.getOrderStats(userId)
      
            res.json(stats)
          } catch (error) {
            console.error('Database error:', error)
            res.status(500).json({ error: 'Adatbázis hiba' })
          }
        }

        async updateOrderStats(req, res) {
          try {
            const { userId, orderAmount, orderDate } = req.body
            const stats = await this.orderModel.getOrderStats(userId)
      
            // Hozzáadjuk az új rendelés adatait
            stats.totalOrders += 1
            stats.totalAmount += orderAmount
            stats.lastOrderDate = orderDate
      
            res.json(stats)
          } catch (error) {
            console.error('Database error:', error)
            res.status(500).json({ error: 'Adatbázis hiba' })
          }
        }

        async sendConfirmation(req, res) {
          const { email, name, orderId, orderItems, shippingDetails, totalPrice, discount, shippingCost } = req.body
    
          const orderItemsList = orderItems.map(item => 
            `<tr>
              <td>${item.nev} - Méret: ${item.size}</td>
              <td>${item.mennyiseg} db</td>
              <td>${item.ar.toLocaleString()} Ft</td>
              <td>${(item.ar * item.mennyiseg).toLocaleString()} Ft</td>
            </tr>`
          ).join('')

          const msg = {
            to: email,
            from: {
              name: 'Adali Clothing',
              email: 'adaliclothing@gmail.com'
            },
            subject: 'Rendelés visszaigazolás - Adali Clothing',
            html: `
              <h2>Kedves ${name}!</h2>
              <p>Köszönjük a rendelését! Az alábbiakban találja a rendelés részleteit.</p>
        
              <h3>Rendelési azonosító: #${orderId}</h3>
        
              <h4>Rendelt termékek:</h4>
              <table style="width:100%; border-collapse: collapse;">
                <tr>
                  <th>Termék</th>
                  <th>Mennyiség</th>
                  <th>Egységár</th>
                  <th>Részösszeg</th>
                </tr>
                ${orderItemsList}
              </table>

              <h4>Szállítási adatok:</h4>
              <p>
                Név: ${name}<br>
                Telefonszám: ${shippingDetails.phoneNumber}<br>
                Cím: ${shippingDetails.zipCode} ${shippingDetails.city}, ${shippingDetails.address}
              </p>

        
              <p>
                Részösszeg: ${(totalPrice - shippingCost).toLocaleString()} Ft<br>
                Kedvezmény: ${discount.toLocaleString()} Ft<br>
                Szállítási költség: ${shippingCost.toLocaleString()} Ft<br>
                <strong>Fizetendő összeg: ${(totalPrice - discount).toLocaleString()} Ft</strong>
              </p>
            `
          }

          try {
            console.log('Sending confirmation email...')
            const result = await sgMail.send(msg)
            console.log('Email sent successfully')
            res.json({ success: true })
          } catch (error) {
            console.error('Email sending error:', error.response?.body)
            res.status(500).json({ 
              error: 'Email sending failed',
              details: error.response?.body?.errors 
            })
          }
        }
}

export default OrderController