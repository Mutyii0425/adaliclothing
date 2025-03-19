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
  MenuItem
} from '@mui/material';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Menu from './menu2';
import { useNavigate } from 'react-router-dom';
import Footer from './footer';
import { CircularProgress } from '@mui/material';


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
        const data = await response.json();
        await new Promise(resolve => setTimeout(resolve, 1500));
        setProducts(data);
      } catch (error) {
        console.log('Hiba:', error);
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
  

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.log('Hiba a termékek betöltésekor:', error);
      }
    };
    fetchProducts();
  }, []);

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
    : 'radial-gradient(#e0e0e0 1px, transparent 1px)',
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
              <Button
                                ref={anchorRef}
                                onClick={handleToggle}
                                sx={{
                                  color: '#fff',
                                  zIndex: 1300,
                                  border: '1px solid #fff',
                                  borderRadius: '5px',
                                  padding: '5px 10px',
                                }}
                              >
                                Profil
                              </Button>
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
                    gap: 2, 
                    mb: 4, 
                    flexWrap: 'wrap',
                    marginTop: '20px'
                  }}>
                    <Button 
                      variant="contained"
                      onClick={() => setSelectedCategory(null)}
                      sx={{ 
                        backgroundColor: !selectedCategory ? '#333' : '#555',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: !selectedCategory ? '#444' : '#666',
                        }
                      }}
                    >
                      Összes
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => setSelectedCategory('Pólók')}
                      sx={{ 
                        backgroundColor: selectedCategory === 'Pólók' ? '#333' : '#555',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: selectedCategory === 'Pólók' ? '#444' : '#666',
                        }
                      }}
                    >
                      Pólók
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => setSelectedCategory('Nadrágok')}
                      sx={{ 
                        backgroundColor: selectedCategory === 'Nadrágok' ? '#333' : '#555',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: selectedCategory === 'Nadrágok' ? '#444' : '#666',
                        }
                      }}
                    >
                      Nadrágok
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => setSelectedCategory('Pulloverek')}
                      sx={{ 
                        backgroundColor: selectedCategory === 'Pulloverek' ? '#333' : '#555',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: selectedCategory === 'Pulloverek' ? '#444' : '#666',
                        }
                      }}
                    >
                      Pulóverek
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => setSelectedCategory('Zoknik')}
                      sx={{ 
                        backgroundColor: selectedCategory === 'Zoknik' ? '#333' : '#555',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: selectedCategory === 'Zoknik' ? '#444' : '#666',
                        }
                      }}
                    >
                      Zoknik
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => setSelectedCategory('Kabátok')}
                      sx={{ 
                        backgroundColor: selectedCategory === 'Kabátok' ? '#333' : '#555',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: selectedCategory === 'Kabátok' ? '#444' : '#666',
                        }
                      }}
                    >
                      Kabátok
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => setSelectedCategory('Lábviseletek')}
                      sx={{ 
                        backgroundColor: selectedCategory === 'Lábviseletek' ? '#333' : '#555',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: selectedCategory === 'Lábviseletek' ? '#444' : '#666',
                        }
                      }}
                    >
                      Lábviseletek
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => setSelectedCategory('Atléták')}
                      sx={{ 
                        backgroundColor: selectedCategory === 'Atléták' ? '#333' : '#555',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: selectedCategory === 'Atléták' ? '#444' : '#666',
                        }
                      }}
                    >
                      Atléták
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => setSelectedCategory('Szoknyák')}
                      sx={{ 
                        backgroundColor: selectedCategory === 'Szoknyák' ? '#333' : '#555',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: selectedCategory === 'Szoknyák' ? '#444' : '#666',
                        }
                      }}
                    >
                      Szoknyák
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => setSelectedCategory('Alsóneműk')}
                      sx={{ 
                        backgroundColor: selectedCategory === 'Alsóneműk' ? '#333' : '#555',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: selectedCategory === 'Alsóneműk' ? '#444' : '#666',
                        }
                      }}
                    >
                      Alsóneműk
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => setSelectedCategory('Mellények')}
                      sx={{ 
                        backgroundColor: selectedCategory === 'Mellények' ? '#333' : '#555',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: selectedCategory === 'Mellények' ? '#444' : '#666',
                        }
                      }}
                    >
                      Mellények
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => setSelectedCategory('Kiegészítők')}
                      sx={{ 
                        backgroundColor: selectedCategory === 'Kiegészítők' ? '#333' : '#555',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: selectedCategory === 'Kiegészítők' ? '#444' : '#666',
                        }
                      }}
                    >
                      Kiegészítők
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => setSelectedCategory('Sapkák')}
                      sx={{ 
                        backgroundColor: selectedCategory === 'Sapkák' ? '#333' : '#555',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: selectedCategory === 'Sapkák' ? '#444' : '#666',
                        }
                      }}
                    >
                      Sapkák
                    </Button>

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
  height: '500px',
  backgroundColor: darkMode ? '#333' : 'white',
  color: darkMode ? 'white' : 'black',
  transition: 'transform 0.2s',
  border: darkMode ? '1px solid #fff' : '1px solid #000',
  '&:hover': {
    transform: 'scale(1.02)'
  }
}}>
            <Box sx={{ position: 'relative', height: '350px' }}>
              <CardMedia
                component="img"
                sx={{
                  height: '100%',
                  width: '100%',
                  objectFit: 'contain'
                }}
                image={product.imageUrl}
                alt={product.nev}
              />
            </Box>
            <CardContent>
              <Typography variant="h6" color={darkMode ? 'white' : 'black'}>
                {product.nev}
              </Typography>
              <Typography variant="h6" color="primary">
                {product.ar} Ft
              </Typography>
              <Typography variant="body2" color={darkMode ? 'grey.300' : 'text.secondary'}>
                {product.leiras}
              </Typography>
              <Typography variant="body2" color={darkMode ? 'grey.300' : 'text.secondary'}>
                Méret: {product.meret}
              </Typography>
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