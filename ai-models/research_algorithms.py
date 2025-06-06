#!/usr/bin/env python3
"""
ReFlow Research Algorithms
Novel algorithms for penetrant liquid recycling optimization and quality prediction
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import optimize, signal, stats
from scipy.spatial.distance import cdist
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.cluster import DBSCAN, KMeans
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.model_selection import cross_val_score, GridSearchCV
from sklearn.metrics import mean_squared_error, r2_score
import networkx as nx
from typing import Dict, List, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')

class PenetrantQualityPredictor:
    """Penetrant kalite tahmin algoritması - Hibrit ML/Fizik tabanlı model"""
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.model = None
        self.feature_importance = {}
        self.physical_constants = {
            'density_water': 1000,  # kg/m³
            'viscosity_water': 0.001,  # Pa·s
            'surface_tension_water': 0.0728,  # N/m
            'ph_neutral': 7.0,
            'conductivity_pure': 5.5e-6  # S/m
        }
    
    def extract_features(self, sensor_data: Dict) -> np.ndarray:
        """Sensör verilerinden özellik çıkarımı"""
        features = []
        
        # Temel fiziksel özellikler
        features.extend([
            sensor_data.get('temperature', 20),
            sensor_data.get('ph', 7.0),
            sensor_data.get('conductivity', 0.001),
            sensor_data.get('viscosity', 0.002),
            sensor_data.get('density', 950),
            sensor_data.get('surface_tension', 0.025)
        ])
        
        # Türev özellikler (fizik tabanlı)
        temp = sensor_data.get('temperature', 20)
        visc = sensor_data.get('viscosity', 0.002)
        dens = sensor_data.get('density', 950)
        
        # Reynolds number proxy
        reynolds_proxy = (dens * 0.1) / visc  # Assuming characteristic velocity
        features.append(reynolds_proxy)
        
        # Prandtl number proxy
        prandtl_proxy = visc / (dens * 0.001)  # Assuming thermal diffusivity
        features.append(prandtl_proxy)
        
        # Weber number proxy
        weber_proxy = (dens * 0.1**2 * 0.01) / sensor_data.get('surface_tension', 0.025)
        features.append(weber_proxy)
        
        # pH deviation from neutral
        ph_deviation = abs(sensor_data.get('ph', 7.0) - 7.0)
        features.append(ph_deviation)
        
        # Normalized features
        features.append(sensor_data.get('temperature', 20) / 100)
        features.append(sensor_data.get('conductivity', 0.001) * 1000)
        
        return np.array(features)
    
    def train_model(self, training_data: List[Dict], quality_scores: List[float]):
        """Model eğitimi"""
        # Feature extraction
        X = np.array([self.extract_features(data) for data in training_data])
        y = np.array(quality_scores)
        
        # Scaling
        X_scaled = self.scaler.fit_transform(X)
        
        # Ensemble model with physical constraints
        self.model = RandomForestRegressor(
            n_estimators=200,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42
        )
        
        self.model.fit(X_scaled, y)
        
        # Feature importance
        feature_names = [
            'temperature', 'ph', 'conductivity', 'viscosity', 'density', 
            'surface_tension', 'reynolds_proxy', 'prandtl_proxy', 
            'weber_proxy', 'ph_deviation', 'temp_norm', 'cond_norm'
        ]
        
        self.feature_importance = dict(zip(feature_names, self.model.feature_importances_))
        
        return self.model.score(X_scaled, y)
    
    def predict_quality(self, sensor_data: Dict) -> Dict:
        """Kalite tahmini"""
        if self.model is None:
            raise ValueError("Model henüz eğitilmemiş!")
        
        features = self.extract_features(sensor_data).reshape(1, -1)
        features_scaled = self.scaler.transform(features)
        
        # Prediction
        quality_score = self.model.predict(features_scaled)[0]
        
        # Uncertainty estimation (using tree variance)
        tree_predictions = [tree.predict(features_scaled)[0] for tree in self.model.estimators_]
        uncertainty = np.std(tree_predictions)
        
        # Physical validation
        physical_validation = self._validate_physical_constraints(sensor_data)
        
        return {
            'quality_score': float(quality_score),
            'uncertainty': float(uncertainty),
            'confidence': float(1 - min(uncertainty / 10, 0.5)),
            'physical_validation': physical_validation,
            'recommendations': self._generate_quality_recommendations(sensor_data, quality_score)
        }
    
    def _validate_physical_constraints(self, sensor_data: Dict) -> Dict:
        """Fiziksel kısıtlamaları kontrol eder"""
        validations = {}
        
        # Temperature range
        temp = sensor_data.get('temperature', 20)
        validations['temperature_valid'] = 10 <= temp <= 80
        
        # pH range
        ph = sensor_data.get('ph', 7.0)
        validations['ph_valid'] = 6.0 <= ph <= 8.5
        
        # Viscosity reasonableness
        visc = sensor_data.get('viscosity', 0.002)
        validations['viscosity_valid'] = 0.0005 <= visc <= 0.01
        
        # Density range
        dens = sensor_data.get('density', 950)
        validations['density_valid'] = 800 <= dens <= 1200
        
        return validations
    
    def _generate_quality_recommendations(self, sensor_data: Dict, quality_score: float) -> List[str]:
        """Kalite geliştirme önerileri"""
        recommendations = []
        
        if quality_score < 70:
            if sensor_data.get('ph', 7.0) < 6.5:
                recommendations.append("pH değerini yükseltin")
            elif sensor_data.get('ph', 7.0) > 8.0:
                recommendations.append("pH değerini düşürün")
            
            if sensor_data.get('temperature', 20) > 60:
                recommendations.append("Sıcaklığı düşürün")
            
            if sensor_data.get('conductivity', 0.001) > 0.005:
                recommendations.append("Ek filtreleme gerekli")
        
        return recommendations

class OptimalFiltrationDesigner:
    """Optimum filtrasyon parametrelerini hesaplayan algoritma"""
    
    def __init__(self):
        self.filtration_stages = {
            'pre_filter': {'pore_size': 50e-6, 'efficiency': 0.85},
            'main_filter': {'pore_size': 5e-6, 'efficiency': 0.95},
            'ultra_filter': {'pore_size': 0.1e-6, 'efficiency': 0.99},
            'nano_filter': {'pore_size': 0.01e-6, 'efficiency': 0.999}
        }
    
    def optimize_filtration_sequence(self, input_contamination: Dict, 
                                   target_purity: float, max_stages: int = 4) -> Dict:
        """Optimum filtrasyon sırasını hesaplar"""
        
        def objective_function(stage_selection):
            """Optimize edilecek amaç fonksiyonu"""
            total_cost = 0
            current_purity = 1 - input_contamination.get('total_contamination', 0.1)
            energy_consumption = 0
            
            for i, use_stage in enumerate(stage_selection):
                if use_stage > 0.5:  # Binary decision
                    stage_name = list(self.filtration_stages.keys())[i]
                    stage_info = self.filtration_stages[stage_name]
                    
                    # Update purity
                    remaining_contamination = 1 - current_purity
                    filtered_contamination = remaining_contamination * stage_info['efficiency']
                    current_purity = 1 - (remaining_contamination - filtered_contamination)
                    
                    # Add costs
                    total_cost += self._calculate_stage_cost(stage_name)
                    energy_consumption += self._calculate_energy_consumption(stage_name)
            
            # Penalty if target not reached
            purity_penalty = max(0, (target_purity - current_purity) * 1000)
            
            # Multi-objective: minimize cost and energy while maximizing purity
            return total_cost + energy_consumption * 0.1 + purity_penalty
        
        # Constraints
        constraints = [
            {'type': 'ineq', 'fun': lambda x: sum(x) - 1},  # At least one stage
            {'type': 'ineq', 'fun': lambda x: max_stages - sum(x)}  # Max stages limit
        ]
        
        bounds = [(0, 1) for _ in range(len(self.filtration_stages))]
        
        # Optimization
        result = optimize.differential_evolution(
            objective_function,
            bounds,
            maxiter=100,
            seed=42
        )
        
        # Process results
        optimal_stages = [i for i, use in enumerate(result.x) if use > 0.5]
        stage_names = [list(self.filtration_stages.keys())[i] for i in optimal_stages]
        
        # Calculate final performance
        final_purity = self._calculate_final_purity(input_contamination, stage_names)
        total_cost = sum(self._calculate_stage_cost(stage) for stage in stage_names)
        total_energy = sum(self._calculate_energy_consumption(stage) for stage in stage_names)
        
        return {
            'optimal_stages': stage_names,
            'final_purity': final_purity,
            'total_cost': total_cost,
            'energy_consumption': total_energy,
            'efficiency_ratio': final_purity / (total_cost + 1),
            'processing_time': self._estimate_processing_time(stage_names)
        }
    
    def _calculate_stage_cost(self, stage_name: str) -> float:
        """Aşama maliyetini hesaplar"""
        cost_mapping = {
            'pre_filter': 10,
            'main_filter': 25,
            'ultra_filter': 50,
            'nano_filter': 100
        }
        return cost_mapping.get(stage_name, 0)
    
    def _calculate_energy_consumption(self, stage_name: str) -> float:
        """Enerji tüketimini hesaplar"""
        energy_mapping = {
            'pre_filter': 5,
            'main_filter': 15,
            'ultra_filter': 35,
            'nano_filter': 80
        }
        return energy_mapping.get(stage_name, 0)
    
    def _calculate_final_purity(self, input_contamination: Dict, stages: List[str]) -> float:
        """Final saflık seviyesini hesaplar"""
        current_purity = 1 - input_contamination.get('total_contamination', 0.1)
        
        for stage_name in stages:
            if stage_name in self.filtration_stages:
                efficiency = self.filtration_stages[stage_name]['efficiency']
                remaining_contamination = 1 - current_purity
                filtered_contamination = remaining_contamination * efficiency
                current_purity = 1 - (remaining_contamination - filtered_contamination)
        
        return current_purity
    
    def _estimate_processing_time(self, stages: List[str]) -> float:
        """İşlem süresini tahmin eder"""
        time_mapping = {
            'pre_filter': 5,
            'main_filter': 10,
            'ultra_filter': 20,
            'nano_filter': 45
        }
        return sum(time_mapping.get(stage, 0) for stage in stages)

class SystemPerformanceOptimizer:
    """Sistem performansını optimize eden algoritma"""
    
    def __init__(self):
        self.performance_history = []
        self.optimization_params = {
            'flow_rate': (0.1, 2.0),      # L/min
            'pressure': (1.0, 5.0),       # bar
            'temperature': (20, 60),       # °C
            'ph_target': (6.5, 7.5),      # pH
            'filtration_cycles': (1, 5)   # cycles
        }
    
    def optimize_operation_parameters(self, current_performance: Dict, 
                                    constraints: Dict = None) -> Dict:
        """Operasyon parametrelerini optimize eder"""
        
        def performance_objective(params):
            """Performans amaç fonksiyonu"""
            flow_rate, pressure, temperature, ph_target, cycles = params
            
            # Performance model (simplified)
            efficiency = self._calculate_efficiency(flow_rate, pressure, temperature)
            quality = self._calculate_quality(ph_target, temperature, cycles)
            energy = self._calculate_energy_consumption(flow_rate, pressure, cycles)
            cost = self._calculate_operation_cost(params)
            
            # Multi-objective optimization
            # Maximize efficiency and quality, minimize energy and cost
            return -(efficiency * 0.3 + quality * 0.4 - energy * 0.1 - cost * 0.2)
        
        # Bounds
        bounds = list(self.optimization_params.values())
        
        # Apply constraints if provided
        if constraints:
            bounds = self._apply_constraints(bounds, constraints)
        
        # Optimization using multiple algorithms
        results = []
        
        # Differential Evolution
        de_result = optimize.differential_evolution(
            performance_objective, bounds, maxiter=50, seed=42
        )
        results.append(('differential_evolution', de_result))
        
        # Basin Hopping
        x0 = [np.mean(bound) for bound in bounds]
        bh_result = optimize.basinhopping(
            performance_objective, x0, niter=30, T=1.0, stepsize=0.5
        )
        results.append(('basin_hopping', bh_result))
        
        # Select best result
        best_result = min(results, key=lambda x: x[1].fun)
        method, result = best_result
        
        # Process optimal parameters
        optimal_params = {
            'flow_rate': result.x[0],
            'pressure': result.x[1],
            'temperature': result.x[2],
            'ph_target': result.x[3],
            'filtration_cycles': int(result.x[4])
        }
        
        # Calculate expected performance
        expected_performance = self._calculate_expected_performance(optimal_params)
        
        return {
            'optimal_parameters': optimal_params,
            'expected_performance': expected_performance,
            'optimization_method': method,
            'improvement_potential': self._calculate_improvement(
                current_performance, expected_performance
            )
        }
    
    def _calculate_efficiency(self, flow_rate: float, pressure: float, temperature: float) -> float:
        """Verimlilik hesaplama"""
        # Efficiency model based on fluid dynamics
        base_efficiency = 0.7
        
        # Flow rate effect (optimal around 1.0 L/min)
        flow_factor = 1 - abs(flow_rate - 1.0) * 0.1
        
        # Pressure effect (higher pressure generally better)
        pressure_factor = min(pressure / 3.0, 1.0)
        
        # Temperature effect (optimal around 40°C)
        temp_factor = 1 - abs(temperature - 40) * 0.005
        
        return base_efficiency * flow_factor * pressure_factor * temp_factor
    
    def _calculate_quality(self, ph_target: float, temperature: float, cycles: int) -> float:
        """Kalite hesaplama"""
        base_quality = 0.8
        
        # pH effect (optimal around 7.0)
        ph_factor = 1 - abs(ph_target - 7.0) * 0.1
        
        # Temperature effect
        temp_factor = 1 - abs(temperature - 35) * 0.003
        
        # Cycles effect (more cycles = higher quality but diminishing returns)
        cycle_factor = 1 - np.exp(-cycles * 0.5)
        
        return base_quality * ph_factor * temp_factor * cycle_factor
    
    def _calculate_energy_consumption(self, flow_rate: float, pressure: float, cycles: int) -> float:
        """Enerji tüketimi hesaplama"""
        # Energy increases with flow rate, pressure, and cycles
        base_energy = 10  # kWh
        
        energy = base_energy * (
            flow_rate * 0.5 + 
            pressure * 0.3 + 
            cycles * 0.2
        )
        
        return energy / 100  # Normalize
    
    def _calculate_operation_cost(self, params: List[float]) -> float:
        """Operasyon maliyeti hesaplama"""
        flow_rate, pressure, temperature, ph_target, cycles = params
        
        # Cost components
        energy_cost = self._calculate_energy_consumption(flow_rate, pressure, cycles) * 0.15
        chemical_cost = abs(ph_target - 7.0) * 0.05
        maintenance_cost = pressure * 0.02 + cycles * 0.03
        
        return energy_cost + chemical_cost + maintenance_cost
    
    def _apply_constraints(self, bounds: List[Tuple], constraints: Dict) -> List[Tuple]:
        """Kısıtlamaları uygular"""
        new_bounds = bounds.copy()
        
        for param, constraint in constraints.items():
            if param in self.optimization_params:
                param_idx = list(self.optimization_params.keys()).index(param)
                if 'min' in constraint:
                    new_bounds[param_idx] = (max(new_bounds[param_idx][0], constraint['min']), 
                                           new_bounds[param_idx][1])
                if 'max' in constraint:
                    new_bounds[param_idx] = (new_bounds[param_idx][0], 
                                           min(new_bounds[param_idx][1], constraint['max']))
        
        return new_bounds
    
    def _calculate_expected_performance(self, params: Dict) -> Dict:
        """Beklenen performansı hesaplar"""
        efficiency = self._calculate_efficiency(params['flow_rate'], params['pressure'], params['temperature'])
        quality = self._calculate_quality(params['ph_target'], params['temperature'], params['filtration_cycles'])
        energy = self._calculate_energy_consumption(params['flow_rate'], params['pressure'], params['filtration_cycles'])
        
        return {
            'efficiency': efficiency,
            'quality': quality,
            'energy_consumption': energy,
            'overall_score': efficiency * 0.4 + quality * 0.4 - energy * 0.2
        }
    
    def _calculate_improvement(self, current: Dict, expected: Dict) -> Dict:
        """İyileştirme potansiyelini hesaplar"""
        return {
            'efficiency_improvement': (expected['efficiency'] - current.get('efficiency', 0.5)) * 100,
            'quality_improvement': (expected['quality'] - current.get('quality', 0.5)) * 100,
            'energy_reduction': (current.get('energy_consumption', 0.3) - expected['energy_consumption']) * 100
        }

class AnomalyDetectionSystem:
    """Anomali tespit sistemi"""
    
    def __init__(self):
        self.models = {
            'isolation_forest': IsolationForest(contamination=0.1, random_state=42),
            'clustering': DBSCAN(eps=0.3, min_samples=5),
            'statistical': None  # Will be initialized with data
        }
        self.scalers = {model_name: StandardScaler() for model_name in self.models.keys()}
        self.baseline_stats = {}
    
    def train_anomaly_detection(self, normal_data: List[Dict]):
        """Anomali tespit modellerini eğitir"""
        # Feature extraction
        features = np.array([self._extract_anomaly_features(data) for data in normal_data])
        
        # Train each model
        for model_name, model in self.models.items():
            if model_name == 'isolation_forest':
                features_scaled = self.scalers[model_name].fit_transform(features)
                model.fit(features_scaled)
            
            elif model_name == 'clustering':
                features_scaled = self.scalers[model_name].fit_transform(features)
                labels = model.fit_predict(features_scaled)
                # Store normal cluster centers
                normal_clusters = self._identify_normal_clusters(features_scaled, labels)
                setattr(model, 'normal_clusters', normal_clusters)
            
            elif model_name == 'statistical':
                # Statistical baseline
                self.baseline_stats = {
                    'mean': np.mean(features, axis=0),
                    'std': np.std(features, axis=0),
                    'percentiles': {
                        'p95': np.percentile(features, 95, axis=0),
                        'p99': np.percentile(features, 99, axis=0)
                    }
                }
    
    def detect_anomalies(self, sensor_data: Dict) -> Dict:
        """Anomali tespiti yapar"""
        features = self._extract_anomaly_features(sensor_data).reshape(1, -1)
        
        anomaly_scores = {}
        
        # Isolation Forest
        if self.models['isolation_forest']:
            features_scaled = self.scalers['isolation_forest'].transform(features)
            is_anomaly = self.models['isolation_forest'].predict(features_scaled)[0] == -1
            anomaly_score = -self.models['isolation_forest'].score_samples(features_scaled)[0]
            anomaly_scores['isolation_forest'] = {
                'is_anomaly': bool(is_anomaly),
                'score': float(anomaly_score)
            }
        
        # Clustering-based
        if hasattr(self.models['clustering'], 'normal_clusters'):
            features_scaled = self.scalers['clustering'].transform(features)
            min_distance = min([
                np.linalg.norm(features_scaled[0] - center) 
                for center in self.models['clustering'].normal_clusters
            ])
            is_anomaly = min_distance > 2.0  # Threshold
            anomaly_scores['clustering'] = {
                'is_anomaly': bool(is_anomaly),
                'distance': float(min_distance)
            }
        
        # Statistical
        if self.baseline_stats:
            z_scores = np.abs((features[0] - self.baseline_stats['mean']) / 
                            (self.baseline_stats['std'] + 1e-8))
            max_z_score = np.max(z_scores)
            is_anomaly = max_z_score > 3.0  # 3-sigma rule
            anomaly_scores['statistical'] = {
                'is_anomaly': bool(is_anomaly),
                'max_z_score': float(max_z_score)
            }
        
        # Ensemble decision
        anomaly_count = sum(1 for result in anomaly_scores.values() if result['is_anomaly'])
        ensemble_anomaly = anomaly_count >= 2
        
        return {
            'is_anomaly': ensemble_anomaly,
            'individual_results': anomaly_scores,
            'confidence': float(anomaly_count / len(anomaly_scores)),
            'anomaly_type': self._classify_anomaly_type(sensor_data, anomaly_scores)
        }
    
    def _extract_anomaly_features(self, sensor_data: Dict) -> np.ndarray:
        """Anomali tespiti için özellik çıkarımı"""
        features = [
            sensor_data.get('temperature', 20),
            sensor_data.get('ph', 7.0),
            sensor_data.get('conductivity', 0.001),
            sensor_data.get('viscosity', 0.002),
            sensor_data.get('density', 950),
            sensor_data.get('flow_rate', 1.0),
            sensor_data.get('pressure', 2.0),
            sensor_data.get('turbidity', 0.1)
        ]
        
        # Add derived features
        features.extend([
            features[0] * features[3],  # temp * viscosity
            features[1] - 7.0,         # pH deviation
            features[2] / features[4],  # conductivity/density ratio
        ])
        
        return np.array(features)
    
    def _identify_normal_clusters(self, features: np.ndarray, labels: np.ndarray) -> List[np.ndarray]:
        """Normal cluster merkezlerini belirler"""
        unique_labels = set(labels)
        normal_clusters = []
        
        for label in unique_labels:
            if label != -1:  # -1 is noise in DBSCAN
                cluster_points = features[labels == label]
                cluster_center = np.mean(cluster_points, axis=0)
                normal_clusters.append(cluster_center)
        
        return normal_clusters
    
    def _classify_anomaly_type(self, sensor_data: Dict, anomaly_scores: Dict) -> str:
        """Anomali türünü sınıflandırır"""
        # Simple rule-based classification
        temp = sensor_data.get('temperature', 20)
        ph = sensor_data.get('ph', 7.0)
        conductivity = sensor_data.get('conductivity', 0.001)
        
        if temp > 70:
            return 'high_temperature'
        elif temp < 10:
            return 'low_temperature'
        elif ph < 6.0 or ph > 8.5:
            return 'ph_anomaly'
        elif conductivity > 0.01:
            return 'high_contamination'
        else:
            return 'unknown'

def demonstrate_algorithms():
    """Algoritmaları gösterir"""
    print("ReFlow Araştırma Algoritmalarını Test Ediyoruz...\n")
    
    # 1. Kalite Tahmin Testi
    print("1. Kalite Tahmin Algoritması")
    predictor = PenetrantQualityPredictor()
    
    # Dummy training data
    training_data = [
        {'temperature': 25, 'ph': 7.0, 'conductivity': 0.001, 'viscosity': 0.002, 'density': 950, 'surface_tension': 0.025},
        {'temperature': 30, 'ph': 6.8, 'conductivity': 0.002, 'viscosity': 0.0025, 'density': 960, 'surface_tension': 0.024},
        {'temperature': 35, 'ph': 7.2, 'conductivity': 0.0015, 'viscosity': 0.0018, 'density': 940, 'surface_tension': 0.026}
    ]
    quality_scores = [85, 78, 92]
    
    predictor.train_model(training_data, quality_scores)
    
    test_data = {'temperature': 28, 'ph': 7.1, 'conductivity': 0.0012, 'viscosity': 0.002, 'density': 955, 'surface_tension': 0.025}
    quality_result = predictor.predict_quality(test_data)
    print(f"Kalite Skoru: {quality_result['quality_score']:.1f}")
    print(f"Güven: {quality_result['confidence']:.2f}")
    
    # 2. Filtrasyon Optimizasyon Testi
    print("\n2. Filtrasyon Optimizasyon Algoritması")
    designer = OptimalFiltrationDesigner()
    
    contamination = {'total_contamination': 0.15, 'particle_size_dist': [0.1, 0.3, 0.4, 0.2]}
    optimization_result = designer.optimize_filtration_sequence(contamination, target_purity=0.98)
    
    print(f"Optimal Aşamalar: {optimization_result['optimal_stages']}")
    print(f"Final Saflık: {optimization_result['final_purity']:.3f}")
    print(f"Toplam Maliyet: {optimization_result['total_cost']:.1f}")
    
    # 3. Sistem Optimizasyon Testi
    print("\n3. Sistem Performans Optimizasyonu")
    optimizer = SystemPerformanceOptimizer()
    
    current_perf = {'efficiency': 0.75, 'quality': 0.80, 'energy_consumption': 0.25}
    opt_result = optimizer.optimize_operation_parameters(current_perf)
    
    print(f"Optimal Parametreler: {opt_result['optimal_parameters']}")
    print(f"Beklenen Performans: {opt_result['expected_performance']}")
    
    print("\nTüm algoritmalar başarıyla test edildi!")

if __name__ == "__main__":
    demonstrate_algorithms()