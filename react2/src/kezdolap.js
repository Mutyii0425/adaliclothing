import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Typography, 
  Button, 
  IconButton, 
  FormGroup, 
  FormControlLabel, 
  Switch, 
  Box,
  ClickAwayListener,
  Grow,
  Paper,
  Popper,
  MenuItem,
  MenuList,
  Card,
  Dialog,
  useMediaQuery,
  CardContent,
  Badge,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import fek from './kep/fekete.jpg';
import polo from './kep/polo.jpg';
import vinted from './kep/vinted.jpg';
import polok from './kep/polok.png';
import pulcsik from './kep/pulcsik.png';
import gatyak from './kep/gatyak.png';
import Footer from './footer';
import Menu from './menu2';
import { useInView } from 'react-intersection-observer';
import { Rating } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';

const prizes = [
  { option: 'Nincs nyeremény', style: { backgroundColor: '#34495E', textColor: '#fff' }},
  { option: '10% kedvezmény', style: { backgroundColor: '#2ECC71', textColor: '#fff' }},
  { option: '5% kedvezmény', style: { backgroundColor: '#34495E', textColor: '#fff' }},
  { option: '25% kedvezmény', style: { backgroundColor: '#2ECC71', textColor: '#fff' }},
  { option: '20% kedvezmény', style: { backgroundColor: '#34495E', textColor: '#fff' }},
  { option: '15% kedvezmény', style: { backgroundColor: '#2ECC71', textColor: '#fff' }}
];

const CouponAlert = ({ 
  open, 
  onClose, 
  darkMode, 
  onPrizeWon,  
  setWonPrize,
  setShowWelcomeDialog,
  setShowSuccessAlert,
  saveCouponToDatabase
}) => {
  const [currentPrize, setCurrentPrize] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);

  

  const spinCoupon = () => {
    setIsSpinning(true);
    let spins = 0;
    const maxSpins = 30;
    const interval = setInterval(() => {
      const randomPrize = prizes[Math.floor(Math.random() * prizes.length)].option;
      setCurrentPrize(randomPrize);
      spins++;
      
      if (spins >= maxSpins) {
        clearInterval(interval);
        const finalPrize = prizes[Math.floor(Math.random() * prizes.length)].option;
        
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
          user.hasWonPrize = true;
          user.hasSpun = true;
          user.kupon = finalPrize;
          delete user.isNewRegistration;
          localStorage.setItem('user', JSON.stringify(user));
        }

        setCurrentPrize(finalPrize);
        
        setTimeout(() => {
          setIsSpinning(false);
          
        
          if (typeof onPrizeWon === 'function') {
            onPrizeWon(finalPrize);
          } else {
           
            setWonPrize && setWonPrize(finalPrize);
            setShowWelcomeDialog && setShowWelcomeDialog(false);
            setTimeout(() => {
              saveCouponToDatabase && saveCouponToDatabase(finalPrize);
              setShowSuccessAlert && setShowSuccessAlert(true);
            }, 800);
          }
          
          onClose();
        }, 500);
      }
    }, 100);
  };

  return (
    <Dialog
      open={open}
      sx={{
        '& .MuiDialog-paper': {
          backgroundColor: darkMode ? '#1E1E1E' : '#fff',
          borderRadius: '25px',
          padding: '3rem',
          minWidth: '450px',
          textAlign: 'center',
          animation: 'fadeIn 0.3s ease-out',
          '@keyframes fadeIn': {
            from: { opacity: 0, transform: 'translateY(-20px)' },
            to: { opacity: 1, transform: 'translateY(0)' }
          }
        }
      }}
    >
      <Typography 
        variant="h4" 
        sx={{ 
          color: '#60BA97', 
          mb: 3,
          animation: 'slideDown 0.5s ease-out',
          '@keyframes slideDown': {
            from: { opacity: 0, transform: 'translateY(-20px)' },
            to: { opacity: 1, transform: 'translateY(0)' }
          }
        }}
      >
        Nyerj Kedvezményt!
      </Typography>
      
      <Typography 
        variant="h5" 
        sx={{ 
          color: darkMode ? '#fff' : '#333', 
          mb: 4,
          transition: 'all 0.3s ease',
          transform: isSpinning ? 'scale(1.1)' : 'scale(1)',
          animation: isSpinning ? 'pulse 0.5s infinite alternate' : 'none',
          '@keyframes pulse': {
            from: { opacity: 0.8, transform: 'scale(1)' },
            to: { opacity: 1, transform: 'scale(1.1)' }
          }
        }}
      >
        {isSpinning ? currentPrize : 'Kattints a sorsoláshoz!'}
      </Typography>

      <Button
        onClick={spinCoupon}
        disabled={isSpinning}
        sx={{
          background: 'linear-gradient(45deg, #60BA97, #4e9d7e)',
          padding: '15px 40px',
          color: '#fff',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0 6px 20px rgba(96,186,151,0.4)'
          },
          '&:disabled': {
            background: 'linear-gradient(45deg, #60BA97, #4e9d7e)',
            opacity: 0.7
          }
        }}
      >
        {isSpinning ? 'Sorsolás...' : 'Sorsol'}
      </Button>
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          color: darkMode ? '#60BA97' : '#4e9d7e',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'rotate(90deg)',
            color: '#60BA97'
          }
        }}
      >
        <CloseIcon />
      </IconButton>
    </Dialog>
  );
};

const Home = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [sideMenuActive, setSideMenuActive] = useState(false);
  const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
  const cartItemCount = cartItems.reduce((total, item) => total + item.mennyiseg, 0);
  const [darkMode, setDarkMode] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [wonPrize, setWonPrize] = useState('');
  const [spinComplete, setSpinComplete] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [ratings, setRatings] = useState([]);
  const scrollbarRef = useRef(null);
  const contentRef = useRef(null);
  const [animationStates, setAnimationStates] = useState({});

  const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isExtraSmall = useMediaQuery('(max-width:400px)');

  const startAnimation = (elementId, animationName, duration = 1000) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    
    setAnimationStates(prev => ({
      ...prev,
      [elementId]: true
    }));
    
   
    element.style.animation = 'none';
    void element.offsetWidth; // Force reflow
    element.style.animation = `${animationName} ${duration}ms`;
    
   
    setTimeout(() => {
      setAnimationStates(prev => ({
        ...prev,
        [elementId]: false
      }));
    }, duration);
  };

  
  const resetAllAnimations = () => {
   
    const animatedElements = ['slideImage', 'slideText', 'slideButton'];
    
    animatedElements.forEach(elementId => {
      const element = document.getElementById(elementId);
      if (element) {
        element.style.animation = 'none';
        void element.offsetWidth; // Force reflow
      }
    });
    
   
    setAnimationStates({});
    setIsAnimating(false);
  };

 
  useEffect(() => {
    
    const resetInterval = setInterval(() => {
      resetAllAnimations();
    }, 10 * 60 * 1000);
    
    return () => clearInterval(resetInterval);
  }, []);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let rafId;
    
    const checkPerformance = () => {
      const now = performance.now();
      const delta = now - lastTime;
      frameCount++;
      
      if (delta >= 1000) {
        const fps = Math.round((frameCount * 1000) / delta);
        
       
        if (fps < 30) {
         
          document.body.classList.add('reduced-animations');
        } else {
          document.body.classList.remove('reduced-animations');
        }
        
        frameCount = 0;
        lastTime = now;
      }
      
      rafId = requestAnimationFrame(checkPerformance);
    };
    
    rafId = requestAnimationFrame(checkPerformance);
    
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);

  const handlePrizeWon = (prize) => {
    console.log("Nyeremény megkapva:", prize);
    setWonPrize(prize);
    setShowWelcomeDialog(false);
    
    // Késleltetés után mutassuk az eredményt
    setTimeout(() => {
      saveCouponToDatabase(prize);
      setShowSuccessAlert(true);
    }, 800);
  };
  

  // A Home komponensben:
useEffect(() => {
  console.log("showSuccessAlert állapot változott:", showSuccessAlert);
  console.log("wonPrize állapot:", wonPrize);
}, [showSuccessAlert, wonPrize]);


  const [dialogAnimationState, setDialogAnimationState] = useState({
    welcomeDialog: false,
    successAlert: false,
    logoutAlert: false
  });

  // Dialógus megjelenítése animációval
  const showDialog = (dialogType) => {
    // Először állítsuk be az animáció kezdeti állapotát
    requestAnimationFrame(() => {
      setDialogAnimationState(prev => ({
        ...prev,
        [dialogType]: true
      }));
    });
  };

  // Dialógus elrejtése animációval
  const hideDialog = (dialogType) => {
    // Animáció befejezése után rejtsük el a dialógust
    const dialogElement = document.querySelector(`.${dialogType}-dialog`);
    if (dialogElement) {
      dialogElement.style.animation = 'fadeOut 0.3s forwards';
      
      setTimeout(() => {
        setDialogAnimationState(prev => ({
          ...prev,
          [dialogType]: false
        }));
      }, 300);
    } else {
      // Ha nincs DOM elem, egyszerűen rejtsük el
      setDialogAnimationState(prev => ({
        ...prev,
        [dialogType]: false
      }));
    }
  };

  useEffect(() => {
    const scrollbar = scrollbarRef.current;
    const content = contentRef.current;
  
    const handleScroll = () => {
      const scrollPercentage = scrollbar.scrollLeft / (scrollbar.scrollWidth - scrollbar.clientWidth);
      const scrollAmount = (content.scrollWidth - content.clientWidth) * scrollPercentage;
      content.scrollLeft = scrollAmount;
    };
  
    if (scrollbar && content) {
      scrollbar.addEventListener('scroll', handleScroll);
      return () => scrollbar.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  
  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await fetch('http://localhost:5000/get-all-ratings');
        const data = await response.json();
        console.log('Fetched ratings:', data);
        setRatings(data || []);
      } catch (error) {
        console.error('Error fetching ratings:', error);
      }
    };
    
    fetchRatings();
  }, []);

  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true
  });

  const [initialPosition, setInitialPosition] = useState({
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  });

  useEffect(() => {
    const updatePosition = () => {
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      setInitialPosition({
        top: `${viewportHeight / 2}px`,
        left: `${viewportWidth / 2}px`,
        transform: 'translate(-50%, -50%)'
      });
    };
  
    updatePosition();
    window.addEventListener('resize', updatePosition);
  
    return () => window.removeEventListener('resize', updatePosition);
  }, []);
  
  const saveCouponToDatabase = async (coupon) => {
    const userData = JSON.parse(localStorage.getItem('user'));
    try {
      const response = await fetch('http://localhost:5000/update-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.email,
          coupon: coupon,
          couponUsed: false 
        })
      });
      if (response.ok) {
        userData.kupon = coupon;
        userData.kupon_hasznalva = false;
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Kupon mentési hiba:', error);
    }
  };
  
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.isNewRegistration && !user.hasSpun) {
        setShowWelcomeDialog(true);
      }
    }
  }, []);

  const handleSpinComplete = (prize) => {
    setSpinComplete(true);
    setShowWelcomeDialog(false);
    const user = JSON.parse(localStorage.getItem('user'));
    user.hasWonPrize = true;
    delete user.isNewRegistration;
    localStorage.setItem('user', JSON.stringify(user));
  };

  const images = [
    {
      img: polok,
      title: "Friss kollekció érkezett!",
      subtitle: "Dobd fel a szettjeid a legújabb kollekcióval! Ne maradj le róluk.",
      imageStyle: {}
    },
    {
      img: gatyak,
      title: "Téli nadrágok",
      subtitle: "Leghidegebb napokon is melegen tart!",
      imageStyle: { transform: 'translateY(-50px)' }
    },
    {
      img: pulcsik,
      title: "Kényelmes pullover",
      subtitle: "Ez a pullover minden alkalomra tökéletes, egyedi design. Csapj le rájuk, amíg van készleten!",
      imageStyle: {}
    }
  ];

  const styles = {
    root: {
      overflowX: 'hidden', 
      width: '100%',
      position: 'relative'
    }
  };

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
    images.forEach(image => {
      const img = new Image();
      img.src = image.img;
    });
  }, []);

  useEffect(() => {
    if (sideMenuActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [sideMenuActive]);

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

  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {

    if (!isAnimating) {
      const timer = setTimeout(() => {
        setIsAnimating(true);
        console.log("Animáció indítása, jelenlegi kép:", currentImageIndex);
  
        const imageElement = document.getElementById('slideImage');
        const textElement = document.getElementById('slideText');
  
        if (imageElement && textElement) {
 
          imageElement.style.animation = 'slideOutLeft 1.5s ease-in-out';
          textElement.style.animation = 'slideOutRight 1.5s ease-in-out';
          
    
          setTimeout(() => {
       
            const nextIndex = currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1;
            console.log("Képváltás:", currentImageIndex, "->", nextIndex);
            setCurrentImageIndex(nextIndex);
            
       
            imageElement.style.animation = 'slideInLeft 1.5s ease-in-out';
            textElement.style.animation = 'slideInRight 1.5s ease-in-out';
            
          
            setTimeout(() => {
              setIsAnimating(false);
              console.log("Animáció befejezve, új kép:", nextIndex);
            }, 1500);
          }, 1500);
        }
      }, 4500);
      
      return () => clearTimeout(timer);
    }
  }, [currentImageIndex, isAnimating, images.length]);

    return (
      <div style={{
        backgroundColor: darkMode ? '#333' : '#f5f5f5',
        backgroundImage: darkMode 
        ? 'radial-gradient(#444 1px, transparent 1px)'
        : 'radial-gradient(#aaaaaa 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        color: darkMode ? 'white' : 'black',
        minHeight: '100vh',
        transition: 'all 0.3s ease-in-out' 
      }}>

        <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: sideMenuActive ? 0 : '-250px',
          width: '250px',
          height: '100%',
          backgroundColor: '#fff',
          boxShadow: '4px 0px 10px rgba(0, 0, 0, 0.2)',
          zIndex: 1200,
          transition: 'left 0.1s ease-in-out',
        }}
      >
        <IconButton
          onClick={toggleSideMenu}
          sx={{
            position: 'absolute',
            zIndex: 1300,
            top: '10px',
            right: '10px',
          }}
        >
          <CloseIcon />
        </IconButton>
        <Menu sideMenuActive={sideMenuActive} toggleSideMenu={toggleSideMenu} />
      </Box>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: darkMode ? '#333' : '#333',
          padding: isExtraSmall ? '8px 12px' : '10px 20px',
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
          style={{ 
            color: darkMode ? 'white' : 'white',
            padding: isExtraSmall ? '4px' : '8px'
          }}
        >
          <MenuIcon fontSize={isExtraSmall ? "small" : "medium"} />
        </IconButton>
      
        <Typography
          variant="h1"
          sx={{
            fontWeight: 'bold',
            fontSize: {
              xs: isExtraSmall ? '0.9rem' : '1.1rem',
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
        <Box sx={{ display: 'flex', gap: isExtraSmall ? '5px' : '10px', alignItems: 'center' }}>
          {isLoggedIn ? (
            <Box sx={{ display: 'flex', gap: isExtraSmall ? '5px' : '10px', alignItems: 'center' }}>
              <IconButton
                onClick={handleCartClick}
                sx={{
                  color: '#fff',
                  padding: isExtraSmall ? '4px' : '8px',
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
                      color: '#333',
                      fontSize: isExtraSmall ? '0.6rem' : '0.75rem',
                      minWidth: isExtraSmall ? '14px' : '20px',
                      height: isExtraSmall ? '14px' : '20px'
                    } 
                  }}
                >
                  <ShoppingCartIcon fontSize={isExtraSmall ? "small" : "medium"} />
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
                  padding: isExtraSmall ? '4px' : '8px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    transform: 'scale(1.05)',
                    boxShadow: '0 0 10px rgba(255, 255, 255, 0.2)'
                  }
                }}
              >
                <PersonIcon fontSize={isExtraSmall ? "small" : "medium"} />
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
                        minWidth: isExtraSmall ? '180px' : '200px',
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
                              py: isExtraSmall ? 1 : 1.5,
                              px: isExtraSmall ? 1.5 : 2,
                              color: darkMode ? '#fff' : '#333',
                              '&:hover': {
                                backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)',
                              },
                              gap: 2,
                            }}
                          >
                            <Typography variant="body1" sx={{ 
                              fontWeight: 500,
                              fontSize: isExtraSmall ? '0.8rem' : 'inherit'
                            }}>
                              {userName} profilja
                            </Typography>
                          </MenuItem>

                          <MenuItem 
                            onClick={() => {
                              handleClose();
                              navigate('/fiokom');
                            }}
                            sx={{
                              py: isExtraSmall ? 1 : 1.5,
                              px: isExtraSmall ? 1.5 : 2,
                              color: darkMode ? '#fff' : '#333',
                              '&:hover': {
                                backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)',
                              },
                              gap: 2,
                            }}
                          >
                            <Typography variant="body1" sx={{ fontSize: isExtraSmall ? '0.8rem' : 'inherit' }}>
                              Fiókom
                            </Typography>
                          </MenuItem>

                          <MenuItem 
                            onClick={handleClose}
                            sx={{
                              py: isExtraSmall ? 1 : 1.5,
                              px: isExtraSmall ? 1.5 : 2,
                              color: darkMode ? '#fff' : '#333',
                              '&:hover': {
                                backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)',
                              },
                              gap: 2,
                            }}
                          >
                            <Typography variant="body1" sx={{ fontSize: isExtraSmall ? '0.8rem' : 'inherit' }}>
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
                              py: isExtraSmall ? 1 : 1.5,
                              px: isExtraSmall ? 1.5 : 2,
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
                            <Typography variant="body1" sx={{ fontSize: isExtraSmall ? '0.8rem' : 'inherit' }}>
                              Kijelentkezés
                            </Typography>
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
      xs: isExtraSmall ? '1px 3px' : '2px 6px',
      sm: '5px 10px'
    },
    fontSize: {
      xs: isExtraSmall ? '0.55rem' : '0.7rem',
      sm: '1rem'
    },
    whiteSpace: 'nowrap',
    minWidth: isExtraSmall ? '40px' : 'auto',
    height: isExtraSmall ? '24px' : 'auto',
    marginRight: isExtraSmall ? '2px' : 'auto',
    '&:hover': {
      backgroundColor: '#fff',
      color: '#333',
    },
  }}
>
  {isExtraSmall ? 'Sign In' : 'Sign In'}
</Button>

<Button
  component={Link}
  to="/signup"
  sx={{
    color: '#fff',
    border: '1px solid #fff',
    borderRadius: '5px',
    padding: {
      xs: isExtraSmall ? '1px 3px' : '2px 6px',
      sm: '5px 10px'
    },
    fontSize: {
      xs: isExtraSmall ? '0.55rem' : '0.7rem',
      sm: '1rem'
    },
    whiteSpace: 'nowrap',
    minWidth: isExtraSmall ? '40px' : 'auto',
    height: isExtraSmall ? '24px' : 'auto',
    '&:hover': {
      backgroundColor: '#fff',
      color: '#333',
    },
  }}
>
  {isExtraSmall ? 'Sign Up' : 'Sign Up'}
</Button>

            </>
          )}
        </Box>
      </div>

      <FormGroup
        sx={{
          position: 'absolute',
          top: 60,
          right: 20,
        }}
      >
        <FormControlLabel
          control={
            <Switch
           
              color="default"
              sx={{
                color: 'black',
              }}
              checked={darkMode}
              onChange={() => setDarkMode((prev) => !prev)}
            />
          }
          label="Dark Mode"
        />
      </FormGroup>

      <div
        style={{
          textAlign: 'center',
          padding: '40px',
        }}
      >
        <Typography
  variant="h1"
  sx={{
    fontSize: {
      xs: '24px',   
      sm: '30px',    
      md: '36px'    
    },
    textAlign: 'center',
    fontWeight: {
      xs: 500,      
      sm: 600,      
      md: 600
    },
    lineHeight: {
      xs: 1.3,      
      sm: 1.4,      
      md: 1.5       
    },
    padding: {
      xs: '0 15px', 
      sm: '0 10px',  
      md: '0'      
    },
    color: darkMode ? 'white' : 'black'  
  }}
>
  Üdvözlünk az Adali Clothing Webáruházban
</Typography>

      </div>

      <div 
  ref={ref}
  style={{
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    padding: '20px',
    opacity: 0,
    transform: 'translateY(50px)',
    animation: inView ? 'fadeInUp 0.8s forwards' : 'none'
  }}
>
<Box
  ref={ref}
  sx={{
    display: 'flex',
    flexDirection: {
      xs: 'column',  
      sm: 'column',  
      md: 'row'      
    },
    justifyContent: 'center',
    alignItems: {
      xs: 'center', 
      md: 'stretch'  
    },
    gap: '20px',
    padding: '20px',
    opacity: 0,
    transform: 'translateY(50px)',
    animation: inView ? 'fadeInUp 0.8s forwards' : 'none',
    width: '100%'
  }}
>
  <Card
    sx={{
      flex: {
        xs: '1 1 auto',  
        sm: '1 1 auto',   
        md: '1 1 300px'  
      },
      maxWidth: {
        xs: '90%',      
        sm: '450px',      
        md: '600px'       
      },
      margin: {
        xs: '0 auto 20px',
        sm: '0 auto 20px',
        md: '0'           
      },
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: darkMode ? '#555' : '#fff',
      borderRadius: '10px',
      '&:hover': {
        transform: {
          xs: 'none',       
          sm: 'translateY(-5px)',
          md: 'translateY(-8px)'  
        },
        boxShadow: darkMode
          ? '0 20px 40px rgba(0,0,0,0.4)'
          : '0 20px 40px rgba(0,0,0,0.2)',
      }
    }}
  >
    <Link to="/oterm">
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          component="img"
          src={polo}
          alt="All Products"
          sx={{
            width: '100%',
            height: {
              xs: '300px',  
              sm: '400px',  
              md: '500px'  
            },
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: {
                xs: 'none',    
                sm: 'scale(1.05)', 
                md: 'scale(1.1)'   
              }
            }
          }}
        />
      </Box>
    </Link>

    <Typography
      variant="body1"
      sx={{
        fontSize: {
          xs: '14px',     
          sm: '16px',    
          md: '18px'      
        },
        padding: {
          xs: '8px',     
          sm: '10px',   
          md: '10px'      
        },
        color: darkMode ? 'white' : 'black',
        textAlign: 'center',
        transition: 'transform 0.3s ease',
        marginTop: {
          xs: '5px',      
          sm: '8px',      
          md: '10px'    
        },
        lineHeight: {
          xs: 1.4,        
          sm: 1.5,       
          md: 1.6        
        },
        fontWeight: 400
      }}
    >
      Nézd meg a teljes kollekciót! Tuti, hogy találsz valamit ami tetszik.
    </Typography>
  </Card>

  <Card
    sx={{
      flex: {
        xs: '1 1 auto',   
        sm: '1 1 auto',   
        md: '1 1 300px'   
      },
      maxWidth: {
        xs: '90%',        
        sm: '450px',     
        md: '600px'     
      },
      margin: {
        xs: '0 auto 20px', 
        sm: '0 auto 20px', 
        md: '0'           
      },
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: darkMode ? '#555' : '#fff',
      borderRadius: '10px',
      '&:hover': {
        transform: {
          xs: 'none',       
          sm: 'translateY(-5px)',
          md: 'translateY(-8px)' 
        },
        boxShadow: darkMode
          ? '0 20px 40px rgba(0,0,0,0.4)'
          : '0 20px 40px rgba(0,0,0,0.2)',
      }
    }}
  >
    <Link to="/vinted">
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          component="img"
          src={vinted}
          alt="Vinted"
          sx={{
            width: '100%',
            height: {
              xs: '300px',  
              sm: '400px',  
              md: '500px'   
            },
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: {
                xs: 'none',    
                sm: 'scale(1.05)',
                md: 'scale(1.1)'   
              }
            }
          }}
        />
      </Box>
    </Link>

    <Typography
      variant="body1"
      sx={{
        fontSize: {
          xs: '14px',   
          sm: '16px',    
          md: '18px'     
        },
        padding: {
          xs: '8px',     
          sm: '10px',    
          md: '10px'     
        },
        color: darkMode ? 'white' : 'black',
        textAlign: 'center',
        transition: 'transform 0.3s ease',
        marginTop: {
          xs: '5px',     
          sm: '8px',    
          md: '10px'     
        },
        lineHeight: {
          xs: 1.4,       
          sm: 1.5,       
          md: 1.6        
        },
        fontWeight: 400
      }}
    >
      Nézd meg a legmenőbb felhasználók által feltöltött cuccokat! Találd meg a következő kedvenc ruhadarabod.
    </Typography>
  </Card>

  <Card
    sx={{
      flex: {
        xs: '1 1 auto',  
        sm: '1 1 auto',   
        md: '1 1 300px'  
      },
      maxWidth: {
        xs: '90%',       
        sm: '450px',     
        md: '600px'     
      },
      margin: {
        xs: '0 auto 20px',
        sm: '0 auto 20px', 
        md: '0'           
      },
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: darkMode ? '#555' : '#fff',
      borderRadius: '10px',
      '&:hover': {
        transform: {
          xs: 'none',      
          sm: 'translateY(-5px)',
          md: 'translateY(-8px)'  
        },
        boxShadow: darkMode
          ? '0 20px 40px rgba(0,0,0,0.4)'
          : '0 20px 40px rgba(0,0,0,0.2)',
      }
    }}
  >
    
    <Link to="/add">
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          component="img"
          src={fek}
          alt="Upload"
          sx={{
            width: '100%',
            height: {
              xs: '300px', 
              sm: '400px',  
              md: '500px'  
            },
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: {
                xs: 'none',    
                sm: 'scale(1.05)', 
                md: 'scale(1.1)'   
              }
            }
          }}
        />
      </Box>
    </Link>

    <Typography
      variant="body1"
      sx={{
        fontSize: {
          xs: '14px',     
          sm: '16px',     
          md: '18px'      
        },
        padding: {
          xs: '8px',      
          sm: '10px',     
          md: '10px'    
        },
        color: darkMode ? 'white' : 'black',
        textAlign: 'center',
        transition: 'transform 0.3s ease',
        marginTop: {
          xs: '5px',    
          sm: '8px',     
          md: '10px'    
        },
        lineHeight: {
          xs: 1.4,        
          sm: 1.5,       
          md: 1.6         
        },
        fontWeight: 400
      }}
    >
      Dobd fel a saját cuccaidat! Legyél Te is az Adali Clothing része.
    </Typography>
  </Card>
</Box>

          </div>

          <Typography
  variant="h1"
  sx={{
    textAlign: 'center',
    fontSize: {
      xs: '1.5rem',   
      sm: '2rem',     
      md: '2.5rem'    
    },
    fontWeight: 'bold',
    background: darkMode
      ? 'linear-gradient(45deg,rgb(255, 255, 255),rgb(255, 255, 255))'
      : 'linear-gradient(45deg,rgb(0, 0, 0),rgb(0, 0, 0))',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: {
      xs: '40px 20px', 
      sm: '60px 20px', 
      md: '80px 0'     
    },
    padding: {
      xs: '0 10px',     
      sm: '0',         
    },
    lineHeight: {
      xs: 1.3,         
      sm: 1.4,         
      md: 1.5          
    },
    animation: 'fadeIn 1s ease-out',
    '@keyframes fadeIn': {
      from: { opacity: 0, transform: 'translateY(20px)' },
      to: { opacity: 1, transform: 'translateY(0)' }
    }
  }}
>
  Adali Clothing - A Te stílusod, a mi szenvedélyünk!
</Typography>

<Box
  sx={{
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    padding: '20px',
    '& > div': {
      transform: 'translateY(50px)',
      opacity: 0,
      animation: 'slideUp 0.6s forwards',
      '&:nth-of-type(2)': {
        animationDelay: '0.2s'
      },
      '&:nth-of-type(3)': {
        animationDelay: '0.4s'
      }
    },
    '@keyframes slideUp': {
      to: {
        transform: 'translateY(0)',
        opacity: 1
      }
    }
  }}
>
<Box
  id="slideContainer"
  sx={{
    display: 'flex',
    flexDirection: {
      xs: 'column', 
      md: 'row'      
    },
    alignItems: 'center',
    justifyContent: {
      xs: 'center',
      md: 'space-between'
    },
    width: '90%',
    maxWidth: '1400px',
    margin: '0 auto',
    overflow: 'hidden',
    border: '2px solid',
    borderColor: darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: darkMode ? '0 0 15px rgba(255, 255, 255, 0.1)' : '0 0 15px rgba(0, 0, 0, 0.1)'
  }}
>
<Box
  id="slideImage"
  component="img"
  src={images[currentImageIndex].img}
  sx={{
    height: {
      xs: '250px',
      sm: '350px',
      md: '450px',
      lg: '550px'
    },
    width: {
      xs: '250px',
      sm: '350px',
      md: '450px',
      lg: '550px'
    },
    objectFit: 'cover',
    flex: '0 0 auto',
    position: 'relative',
    left: {
      xs: '0',
      md: '50px'
    },
    marginRight: {
      xs: '0',
      md: '50px'
    },
    marginBottom: {
      xs: '20px',
      md: '0'
    },
    ...images[currentImageIndex].imageStyle
  }}
/>
    <Box
      id="slideText"
      sx={{
        flex: {
          xs: '1 1 auto',
          md: '0 0 500px'
        },
        padding: {
          xs: '20px',
          sm: '30px',
          md: '40px'
        },
        position: 'relative',
        right: {
          xs: '0',
          md: '50px'
        },
        textAlign: {
          xs: 'center',
          md: 'left'
        }
      }}
    >
      <Typography
        variant="h2"
        sx={{
          mb: 3,
          color: darkMode ? 'white' : 'black',
          fontSize: {
            xs: '1.5rem',
            sm: '2rem',
            md: '2.5rem'
          }
        }}
      >
        {images[currentImageIndex].title}
      </Typography>
      <Typography
        variant="h4"
        sx={{
          color: darkMode ? 'grey.300' : 'grey.700',
          fontSize: {
            xs: '1rem',
            sm: '1.25rem',
            md: '1.5rem'
          }
        }}
      >
        {images[currentImageIndex].subtitle}
      </Typography>
    </Box>
  </Box>

  <style>
  {`
    @keyframes slideInLeft {
      from {
        transform: translateX(-100%) translateY(${currentImageIndex === 1 ? '-50px' : '0'});
        opacity: 0;
      }
      to {
        transform: translateX(0) translateY(${currentImageIndex === 1 ? '-50px' : '0'});
        opacity: 1;
      }
    }
    @keyframes slideOutLeft {
      from {
        transform: translateX(0) translateY(${currentImageIndex === 1 ? '-50px' : '0'});
        opacity: 1;
      }
      to {
        transform: translateX(-100%) translateY(${currentImageIndex === 1 ? '-50px' : '0'});
        opacity: 0;
      }
    }
       .reduced-animations * {
    transition-duration: 0.1s !important;
    animation-duration: 0.1s !important;
  }
  
  /* Hardveres gyorsítás */
  .animated-element {
    will-change: transform, opacity;
    transform: translateZ(0);
    backface-visibility: hidden;
  }
  
  /* Animáció kikapcsolása, ha a felhasználó preferálja */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.001s !important;
      transition-duration: 0.001s !important;
    }
  }
  
  /* Animációk tisztítása */
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(50px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `}
  </style>
</Box>

{showLogoutAlert && (
  <Box
    sx={{
      position: 'fixed',
      top: initialPosition.top,
      left: initialPosition.left,
      transform: initialPosition.transform,
      zIndex: 1400,
      width: {
        xs: '90%',   
        sm: '400px', 
        md: 'auto'    
      },
      maxWidth: {
        xs: '350px',
        sm: '450px', 
        md: '500px'   
      },
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
          transform: initialPosition.transform,
        },
      },
    }}
  >
    <Card
      sx={{
        minWidth: {
          xs: '100%', 
          sm: '350px'  
        },
        backgroundColor: darkMode ? 'rgba(45, 45, 45, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        color: darkMode ? '#fff' : '#000',
        boxShadow: darkMode 
          ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
          : '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        borderRadius: {
          xs: '15px', 
          sm: '20px'  
        },
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
      <CardContent 
        sx={{ 
          p: {
            xs: 2.5,  
            sm: 3,   
            md: 4     
          }
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 600,
              mb: 1,
              fontSize: {
                xs: '1.2rem',  
                sm: '1.4rem', 
                md: '1.5rem'   
              },
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
          <Typography 
            variant="body1" 
            sx={{ 
              color: darkMode ? '#aaa' : '#666',
              fontSize: {
                xs: '0.9rem',  
                sm: '1rem'    
              }
            }}
          >
            Biztosan ki szeretnél jelentkezni?
          </Typography>
        </Box>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: {
              xs: 'column',  
              sm: 'row'     
            },
            gap: 2,
            justifyContent: 'space-between'
          }}
        >
          <Button
            onClick={() => setShowLogoutAlert(false)}
            sx={{
              flex: 1,
              py: {
                xs: 1,   
                sm: 1.5   
              },
              borderRadius: '12px',
              backgroundColor: darkMode ? 'rgba(144, 202, 249, 0.1)' : 'rgba(25, 118, 210, 0.1)',
              color: darkMode ? '#90caf9' : '#1976d2',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: darkMode ? 'rgba(144, 202, 249, 0.2)' : 'rgba(25, 118, 210, 0.2)',
                transform: 'translateY(-2px)',
              },
              mb: {
                xs: 1,    
                sm: 0     
              }
            }}
          >
            Mégse
          </Button>
          <Button
            onClick={confirmLogout}
            sx={{
              flex: 1,
              py: {
                xs: 1,    
                sm: 1.5   
              },
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

<CouponAlert 
        open={showWelcomeDialog} 
        onClose={() => setShowWelcomeDialog(false)}
        darkMode={darkMode}
        onPrizeWon={handlePrizeWon}  // Adjuk át a callback-et
        setWonPrize={setWonPrize}
        setShowWelcomeDialog={setShowWelcomeDialog}
        setShowSuccessAlert={setShowSuccessAlert}
        saveCouponToDatabase={saveCouponToDatabase}
      />
      
      <Dialog
        open={showSuccessAlert}
        onClose={() => setShowSuccessAlert(false)}
        sx={{
          '& .MuiDialog-paper': {
            backgroundColor: darkMode ? '#1E1E1E' : '#fff',
            borderRadius: '25px',
            padding: '2rem',
            minWidth: '350px',
            textAlign: 'center'
          }
        }}
      >
        <Typography variant="h5" sx={{ color: '#60BA97', mb: 2 }}>
          Gratulálunk!
        </Typography>
        <Typography variant="body1" sx={{ color: darkMode ? '#fff' : '#333', mb: 3 }}>
          Nyereményed: {wonPrize}
        </Typography>
        <Button
          onClick={() => setShowSuccessAlert(false)}
          sx={{
            background: 'linear-gradient(45deg, #60BA97, #4e9d7e)',
            color: '#fff',
            padding: '8px 22px',
            '&:hover': { transform: 'scale(1.05)' }
          }}
        >
          Rendben
        </Button>
      </Dialog>

<Typography 
  variant="h4" 
  sx={{
    textAlign: 'center',
    mb: 2,
    color: darkMode ? '#fff' : '#333',
    fontSize: {
      xs: '1.3rem',  
      sm: '1.6rem',   
      md: '2rem'      
    },
    padding: {
      xs: '0 15px',  
      sm: '0'        
    },
    mt: {
      xs: 4,          
      sm: 5         
    }
  }}
>
  Vásárlói Vélemények
</Typography>

<Box
  ref={scrollbarRef}
  sx={{
    width: {
      xs: '90%',      
      sm: '95%',    
      md: '100%'    
    },
    margin: '0 auto',
    height: {
      xs: '8px',      
      sm: '10px',   
      md: '12px'     
    },
    mb: 2,
    overflowX: 'auto',
    '&::-webkit-scrollbar': {
      height: {
        xs: '8px', 
        sm: '10px',  
        md: '12px'   
      },
      backgroundColor: darkMode ? '#444' : '#eee'
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: darkMode ? '#444' : '#eee',
      borderRadius: '6px'
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: darkMode ? '#666' : '#999',
      borderRadius: '6px',
      '&:hover': {
        backgroundColor: darkMode ? '#888' : '#777'
      }
    }
  }}
>
  <Box sx={{ minWidth: '200%' }}></Box>
</Box>

<Box
  ref={contentRef}
  sx={{
    display: 'flex',
    gap: {
      xs: 2,         
      sm: 2.5,     
      md: 3          
    },
    overflowX: 'auto',
    scrollbarWidth: 'none',
    backgroundColor: darkMode ? '#333' : '#f5f5f5',
    backgroundImage: darkMode
      ? 'radial-gradient(#444 1px, transparent 1px)'
      : 'radial-gradient(#e0e0e0 1px, transparent 1px)',
    backgroundSize: '20px 20px',
    '&::-webkit-scrollbar': {
      display: 'none'
    },
    padding: {
      xs: '0 15px 20px',  
      sm: '0 20px 20px',
      md: '0 0 20px'    
    },
    width: {
      xs: '100%',        
      sm: '95%',          
      md: '100%'        
    },
    margin: '0 auto'   
  }}
>
  {Array.isArray(ratings) && ratings.map((rating, index) => (
    <Box
      key={index}
      sx={{
        backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)',
        padding: {
          xs: 2,           
          sm: 2.5,      
          md: 3            
        },
        borderRadius: {
          xs: 3,          
          sm: 4,        
          md: 5         
        },
        width: {
          xs: '250px',   
          sm: '280px',    
          md: '300px'      
        },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: {
          xs: 1.5,       
          sm: 1.8,         
          md: 2           
        },
        flexShrink: 0
      }}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          color: darkMode ? '#fff' : '#333',
          fontSize: {
            xs: '0.95rem',
            sm: '1.1rem',   
            md: '1.25rem'   
          }
        }}
      >
        {rating.felhasznalonev}
      </Typography>
      <Rating 
        value={rating.rating} 
        readOnly 
        size={window.innerWidth < 600 ? "medium" : "large"}
      />
      <Typography 
        sx={{ 
          color: darkMode ? '#ccc' : '#666', 
          fontSize: {
            xs: '0.8rem',   
            sm: '0.85rem',  
            md: '0.9rem'   
          },
          textAlign: 'center',
          maxHeight: {
            xs: '60px',    
            sm: '80px',    
            md: '100px'   
          },
          overflow: 'auto'
        }}
      >
        {rating.velemeny}
      </Typography>
      <Typography 
        sx={{ 
          color: darkMode ? '#ccc' : '#666', 
          fontSize: {
            xs: '0.7rem',  
            sm: '0.75rem', 
            md: '0.8rem' 
          }
        }}
      >
        {new Date(rating.date).toLocaleDateString()}
      </Typography>
    </Box>
  ))}
</Box>

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
};
export default Home;