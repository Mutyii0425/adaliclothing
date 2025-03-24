import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress, 
  Paper, 
  Grid, 
  Card, 
  CardContent,
  Chip,
  Divider,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  Container,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogContent,
  DialogTitle
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { styled } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Input = styled('input')({
  display: 'none',
});

const ColorBox = styled(Box)(({ color }) => ({
  width: 30,
  height: 30,
  backgroundColor: color,
  borderRadius: 4,
  border: '1px solid rgba(0, 0, 0, 0.12)',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
}));

const MotionBox = styled(motion.div)({
  width: '100%'
});

const VisionAdvisor = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [darkMode, setDarkMode] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [apiUsage, setApiUsage] = useState(null);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sötét mód beállítása a localStorage alapján
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true');
    }
  }, []);

  // API használati adatok lekérése
  useEffect(() => {
    const fetchApiUsage = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/usage');
        if (response.ok) {
          const data = await response.json();
          const visionApiData = data.find(api => api.api_name === 'vision_api') || 
                               { api_name: 'vision_api', usage_count: 0, limit_count: 1000 };
          setApiUsage(visionApiData);
        }
      } catch (error) {
        console.error('Hiba az API használati adatok lekérésénél:', error);
      }
    };
    
    fetchApiUsage();
  }, []);

  // Első betöltéskor mutassunk egy rövid útmutatót
  useEffect(() => {
    setTimeout(() => {
      setInfoDialogOpen(true);
    }, 500);
  }, []);

  // Fájl kiválasztása
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: 'A fájl mérete nem lehet nagyobb 5MB-nál',
          severity: 'error'
        });
        return;
      }
      
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError('');
      
      // Ha a kamera aktív, leállítjuk
      if (cameraActive) {
        stopCamera();
      }
      
      setSnackbar({
        open: true,
        message: 'Kép sikeresen kiválasztva!',
        severity: 'success'
      });
    }
  };

  // Kamera indítása
  const startCamera = async () => {
    try {
      setCameraActive(true);
      setSelectedFile(null);
      setPreviewUrl('');
      setResult(null);
      setError('');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setSnackbar({
        open: true,
        message: 'Kamera aktiválva. Készíts egy képet!',
        severity: 'info'
      });
    } catch (err) {
      console.error('Kamera hiba:', err);
      setError('Nem sikerült hozzáférni a kamerához: ' + err.message);
      setCameraActive(false);
      
      setSnackbar({
        open: true,
        message: 'Nem sikerült hozzáférni a kamerához',
        severity: 'error'
      });
    }
  };

  // Kamera leállítása
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Kép készítése a kamerával
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Canvas méretének beállítása a videó méretére
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Kép rajzolása a canvas-ra
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Canvas konvertálása base64 képpé
    const imageDataUrl = canvas.toDataURL('image/jpeg');
    setPreviewUrl(imageDataUrl);
    
    // Kamera leállítása
    stopCamera();
    
    // Eredmények törlése
    setResult(null);
    
    setSnackbar({
      open: true,
      message: 'Kép sikeresen elkészítve!',
      severity: 'success'
    });
  };

  // Kép elemzése
  const analyzeImage = async () => {
    if (!selectedFile && !previewUrl) {
      setSnackbar({
        open: true,
        message: 'Kérlek válassz ki vagy készíts egy képet',
        severity: 'warning'
      });
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      let response;
      
      if (selectedFile) {
        // Fájl feltöltése
        const formData = new FormData();
        formData.append('image', selectedFile);
        
        response = await fetch('http://localhost:5000/api/vision/analyze-file', {
          method: 'POST',
          body: formData
        });
      } else if (previewUrl) {
        // Base64 kép küldése
        response = await fetch('http://localhost:5000/api/analyze-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ image: previewUrl })
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Hiba történt a kép elemzése során');
      }
      
      const data = await response.json();
      setResult(data);
      
      // Frissítsük az API használati adatokat
      fetchApiUsage();
      
      setSnackbar({
        open: true,
        message: 'Kép sikeresen elemezve!',
        severity: 'success'
      });
      
      // Nyissuk meg az eredmény dialógust
      setResultDialogOpen(true);
    } catch (err) {
      console.error('Elemzési hiba:', err);
      setError(err.message || 'Hiba történt a kép elemzése során');
      
      setSnackbar({
        open: true,
        message: err.message || 'Hiba történt a kép elemzése során',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // API használati adatok frissítése
  const fetchApiUsage = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/usage');
      if (response.ok) {
        const data = await response.json();
        const visionApiData = data.find(api => api.api_name === 'vision_api') || 
                             { api_name: 'vision_api', usage_count: 0, limit_count: 1000 };
        setApiUsage(visionApiData);
      }
    } catch (error) {
      console.error('Hiba az API használati adatok lekérésénél:', error);
    }
  };

  // Új kép választása
  const handleNewImage = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setResult(null);
    setError('');
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Eredmények használata
  const handleUseResults = () => {
    // Itt implementálhatjuk, hogy mit csináljon a gomb
    // Például elmenthetjük az eredményeket a localStorage-ba
    localStorage.setItem('visionResult', JSON.stringify(result));
    
    setSnackbar({
      open: true,
      message: 'Elemzési eredmények elmentve!',
      severity: 'success'
    });
    
    // Navigáljunk a termékfeltöltési oldalra
    navigate('/add', { state: { visionResult: result } });
  };

  // Snackbar bezárása
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Button
            component={Link}
            to="/"
            startIcon={<ArrowBackIcon />}
            sx={{ 
              color: darkMode ? '#90caf9' : '#1976d2',
              '&:hover': {
                backgroundColor: darkMode ? 'rgba(144, 202, 249, 0.1)' : 'rgba(25, 118, 210, 0.05)'
              }
            }}
          >
            Vissza a főoldalra
          </Button>
          
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            component="h1"
            sx={{ 
              fontWeight: 600,
              color: darkMode ? '#fff' : '#333',
              flexGrow: 1,
              textAlign: isMobile ? 'center' : 'left'
            }}
          >
            AI Ruházati Tanácsadó
          </Typography>
        </Box>
        
        {apiUsage && (
          <Paper 
            elevation={darkMode ? 3 : 1}
            sx={{ 
              p: 2, 
              mb: 3, 
              backgroundColor: darkMode ? 'rgba(144, 202, 249, 0.1)' : 'rgba(25, 118, 210, 0.05)',
              borderRadius: 2,
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2
            }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: darkMode ? '#90caf9' : '#1976d2' }}>
                API Használati Statisztika
              </Typography>
              <Typography variant="body2" sx={{ color: darkMode ? '#ccc' : '#666' }}>
                Havi kép elemzési limit: {apiUsage.limit_count || 1000} | Felhasznált: {apiUsage.usage_count || 0}
              </Typography>
            </Box>
            
            <Box sx={{ 
              width: isMobile ? '100%' : '60%', 
              height: 10, 
              backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
              borderRadius: 5,
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box sx={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: `${((apiUsage.usage_count || 0) / (apiUsage.limit_count || 1000)) * 100}%`,
                backgroundColor: getApiUsageColor((apiUsage.usage_count || 0) / (apiUsage.limit_count || 1000), darkMode),
                borderRadius: 5
              }} />
            </Box>
          </Paper>
        )}

        <Box sx={{ 
          maxWidth: 1200, 
          mx: 'auto', 
          p: { xs: 2, sm: 3, md: 4 },
          backgroundColor: darkMode ? '#1a1a1a' : '#f8f9fa',
          color: darkMode ? '#fff' : '#333',
          minHeight: '100vh',
          borderRadius: 2,
          boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease'
        }}>
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography 
              variant="h4" 
              gutterBottom 
              align="center" 
              sx={{ 
                mb: 2,
                color: darkMode ? '#fff' : '#333',
                fontWeight: 600,
                position: 'relative',
                display: 'inline-block',
                left: '50%',
                transform: 'translateX(-50%)'
              }}
            >
              AI Ruházati Tanácsadó
              <Tooltip title="Információ a szolgáltatásról">
                <IconButton 
                  size="small" 
                  sx={{ ml: 1, color: darkMode ? '#90caf9' : '#1976d2' }}
                  onClick={() => setInfoDialogOpen(true)}
                >
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </Typography>
            
            <Typography 
              variant="body1" 
              paragraph 
              align="center" 
              sx={{ 
                mb: 4,
                maxWidth: 800,
                mx: 'auto',
                color: darkMode ? '#ccc' : '#555',
                lineHeight: 1.6
              }}
            >
              Tölts fel egy képet a ruhadarabról, és az AI segít meghatározni annak kategóriáját, 
              javaslatot tesz a leírásra, és felismeri a színeket.
            </Typography>
          </MotionBox>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <MotionBox
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Paper 
                  elevation={darkMode ? 4 : 2} 
                  sx={{ 
                    p: 3, 
                    backgroundColor: darkMode ? '#2d2d2d' : '#fff',
                    borderRadius: 2,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ color: darkMode ? '#90caf9' : '#1976d2', mb: 2 }}
                  >
                    Kép feltöltése vagy készítése
                  </Typography>

                  {!cameraActive && !previewUrl && (
                    <Box 
                      sx={{ 
                        border: '2px dashed',
                        borderColor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                        borderRadius: 2,
                        p: 4,
                        textAlign: 'center',
                        mb: 3,
                        backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: darkMode ? '#90caf9' : '#1976d2',
                          backgroundColor: darkMode ? 'rgba(144, 202, 249, 0.1)' : 'rgba(25, 118, 210, 0.05)'
                        }
                      }}
                    >
                      <Input
                        ref={fileInputRef}
                        accept="image/*"
                        id="contained-button-file"
                        type="file"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="contained-button-file">
                        <Button
                          variant="contained"
                          component="span"
                          startIcon={<CloudUploadIcon />}
                          sx={{ 
                            mb: 2,
                            backgroundColor: darkMode ? '#90caf9' : '#1976d2',
                            '&:hover': {
                              backgroundColor: darkMode ? '#42a5f5' : '#115293'
                            }
                          }}
                        >
                          Kép feltöltése
                        </Button>
                      </label>
                      <Typography variant="body2" sx={{ color: darkMode ? '#aaa' : '#666' }}>
                        vagy
                      </Typography>
                      <Button
                        variant="outlined"
                        onClick={startCamera}
                        startIcon={<PhotoCameraIcon />}
                        sx={{ 
                          mt: 2,
                          borderColor: darkMode ? '#90caf9' : '#1976d2',
                          color: darkMode ? '#90caf9' : '#1976d2',
                          '&:hover': {
                            borderColor: darkMode ? '#42a5f5' : '#115293',
                            backgroundColor: darkMode ? 'rgba(144, 202, 249, 0.1)' : 'rgba(25, 118, 210, 0.05)'
                          }
                        }}
                      >
                        Kamera használata
                      </Button>
                    </Box>
                  )}

                  {cameraActive && (
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        style={{ 
                          width: '100%', 
                          maxHeight: 400, 
                          borderRadius: 8,
                          boxShadow: darkMode ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                        <Button
                          variant="contained"
                          onClick={captureImage}
                          startIcon={<PhotoCameraIcon />}
                          sx={{ 
                            backgroundColor: '#4caf50',
                            '&:hover': {
                              backgroundColor: '#388e3c'
                            }
                          }}
                        >
                          Kép készítése
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={stopCamera}
                          color="error"
                        >
                          Mégse
                        </Button>
                      </Box>
                      <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </Box>
                  )}

                  {previewUrl && (
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <Box
                        component="img"
                        src={previewUrl}
                        alt="Előnézet"
                        sx={{ 
                          width: '100%', 
                          maxHeight: 400, 
                          objectFit: 'contain',
                          borderRadius: 2,
                          boxShadow: darkMode ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                        <Button
                          variant="contained"
                          onClick={analyzeImage}
                          disabled={loading}
                          sx={{ 
                            backgroundColor: darkMode ? '#90caf9' : '#1976d2',
                            '&:hover': {
                              backgroundColor: darkMode ? '#42a5f5' : '#115293'
                            }
                          }}
                        >
                          {loading ? (
                            <>
                              <CircularProgress size={24} sx={{ color: '#fff', mr: 1 }} />
                              Elemzés...
                            </>
                          ) : 'Kép elemzése'}
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={handleNewImage}
                          disabled={loading}
                          color="error"
                        >
                          Új kép
                        </Button>
                      </Box>
                    </Box>
                  )}

                  {error && (
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mb: 2,
                        backgroundColor: darkMode ? 'rgba(211, 47, 47, 0.2)' : undefined,
                        color: darkMode ? '#f44336' : undefined,
                        '& .MuiAlert-icon': {
                          color: darkMode ? '#f44336' : undefined
                        }
                      }}
                    >
                      {error}
                    </Alert>
                  )}
                </Paper>
              </MotionBox>
            </Grid>

            <Grid item xs={12} md={6}>
              <MotionBox
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Paper 
                  elevation={darkMode ? 4 : 2} 
                  sx={{ 
                    p: 3, 
                    backgroundColor: darkMode ? '#2d2d2d' : '#fff',
                    borderRadius: 2,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ color: darkMode ? '#90caf9' : '#1976d2', mb: 2 }}
                  >
                    Elemzési eredmények
                  </Typography>

                  {!result && !loading && (
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        height: '100%',
                        minHeight: 200,
                        color: darkMode ? '#aaa' : '#666'
                      }}
                    >
                      <InfoIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                      <Typography variant="body1" align="center">
                        Tölts fel egy képet és kattints az "Elemzés" gombra a ruházati elemzés megkezdéséhez
                      </Typography>
                    </Box>
                  )}

                  {loading && (
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        height: '100%',
                        minHeight: 200
                      }}
                    >
                      <CircularProgress size={60} sx={{ mb: 3, color: darkMode ? '#90caf9' : '#1976d2' }} />
                      <Typography variant="h6" align="center" sx={{ mb: 1 }}>
                        Kép elemzése folyamatban...
                      </Typography>
                      <Typography variant="body2" align="center" sx={{ color: darkMode ? '#aaa' : '#666' }}>
                        Az AI most elemzi a képet és azonosítja a ruházati terméket
                      </Typography>
                    </Box>
                  )}

                  {result && (
                    <Box sx={{ mt: 1 }}>
                      <Card 
                        variant="outlined" 
                        sx={{ 
                          mb: 3, 
                          backgroundColor: darkMode ? 'rgba(144, 202, 249, 0.1)' : 'rgba(25, 118, 210, 0.05)',
                          borderColor: darkMode ? 'rgba(144, 202, 249, 0.3)' : 'rgba(25, 118, 210, 0.2)',
                          borderRadius: 2
                        }}
                      >
                        <CardContent>
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              fontWeight: 600, 
                              mb: 1,
                              color: darkMode ? '#90caf9' : '#1976d2'
                            }}
                          >
                            Javasolt kategória
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            {(() => {
                              const categories = {
                                '1': 'Sapkák',
                                '2': 'Nadrágok',
                                '3': 'Zoknik',
                                '4': 'Pólók',
                                '5': 'Pulloverek',
                                '6': 'Kabátok',
                                '7': 'Lábviseletek',
                                '8': 'Atléták',
                                '9': 'Kiegészítők',
                                '10': 'Szoknyák',
                                '11': 'Alsóneműk',
                                '12': 'Mellények'
                              };
                              return categories[result.suggestedCategory] || 'Egyéb ruházat';
                            })()}
                          </Typography>
                          
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              fontWeight: 600, 
                              mb: 1,
                              color: darkMode ? '#90caf9' : '#1976d2'
                            }}
                          >
                            Javasolt leírás
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            {result.suggestedDescription}
                          </Typography>
                          
                          <Divider sx={{ my: 2 }} />
                          
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              fontWeight: 600, 
                              mb: 1,
                              color: darkMode ? '#90caf9' : '#1976d2'
                            }}
                          >
                            Felismert címkék
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            {result.tags && result.tags.map((tag, index) => (
                              <Chip 
                                key={index} 
                                label={tag} 
                                size="small"
                                sx={{ 
                                    backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                                    color: darkMode ? '#fff' : '#333'
                                  }}
                                />
                              ))}
                            </Box>
                            
                            <Typography 
                              variant="subtitle1" 
                              sx={{ 
                                fontWeight: 600, 
                                mb: 1,
                                color: darkMode ? '#90caf9' : '#1976d2'
                              }}
                            >
                              Domináns színek
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                              {result.colors && result.colors.map((color, index) => (
                                <Tooltip key={index} title={color} arrow>
                                  <ColorBox color={color} />
                                </Tooltip>
                              ))}
                            </Box>
                            
                            <Typography 
                              variant="subtitle1" 
                              sx={{ 
                                fontWeight: 600, 
                                mb: 1,
                                color: darkMode ? '#90caf9' : '#1976d2'
                              }}
                            >
                              Megbízhatóság
                            </Typography>
                            <Box 
                              sx={{ 
                                width: '100%', 
                                height: 8, 
                                backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                                borderRadius: 4,
                                position: 'relative',
                                overflow: 'hidden'
                              }}
                            >
                              <Box 
                                sx={{ 
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  height: '100%',
                                  width: `${(result.confidence || 0.7) * 100}%`,
                                  backgroundColor: getConfidenceColor(result.confidence || 0.7, darkMode),
                                  borderRadius: 4,
                                  transition: 'width 1s ease-in-out'
                                }}
                              />
                            </Box>
                            <Typography 
                              variant="body2" 
                              align="right" 
                              sx={{ mt: 0.5, color: darkMode ? '#aaa' : '#666' }}
                            >
                              {Math.round((result.confidence || 0.7) * 100)}%
                            </Typography>
                          </CardContent>
                        </Card>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          <Button
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircleIcon />}
                            onClick={handleUseResults}
                            sx={{ 
                              backgroundColor: '#4caf50',
                              '&:hover': {
                                backgroundColor: '#388e3c'
                              }
                            }}
                          >
                            Eredmények felhasználása
                          </Button>
                        </Box>
                      </Box>
                    )}
                  </Paper>
                </MotionBox>
              </Grid>
            </Grid>
  
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Divider sx={{ mb: 3 }} />
              <Typography variant="body2" sx={{ color: darkMode ? '#aaa' : '#666' }}>
                Az AI Ruházati Tanácsadó a Google Cloud Vision API technológiáját használja.
                A szolgáltatás pontossága a feltöltött képek minőségétől függően változhat.
              </Typography>
            </Box>
          </Box>
  
          {/* Információs dialógus */}
          <Dialog
            open={infoDialogOpen}
            onClose={() => setInfoDialogOpen(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                backgroundColor: darkMode ? '#2d2d2d' : '#fff',
                borderRadius: 2,
                boxShadow: darkMode 
                  ? '0 8px 32px rgba(0,0,0,0.5)' 
                  : '0 8px 32px rgba(0,0,0,0.1)',
              }
            }}
          >
            <DialogTitle sx={{ 
              color: darkMode ? '#90caf9' : '#1976d2',
              borderBottom: '1px solid',
              borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              pb: 2
            }}>
              AI Ruházati Tanácsadó - Útmutató
              <IconButton
                onClick={() => setInfoDialogOpen(false)}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  color: darkMode ? '#aaa' : '#666'
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ py: 3 }}>
              <Typography variant="body1" paragraph>
                Üdvözöljük az AI Ruházati Tanácsadó szolgáltatásban! Ez a funkció segít a ruházati termékek kategorizálásában és leírásában.
              </Typography>
              
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
                Hogyan működik?
              </Typography>
              
              <Typography variant="body2" paragraph>
                1. Tölts fel egy képet a ruhadarabról vagy készíts egy fotót a kamerával
              </Typography>
              
              <Typography variant="body2" paragraph>
                2. Kattints a "Kép elemzése" gombra
              </Typography>
              
              <Typography variant="body2" paragraph>
                3. Az AI elemzi a képet és javaslatot tesz a kategóriára, leírásra és felismeri a színeket
              </Typography>
              
              <Typography variant="body2" paragraph>
                4. Az eredményeket felhasználhatod a termék feltöltésekor
              </Typography>
              
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
                Tippek a legjobb eredményekért:
              </Typography>
              
              <Typography variant="body2" paragraph>
                • Használj jó megvilágítást a képek készítésekor
              </Typography>
              
              <Typography variant="body2" paragraph>
                • A ruhadarab legyen a kép középpontjában
              </Typography>
              
              <Typography variant="body2" paragraph>
                • Kerüld a túl zsúfolt hátteret
              </Typography>
              
              <Button
                variant="contained"
                onClick={() => setInfoDialogOpen(false)}
                fullWidth
                sx={{ 
                  mt: 2,
                  backgroundColor: darkMode ? '#90caf9' : '#1976d2',
                  '&:hover': {
                    backgroundColor: darkMode ? '#42a5f5' : '#115293'
                  }
                }}
              >
                Értettem
              </Button>
            </DialogContent>
          </Dialog>
  
          {/* Eredmény dialógus */}
          <Dialog
            open={resultDialogOpen}
            onClose={() => setResultDialogOpen(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                backgroundColor: darkMode ? '#2d2d2d' : '#fff',
                borderRadius: 2,
                boxShadow: darkMode 
                  ? '0 8px 32px rgba(0,0,0,0.5)' 
                  : '0 8px 32px rgba(0,0,0,0.1)',
              }
            }}
          >
            <DialogTitle sx={{ 
              color: darkMode ? '#4caf50' : '#388e3c',
              borderBottom: '1px solid',
              borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              pb: 2
            }}>
              Elemzés sikeres!
              <IconButton
                onClick={() => setResultDialogOpen(false)}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  color: darkMode ? '#aaa' : '#666'
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ py: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={5}>
                  <Box
                    component="img"
                    src={previewUrl}
                    alt="Elemzett kép"
                    sx={{ 
                      width: '100%', 
                      borderRadius: 2,
                      boxShadow: darkMode ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={7}>
                  <Typography variant="h6" gutterBottom sx={{ color: darkMode ? '#90caf9' : '#1976d2' }}>
                    Elemzési eredmények
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: darkMode ? '#aaa' : '#666' }}>
                      Kategória:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {(() => {
                        const categories = {
                          '1': 'Sapkák',
                          '2': 'Nadrágok',
                          '3': 'Zoknik',
                          '4': 'Pólók',
                          '5': 'Pulloverek',
                          '6': 'Kabátok',
                          '7': 'Lábviseletek',
                          '8': 'Atléták',
                          '9': 'Kiegészítők',
                          '10': 'Szoknyák',
                          '11': 'Alsóneműk',
                          '12': 'Mellények'
                        };
                        return categories[result?.suggestedCategory] || 'Egyéb ruházat';
                      })()}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: darkMode ? '#aaa' : '#666' }}>
                      Leírás:
                    </Typography>
                    <Typography variant="body1">
                      {result?.suggestedDescription}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: darkMode ? '#aaa' : '#666' }}>
                      Címkék:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {result?.tags && result.tags.map((tag, index) => (
                        <Chip 
                          key={index} 
                          label={tag} 
                          size="small"
                          sx={{ 
                            backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                            color: darkMode ? '#fff' : '#333'
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: darkMode ? '#aaa' : '#666' }}>
                      Színek:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                      {result?.colors && result.colors.map((color, index) => (
                        <Tooltip key={index} title={color} arrow>
                          <ColorBox color={color} />
                        </Tooltip>
                      ))}
                    </Box>
                  </Box>
                  
                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => {
                        handleUseResults();
                        setResultDialogOpen(false);
                      }}
                      fullWidth
                      sx={{ 
                        py: 1.5,
                        backgroundColor: '#4caf50',
                        '&:hover': {
                          backgroundColor: '#388e3c'
                        }
                      }}
                    >
                      Eredmények felhasználása
                    </Button>
                    
                    <Button
                      variant="outlined"
                      onClick={() => setResultDialogOpen(false)}
                      fullWidth
                      sx={{ 
                        py: 1.5,
                        borderColor: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                        color: darkMode ? '#fff' : '#333'
                      }}
                    >
                      Bezárás
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
          </Dialog>
  
          {/* Snackbar értesítések */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert 
              onClose={handleCloseSnackbar} 
              severity={snackbar.severity} 
              variant="filled"
              sx={{ 
                width: '100%',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </MotionBox>
      </Container>
    );
  };
  
  // Segédfüggvény a megbízhatósági szín meghatározásához
  const getConfidenceColor = (confidence, darkMode) => {
    if (confidence >= 0.8) {
      return darkMode ? '#4caf50' : '#4caf50';
    } else if (confidence >= 0.6) {
      return darkMode ? '#ffb74d' : '#ff9800';
    } else {
      return darkMode ? '#f44336' : '#f44336';
    }
  };
  
  // Segédfüggvény az API használati szín meghatározásához
  const getApiUsageColor = (usageRatio, darkMode) => {
    if (usageRatio < 0.5) {
      return darkMode ? '#4caf50' : '#4caf50';
    } else if (usageRatio < 0.8) {
        return darkMode ? '#ffb74d' : '#ff9800';
      } else {
        return darkMode ? '#f44336' : '#f44336';
      }
    };
    
    export default VisionAdvisor;
  

