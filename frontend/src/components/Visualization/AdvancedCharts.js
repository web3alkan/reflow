import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Slider,
  Switch,
  FormControlLabel,
  Chip,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  ExpandMore,
  Download,
  Fullscreen,
  Settings,
  Refresh,
  PlayArrow,
  Pause,
  ZoomIn,
  ZoomOut,
  RotateLeft,
  RotateRight,
  ViewIn3d
} from '@mui/icons-material';
import Plot from 'react-plotly.js';
import * as d3 from 'd3';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box as ThreeBox, Sphere } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';

const AdvancedCharts = () => {
  const [selectedVisualization, setSelectedVisualization] = useState('heatmap');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [is3DMode, setIs3DMode] = useState(false);
  const [dataRange, setDataRange] = useState([0, 100]);
  const [selectedParameters, setSelectedParameters] = useState(['temperature', 'ph', 'conductivity']);

  const visualizationTypes = [
    { value: 'heatmap', label: 'Isı Haritası', description: 'Sensör verilerinin 2D görselleştirmesi' },
    { value: 'surface3d', label: '3D Yüzey', description: 'Kalite dağılımının 3D analizi' },
    { value: 'network', label: 'Ağ Diyagramı', description: 'Sistem bileşenlerinin bağlantı analizi' },
    { value: 'treemap', label: 'Ağaç Haritası', description: 'Hiyerarşik veri yapısı' },
    { value: 'sankey', label: 'Sankey Diyagramı', description: 'Enerji ve madde akış analizi' },
    { value: 'parallel', label: 'Paralel Koordinatlar', description: 'Çok boyutlu veri analizi' },
    { value: 'waterfall', label: 'Şelale Grafiği', description: 'Kümülatif etki analizi' },
    { value: 'violin', label: 'Keman Grafiği', description: 'Veri dağılımı analizi' }
  ];

  const parameters = [
    'temperature', 'ph', 'conductivity', 'viscosity', 'density', 
    'pressure', 'flow_rate', 'turbidity', 'quality_score'
  ];

  // Generate sample data
  const generateHeatmapData = () => {
    const data = [];
    const x = [];
    const y = [];
    
    for (let i = 0; i < 50; i++) {
      x.push(`Sensör ${i + 1}`);
    }
    
    for (let i = 0; i < 24; i++) {
      y.push(`${i}:00`);
      const row = [];
      for (let j = 0; j < 50; j++) {
        row.push(Math.random() * 100 * (Math.sin(i * 0.1) + 1) * (Math.cos(j * 0.1) + 1));
      }
      data.push(row);
    }
    
    return { x, y, z: data };
  };

  const generate3DSurfaceData = () => {
    const x = [];
    const y = [];
    const z = [];
    
    for (let i = 0; i < 20; i++) {
      x.push(i);
      y.push(i);
    }
    
    for (let i = 0; i < 20; i++) {
      const row = [];
      for (let j = 0; j < 20; j++) {
        row.push(
          Math.sin(i * 0.3) * Math.cos(j * 0.3) * 50 + 
          Math.random() * 10 + 50
        );
      }
      z.push(row);
    }
    
    return { x, y, z };
  };

  const generateNetworkData = () => {
    const nodes = [
      { id: 'main_tank', label: 'Ana Tank', group: 1, size: 30 },
      { id: 'filter1', label: 'Ön Filtre', group: 2, size: 20 },
      { id: 'filter2', label: 'Ana Filtre', group: 2, size: 25 },
      { id: 'filter3', label: 'Ultra Filtre', group: 2, size: 20 },
      { id: 'uv_unit', label: 'UV Sterilizasyon', group: 3, size: 22 },
      { id: 'quality_control', label: 'Kalite Kontrol', group: 4, size: 25 },
      { id: 'storage', label: 'Depolama', group: 1, size: 28 },
      { id: 'ai_analyzer', label: 'AI Analiz', group: 4, size: 30 },
      { id: 'sensor_network', label: 'Sensör Ağı', group: 5, size: 35 }
    ];
    
    const links = [
      { source: 'main_tank', target: 'filter1', value: 5 },
      { source: 'filter1', target: 'filter2', value: 4 },
      { source: 'filter2', target: 'filter3', value: 3 },
      { source: 'filter3', target: 'uv_unit', value: 3 },
      { source: 'uv_unit', target: 'quality_control', value: 2 },
      { source: 'quality_control', target: 'storage', value: 4 },
      { source: 'sensor_network', target: 'ai_analyzer', value: 6 },
      { source: 'ai_analyzer', target: 'quality_control', value: 4 },
      { source: 'main_tank', target: 'sensor_network', value: 2 },
      { source: 'storage', target: 'sensor_network', value: 2 }
    ];
    
    return { nodes, links };
  };

  const generateSankeyData = () => {
    return {
      data: [{
        type: "sankey",
        node: {
          pad: 15,
          thickness: 20,
          line: { color: "black", width: 0.5 },
          label: [
            "Giriş Penetrant", "Ön Filtreleme", "Ana Filtreleme", 
            "Ultra Filtreleme", "UV Sterilizasyon", "Kalite Kontrol",
            "Temiz Penetrant", "Atık", "Geri Dönüşüm"
          ],
          color: [
            "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
            "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22"
          ]
        },
        link: {
          source: [0, 1, 2, 3, 4, 5, 1, 2, 3],
          target: [1, 2, 3, 4, 5, 6, 7, 7, 8],
          value: [100, 95, 90, 88, 85, 83, 5, 5, 2],
          color: [
            "rgba(31, 119, 180, 0.8)", "rgba(255, 127, 14, 0.8)",
            "rgba(44, 160, 44, 0.8)", "rgba(214, 39, 40, 0.8)",
            "rgba(148, 103, 189, 0.8)", "rgba(140, 86, 75, 0.8)",
            "rgba(227, 119, 194, 0.8)", "rgba(127, 127, 127, 0.8)",
            "rgba(188, 189, 34, 0.8)"
          ]
        }
      }]
    };
  };

  const generateParallelData = () => {
    const data = [];
    const dimensions = selectedParameters.map(param => ({
      label: param,
      values: Array.from({ length: 200 }, () => Math.random() * 100)
    }));
    
    return {
      data: [{
        type: 'parcoords',
        line: {
          color: Array.from({ length: 200 }, () => Math.random() * 100),
          colorscale: 'Viridis'
        },
        dimensions: dimensions
      }]
    };
  };

  const renderHeatmap = () => {
    const heatmapData = generateHeatmapData();
    
    return (
      <Plot
        data={[{
          z: heatmapData.z,
          x: heatmapData.x,
          y: heatmapData.y,
          type: 'heatmap',
          colorscale: 'Viridis',
          hoverongaps: false,
          colorbar: {
            title: 'Değer',
            titleside: 'right'
          }
        }]}
        layout={{
          title: 'Sensör Verilerinin Zaman İçindeki Değişimi',
          xaxis: { title: 'Sensörler' },
          yaxis: { title: 'Zaman (Saat)' },
          height: 600
        }}
        style={{ width: '100%', height: '600px' }}
        config={{ displayModeBar: true, responsive: true }}
      />
    );
  };

  const render3DSurface = () => {
    const surfaceData = generate3DSurfaceData();
    
    return (
      <Plot
        data={[{
          z: surfaceData.z,
          type: 'surface',
          colorscale: 'Rainbow',
          lighting: {
            ambient: 0.4,
            diffuse: 0.6,
            specular: 2,
            roughness: 0.05,
            fresnel: 0.2
          },
          lightposition: { x: 100, y: 200, z: 0 }
        }]}
        layout={{
          title: 'Kalite Dağılımının 3D Analizi',
          scene: {
            xaxis: { title: 'X Koordinatı' },
            yaxis: { title: 'Y Koordinatı' },
            zaxis: { title: 'Kalite Skoru' },
            camera: {
              eye: { x: 1.87, y: 0.88, z: -0.64 }
            }
          },
          height: 600
        }}
        style={{ width: '100%', height: '600px' }}
      />
    );
  };

  const renderNetworkVisualization = () => {
    const networkData = generateNetworkData();
    
    const nodeTrace = {
      x: networkData.nodes.map((_, i) => Math.cos(i * 2 * Math.PI / networkData.nodes.length) * 2),
      y: networkData.nodes.map((_, i) => Math.sin(i * 2 * Math.PI / networkData.nodes.length) * 2),
      mode: 'markers+text',
      marker: {
        size: networkData.nodes.map(n => n.size),
        color: networkData.nodes.map(n => n.group),
        colorscale: 'Viridis',
        line: { width: 2, color: 'white' }
      },
      text: networkData.nodes.map(n => n.label),
      textposition: 'middle center',
      type: 'scatter'
    };
    
    const edgeTraces = networkData.links.map(link => {
      const sourceNode = networkData.nodes.find(n => n.id === link.source);
      const targetNode = networkData.nodes.find(n => n.id === link.target);
      const sourceIndex = networkData.nodes.indexOf(sourceNode);
      const targetIndex = networkData.nodes.indexOf(targetNode);
      
      return {
        x: [
          Math.cos(sourceIndex * 2 * Math.PI / networkData.nodes.length) * 2,
          Math.cos(targetIndex * 2 * Math.PI / networkData.nodes.length) * 2,
          null
        ],
        y: [
          Math.sin(sourceIndex * 2 * Math.PI / networkData.nodes.length) * 2,
          Math.sin(targetIndex * 2 * Math.PI / networkData.nodes.length) * 2,
          null
        ],
        mode: 'lines',
        line: { width: link.value, color: 'rgba(125, 125, 125, 0.5)' },
        type: 'scatter'
      };
    });
    
    return (
      <Plot
        data={[nodeTrace, ...edgeTraces]}
        layout={{
          title: 'Sistem Bileşenleri Ağ Analizi',
          showlegend: false,
          xaxis: { visible: false },
          yaxis: { visible: false },
          height: 600,
          hovermode: 'closest'
        }}
        style={{ width: '100%', height: '600px' }}
      />
    );
  };

  const renderSankey = () => {
    const sankeyData = generateSankeyData();
    
    return (
      <Plot
        data={sankeyData.data}
        layout={{
          title: 'Penetrant Geri Kazanım Süreci Akış Analizi',
          height: 600,
          font: { size: 10 }
        }}
        style={{ width: '100%', height: '600px' }}
      />
    );
  };

  const renderParallelCoordinates = () => {
    const parallelData = generateParallelData();
    
    return (
      <Plot
        data={parallelData.data}
        layout={{
          title: 'Çok Boyutlu Parametre Analizi',
          height: 600
        }}
        style={{ width: '100%', height: '600px' }}
      />
    );
  };

  const renderTreemap = () => {
    return (
      <Plot
        data={[{
          type: "treemap",
          labels: [
            "Sistem Performansı", "Filtreleme", "Kalite Kontrol", "Enerji",
            "Ön Filtre", "Ana Filtre", "Ultra Filtre", "Nano Filtre",
            "Spektral Analiz", "AI Analiz", "Manual Kontrol",
            "Elektrik", "Mekanik", "Soğutma"
          ],
          parents: [
            "", "Sistem Performansı", "Sistem Performansı", "Sistem Performansı",
            "Filtreleme", "Filtreleme", "Filtreleme", "Filtreleme",
            "Kalite Kontrol", "Kalite Kontrol", "Kalite Kontrol",
            "Enerji", "Enerji", "Enerji"
          ],
          values: [100, 45, 35, 20, 15, 12, 10, 8, 15, 12, 8, 8, 7, 5],
          textinfo: "label+value",
          hovertemplate: '<b>%{label} </b> <br> Değer: %{value}<extra></extra>',
          maxdepth: 3,
          marker: { colorscale: 'Viridis' }
        }]}
        layout={{
          title: 'Sistem Bileşenleri Hiyerarşik Analizi',
          height: 600
        }}
        style={{ width: '100%', height: '600px' }}
      />
    );
  };

  const renderViolin = () => {
    const violinData = selectedParameters.map(param => ({
      type: 'violin',
      y: Array.from({ length: 100 }, () => Math.random() * 100 + Math.sin(Math.random() * 10) * 20),
      name: param,
      box: { visible: true },
      meanline: { visible: true }
    }));
    
    return (
      <Plot
        data={violinData}
        layout={{
          title: 'Parametre Dağılım Analizi',
          yaxis: { title: 'Değer' },
          height: 600
        }}
        style={{ width: '100%', height: '600px' }}
      />
    );
  };

  const renderWaterfall = () => {
    return (
      <Plot
        data={[{
          type: 'waterfall',
          x: [
            'Başlangıç Kalitesi', 'Ön Filtreleme', 'Ana Filtreleme', 
            'Ultra Filtreleme', 'UV Sterilizasyon', 'Son Kalite'
          ],
          y: [70, +15, +8, +5, +2, null],
          measure: ['absolute', 'relative', 'relative', 'relative', 'relative', 'total'],
          text: ['70%', '+15%', '+8%', '+5%', '+2%', '100%'],
          textposition: 'outside',
          connector: { line: { color: 'rgb(63, 63, 63)' } },
          increasing: { marker: { color: 'green' } },
          decreasing: { marker: { color: 'red' } },
          totals: { marker: { color: 'blue' } }
        }]}
        layout={{
          title: 'Kalite İyileştirme Süreci Kümülatif Etkisi',
          yaxis: { title: 'Kalite Artışı (%)' },
          height: 600
        }}
        style={{ width: '100%', height: '600px' }}
      />
    );
  };

  const render3DScene = () => {
    return (
      <Box sx={{ height: 600, bgcolor: 'black', borderRadius: 2 }}>
        <Canvas camera={{ position: [5, 5, 5] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          
          {/* Main system components in 3D */}
          <ThreeBox position={[0, 0, 0]} args={[2, 1, 1]}>
            <meshStandardMaterial color="blue" />
          </ThreeBox>
          
          <Sphere position={[3, 0, 0]} args={[0.5]}>
            <meshStandardMaterial color="green" />
          </Sphere>
          
          <ThreeBox position={[-3, 0, 0]} args={[1, 2, 1]}>
            <meshStandardMaterial color="red" />
          </ThreeBox>
          
          <Text
            position={[0, 2, 0]}
            fontSize={0.5}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            ReFlow 3D Sistem Görünümü
          </Text>
          
          <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
        </Canvas>
      </Box>
    );
  };

  const getCurrentVisualization = () => {
    if (is3DMode) return render3DScene();
    
    switch (selectedVisualization) {
      case 'heatmap': return renderHeatmap();
      case 'surface3d': return render3DSurface();
      case 'network': return renderNetworkVisualization();
      case 'treemap': return renderTreemap();
      case 'sankey': return renderSankey();
      case 'parallel': return renderParallelCoordinates();
      case 'waterfall': return renderWaterfall();
      case 'violin': return renderViolin();
      default: return renderHeatmap();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ViewIn3d color="primary" />
            Gelişmiş Veri Görselleştirme Araçları
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            ReFlow sisteminin verilerini farklı görselleştirme teknikleri ile analiz edin.
          </Typography>

          {/* Control Panel */}
          <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Görselleştirme Türü</InputLabel>
                  <Select
                    value={selectedVisualization}
                    onChange={(e) => setSelectedVisualization(e.target.value)}
                    label="Görselleştirme Türü"
                  >
                    {visualizationTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        <Box>
                          <Typography variant="body2">{type.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {type.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Parametreler</InputLabel>
                  <Select
                    multiple
                    value={selectedParameters}
                    onChange={(e) => setSelectedParameters(e.target.value)}
                    label="Parametreler"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {parameters.map((param) => (
                      <MenuItem key={param} value={param}>
                        {param}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={is3DMode}
                      onChange={(e) => setIs3DMode(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="3D Mod"
                />
              </Grid>
              
              <Grid item xs={12} md={2}>
                <Button
                  variant="contained"
                  startIcon={isAnimating ? <Pause /> : <PlayArrow />}
                  onClick={() => setIsAnimating(!isAnimating)}
                  fullWidth
                >
                  {isAnimating ? 'Duraklat' : 'Animasyon'}
                </Button>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="İndir">
                    <IconButton color="primary">
                      <Download />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Tam Ekran">
                    <IconButton color="primary">
                      <Fullscreen />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Yenile">
                    <IconButton color="primary">
                      <Refresh />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>
            
            {/* Animation Speed Control */}
            {isAnimating && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={4}>
                  <Typography gutterBottom>Animasyon Hızı</Typography>
                  <Slider
                    value={animationSpeed}
                    onChange={(e, value) => setAnimationSpeed(value)}
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
              </Grid>
            )}
          </Paper>

          {/* Visualization Area */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedVisualization + is3DMode}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              {getCurrentVisualization()}
            </motion.div>
          </AnimatePresence>

          {/* Visualization Info */}
          <Box sx={{ mt: 3 }}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">
                  Görselleştirme Bilgileri ve Kullanım Kılavuzu
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Mevcut Görselleştirme: {
                        visualizationTypes.find(v => v.value === selectedVisualization)?.label
                      }
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {visualizationTypes.find(v => v.value === selectedVisualization)?.description}
                    </Typography>
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Kullanım İpuçları:
                    </Typography>
                    <Typography variant="body2">
                      • Fare ile yakınlaştırma/uzaklaştırma yapabilirsiniz
                      <br />
                      • Grafik üzerinde gezinmek için sürükleyin
                      <br />
                      • Veri noktalarının detaylarını görmek için üzerine gelin
                      <br />
                      • Sağ üst köşedeki araçları kullanarak grafiği özelleştirin
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Veri Kaynakları:
                    </Typography>
                    <Typography variant="body2">
                      • Gerçek zamanlı sensör verileri
                      <br />
                      • Geçmiş performans kayıtları
                      <br />
                      • AI model çıktıları
                      <br />
                      • Sistem günlükleri
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <Chip label="Gerçek Zamanlı" color="success" size="small" sx={{ mr: 1 }} />
                      <Chip label="Interaktif" color="primary" size="small" sx={{ mr: 1 }} />
                      <Chip label="Analitik" color="info" size="small" />
                    </Box>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdvancedCharts;