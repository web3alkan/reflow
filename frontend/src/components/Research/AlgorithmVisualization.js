import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  Slider,
  Grid,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Chip,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Refresh,
  Download,
  Settings,
  Info,
  Visibility,
  Code,
  Analytics
} from '@mui/icons-material';
import * as d3 from 'd3';
import { Line, Scatter, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ScatterController
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ScatterController
);

const AlgorithmVisualization = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [currentStep, setCurrentStep] = useState(0);
  const [algorithmData, setAlgorithmData] = useState(null);

  const tabs = [
    { label: 'YOLO Tespit', component: 'yolo' },
    { label: 'Spektral Analiz', component: 'spectral' },
    { label: 'Filtrasyon Optimizasyonu', component: 'filtration' },
    { label: 'Anomali Tespiti', component: 'anomaly' },
    { label: 'Kalite Tahmini', component: 'quality' }
  ];

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const resetSimulation = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Analytics color="primary" />
            Algoritma Görselleştirmeleri ve Demonstrasyonları
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            ReFlow sisteminin gelişmiş AI algoritmalarını interaktif olarak keşfedin ve test edin.
          </Typography>

          <Tabs 
            value={selectedTab} 
            onChange={handleTabChange} 
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
          >
            {tabs.map((tab, index) => (
              <Tab key={index} label={tab.label} />
            ))}
          </Tabs>

          {/* Control Panel */}
          <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Button
                  variant="contained"
                  startIcon={isPlaying ? <Pause /> : <PlayArrow />}
                  onClick={togglePlayback}
                  color="primary"
                >
                  {isPlaying ? 'Duraklat' : 'Başlat'}
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={resetSimulation}
                >
                  Sıfırla
                </Button>
              </Grid>
              <Grid item xs={3}>
                <Typography gutterBottom>Simülasyon Hızı</Typography>
                <Slider
                  value={simulationSpeed}
                  onChange={(e, value) => setSimulationSpeed(value)}
                  min={0.1}
                  max={3}
                  step={0.1}
                  marks={[
                    { value: 0.5, label: '0.5x' },
                    { value: 1, label: '1x' },
                    { value: 2, label: '2x' }
                  ]}
                />
              </Grid>
              <Grid item>
                <Chip 
                  label={`Adım: ${currentStep}`} 
                  color="info" 
                  variant="outlined" 
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Algorithm Components */}
          {selectedTab === 0 && <YOLOVisualization 
            isPlaying={isPlaying} 
            speed={simulationSpeed}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
          />}
          {selectedTab === 1 && <SpectralAnalysisVisualization 
            isPlaying={isPlaying} 
            speed={simulationSpeed}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
          />}
          {selectedTab === 2 && <FiltrationOptimization 
            isPlaying={isPlaying} 
            speed={simulationSpeed}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
          />}
          {selectedTab === 3 && <AnomalyDetectionVisualization 
            isPlaying={isPlaying} 
            speed={simulationSpeed}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
          />}
          {selectedTab === 4 && <QualityPredictionVisualization 
            isPlaying={isPlaying} 
            speed={simulationSpeed}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
          />}
        </CardContent>
      </Card>
    </Box>
  );
};

// YOLO Detection Visualization Component
const YOLOVisualization = ({ isPlaying, speed, currentStep, setCurrentStep }) => {
  const canvasRef = useRef(null);
  const [detections, setDetections] = useState([]);
  const [confidence, setConfidence] = useState(0.5);
  const [selectedDefectType, setSelectedDefectType] = useState('all');

  const defectTypes = ['crack', 'porosity', 'inclusion', 'corrosion', 'all'];
  const colors = {
    'crack': '#ff4444',
    'porosity': '#44ff44',
    'inclusion': '#4444ff',
    'corrosion': '#ffaa00'
  };

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentStep(prev => prev + 1);
        simulateDetection();
      }, 1000 / speed);
      return () => clearInterval(interval);
    }
  }, [isPlaying, speed]);

  const simulateDetection = () => {
    // Simulate YOLO detection with random bounding boxes
    const newDetections = [];
    const numDetections = Math.floor(Math.random() * 4) + 1;
    
    for (let i = 0; i < numDetections; i++) {
      const defectType = defectTypes[Math.floor(Math.random() * (defectTypes.length - 1))];
      const detection = {
        id: Math.random(),
        type: defectType,
        bbox: {
          x: Math.random() * 300,
          y: Math.random() * 200,
          width: 30 + Math.random() * 50,
          height: 20 + Math.random() * 40
        },
        confidence: 0.3 + Math.random() * 0.7
      };
      
      if (detection.confidence >= confidence) {
        newDetections.push(detection);
      }
    }
    
    setDetections(newDetections);
  };

  const drawDetections = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw sample image background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid pattern
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }
    
    // Draw detections
    detections.forEach(detection => {
      if (selectedDefectType === 'all' || selectedDefectType === detection.type) {
        const color = colors[detection.type];
        
        // Draw bounding box
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(
          detection.bbox.x,
          detection.bbox.y,
          detection.bbox.width,
          detection.bbox.height
        );
        
        // Draw label
        ctx.fillStyle = color;
        ctx.fillRect(
          detection.bbox.x,
          detection.bbox.y - 20,
          detection.bbox.width,
          20
        );
        
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText(
          `${detection.type} (${(detection.confidence * 100).toFixed(1)}%)`,
          detection.bbox.x + 2,
          detection.bbox.y - 6
        );
      }
    });
  };

  useEffect(() => {
    drawDetections();
  }, [detections, selectedDefectType]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            YOLO v8 Hata Tespit Algoritması
          </Typography>
          <canvas
            ref={canvasRef}
            width={400}
            height={300}
            style={{
              border: '1px solid #ccc',
              borderRadius: '4px',
              width: '100%',
              maxWidth: '400px'
            }}
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Tespit edilen hatalar gerçek zamanlı olarak sınırlandırılmış kutularla gösterilir.
            </Typography>
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>Kontrol Paneli</Typography>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Hata Türü Filtresi</InputLabel>
            <Select
              value={selectedDefectType}
              onChange={(e) => setSelectedDefectType(e.target.value)}
              label="Hata Türü Filtresi"
            >
              {defectTypes.map(type => (
                <MenuItem key={type} value={type}>
                  {type === 'all' ? 'Tümü' : type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Typography gutterBottom>Güven Eşiği: {confidence.toFixed(2)}</Typography>
          <Slider
            value={confidence}
            onChange={(e, value) => setConfidence(value)}
            min={0.1}
            max={0.9}
            step={0.05}
            sx={{ mb: 2 }}
          />
          
          <Button
            variant="outlined"
            fullWidth
            onClick={simulateDetection}
            startIcon={<Visibility />}
          >
            Yeni Tespit Çalıştır
          </Button>
        </Paper>
        
        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Tespit İstatistikleri</Typography>
          <Typography variant="body2">
            Toplam Tespit: {detections.length}
          </Typography>
          <Typography variant="body2">
            Ortalama Güven: {detections.length > 0 ? 
              (detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length * 100).toFixed(1) + '%' : 
              '0%'
            }
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

// Spectral Analysis Visualization Component
const SpectralAnalysisVisualization = ({ isPlaying, speed, currentStep, setCurrentStep }) => {
  const [spectrumData, setSpectrumData] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);

  useEffect(() => {
    generateSpectrumData();
  }, []);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentStep(prev => prev + 1);
        generateSpectrumData();
      }, 2000 / speed);
      return () => clearInterval(interval);
    }
  }, [isPlaying, speed]);

  const generateSpectrumData = () => {
    const wavelengths = [];
    const intensity = [];
    const reference = [];
    
    for (let i = 200; i <= 800; i += 5) {
      wavelengths.push(i);
      
      // Generate sample spectrum with peaks
      let sampleIntensity = 0.1 + Math.random() * 0.1;
      if (i >= 350 && i <= 370) sampleIntensity += 0.6 * Math.exp(-Math.pow((i - 360) / 10, 2));
      if (i >= 450 && i <= 470) sampleIntensity += 0.4 * Math.exp(-Math.pow((i - 460) / 8, 2));
      if (i >= 550 && i <= 570) sampleIntensity += 0.3 * Math.exp(-Math.pow((i - 560) / 12, 2));
      
      intensity.push(sampleIntensity + (Math.random() - 0.5) * 0.05);
      
      // Reference spectrum
      let refIntensity = 0.1;
      if (i >= 350 && i <= 370) refIntensity += 0.7 * Math.exp(-Math.pow((i - 360) / 10, 2));
      if (i >= 450 && i <= 470) refIntensity += 0.5 * Math.exp(-Math.pow((i - 460) / 8, 2));
      if (i >= 550 && i <= 570) refIntensity += 0.4 * Math.exp(-Math.pow((i - 560) / 12, 2));
      
      reference.push(refIntensity);
    }
    
    setSpectrumData({
      labels: wavelengths,
      datasets: [
        {
          label: 'Örnek Spektrumu',
          data: intensity,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1
        },
        {
          label: 'Referans Spektrumu',
          data: reference,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.1
        }
      ]
    });
    
    // Calculate similarity and composition
    const similarity = calculateSimilarity(intensity, reference);
    const composition = analyzeComposition(intensity);
    
    setAnalysisResults({
      similarity: similarity,
      composition: composition,
      peaks: findPeaks(intensity, wavelengths)
    });
  };

  const calculateSimilarity = (sample, reference) => {
    const correlation = sample.reduce((sum, val, i) => sum + val * reference[i], 0) /
      (Math.sqrt(sample.reduce((sum, val) => sum + val * val, 0)) *
       Math.sqrt(reference.reduce((sum, val) => sum + val * val, 0)));
    return Math.max(0, correlation * 100);
  };

  const analyzeComposition = (spectrum) => {
    const totalIntensity = spectrum.reduce((sum, val) => sum + val, 0);
    const maxIntensity = Math.max(...spectrum);
    const avgIntensity = totalIntensity / spectrum.length;
    
    return {
      purity: Math.min(100, (maxIntensity / avgIntensity) * 20),
      contamination: Math.max(0, (1 - maxIntensity) * 100),
      degradation: Math.max(0, (avgIntensity - 0.2) * 200)
    };
  };

  const findPeaks = (spectrum, wavelengths) => {
    const peaks = [];
    for (let i = 1; i < spectrum.length - 1; i++) {
      if (spectrum[i] > spectrum[i-1] && spectrum[i] > spectrum[i+1] && spectrum[i] > 0.3) {
        peaks.push({
          wavelength: wavelengths[i],
          intensity: spectrum[i]
        });
      }
    }
    return peaks.slice(0, 5); // Top 5 peaks
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'UV-Vis Spektrum Analizi'
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Dalga Boyu (nm)'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Yoğunluk'
        }
      }
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Spektral Analiz Sonuçları
          </Typography>
          {spectrumData && (
            <Line data={spectrumData} options={chartOptions} />
          )}
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>Analiz Sonuçları</Typography>
          
          {analysisResults && (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">Benzerlik Skoru</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={analysisResults.similarity} 
                  sx={{ mt: 1 }}
                />
                <Typography variant="caption">
                  {analysisResults.similarity.toFixed(1)}%
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">Saflık</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={analysisResults.composition.purity} 
                  color="success"
                  sx={{ mt: 1 }}
                />
                <Typography variant="caption">
                  {analysisResults.composition.purity.toFixed(1)}%
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">Kirlilik Seviyesi</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={analysisResults.composition.contamination} 
                  color="warning"
                  sx={{ mt: 1 }}
                />
                <Typography variant="caption">
                  {analysisResults.composition.contamination.toFixed(1)}%
                </Typography>
              </Box>
            </>
          )}
        </Paper>
        
        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Tespit Edilen Pikler</Typography>
          {analysisResults?.peaks.map((peak, index) => (
            <Chip
              key={index}
              label={`${peak.wavelength}nm (${peak.intensity.toFixed(2)})`}
              size="small"
              sx={{ mr: 1, mb: 1 }}
              color="info"
            />
          ))}
        </Paper>
      </Grid>
    </Grid>
  );
};

// Filtration Optimization Visualization Component
const FiltrationOptimization = ({ isPlaying, speed, currentStep, setCurrentStep }) => {
  const [optimizationData, setOptimizationData] = useState(null);
  const [stages, setStages] = useState(['pre_filter', 'main_filter', 'ultra_filter']);
  const [targetPurity, setTargetPurity] = useState(95);

  const stageInfo = {
    pre_filter: { name: 'Ön Filtre', efficiency: 85, cost: 10, energy: 5 },
    main_filter: { name: 'Ana Filtre', efficiency: 95, cost: 25, energy: 15 },
    ultra_filter: { name: 'Ultra Filtre', efficiency: 99, cost: 50, energy: 35 },
    nano_filter: { name: 'Nano Filtre', efficiency: 99.9, cost: 100, energy: 80 }
  };

  useEffect(() => {
    runOptimization();
  }, [stages, targetPurity]);

  const runOptimization = () => {
    let currentPurity = 70; // Starting purity
    let totalCost = 0;
    let totalEnergy = 0;
    const process = [];

    stages.forEach((stage, index) => {
      const info = stageInfo[stage];
      const remaining = 100 - currentPurity;
      const filtered = remaining * (info.efficiency / 100);
      currentPurity = currentPurity + filtered;
      totalCost += info.cost;
      totalEnergy += info.energy;

      process.push({
        stage: index + 1,
        name: info.name,
        purity: currentPurity,
        cost: totalCost,
        energy: totalEnergy
      });
    });

    setOptimizationData({
      process: process,
      finalPurity: currentPurity,
      totalCost: totalCost,
      totalEnergy: totalEnergy,
      targetMet: currentPurity >= targetPurity
    });
  };

  const chartData = optimizationData ? {
    labels: optimizationData.process.map(p => `Aşama ${p.stage}`),
    datasets: [
      {
        label: 'Saflık (%)',
        data: optimizationData.process.map(p => p.purity),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        yAxisID: 'y'
      },
      {
        label: 'Kümülatif Maliyet',
        data: optimizationData.process.map(p => p.cost),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        yAxisID: 'y1'
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Filtrasyon Optimizasyon Süreci'
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Saflık (%)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Maliyet'
        },
        grid: {
          drawOnChartArea: false,
        },
      }
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Filtrasyon Süreci Optimizasyonu
          </Typography>
          {chartData && (
            <Line data={chartData} options={chartOptions} />
          )}
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>Optimizasyon Ayarları</Typography>
          
          <Typography gutterBottom>Hedef Saflık: {targetPurity}%</Typography>
          <Slider
            value={targetPurity}
            onChange={(e, value) => setTargetPurity(value)}
            min={80}
            max={99.9}
            step={0.1}
            sx={{ mb: 2 }}
          />
          
          <Typography variant="body2" sx={{ mb: 1 }}>Aktif Aşamalar:</Typography>
          {Object.keys(stageInfo).map(stage => (
            <FormControlLabel
              key={stage}
              control={
                <Switch
                  checked={stages.includes(stage)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setStages([...stages, stage]);
                    } else {
                      setStages(stages.filter(s => s !== stage));
                    }
                  }}
                />
              }
              label={stageInfo[stage].name}
              sx={{ display: 'block' }}
            />
          ))}
        </Paper>
        
        {optimizationData && (
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Sonuçlar</Typography>
            
            <Alert 
              severity={optimizationData.targetMet ? "success" : "warning"}
              sx={{ mb: 2 }}
            >
              {optimizationData.targetMet ? 
                `Hedef saflık seviyesi başarıyla ulaşıldı!` : 
                `Hedef saflık seviyesine ulaşılamadı.`
              }
            </Alert>
            
            <Typography variant="body2">
              <strong>Final Saflık:</strong> {optimizationData.finalPurity.toFixed(1)}%
            </Typography>
            <Typography variant="body2">
              <strong>Toplam Maliyet:</strong> {optimizationData.totalCost} TL
            </Typography>
            <Typography variant="body2">
              <strong>Enerji Tüketimi:</strong> {optimizationData.totalEnergy} kWh
            </Typography>
            <Typography variant="body2">
              <strong>Verimlilik Oranı:</strong> {
                (optimizationData.finalPurity / optimizationData.totalCost).toFixed(2)
              }
            </Typography>
          </Paper>
        )}
      </Grid>
    </Grid>
  );
};

// Anomaly Detection Visualization Component
const AnomalyDetectionVisualization = ({ isPlaying, speed, currentStep, setCurrentStep }) => {
  const [sensorData, setSensorData] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [threshold, setThreshold] = useState(2.0);

  useEffect(() => {
    generateInitialData();
  }, []);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentStep(prev => prev + 1);
        addNewDataPoint();
      }, 500 / speed);
      return () => clearInterval(interval);
    }
  }, [isPlaying, speed, threshold]);

  const generateInitialData = () => {
    const data = [];
    for (let i = 0; i < 50; i++) {
      data.push(generateDataPoint(i));
    }
    setSensorData(data);
    detectAnomalies(data);
  };

  const generateDataPoint = (index) => {
    const baseTemp = 25 + 5 * Math.sin(index * 0.1) + (Math.random() - 0.5) * 2;
    const basePh = 7.0 + 0.2 * Math.sin(index * 0.15) + (Math.random() - 0.5) * 0.1;
    const baseConductivity = 0.002 + 0.0005 * Math.sin(index * 0.08) + (Math.random() - 0.5) * 0.0002;
    
    // Occasionally inject anomalies
    let isAnomaly = Math.random() < 0.05;
    
    return {
      index: index,
      timestamp: new Date(Date.now() - (50 - index) * 60000),
      temperature: isAnomaly ? baseTemp + (Math.random() - 0.5) * 20 : baseTemp,
      ph: isAnomaly ? basePh + (Math.random() - 0.5) * 2 : basePh,
      conductivity: isAnomaly ? baseConductivity + (Math.random() - 0.5) * 0.005 : baseConductivity,
      isAnomaly: isAnomaly
    };
  };

  const addNewDataPoint = () => {
    setSensorData(prevData => {
      const newData = [...prevData.slice(1), generateDataPoint(prevData.length)];
      detectAnomalies(newData);
      return newData;
    });
  };

  const detectAnomalies = (data) => {
    const detected = [];
    
    // Simple statistical anomaly detection
    const values = data.map(d => d.temperature);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const std = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);
    
    data.forEach((point, index) => {
      const zScore = Math.abs((point.temperature - mean) / std);
      if (zScore > threshold) {
        detected.push({ ...point, zScore, type: 'temperature' });
      }
    });
    
    setAnomalies(detected);
  };

  const chartData = {
    labels: sensorData.map((_, i) => i),
    datasets: [
      {
        label: 'Sıcaklık (°C)',
        data: sensorData.map(d => d.temperature),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: sensorData.map(d => d.isAnomaly ? 'rgba(255, 99, 132, 0.8)' : 'rgba(75, 192, 192, 0.2)'),
        pointBackgroundColor: sensorData.map(d => d.isAnomaly ? 'red' : 'rgb(75, 192, 192)'),
        pointRadius: sensorData.map(d => d.isAnomaly ? 6 : 3)
      }
    ]
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Gerçek Zamanlı Anomali Tespiti
          </Typography>
          <Line data={chartData} />
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>Anomali Tespit Ayarları</Typography>
          
          <Typography gutterBottom>Z-Score Eşiği: {threshold}</Typography>
          <Slider
            value={threshold}
            onChange={(e, value) => setThreshold(value)}
            min={1.0}
            max={4.0}
            step={0.1}
            sx={{ mb: 2 }}
          />
          
          <Alert severity="info" sx={{ mb: 2 }}>
            Yüksek eşik değerleri daha az hassas tespit sağlar.
          </Alert>
        </Paper>
        
        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Tespit Edilen Anomaliler ({anomalies.length})
          </Typography>
          
          {anomalies.slice(-5).map((anomaly, index) => (
            <Alert 
              key={index} 
              severity="warning" 
              sx={{ mb: 1 }}
            >
              <Typography variant="body2">
                <strong>{anomaly.type}:</strong> {anomaly.temperature.toFixed(1)}°C
                <br />
                <strong>Z-Score:</strong> {anomaly.zScore?.toFixed(2)}
              </Typography>
            </Alert>
          ))}
          
          {anomalies.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              Henüz anomali tespit edilmedi.
            </Typography>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

// Quality Prediction Visualization Component
const QualityPredictionVisualization = ({ isPlaying, speed, currentStep, setCurrentStep }) => {
  const [predictions, setPredictions] = useState([]);
  const [features, setFeatures] = useState({
    temperature: 25,
    ph: 7.0,
    conductivity: 0.002,
    viscosity: 0.002,
    density: 950
  });

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentStep(prev => prev + 1);
        generatePrediction();
      }, 1000 / speed);
      return () => clearInterval(interval);
    }
  }, [isPlaying, speed]);

  const generatePrediction = () => {
    // Simulate feature changes
    const newFeatures = {
      temperature: features.temperature + (Math.random() - 0.5) * 5,
      ph: Math.max(6, Math.min(8, features.ph + (Math.random() - 0.5) * 0.5)),
      conductivity: Math.max(0.001, features.conductivity + (Math.random() - 0.5) * 0.001),
      viscosity: Math.max(0.001, features.viscosity + (Math.random() - 0.5) * 0.0005),
      density: features.density + (Math.random() - 0.5) * 20
    };
    
    // Simple quality prediction model
    const quality = predictQuality(newFeatures);
    
    const newPrediction = {
      timestamp: new Date(),
      features: newFeatures,
      quality: quality,
      confidence: 0.8 + Math.random() * 0.2
    };
    
    setFeatures(newFeatures);
    setPredictions(prev => [...prev.slice(-19), newPrediction]);
  };

  const predictQuality = (features) => {
    // Simplified quality prediction based on features
    let score = 50;
    
    // Temperature factor (optimal around 25-35°C)
    const tempOptimal = 30;
    score += (10 - Math.abs(features.temperature - tempOptimal)) * 2;
    
    // pH factor (optimal around 7.0)
    score += (3 - Math.abs(features.ph - 7.0)) * 10;
    
    // Conductivity factor (lower is better)
    score += Math.max(0, (0.005 - features.conductivity) * 5000);
    
    // Viscosity factor
    score += Math.max(0, (0.003 - Math.abs(features.viscosity - 0.002)) * 5000);
    
    // Density factor
    score += Math.max(0, (20 - Math.abs(features.density - 950)) * 0.5);
    
    return Math.max(0, Math.min(100, score));
  };

  const qualityChartData = {
    labels: predictions.map((_, i) => i),
    datasets: [
      {
        label: 'Kalite Skoru',
        data: predictions.map(p => p.quality),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      }
    ]
  };

  const featureChartData = {
    labels: Object.keys(features),
    datasets: [
      {
        label: 'Mevcut Değerler',
        data: [
          features.temperature / 50 * 100, // Normalize to 0-100
          (features.ph - 6) / 2 * 100,
          features.conductivity / 0.01 * 100,
          features.viscosity / 0.005 * 100,
          (features.density - 900) / 100
        ],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Kalite Tahmin Geçmişi
          </Typography>
          {predictions.length > 0 && (
            <Line data={qualityChartData} />
          )}
        </Paper>
        
        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Mevcut Özellik Değerleri
          </Typography>
          <Bar data={featureChartData} />
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>Manuel Özellik Kontrolü</Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography gutterBottom>Sıcaklık: {features.temperature.toFixed(1)}°C</Typography>
            <Slider
              value={features.temperature}
              onChange={(e, value) => setFeatures({...features, temperature: value})}
              min={10}
              max={60}
              step={0.1}
            />
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography gutterBottom>pH: {features.ph.toFixed(2)}</Typography>
            <Slider
              value={features.ph}
              onChange={(e, value) => setFeatures({...features, ph: value})}
              min={6.0}
              max={8.0}
              step={0.01}
            />
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography gutterBottom>İletkenlik: {features.conductivity.toFixed(4)}</Typography>
            <Slider
              value={features.conductivity}
              onChange={(e, value) => setFeatures({...features, conductivity: value})}
              min={0.001}
              max={0.01}
              step={0.0001}
            />
          </Box>
          
          <Button
            variant="contained"
            fullWidth
            onClick={() => {
              const quality = predictQuality(features);
              const newPrediction = {
                timestamp: new Date(),
                features: {...features},
                quality: quality,
                confidence: 0.95
              };
              setPredictions(prev => [...prev.slice(-19), newPrediction]);
            }}
          >
            Kalite Tahmini Yap
          </Button>
        </Paper>
        
        {predictions.length > 0 && (
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Son Tahmin</Typography>
            
            <Typography variant="h4" color="primary" gutterBottom>
              {predictions[predictions.length - 1]?.quality.toFixed(1)}%
            </Typography>
            
            <LinearProgress 
              variant="determinate" 
              value={predictions[predictions.length - 1]?.quality || 0}
              sx={{ mb: 2 }}
              color={
                (predictions[predictions.length - 1]?.quality || 0) > 80 ? 'success' :
                (predictions[predictions.length - 1]?.quality || 0) > 60 ? 'warning' : 'error'
              }
            />
            
            <Typography variant="body2">
              <strong>Güven:</strong> {((predictions[predictions.length - 1]?.confidence || 0) * 100).toFixed(1)}%
            </Typography>
            
            <Typography variant="body2">
              <strong>Durum:</strong> {
                (predictions[predictions.length - 1]?.quality || 0) > 80 ? 'Mükemmel' :
                (predictions[predictions.length - 1]?.quality || 0) > 60 ? 'İyi' : 'Yetersiz'
              }
            </Typography>
          </Paper>
        )}
      </Grid>
    </Grid>
  );
};

export default AlgorithmVisualization;