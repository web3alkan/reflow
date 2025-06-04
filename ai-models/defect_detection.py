#!/usr/bin/env python3
"""
ReFlow AI Defect Detection Model
UV ışığı altında penetrant test görüntülerinden hata tespiti için CNN modeli
"""

import tensorflow as tf
import numpy as np
import cv2
import json
import argparse
import logging
from pathlib import Path
from typing import List, Dict, Tuple
import os

# Logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DefectDetectionModel:
    """UV görüntülerinde hata tespit eden CNN modeli"""
    
    def __init__(self, model_path: str = None, input_shape: Tuple[int, int, int] = (512, 512, 3)):
        self.input_shape = input_shape
        self.class_names = ['crack', 'porosity', 'inclusion', 'no_defect']
        self.model = None
        
        if model_path and os.path.exists(model_path):
            self.load_model(model_path)
        else:
            self.model = self.build_model()
    
    def build_model(self) -> tf.keras.Model:
        """CNN model architecture oluşturur"""
        model = tf.keras.Sequential([
            # Veri artırma katmanları
            tf.keras.layers.experimental.preprocessing.RandomFlip("horizontal"),
            tf.keras.layers.experimental.preprocessing.RandomRotation(0.1),
            tf.keras.layers.experimental.preprocessing.RandomZoom(0.1),
            
            # Konvolüsyonel bloklar
            tf.keras.layers.Conv2D(32, (3, 3), activation='relu', input_shape=self.input_shape),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.MaxPooling2D((2, 2)),
            
            tf.keras.layers.Conv2D(64, (3, 3), activation='relu'),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.MaxPooling2D((2, 2)),
            
            tf.keras.layers.Conv2D(128, (3, 3), activation='relu'),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.MaxPooling2D((2, 2)),
            
            tf.keras.layers.Conv2D(256, (3, 3), activation='relu'),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.MaxPooling2D((2, 2)),
            
            # Global Average Pooling
            tf.keras.layers.GlobalAveragePooling2D(),
            
            # Dense katmanlar
            tf.keras.layers.Dense(512, activation='relu'),
            tf.keras.layers.Dropout(0.5),
            tf.keras.layers.Dense(256, activation='relu'),
            tf.keras.layers.Dropout(0.3),
            
            # Çıkış katmanı
            tf.keras.layers.Dense(len(self.class_names), activation='softmax')
        ])
        
        # Model compilation
        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
            loss='categorical_crossentropy',
            metrics=['accuracy', 'precision', 'recall']
        )
        
        return model
    
    def preprocess_image(self, image_path: str) -> np.ndarray:
        """Görüntüyü model için ön işler"""
        try:
            # Görüntüyü yükle
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError(f"Görüntü yüklenemedi: {image_path}")
            
            # BGR'dan RGB'ye dönüştür
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Boyutu yeniden boyutlandır
            image = cv2.resize(image, (self.input_shape[1], self.input_shape[0]))
            
            # Normalize et [0, 1] aralığına
            image = image.astype(np.float32) / 255.0
            
            # Batch dimension ekle
            image = np.expand_dims(image, axis=0)
            
            return image
            
        except Exception as e:
            logger.error(f"Görüntü ön işleme hatası: {e}")
            raise
    
    def enhance_uv_image(self, image: np.ndarray) -> np.ndarray:
        """UV görüntüsünü geliştirir"""
        # Kontrast artırma
        lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
        lab[:, :, 0] = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(lab[:, :, 0])
        enhanced = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
        
        # Gaussian blur ile gürültü azaltma
        enhanced = cv2.GaussianBlur(enhanced, (3, 3), 0)
        
        return enhanced
    
    def predict_defects(self, image_path: str, confidence_threshold: float = 0.3) -> List[Dict]:
        """Görüntüden hataları tespit eder"""
        try:
            # Görüntüyü ön işle
            processed_image = self.preprocess_image(image_path)
            
            # Tahmin yap
            predictions = self.model.predict(processed_image, verbose=0)
            confidences = predictions[0]
            
            # Sonuçları işle
            results = []
            for i, class_name in enumerate(self.class_names):
                confidence = float(confidences[i])
                
                if confidence > confidence_threshold:
                    # Hata konumunu tespit et (basit yöntem)
                    location = self.localize_defect(image_path, class_name, confidence)
                    
                    result = {
                        'defect_type': class_name,
                        'confidence': confidence,
                        'location': location,
                        'severity': self.determine_severity(class_name, confidence)
                    }
                    results.append(result)
            
            return results
            
        except Exception as e:
            logger.error(f"Hata tespit hatası: {e}")
            raise
    
    def localize_defect(self, image_path: str, defect_type: str, confidence: float) -> Dict:
        """Hata lokalizasyonu (basit implementasyon)"""
        # Gerçek implementasyonda Grad-CAM veya benzer teknikler kullanılabilir
        image = cv2.imread(image_path)
        h, w = image.shape[:2]
        
        # Mock lokalizasyon (rastgele pozisyon)
        x = np.random.randint(0, w // 2)
        y = np.random.randint(0, h // 2)
        width = np.random.randint(20, min(100, w - x))
        height = np.random.randint(10, min(50, h - y))
        
        return {
            'x': int(x),
            'y': int(y),
            'width': int(width),
            'height': int(height),
            'center_x': int(x + width // 2),
            'center_y': int(y + height // 2)
        }
    
    def determine_severity(self, defect_type: str, confidence: float) -> str:
        """Hata şiddetini belirler"""
        if defect_type == 'no_defect':
            return 'none'
        
        if confidence > 0.9:
            return 'high'
        elif confidence > 0.7:
            return 'medium'
        else:
            return 'low'
    
    def analyze_image_quality(self, image_path: str) -> Dict:
        """Görüntü kalitesini analiz eder"""
        try:
            image = cv2.imread(image_path)
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Parlaklık
            brightness = np.mean(gray)
            
            # Kontrast (standart sapma)
            contrast = np.std(gray)
            
            # Keskinlik (Laplacian variance)
            sharpness = cv2.Laplacian(gray, cv2.CV_64F).var()
            
            # UV yoğunluğu (mavi kanal analizi)
            blue_channel = image[:, :, 0]  # BGR formatında mavi kanal
            uv_intensity = np.mean(blue_channel)
            
            # Kalite skoru hesaplama
            quality_score = min(100, (
                (brightness / 255.0) * 25 +
                (min(contrast, 50) / 50.0) * 25 +
                (min(sharpness, 1000) / 1000.0) * 25 +
                (uv_intensity / 255.0) * 25
            ))
            
            return {
                'brightness': float(brightness),
                'contrast': float(contrast),
                'sharpness': float(sharpness),
                'uv_intensity': float(uv_intensity),
                'quality_score': float(quality_score)
            }
            
        except Exception as e:
            logger.error(f"Görüntü kalitesi analiz hatası: {e}")
            raise
    
    def save_model(self, save_path: str):
        """Modeli kaydeder"""
        try:
            self.model.save(save_path)
            logger.info(f"Model kaydedildi: {save_path}")
        except Exception as e:
            logger.error(f"Model kaydetme hatası: {e}")
            raise
    
    def load_model(self, model_path: str):
        """Modeli yükler"""
        try:
            self.model = tf.keras.models.load_model(model_path)
            logger.info(f"Model yüklendi: {model_path}")
        except Exception as e:
            logger.error(f"Model yükleme hatası: {e}")
            raise

def main():
    """Ana fonksiyon - komut satırından çalıştırma için"""
    parser = argparse.ArgumentParser(description='ReFlow AI Defect Detection')
    parser.add_argument('--image', type=str, required=True, help='Analiz edilecek görüntü yolu')
    parser.add_argument('--model', type=str, help='Model dosyası yolu')
    parser.add_argument('--threshold', type=float, default=0.3, help='Güven eşiği')
    parser.add_argument('--output', type=str, help='Sonuç dosyası yolu')
    
    args = parser.parse_args()
    
    try:
        # Model oluştur
        detector = DefectDetectionModel(model_path=args.model)
        
        # Görüntü kalitesini analiz et
        quality = detector.analyze_image_quality(args.image)
        logger.info(f"Görüntü kalitesi: {quality['quality_score']:.1f}")
        
        if quality['quality_score'] < 70:
            logger.warning("Görüntü kalitesi düşük!")
        
        # Hata tespiti yap
        detections = detector.predict_defects(args.image, args.threshold)
        
        # Sonuçları hazırla
        result = {
            'image_path': args.image,
            'image_quality': quality,
            'detections': detections,
            'summary': {
                'total_defects': len(detections),
                'high_severity': len([d for d in detections if d['severity'] == 'high']),
                'medium_severity': len([d for d in detections if d['severity'] == 'medium']),
                'low_severity': len([d for d in detections if d['severity'] == 'low']),
                'overall_status': 'pass' if len(detections) == 0 else 
                                'reject' if any(d['severity'] == 'high' for d in detections) else 'review'
            }
        }
        
        # Sonuçları yazdır
        print(json.dumps(result, indent=2, ensure_ascii=False))
        
        # Dosyaya kaydet
        if args.output:
            with open(args.output, 'w', encoding='utf-8') as f:
                json.dump(result, f, indent=2, ensure_ascii=False)
            logger.info(f"Sonuçlar kaydedildi: {args.output}")
        
    except Exception as e:
        logger.error(f"Analiz hatası: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main()) 