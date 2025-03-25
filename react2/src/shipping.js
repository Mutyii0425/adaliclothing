import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Dialog, Zoom, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Rating } from '@mui/material';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  Divider,
  createTheme,
  ThemeProvider
} from '@mui/material';

export default function Shipping() {
  const location = useLocation();
  const navigate = useNavigate();
  
const { cartItems, totalPrice } = location.state;
const [discountPercentage, setDiscountPercentage] = useState(0);
const [orderSuccess, setOrderSuccess] = useState(false);
const [isLoading, setIsLoading] = useState(false);
const [darkMode, setDarkMode] = useState(true);
const [orderData, setOrderData] = useState({
  nev: '',
  telefonszam: '',
  email: '',
  irsz: '',
  telepules: '',
  kozterulet: ''
});
const [rating, setRating] = useState(0);
const [comment, setComment] = useState('');

const [errors, setErrors] = useState({
  nev: false,
  telefonszam: false,
  email: false,
  irsz: false,
  telepules: false,
  kozterulet: false
});
const validateForm = () => {
  const newErrors = {};
  let isValid = true;


  Object.keys(orderData).forEach(field => {
    if (!orderData[field].trim()) {
      newErrors[field] = true;
      isValid = false;
    } else {
      newErrors[field] = false;
    }
  });


  if (!orderData.email.includes('@')) {
    newErrors.email = true;
    isValid = false;
  }


  const irszRegex = /^\d{4}$/;
  if (!irszRegex.test(orderData.irsz)) {
    newErrors.irsz = true;
    isValid = false;
  }

 
  const phoneRegex = /^(\+36|06)[0-9]{9}$/;
  if (!phoneRegex.test(orderData.telefonszam)) {
    newErrors.telefonszam = true;
    isValid = false;
  }

  setErrors(newErrors);
  return isValid;
};

const discountAmount = Math.round((totalPrice * discountPercentage) / 100);
const finalPrice = totalPrice - discountAmount + 1590;
const handleSubmitOrder = async () => {

  if (!validateForm()) {
    return;
  }

  setIsLoading(true);
  try {
    const vevoResponse = await fetch('http://localhost:5000/vevo/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...orderData,
        vegosszeg: finalPrice
      })
    });

    if (!vevoResponse.ok) {
      const errorData = await vevoResponse.json();
      throw new Error(errorData.error || 'Hiba történt a rendelés során');
    }

    const vevoResult = await vevoResponse.json();


    for (const item of cartItems) {
      await fetch('http://localhost:5000/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          termek: item.id,
          statusz: 'Feldolgozás alatt',
          mennyiseg: item.mennyiseg,
          vevo_id: vevoResult.id,
          ar: item.ar
        })
      });
    }

    const optimizedCartItems = cartItems.map(item => ({
      id: item.id,
      nev: item.nev,
      ar: item.ar,
      mennyiseg: item.mennyiseg,
      size: item.size || item.meret,
      imageUrl: item.imageUrl // Csak az URL-t küldd, ne a teljes képet
    }));

    const emailResponse = await fetch('http://localhost:5000/send-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: orderData.email,
        name: orderData.nev,
        orderId: vevoResult.id,
        orderItems: optimizedCartItems,
        shippingDetails: {
          phoneNumber: orderData.telefonszam,
          zipCode: orderData.irsz,
          city: orderData.telepules,
          address: orderData.kozterulet
        },
        totalPrice: finalPrice,
        discount: discountAmount,
        shippingCost: 1590
      })
    });
    
        
           
        const emailResult = await emailResponse.json();
        if (emailResult.success) {
          console.log('Email sikeresen elküldve!');
        } else {
          console.error('Hiba az email küldésekor:', emailResult.error);
        }
  
        const user = JSON.parse(localStorage.getItem('user'));
if (user && user.f_azonosito) {
  await fetch(`http://localhost:5000/api/update-order-stats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: user.f_azonosito,
      orderAmount: finalPrice,
      orderDate: new Date()
    })
  });
}

        setOrderSuccess(true);

        localStorage.removeItem('cartItems');
      } catch (error) {
        console.error('Rendelési hiba:', error);
        alert('Hiba történt a rendelés során!');
      }
      setIsLoading(false);
    };
      
    const saveRatingToDatabase = async (rating, comment) => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        const response = await fetch('http://localhost:5000/save-rating', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            rating,
            velemeny: comment || null,
            email: userData.email,
            orderDate: new Date()
          })
        });
        
        if (response.ok) {
          console.log('Értékelés sikeresen mentve');
        }
      } catch (error) {
        console.error('Hiba az értékelés mentésekor:', error);
      }
    };
    
  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
      borderRadius: 2,
      color: '#fff'
    },
    '& .MuiInputLabel-root': {
      color: '#fff'
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(255,255,255,0.3)'
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(255,255,255,0.5)'
    }
  };

  const theme = createTheme({
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: darkMode ? '#666' : '#333',
              },
              '&.Mui-focused fieldset': {
                borderColor: darkMode ? '#888' : '#444',
              }
            }
          }
        }
      }
    }
  });     
  
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.kupon) {
        
        const matches = user.kupon.match(/\d+/);
        if (matches && matches.length > 0) {
          const percentage = parseInt(matches[0]);
          setDiscountPercentage(percentage);
        }
      }
    }
  }, []);
  

    return (
      <ThemeProvider theme={theme}>
       <Box
  style={{
    backgroundColor: darkMode ? '#333' : '#f5f5f5',
    backgroundImage: darkMode 
      ? 'radial-gradient(#666 1px, transparent 1px)'
      : 'radial-gradient(#e0e0e0 1px, transparent 1px)',
    backgroundSize: '20px 20px',
    color: darkMode ? 'white' : 'black',
    minHeight: '100vh',
    transition: 'all 0.3s ease-in-out',
    display: 'flex',        
    alignItems: 'center',      
    justifyContent: 'center', 
    padding: '3rem 0'         
  }}
>
          <Container maxWidth="lg">
            <Box
              sx={{
                display: 'flex',
                gap: 4,
                flexDirection: { xs: 'column', md: 'row' }
              }}
            >
             
              <Card
                elevation={8}
                sx={{
                  flex: 2,
                  backgroundColor: darkMode ? '#333' : '#fff',
                  borderRadius: 3,
                  padding: 4,
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)'
                  }
                }}
              >
                <Typography 
                  variant="h4" 
                  gutterBottom 
                  sx={{ 
                    color: darkMode ? '#fff' : '#333',
                    borderBottom: '2px solid',
                    borderColor: darkMode ? '#555' : '#ddd',
                    paddingBottom: 2,
                    marginBottom: 4
                  }}
                >
                  Szállítási adatok
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
  <TextField
    fullWidth
    label="Név"
    value={orderData.nev}
    onChange={(e) => setOrderData({...orderData, nev: e.target.value})}
    error={errors.nev}
    helperText={errors.nev ? "Irja be a nevet!" : ""}
    sx={textFieldStyle}
  />
  <TextField
    fullWidth
    label="Telefonszám" 
    value={orderData.telefonszam}
    onChange={(e) => setOrderData({...orderData, telefonszam: e.target.value})}
    error={errors.telefonszam}
    inputProps={{ maxLength: 12 }}
    helperText={errors.telefonszam ?"Érvénytelen telefonszám (+36 vagy 06 kezdettel)!" : ""}
    sx={textFieldStyle}
  />
  <TextField
    fullWidth
    label="Email"
    value={orderData.email} 
    onChange={(e) => setOrderData({...orderData, email: e.target.value})}
    error={errors.email}
    helperText={errors.email ? "Érvénytelen email cím!" :  ""}
    sx={textFieldStyle}
  />
  <TextField
    fullWidth
    label="Irányítószám"
    value={orderData.irsz}
    onChange={(e) => setOrderData({...orderData, irsz: e.target.value})}
    error={errors.irsz} 
    inputProps={{ maxLength: 4 }}
    helperText={errors.irsz ? "Az irányítószámnak pontosan 4 számjegyből kell állnia!"  : ""}
    sx={textFieldStyle}
  />
  <TextField
    fullWidth
    label="Település"
    value={orderData.telepules}
    onChange={(e) => setOrderData({...orderData, telepules: e.target.value})}
    error={errors.telepules}
    helperText={errors.telepules ? "Irja be a település nevét!" : ""}
    sx={textFieldStyle}
  />
  <TextField
    fullWidth
    label="Közterület"
    value={orderData.kozterulet}
    onChange={(e) => setOrderData({...orderData, kozterulet: e.target.value})}
    error={errors.kozterulet}
    helperText={errors.kozterulet ? "Adja meg a közterületét!" : ""}
    sx={textFieldStyle}
  />
</Box>
              </Card>
             
              <Card
                elevation={8}
                sx={{
                  flex: 1,
                  backgroundColor: darkMode ? '#333' : '#fff',
                  borderRadius: 3,
                  padding: 4,
                  height: 'fit-content',
                  position: 'sticky',
                  top: 20
                }}
              >
                <Typography 
                  variant="h5" 
                  sx={{ 
                    color: darkMode ? '#fff' : '#333',
                    marginBottom: 3,
                    borderBottom: '2px solid',
                    borderColor: darkMode ? '#555' : '#ddd',
                    paddingBottom: 2
                  }}
                >
                  Rendelés összegzése
                </Typography>

                <Box sx={{ mb: 4 }}>
                  {cartItems.map((item, index) => (
                    <Box 
                      key={index}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 2,
                        padding: 2,
                        backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                        borderRadius: 2
                      }}
                    >
           <Typography sx={{ color: '#fff' }}>
           {item.nev} - Méret: {item.size || item.meret} (x{item.mennyiseg})
    </Typography>

    <Typography sx={{ color: '#fff' }}>
    {(item.ar * item.mennyiseg).toLocaleString()} Ft
    </Typography>
                    </Box>
                  ))}
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography sx={{ color: '#fff' }}>Részösszeg:</Typography>
                    <Typography sx={{ color: '#fff' }}>{totalPrice.toLocaleString()} Ft</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography sx={{ color: '#fff' }}>Szállítási költség:</Typography>
                    <Typography sx={{ color: '#fff' }}>1590 Ft</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
  <Typography sx={{ color: '#fff' }}>Kedvezmény ({discountPercentage}%):</Typography>
  <Typography sx={{ color: '#fff' }}>-{discountAmount.toLocaleString()} Ft</Typography>
</Box>

                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      mt: 3,
                      backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      padding: 2,
                      borderRadius: 2
                    }}
                  >
                    <Typography sx={{ color: '#fff' }} variant="h6">Végösszeg:</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#fff' }}>
  {(totalPrice - discountAmount + 1590).toLocaleString()} Ft
</Typography>

                  </Box>
                </Box>

                <Box sx={{ 
    display: 'flex', 
    gap: 2, 
    mt: 3,
    justifyContent: 'space-between',
    alignItems: 'center' 
    }}>
    <Button
    variant="outlined"
    size="large"
    startIcon={<ArrowBackIcon />}
    onClick={() => navigate('/kezdolap')}
    sx={{
      width: '40%',
      py: 1.5,
      borderColor: darkMode ? '#666' : '#333',
      color: darkMode ? '#fff' : '#333',
      '&:hover': {
        borderColor: darkMode ? '#777' : '#444',
        backgroundColor: 'rgba(255,255,255,0.05)',
        transform: 'scale(1.02)'
      },
      transition: 'all 0.3s ease'
    }}
    >
    Vissza
    </Button>

    <Button
    variant="contained"
    size="large"
    onClick={handleSubmitOrder}
    sx={{
      fontSize: '1.1rem',
              fontWeight: 600,
      width: '55%',
      py: 1.5,
      backgroundColor: darkMode ? '#666' : '#333',
      '&:hover': {
        backgroundColor: darkMode ? '#777' : '#444',
        transform: 'scale(1.02)'
      },
      transition: 'all 0.3s ease'
    }}
    >
    Rendelés véglegesítése
    </Button>
    </Box>
              </Card>
            </Box>
            {isLoading && (
              <Box sx={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <CircularProgress />
              </Box>
            )}

            
<Dialog
  open={orderSuccess}
  TransitionComponent={Zoom}
  sx={{
    '& .MuiDialog-paper': {
      backgroundColor: darkMode ? '#333' : '#fff',
      borderRadius: 3,
      padding: 4,
      textAlign: 'center',
      minWidth: '400px'
    }
  }}
>
  <CheckCircleIcon sx={{ fontSize: 60, color: '#4CAF50', mb: 2 }} />
  <Typography variant="h5" sx={{ color: darkMode ? '#fff' : '#333', mb: 2 }}>
    Köszönjük a rendelését!
  </Typography>
  <Typography sx={{ color: darkMode ? '#ccc' : '#666', mb: 3 }}>
    A rendelés visszaigazolását elküldtük emailben.
  </Typography>
  
  <Box sx={{ mb: 3 }}>
    <Typography sx={{ color: darkMode ? '#ccc' : '#666', mb: 2 }}>
      Értékelje az élményét:
    </Typography>
    <Rating 
      size="large"
      value={rating}
      onChange={(event, newValue) => setRating(newValue)}
    />
    <TextField
      multiline
      rows={4}
      placeholder="Írd le véleményed..."
      value={comment}
      onChange={(e) => setComment(e.target.value)}
      sx={{ mt: 2, width: '100%' }}
    />
    <Button 
      onClick={() => {
        saveRatingToDatabase(rating, comment);
        navigate('/kezdolap');
      }}
      sx={{ mt: 2 }}
    >
      Értékelés küldése
    </Button>
  </Box>
</Dialog>
          </Container>
        </Box>
      </ThemeProvider>
    )
  
};