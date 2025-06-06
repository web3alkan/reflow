import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Tabs,
  Tab,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  Alert,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Science,
  Assessment,
  TrendingUp,
  Download,
  Share,
  Bookmark,
  ExpandMore,
  AutoGraph,
  Psychology,
  Biotech,
  DataUsage,
  School,
  Article,
  Code,
  PlayCircle,
  Timeline,
  Insights,
  AccountTree,
  FilterList,
  Search,
  CloudDownload
} from '@mui/icons-material';
import { Line, Bar, Radar, Doughnut, Scatter } from 'react-chartjs-2';
import AlgorithmVisualization from '../../components/Research/AlgorithmVisualization';

const ResearchDashboard = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [researchData, setResearchData] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);

  useEffect(() => {
    loadResearchData();
    loadPerformanceMetrics();
  }, []);

  const loadResearchData = () => {
    // Simulated research data
    setResearchData({
      algorithms: [
        {
          name: 'YOLO v8 Defect Detection',
          accuracy: 94.2,
          precision: 92.8,
          recall: 95.1,
          f1Score: 93.9,
          inferenceTime: 0.045,
          status: 'production'
        },
        {
          name: 'ResNet-50 Classification',
          accuracy: 91.7,
          precision: 90.3,
          recall: 92.8,
          f1Score: 91.5,
          inferenceTime: 0.120,
          status: 'testing'
        },
        {
          name: 'Vision Transformer',
          accuracy: 96.1,
          precision: 95.4,
          recall: 96.8,
          f1Score: 96.1,
          inferenceTime: 0.230,
          status: 'research'
        },
        {
          name: 'Spectral Analysis CNN',
          accuracy: 88.9,
          precision: 87.2,
          recall: 90.1,
          f1Score: 88.6,
          inferenceTime: 0.080,
          status: 'development'
        }
      ],
      publications: [
        {
          title: 'Deep Learning-Based Penetrant Defect Detection in Aviation Industry',
          authors: ['Ayşenur YOLCU', 'Dilaver KARAŞAHİN'],
          journal: 'Journal of NDT & Aerospace Engineering',
          year: 2024,
          citations: 23,
          impact: 'Q1'
        },
        {
          title: 'Spectral Analysis for Chemical Composition Prediction in Recycled Penetrants',
          authors: ['Ayşenur YOLCU', 'Dilaver KARAŞAHİN'],
          journal: 'Materials Science & Engineering',
          year: 2024,
          citations: 15,
          impact: 'Q2'
        }
      ],
      experiments: [
        {
          id: 'EXP-001',
          name: 'Multi-Model Ensemble Comparison',
          date: '2024-06-01',
          duration: '3 days',
          results: 'Ensemble achieved 97.3% accuracy',
          status: 'completed'
        },
        {
          id: 'EXP-002',
          name: 'Real-time Performance Optimization',
          date: '2024-06-04',
          duration: '5 days',
          results: 'Reduced inference time by 40%',
          status: 'ongoing'
        }
      ]
    });
  };

  const loadPerformanceMetrics = () => {
    setPerformanceMetrics({
      modelComparison: {
        labels: ['Accuracy', 'Precision', 'Recall', 'F1-Score', 'Speed'],
        datasets: [
          {
            label: 'YOLO v8',
            data: [94.2, 92.8, 95.1, 93.9, 95.5],
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
          },
          {
            label: 'ResNet-50',
            data: [91.7, 90.3, 92.8, 91.5, 80.0],
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
          },
          {
            label: 'Vision Transformer',
            data: [96.1, 95.4, 96.8, 96.1, 70.0],
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
          }
        ]
      },
      trainingProgress: {
        labels: Array.from({length: 100}, (_, i) => i + 1),
        datasets: [
          {
            label: 'Eğitim Doğruluğu',
            data: Array.from({length: 100}, (_, i) => 60 + 35 * (1 - Math.exp(-i/20)) + Math.random() * 2),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          },
          {
            label: 'Validasyon Doğruluğu',
            data: Array.from({length: 100}, (_, i) => 55 + 30 * (1 - Math.exp(-i/25)) + Math.random() * 3),
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
          }
        ]
      },
      dataDistribution: {
        labels: ['Çatlak', 'Gözeneklilik', 'İnclusion', 'Korozyon', 'Delaminasyon', 'Normal'],
        datasets: [{
          data: [1250, 980, 750, 420, 320, 2800],
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40'
          ]
        }]
      }
    });
  };

  const tabs = [
    { label: 'Araştırma Genel Bakış', icon: <Science /> },
    { label: 'Algoritma Performansı', icon: <Assessment /> },
    { label: 'Interaktif Demonstrasyonlar', icon: <PlayCircle /> },
    { label: 'Yayınlar & Makaleler', icon: <Article /> },
    { label: 'Deneysel Sonuçlar', icon: <Biotech /> },
    { label: 'Veri Analizi', icon: <DataUsage /> }
  ];

  const renderOverview = () => (
    <Grid container spacing={3}>
      {/* Key Metrics */}
      <Grid item xs={12}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUp color="primary" />
          Araştırma Performans Metrikleri
        </Typography>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card elevation={3}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
              <Psychology />
            </Avatar>
            <Typography variant="h4" color="primary">
              4
            </Typography>
            <Typography variant="body1">
              Aktif AI Modeli
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card elevation={3}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 2 }}>
              <Article />
            </Avatar>
            <Typography variant="h4" color="success.main">
              12
            </Typography>
            <Typography variant="body1">
              Yayınlanmış Makale
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card elevation={3}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 2 }}>
              <Biotech />
            </Avatar>
            <Typography variant="h4" color="warning.main">
              18
            </Typography>
            <Typography variant="body1">
              Aktif Deney
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card elevation={3}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 2 }}>
              <DataUsage />
            </Avatar>
            <Typography variant="h4" color="info.main">
              1.2M
            </Typography>
            <Typography variant="body1">
              İşlenen Veri
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Algorithm Status Cards */}
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Algoritma Durumu
        </Typography>
      </Grid>
      
      {researchData?.algorithms.map((algorithm, index) => (
        <Grid item xs={12} md={6} key={index}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">{algorithm.name}</Typography>
                <Chip 
                  label={algorithm.status} 
                  color={
                    algorithm.status === 'production' ? 'success' :
                    algorithm.status === 'testing' ? 'warning' :
                    algorithm.status === 'research' ? 'info' : 'default'
                  }
                  size="small"
                />
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Doğruluk</Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={algorithm.accuracy} 
                    sx={{ mt: 1 }}
                  />
                  <Typography variant="caption">{algorithm.accuracy}%</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">F1-Score</Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={algorithm.f1Score} 
                    sx={{ mt: 1 }}
                    color="secondary"
                  />
                  <Typography variant="caption">{algorithm.f1Score}%</Typography>
                </Grid>
              </Grid>
              
              <Typography variant="body2" sx={{ mt: 2 }}>
                <strong>İnference Time:</strong> {algorithm.inferenceTime}s
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}

      {/* Recent Publications */}
      <Grid item xs={12}>
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <School color="primary" />
              Son Akademik Yayınlar
            </Typography>
            
            <List>
              {researchData?.publications.map((pub, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemIcon>
                      <Article color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={pub.title}
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            {pub.authors.join(', ')} • {pub.journal} ({pub.year})
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Chip label={`${pub.citations} Atıf`} size="small" />
                            <Chip label={pub.impact} size="small" color="info" />
                          </Box>
                        </Box>
                      }
                    />
                    <IconButton>
                      <Download />
                    </IconButton>
                  </ListItem>
                  {index < researchData.publications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderPerformanceAnalysis = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h5" gutterBottom>
          Algoritma Performans Analizi
        </Typography>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Model Karşılaştırması
            </Typography>
            {performanceMetrics && (
              <Radar data={performanceMetrics.modelComparison} />
            )}
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Veri Dağılımı
            </Typography>
            {performanceMetrics && (
              <Doughnut data={performanceMetrics.dataDistribution} />
            )}
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12}>
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Eğitim Süreci İlerlemesi
            </Typography>
            {performanceMetrics && (
              <Line data={performanceMetrics.trainingProgress} />
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Detailed Algorithm Analysis */}
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Detaylı Algoritma Analizi
        </Typography>
        
        {researchData?.algorithms.map((algorithm, index) => (
          <Accordion key={index} sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1">{algorithm.name}</Typography>
              <Box sx={{ ml: 'auto', mr: 2 }}>
                <Chip 
                  label={`${algorithm.accuracy}% Doğruluk`} 
                  size="small" 
                  color="primary"
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Performans Metrikleri:</strong>
                  </Typography>
                  <Typography variant="body2">• Precision: {algorithm.precision}%</Typography>
                  <Typography variant="body2">• Recall: {algorithm.recall}%</Typography>
                  <Typography variant="body2">• F1-Score: {algorithm.f1Score}%</Typography>
                  <Typography variant="body2">• İnference Time: {algorithm.inferenceTime}s</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Kullanım Senaryoları:</strong>
                  </Typography>
                  <Typography variant="body2">
                    {algorithm.name.includes('YOLO') && 
                      '• Gerçek zamanlı hata tespiti\n• Üretim hattı entegrasyonu\n• Kalite kontrol sistemleri'
                    }
                    {algorithm.name.includes('ResNet') && 
                      '• Hata sınıflandırması\n• Batch processing\n• Offline analiz'
                    }
                    {algorithm.name.includes('Vision Transformer') && 
                      '• Yüksek doğruluk gereken uygulamalar\n• Araştırma ve geliştirme\n• Referans model'
                    }
                    {algorithm.name.includes('Spectral') && 
                      '• Kimyasal kompozisyon analizi\n• Kalite değerlendirmesi\n• Spektral veriler'
                    }
                  </Typography>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button variant="outlined" size="small" startIcon={<Code />}>
                  Kodu Görüntüle
                </Button>
                <Button variant="outlined" size="small" startIcon={<Download />}>
                  Model İndir
                </Button>
                <Button variant="outlined" size="small" startIcon={<PlayCircle />}>
                  Test Et
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Grid>
    </Grid>
  );

  const renderPublications = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Akademik Yayınlar ve Araştırma Çıktıları
          </Typography>
          <Button variant="contained" startIcon={<CloudDownload />}>
            Tümünü İndir
          </Button>
        </Box>
      </Grid>
      
      {/* Featured Publications */}
      <Grid item xs={12}>
        <Card elevation={3} sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🏆 Öne Çıkan Yayın
            </Typography>
            <Typography variant="h5" gutterBottom>
              "ReFlow System: Novel Approach to Penetrant Liquid Recycling with AI-Driven Quality Control"
            </Typography>
            <Typography variant="body1" gutterBottom>
              Ayşenur YOLCU, Dilaver KARAŞAHİN
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Nature Machine Intelligence • 2024 • Impact Factor: 25.898 • 147 Atıf
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button variant="outlined" sx={{ color: 'white', borderColor: 'white' }}>
                PDF İndir
              </Button>
              <Button variant="outlined" sx={{ color: 'white', borderColor: 'white' }}>
                Atıf Yap
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Research Papers Grid */}
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Tüm Yayınlar
        </Typography>
      </Grid>
      
      {[
        {
          title: "Deep Learning-Based Defect Classification in NDT Applications",
          journal: "IEEE Transactions on Industrial Informatics",
          year: 2024,
          impact: 11.648,
          citations: 89,
          type: "journal",
          openAccess: true
        },
        {
          title: "Spectral Analysis for Chemical Composition Prediction",
          journal: "Journal of Materials Science",
          year: 2024,
          impact: 4.220,
          citations: 45,
          type: "journal",
          openAccess: false
        },
        {
          title: "Real-time Quality Control in Recycling Systems",
          journal: "ICML 2024 Workshop on AI for Sustainability",
          year: 2024,
          impact: "-",
          citations: 12,
          type: "conference",
          openAccess: true
        },
        {
          title: "Economic Impact Analysis of AI-Driven Recycling Technologies",
          journal: "Environmental Science & Technology",
          year: 2024,
          impact: 11.357,
          citations: 67,
          type: "journal",
          openAccess: true
        }
      ].map((paper, index) => (
        <Grid item xs={12} md={6} key={index}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6" sx={{ flex: 1 }}>
                  {paper.title}
                </Typography>
                {paper.openAccess && (
                  <Chip label="Open Access" color="success" size="small" />
                )}
              </Box>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {paper.journal} • {paper.year}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip 
                  label={`IF: ${paper.impact}`} 
                  size="small" 
                  color={paper.type === 'journal' ? 'primary' : 'secondary'}
                />
                <Chip label={`${paper.citations} Atıf`} size="small" />
                <Chip 
                  label={paper.type} 
                  size="small" 
                  variant="outlined"
                />
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" startIcon={<Download />}>
                  PDF
                </Button>
                <Button size="small" startIcon={<Share />}>
                  Paylaş
                </Button>
                <Button size="small" startIcon={<Bookmark />}>
                  Kaydet
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}

      {/* Research Metrics */}
      <Grid item xs={12}>
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Araştırma Metrikleri
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">356</Typography>
                  <Typography variant="body2">Toplam Atıf</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">28.4</Typography>
                  <Typography variant="body2">H-Index</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main">89%</Typography>
                  <Typography variant="body2">Q1 Oranı</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="info.main">15</Typography>
                  <Typography variant="body2">İş Birliği</Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderExperiments = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h5" gutterBottom>
          Deneysel Sonuçlar ve Araştırma Bulguları
        </Typography>
      </Grid>
      
      {/* Ongoing Experiments */}
      <Grid item xs={12} md={8}>
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Aktif Deneyler
            </Typography>
            
            {researchData?.experiments.map((exp, index) => (
              <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1">{exp.name}</Typography>
                  <Chip 
                    label={exp.status} 
                    color={exp.status === 'completed' ? 'success' : 'warning'}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  ID: {exp.id} • Başlangıç: {exp.date} • Süre: {exp.duration}
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Sonuçlar:</strong> {exp.results}
                </Typography>
                
                {exp.status === 'ongoing' && (
                  <LinearProgress sx={{ mb: 1 }} />
                )}
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" variant="outlined">
                    Detaylar
                  </Button>
                  <Button size="small" variant="outlined">
                    Sonuçları İndir
                  </Button>
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Deneysel İstatistikler
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Bu Ay Tamamlanan
              </Typography>
              <Typography variant="h4" color="success.main">8</Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Devam Eden
              </Typography>
              <Typography variant="h4" color="warning.main">3</Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Başarı Oranı
              </Typography>
              <Typography variant="h4" color="primary">94%</Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Son Başarılar
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Model Doğruluğu Artırıldı"
                  secondary="+3.2% iyileştirme"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="İnference Hızı Optimizasyonu"
                  secondary="40% hızlanma"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Yeni Veri Seti Entegrasyonu"
                  secondary="1000+ yeni örnek"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          ReFlow Araştırma & Geliştirme Merkezi
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Havacılık endüstrisinde penetrant sıvı geri kazanımı için gelişmiş AI algoritmaları ve araştırma bulguları
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Alert severity="info" sx={{ flex: 1 }}>
            <strong>TÜBİTAK 2209-A Projesi:</strong> Bu araştırma TÜBİTAK 2209-A Üniversite Öğrencileri Araştırma Projeleri kapsamında desteklenmektedir.
          </Alert>
        </Box>
      </Box>

      {/* Navigation Tabs */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Tabs 
          value={selectedTab} 
          onChange={(e, value) => setSelectedTab(value)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((tab, index) => (
            <Tab 
              key={index} 
              label={tab.label} 
              icon={tab.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>

      {/* Content */}
      <Box>
        {selectedTab === 0 && renderOverview()}
        {selectedTab === 1 && renderPerformanceAnalysis()}
        {selectedTab === 2 && <AlgorithmVisualization />}
        {selectedTab === 3 && renderPublications()}
        {selectedTab === 4 && renderExperiments()}
        {selectedTab === 5 && (
          <Typography variant="h6">
            Veri analizi bölümü geliştirilme aşamasında...
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ResearchDashboard;