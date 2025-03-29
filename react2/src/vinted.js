import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Button,
  FormGroup,
  FormControlLabel,
  Switch,
  Popper,
  Grow,
  Paper,
  ClickAwayListener,
  MenuList,
  Badge,
  Avatar,
  MenuItem
} from '@mui/material';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Menu from './menu2';
import { useNavigate } from 'react-router-dom';
import Footer from './footer';
import { CircularProgress } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ShareProduct from './ShareProduct';


export default function Vinted() {
  const [darkMode, setDarkMode] = useState(true);
  const [sideMenuActive, setSideMenuActive] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
  const cartItemCount = cartItems.reduce((total, item) => total + item.mennyiseg, 0);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const anchorRef = useRef(null);
  const navigate = useNavigate();
  

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:5000/products');
        let data = await response.json();
        console.log("Products fetched:", data);
        
        // Ellenőrizzük, hogy a termékek tartalmazzák-e a feltolto mezőt
        data.forEach(product => {
          console.log(`Termék: ${product.nev}, Feltöltő: ${product.feltolto || 'Nincs megadva'}`);
        });
        
        // Lekérjük a feltöltők profilképeit
        const productsWithProfileImages = await Promise.all(data.map(async (product) => {
          if (product.feltolto) {
            try {
              console.log(`Profilkép lekérése: ${product.feltolto}`);
              const profileResponse = await fetch(`http://localhost:5000/profile-image/${product.feltolto}`);
              
              if (!profileResponse.ok) {
                console.log(`Nem sikerült lekérni a profilképet: ${product.feltolto}, státusz: ${profileResponse.status}`);
                return product;
              }
              
              const profileData = await profileResponse.json();
              console.log(`Profilkép válasz: `, profileData);
              
              if (profileData.success && profileData.profileImage) {
                console.log(`Profilkép sikeresen lekérve: ${product.feltolto}`);
                return {
                  ...product,
                  feltoltoKep: profileData.profileImage
                };
              }
            } catch (error) {
              console.error(`Hiba a profilkép lekérésekor: ${product.feltolto}`, error);
            }
          }
          return product;
        }));
        
        console.log('Termékek profilképekkel:', productsWithProfileImages);
        setProducts(productsWithProfileImages);
      } catch (error) {
        console.log('Hiba a termékek lekérésekor:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);
  


  
  
  useEffect(() => {
    const handleKeyPress = (event) => {
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      
      if (event.ctrlKey && event.shiftKey && event.key === 'Q') {
        if (user && user.email === 'adaliclothing@gmail.com') {
          navigate('/user');
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);
  

 

  const filteredProducts = selectedCategory 
      ? products.filter(product => {
          if (selectedCategory === 'Sapkák') return product.kategoriaId === 1;
          if (selectedCategory === 'Nadrágok') return product.kategoriaId === 2;
          if (selectedCategory === 'Zoknik') return product.kategoriaId === 3;
          if (selectedCategory === 'Pólók') return product.kategoriaId === 4;
          if (selectedCategory === 'Pulloverek') return product.kategoriaId === 5;
          if (selectedCategory === 'Kabátok') return product.kategoriaId === 6;
          if (selectedCategory === 'Lábviseletek') return product.kategoriaId === 7;
          if (selectedCategory === 'Atléták') return product.kategoriaId === 8;
          if (selectedCategory === 'Kiegészítők') return product.kategoriaId === 9;
          if (selectedCategory === 'Szoknyák') return product.kategoriaId === 10;
          if (selectedCategory === 'Alsóneműk') return product.kategoriaId === 11;
          if (selectedCategory === 'Mellények') return product.kategoriaId === 12;  
          return true;
        })
      : products;

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event = {}) => {
    if (event.target && anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleListKeyDown = (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutAlert(true);
    setOpen(false);
  };

  const confirmLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setShowLogoutAlert(false);
    navigate('/sign');
  };

  const toggleSideMenu = () => {
    setSideMenuActive((prev) => !prev);
  };

  const handleCartClick = () => {
    navigate('/kosar');
  };

  useEffect(() => {
    const checkLoginStatus = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setIsLoggedIn(true);
        setUserName(user.username || user.felhasznalonev || 'Felhasználó');
      }
    };
    checkLoginStatus();
  }, []);

    return (
<div style={{
  backgroundColor: darkMode ? '#333' : '#f5f5f5',
  backgroundImage: darkMode 
    ? 'radial-gradient(#444 1px, transparent 1px)'
    : 'radial-gradient(#aaaaaa 1px, transparent 1px)',  // Changed from #e0e0e0 to #aaaaaa for better visibility
  backgroundSize: '20px 20px',
  color: darkMode ? 'white' : 'black',
  minHeight: '100vh',
  transition: 'all 0.3s ease-in-out' 
}}>

       <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: darkMode ? '#333' : '#333',
          padding: '10px 20px',
          position: 'relative',
          width: '100%',
          boxSizing: 'border-box',
          borderBottom: '3px solid #ffffff', 
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', 
          marginBottom: '10px',
        }}
      >
        <IconButton
          onClick={toggleSideMenu}
          style={{ color: darkMode ? 'white' : 'white' }}
        >
          <MenuIcon />
        </IconButton>
      
        <Typography
            variant="h1"
            sx={{
              fontWeight: 'bold',
              fontSize: {
                xs: '1.1rem',    
                sm: '1.5rem', 
                md: '2rem'     
              },
              textAlign: 'center',
              color: 'white',
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'auto',
              pointerEvents: 'none'
          }}
        >
          Adali Clothing
        </Typography>
          <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {isLoggedIn ? (
            <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <IconButton
                onClick={handleCartClick}
                sx={{
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                <Badge 
                  badgeContent={cartItemCount} 
                  color="primary"
                  sx={{ 
                    '& .MuiBadge-badge': { 
                      backgroundColor: '#fff', 
                      color: '#333' 
                    } 
                  }}
                >
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
              <IconButton
                                ref={anchorRef}
                                onClick={handleToggle}
                                sx={{
                                  color: '#fff',
                                  zIndex: 1300,
                                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                  border: '1px solid rgba(255, 255, 255, 0.3)',
                                  borderRadius: '50%',
                                  padding: '8px',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    transform: 'scale(1.05)',
                                    boxShadow: '0 0 10px rgba(255, 255, 255, 0.2)'
                                  }
                                }}
                              >
                                <PersonIcon fontSize="medium" />
                              </IconButton>
                              <Popper
                open={open}
                anchorEl={anchorRef.current}
                placement="bottom-start"
                transition
                disablePortal
                sx={{ 
                  zIndex: 1300,
                  mt: 1, 
                  '& .MuiPaper-root': {
                    overflow: 'hidden',
                    borderRadius: '12px',
                    boxShadow: darkMode 
                      ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                      : '0 8px 32px rgba(0, 0, 0, 0.1)',
                    border: darkMode 
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : '1px solid rgba(0, 0, 0, 0.05)',
                  }
                }}
              >
                {({ TransitionProps, placement }) => (
                  <Grow
                    {...TransitionProps}
                    style={{
                      transformOrigin: placement === 'bottom-start' ? 'left top' : 'left bottom',
                    }}
                  >
                    <Paper
                      sx={{
                        backgroundColor: darkMode ? '#2d2d2d' : '#ffffff',
                        minWidth: '200px',
                      }}
                    >
                      <ClickAwayListener onClickAway={handleClose}>
                        <MenuList 
                          autoFocusItem={open} 
                          onKeyDown={handleListKeyDown}
                          sx={{ py: 1 }}
                        >
                          <MenuItem 
                            onClick={handleClose}
                            sx={{
                              py: 1.5,
                              px: 2,
                              color: darkMode ? '#fff' : '#333',
                              '&:hover': {
                                backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)',
                              },
                              gap: 2,
                            }}
                          >
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {userName} profilja
                            </Typography>
                          </MenuItem>

                          <MenuItem 
                            onClick={() => {
                              handleClose();
                              navigate('/fiokom');
                            }}
                            sx={{
                              py: 1.5,
                              px: 2,
                              color: darkMode ? '#fff' : '#333',
                              '&:hover': {
                                backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)',
                              },
                              gap: 2,
                            }}
                          >
                            <Typography variant="body1">Fiókom</Typography>
                          </MenuItem>

                         <MenuItem 
                                                    onClick={handleClose}
                                                    sx={{
                                                      py: 1.5,
                                                      px: 2,
                                                      color: darkMode ? '#fff' : '#333',
                                                      '&:hover': {
                                                        backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)',
                                                      },
                                                      gap: 2,
                                                    }}
                                                  >
                                                    <Typography variant="body1">
                                                      {(() => {
                                                        const user = JSON.parse(localStorage.getItem('user') || '{}');
                                                        if (user.kupon) {
                                                          if (user.kupon_hasznalva) {
                                                            return `Kupon: ${user.kupon} (Felhasználva)`;
                                                          } else if (user.kupon === 'Nincs nyeremény') {
                                                            return `Kupon: ${user.kupon} `;
                                                          } else {
                                                            return `Kupon: ${user.kupon} (Aktív)`;
                                                          }
                                                        } else {
                                                          return 'Nincs kuponod';
                                                        }
                                                      })()}
                                                    </Typography>
                                                  </MenuItem>

              
                          <MenuItem 
                            onClick={handleLogout}
                            sx={{
                              py: 1.5,
                              px: 2,
                              color: '#ff4444',
                              '&:hover': {
                                backgroundColor: 'rgba(255,68,68,0.1)',
                              },
                              gap: 2,
                              borderTop: '1px solid',
                              borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                              mt: 1,
                            }}
                          >
                            <Typography variant="body1">Kijelentkezés</Typography>
                          </MenuItem>
                        </MenuList>
                      </ClickAwayListener>
                    </Paper>
                  </Grow>
                )}
              </Popper>
            </Box>
          ) : (
            <>
              <Button
               component={Link}
               to="/sign"
               sx={{
                 color: '#fff',
                 border: '1px solid #fff',
                 borderRadius: '5px',
                 padding: {
                   xs: '2px 6px',  
                   sm: '5px 10px'
                 },
                 fontSize: {
                   xs: '0.7rem',   
                   sm: '1rem'
                 },
                 whiteSpace: 'nowrap',
                 '&:hover': {
                   backgroundColor: '#fff',
                   color: '#333',
                 },
               }}
             >
               Sign In
             </Button>
             
             <Button
               component={Link}
               to="/signup"
               sx={{
                 color: '#fff',
                 border: '1px solid #fff',
                 borderRadius: '5px',
                 padding: {
                   xs: '2px 6px',  
                   sm: '5px 10px'
                 },
                 fontSize: {
                   xs: '0.7rem',   
                   sm: '1rem'
                 },
                 whiteSpace: 'nowrap',
                 '&:hover': {
                   backgroundColor: '#fff',
                   color: '#333',
                 },
               }}
             >
               Sign Up
             </Button>
            </>
          )}
        </Box>
      </div>

      <Box sx={{
        position: 'fixed',
        top: 0,
        left: sideMenuActive ? 0 : '-250px',
        width: '250px',
        height: '100%',
        backgroundColor: '#fff',
        boxShadow: '4px 0px 10px rgba(0, 0, 0, 0.2)',
        zIndex: 1200,
        transition: 'left 0.1s ease-in-out',
      }}>
        <Menu sideMenuActive={sideMenuActive} toggleSideMenu={toggleSideMenu} />
      </Box>

      <FormGroup sx={{ position: 'absolute', top: 60, right: 20 }}>
        <FormControlLabel
          control={
            <Switch
              color="default"
              checked={darkMode}
              onChange={() => setDarkMode((prev) => !prev)}
            />
          }
          label="Dark Mode"
        />
      </FormGroup>

      <Container maxWidth="xl" sx={{ mt: 8, mb: 8 }}>
        <Typography variant="h4" sx={{ mb: 4, textAlign: 'center', color: darkMode ? 'white' : 'black' }}>
          Feltöltött Termékek
        </Typography>

        <Box sx={{ 
  display: 'flex', 
  justifyContent: 'center', 
  gap: 1.5, 
  mb: 5, 
  flexWrap: 'wrap',
  marginTop: '30px'
}}>
  {[
    { id: null, name: 'Összes' },
    { id: 'Pólók', name: 'Pólók' },
    { id: 'Nadrágok', name: 'Nadrágok' },
    { id: 'Pulloverek', name: 'Pulóverek' },
    { id: 'Zoknik', name: 'Zoknik' },
    { id: 'Kabátok', name: 'Kabátok' },
    { id: 'Lábviseletek', name: 'Lábviseletek' },
    { id: 'Atléták', name: 'Atléták' },
    { id: 'Szoknyák', name: 'Szoknyák' },
    { id: 'Alsóneműk', name: 'Alsóneműk' },
    { id: 'Mellények', name: 'Mellények' },
    { id: 'Sapkák', name: 'Sapkák' },
    { id: 'Kiegészítők', name: 'Kiegészítők' }
  ].map(category => (
    <Button 
      key={category.id || 'all'}
      variant={selectedCategory === category.id ? "contained" : "outlined"}
      onClick={() => setSelectedCategory(category.id)}
      sx={{ 
        borderRadius: '20px',
        px: 2,
        py: 0.8,
        backgroundColor: selectedCategory === category.id 
          ? (darkMode ? '#1976d2' : '#1976d2') 
          : 'transparent',
        borderColor: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
        color: selectedCategory === category.id 
          ? '#fff' 
          : (darkMode ? '#fff' : '#333'),
        '&:hover': {
          backgroundColor: selectedCategory === category.id 
            ? (darkMode ? '#1565c0' : '#1565c0') 
            : (darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'),
          borderColor: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)',
        },
        textTransform: 'none',
        fontWeight: 500,
        fontSize: '0.9rem',
        transition: 'all 0.2s ease'
      }}
    >
      {category.name}
    </Button>
  ))}
</Box>

        {isLoading ? (
  <Box sx={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh',
    flexDirection: 'column',
    gap: 2
  }}>
    <CircularProgress />
    <Typography variant="h6" sx={{ color: darkMode ? '#fff' : '#333' }}>
      Termékek betöltése...
    </Typography>
  </Box>
) : (
  <Grid container spacing={3}>
   {filteredProducts.map((product) => (
    <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
  <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
    <Card sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: darkMode ? '#222' : 'white',
      color: darkMode ? 'white' : 'black',
      transition: 'all 0.3s ease',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: darkMode 
        ? '0 8px 20px rgba(0, 0, 0, 0.3)' 
        : '0 8px 20px rgba(0, 0, 0, 0.1)',
      border: 'none',
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: darkMode 
          ? '0 12px 30px rgba(0, 0, 0, 0.5)' 
          : '0 12px 30px rgba(0, 0, 0, 0.15)'
      }
    }}>
      <Box sx={{ 
        position: 'relative', 
        paddingTop: '120%', // 5:6 arány a képeknek
        overflow: 'hidden',
        backgroundColor: darkMode ? '#333' : '#f5f5f5'
      }}>
        <CardMedia
          component="img"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease'
          }}
          image={product.imageUrl}
          alt={product.nev}
        />
        {/* Ár badge */}
        <Box sx={{
          position: 'absolute',
          bottom: 10,
          right: 10,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '20px',
          fontWeight: 'bold',
          fontSize: '1rem',
          backdropFilter: 'blur(5px)'
        }}>
          {product.ar} Ft
        </Box>
      </Box>
      
      <CardContent sx={{ 
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        p: 2,
        gap: 1
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start'
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              fontSize: '1.1rem',
              color: darkMode ? 'white' : '#333',
              mb: 0.5
            }}
          >
            {product.nev}
          </Typography>
          
          <ShareProduct product={product} darkMode={darkMode} source="vinted" />
        </Box>
        
        {/* Feltöltő információk */}
        {product.feltolto && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            mt: 0.5
          }}>
            <Avatar 
              src={product.feltoltoKep} 
              alt={product.feltolto}
              sx={{ 
                width: 28, 
                height: 28,
                bgcolor: !product.feltoltoKep ? '#1976d2' : 'transparent',
                border: '2px solid',
                borderColor: darkMode ? '#444' : '#e0e0e0'
              }}
            >
              {!product.feltoltoKep && product.feltolto.charAt(0).toUpperCase()}
            </Avatar>
            <Typography 
              variant="body2" 
              sx={{ 
                fontSize: '0.8rem',
                color: darkMode ? '#aaa' : '#666',
                fontWeight: 500
              }}
            >
              {product.feltolto}
            </Typography>
          </Box>
        )}
        
        <Typography 
          variant="body2" 
          sx={{
            color: darkMode ? '#ccc' : '#555',
            mt: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.3
          }}
        >
          {product.leiras}
        </Typography>
        
        <Box sx={{ 
          mt: 'auto', 
          pt: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography 
            variant="body2" 
            sx={{
              color: darkMode ? '#aaa' : '#666',
              fontWeight: 500,
              padding: '3px 10px',
              backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              borderRadius: '12px',
              fontSize: '0.75rem'
            }}
          >
            Méret: {product.meret}
          </Typography>
          
          <Button 
            size="small" 
            sx={{
              minWidth: 'auto',
              color: darkMode ? '#90caf9' : '#1976d2',
              '&:hover': {
                backgroundColor: darkMode ? 'rgba(144, 202, 249, 0.1)' : 'rgba(25, 118, 210, 0.1)'
              }
            }}
          >
            Részletek
          </Button>
        </Box>
      </CardContent>
    </Card>
  </Link>
</Grid>

))}
  </Grid>
)}


        {showLogoutAlert && (
  <Box
    sx={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 1400,
      animation: 'popIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      '@keyframes popIn': {
        '0%': {
          opacity: 0,
          transform: 'translate(-50%, -50%) scale(0.5)',
        },
        '50%': {
          transform: 'translate(-50%, -50%) scale(1.05)',
        },
        '100%': {
          opacity: 1,
          transform: 'translate(-50%, -50%) scale(1)',
        },
      },
    }}
  >
    <Card
      sx={{
        minWidth: 350,
        backgroundColor: darkMode ? 'rgba(45, 45, 45, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        color: darkMode ? '#fff' : '#000',
        boxShadow: darkMode 
          ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
          : '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        borderRadius: '20px',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #00C853, #B2FF59)',
          animation: 'loadingBar 2s ease-in-out',
          '@keyframes loadingBar': {
            '0%': { width: '0%' },
            '100%': { width: '100%' }
          }
        }}
      />
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 600,
              mb: 1,
              background: darkMode 
              ? 'linear-gradient(45deg, #90caf9, #42a5f5)' 
              : 'linear-gradient(45deg, #1976d2, #1565c0)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Kijelentkezés
          </Typography>
          <Typography variant="body1" sx={{ color: darkMode ? '#aaa' : '#666' }}>
            Biztosan ki szeretnél jelentkezni?
          </Typography>
        </Box>
        <Box 
          sx={{ 
            display: 'flex', 
            gap: 2,
            justifyContent: 'space-between'
          }}
        >
          <Button
            onClick={() => setShowLogoutAlert(false)}
            sx={{
              flex: 1,
              py: 1.5,
              borderRadius: '12px',
              backgroundColor: darkMode ? 'rgba(144, 202, 249, 0.1)' : 'rgba(25, 118, 210, 0.1)',
              color: darkMode ? '#90caf9' : '#1976d2',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: darkMode ? 'rgba(144, 202, 249, 0.2)' : 'rgba(25, 118, 210, 0.2)',
                transform: 'translateY(-2px)',
              }
            }}
          >
            Mégse
          </Button>
          <Button
            onClick={confirmLogout}
            sx={{
              flex: 1,
              py: 1.5,
              borderRadius: '12px',
              background: darkMode 
              ? 'linear-gradient(45deg, #90caf9, #42a5f5)' 
              : 'linear-gradient(45deg, #1976d2, #1565c0)',
              color: '#fff',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
              }
            }}
          >
            Kijelentkezés
          </Button>
        </Box>
      </CardContent>
    </Card>
  </Box>
)}

      </Container>
      <Box sx={{ 
      backgroundColor: darkMode ? '#333' : '#f5f5f5',
      backgroundImage: darkMode 
        ? 'radial-gradient(#444 1px, transparent 1px)'
        : 'radial-gradient(#e0e0e0 1px, transparent 1px)',
      backgroundSize: '20px 20px',
      pb: 8 
    }}>
    </Box>
      <Footer />
    </div>
  );
}
