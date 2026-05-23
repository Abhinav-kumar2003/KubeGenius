"""
LSTM Time Series Predictor for Kubernetes Metrics
Uses TensorFlow/Keras for traffic prediction and scaling recommendations.
"""

import os
import pickle
import time
from typing import Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
from tensorflow.keras.layers import LSTM, Dense, Dropout, Input, Bidirectional
from tensorflow.keras.models import Model, load_model
from tensorflow.keras.optimizers import Adam


class LSTMPredictor:
    """
    LSTM-based time series predictor for Kubernetes metrics.
    Predicts future CPU usage and traffic patterns for proactive scaling.
    """
    
    def __init__(
        self,
        lookback_window: int = 60,
        forecast_horizon: int = 30,
        model_path: Optional[str] = None,
        feature_dim: int = 4,
    ):
        self.lookback_window = lookback_window
        self.forecast_horizon = forecast_horizon
        self.feature_dim = feature_dim
        self.model_path = model_path or "/app/models/lstm_predictor"
        self.scaler_path = model_path.replace(".h5", "_scaler.pkl") if model_path else "/app/models/lstm_scaler.pkl"
        
        self.model: Optional[Model] = None
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        self.is_trained = False
        self.model_version = f"3.1.{int(time.time())}"
        
        # Build model architecture
        self._build_model()
    
    def _build_model(self) -> None:
        """Build the LSTM model architecture."""
        inputs = Input(shape=(self.lookback_window, self.feature_dim))
        
        # Bidirectional LSTM layers
        x = Bidirectional(LSTM(128, return_sequences=True, activation='tanh'))(inputs)
        x = Dropout(0.2)(x)
        x = LSTM(64, return_sequences=True, activation='tanh')(x)
        x = Dropout(0.2)(x)
        x = LSTM(32, activation='tanh')(x)
        x = Dropout(0.1)(x)
        
        # Dense layers for output
        x = Dense(64, activation='relu')(x)
        x = Dense(32, activation='relu')(x)
        outputs = Dense(self.forecast_horizon, activation='linear')(x)
        
        self.model = Model(inputs=inputs, outputs=outputs)
        self.model.compile(
            optimizer=Adam(learning_rate=0.001),
            loss='huber',
            metrics=['mae', 'mse']
        )
    
    def prepare_data(
        self,
        df: pd.DataFrame,
        feature_columns: List[str] = None,
        target_column: str = 'cpu_usage'
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """
        Prepare data for LSTM training.
        
        Args:
            df: DataFrame with time series data
            feature_columns: List of feature column names
            target_column: Target column name
            
        Returns:
            X_train, X_val, y_train, y_val
        """
        if feature_columns is None:
            feature_columns = ['cpu_usage', 'memory_usage', 'request_rate', 'response_latency']
        
        # Select and scale features
        data = df[feature_columns].values
        scaled_data = self.scaler.fit_transform(data)
        
        # Create sequences
        X, y = [], []
        for i in range(len(scaled_data) - self.lookback_window - self.forecast_horizon):
            X.append(scaled_data[i:(i + self.lookback_window)])
            # Target is the target_column values for forecast_horizon steps
            target_idx = feature_columns.index(target_column)
            y.append(scaled_data[i + self.lookback_window:i + self.lookback_window + self.forecast_horizon, target_idx])
        
        X = np.array(X)
        y = np.array(y)
        
        # Split into train and validation
        split_idx = int(0.8 * len(X))
        X_train, X_val = X[:split_idx], X[split_idx:]
        y_train, y_val = y[:split_idx], y[split_idx:]
        
        return X_train, X_val, y_train, y_val
    
    def train(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        X_val: np.ndarray,
        y_val: np.ndarray,
        epochs: int = 50,
        batch_size: int = 32,
        callbacks: Optional[List] = None,
        verbose: int = 1
    ) -> tf.keras.callbacks.History:
        """
        Train the LSTM model.
        
        Args:
            X_train: Training features
            y_train: Training targets
            X_val: Validation features
            y_val: Validation targets
            epochs: Number of training epochs
            batch_size: Batch size
            callbacks: Optional list of Keras callbacks
            verbose: Verbosity level
            
        Returns:
            Training history
        """
        if callbacks is None:
            callbacks = [
                EarlyStopping(
                    monitor='val_loss',
                    patience=10,
                    restore_best_weights=True,
                    verbose=1
                ),
                ReduceLROnPlateau(
                    monitor='val_loss',
                    factor=0.5,
                    patience=5,
                    min_lr=1e-6,
                    verbose=1
                ),
                ModelCheckpoint(
                    filepath=f"{self.model_path}_best.h5",
                    monitor='val_loss',
                    save_best_only=True,
                    verbose=1
                ),
            ]
        
        history = self.model.fit(
            X_train, y_train,
            validation_data=(X_val, y_val),
            epochs=epochs,
            batch_size=batch_size,
            callbacks=callbacks,
            verbose=verbose,
        )
        
        self.is_trained = True
        self.model_version = f"3.1.{int(time.time())}"
        
        return history
    
    def predict(self, recent_data: np.ndarray) -> Dict:
        """
        Generate predictions from recent data.
        
        Args:
            recent_data: Recent time series data (lookback_window x feature_dim)
            
        Returns:
            Dictionary with predictions, confidence intervals, and recommendations
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before prediction")
        
        # Scale input
        scaled_input = self.scaler.transform(recent_data)
        X = np.array([scaled_input])
        
        # Predict
        prediction = self.model.predict(X, verbose=0)
        
        # Inverse transform
        predictions = self._inverse_transform_predictions(prediction[0])
        
        # Calculate confidence intervals
        std = np.std(predictions) * 0.5
        upper_bound = predictions + std * 1.96
        lower_bound = predictions - std * 1.96
        
        # Calculate confidence score
        confidence_score = max(0, 100 - np.std(predictions) * 2)
        
        # Generate scaling recommendation
        avg_predicted = np.mean(predictions[:10])
        if avg_predicted > 75:
            recommended_replicas = min(20, int(avg_predicted / 20) + 2)
            action = "scale_up"
        elif avg_predicted < 30:
            recommended_replicas = max(1, 2)
            action = "scale_down"
        else:
            recommended_replicas = 3
            action = "maintain"
        
        return {
            "predictions": predictions.tolist(),
            "upper_bound": upper_bound.tolist(),
            "lower_bound": lower_bound.tolist(),
            "confidence_score": round(confidence_score, 2),
            "recommended_replicas": recommended_replicas,
            "action": action,
            "average_predicted": round(avg_predicted, 2),
            "model_version": self.model_version,
        }
    
    def _inverse_transform_predictions(self, predictions: np.ndarray) -> np.ndarray:
        """Inverse transform predictions back to original scale."""
        # Create dummy array with full feature dimensions
        dummy = np.zeros((len(predictions), self.feature_dim))
        dummy[:, 0] = predictions  # Assuming CPU is first feature
        
        inversed = self.scaler.inverse_transform(dummy)
        return np.clip(inversed[:, 0], 0, 100)
    
    def save(self, path: Optional[str] = None) -> None:
        """Save model and scaler."""
        save_path = path or self.model_path
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        
        self.model.save(f"{save_path}.h5")
        
        with open(self.scaler_path, 'wb') as f:
            pickle.dump(self.scaler, f)
        
        # Save metadata
        metadata = {
            "model_version": self.model_version,
            "lookback_window": self.lookback_window,
            "forecast_horizon": self.forecast_horizon,
            "feature_dim": self.feature_dim,
            "is_trained": self.is_trained,
            "saved_at": time.time(),
        }
        with open(f"{save_path}_metadata.pkl", 'wb') as f:
            pickle.dump(metadata, f)
    
    def load(self, path: Optional[str] = None) -> None:
        """Load model and scaler."""
        load_path = path or self.model_path
        
        if os.path.exists(f"{load_path}.h5"):
            self.model = load_model(f"{load_path}.h5")
        
        if os.path.exists(self.scaler_path):
            with open(self.scaler_path, 'rb') as f:
                self.scaler = pickle.load(f)
        
        metadata_path = f"{load_path}_metadata.pkl"
        if os.path.exists(metadata_path):
            with open(metadata_path, 'rb') as f:
                metadata = pickle.load(f)
                self.model_version = metadata.get("model_version", self.model_version)
                self.is_trained = metadata.get("is_trained", False)
    
    def evaluate(self, X_test: np.ndarray, y_test: np.ndarray) -> Dict:
        """
        Evaluate model performance.
        
        Args:
            X_test: Test features
            y_test: Test targets
            
        Returns:
            Evaluation metrics
        """
        loss, mae, mse = self.model.evaluate(X_test, y_test, verbose=0)
        
        predictions = self.model.predict(X_test, verbose=0)
        
        # Calculate additional metrics
        mape = np.mean(np.abs((y_test - predictions) / (y_test + 1e-8))) * 100
        rmse = np.sqrt(mse)
        
        return {
            "loss": round(loss, 4),
            "mae": round(mae, 4),
            "mse": round(mse, 4),
            "rmse": round(rmse, 4),
            "mape": round(mape, 2),
            "model_version": self.model_version,
        }
    
    def get_model_summary(self) -> Dict:
        """Get model architecture summary."""
        summary = []
        self.model.summary(print_fn=lambda x: summary.append(x))
        
        return {
            "architecture": "\n".join(summary),
            "total_params": self.model.count_params(),
            "layers": len(self.model.layers),
            "lookback_window": self.lookback_window,
            "forecast_horizon": self.forecast_horizon,
            "model_version": self.model_version,
        }


class AnomalyDetector:
    """
    Anomaly detection using LSTM autoencoder.
    Detects unusual patterns in Kubernetes metrics.
    """
    
    def __init__(self, lookback_window: int = 30, feature_dim: int = 4):
        self.lookback_window = lookback_window
        self.feature_dim = feature_dim
        self.model: Optional[Model] = None
        self.threshold: float = 0.1
        self.scaler = MinMaxScaler()
        
        self._build_model()
    
    def _build_model(self) -> None:
        """Build autoencoder model."""
        # Encoder
        inputs = Input(shape=(self.lookback_window, self.feature_dim))
        encoded = LSTM(64, activation='tanh')(inputs)
        encoded = Dense(32, activation='relu')(encoded)
        encoded = Dense(16, activation='relu')(encoded)
        
        # Decoder
        decoded = Dense(32, activation='relu')(encoded)
        decoded = Dense(self.lookback_window * self.feature_dim, activation='sigmoid')(decoded)
        decoded = tf.keras.layers.Reshape((self.lookback_window, self.feature_dim))(decoded)
        
        self.model = Model(inputs, decoded)
        self.model.compile(optimizer='adam', loss='mse')
    
    def fit(self, X: np.ndarray, epochs: int = 50, batch_size: int = 32) -> None:
        """Train anomaly detector."""
        scaled_X = self.scaler.fit_transform(X.reshape(-1, self.feature_dim)).reshape(X.shape)
        
        history = self.model.fit(
            scaled_X, scaled_X,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=0.1,
            verbose=0
        )
        
        # Set threshold based on reconstruction error
        reconstructions = self.model.predict(scaled_X, verbose=0)
        mse = np.mean(np.power(scaled_X - reconstructions, 2), axis=(1, 2))
        self.threshold = np.percentile(mse, 95)
    
    def detect(self, X: np.ndarray) -> List[Dict]:
        """Detect anomalies in data."""
        scaled_X = self.scaler.transform(X.reshape(-1, self.feature_dim)).reshape(X.shape)
        reconstructions = self.model.predict(scaled_X, verbose=0)
        mse = np.mean(np.power(scaled_X - reconstructions, 2), axis=(1, 2))
        
        anomalies = []
        for i, error in enumerate(mse):
            if error > self.threshold:
                anomalies.append({
                    "index": i,
                    "reconstruction_error": float(error),
                    "threshold": float(self.threshold),
                    "severity": "critical" if error > self.threshold * 2 else "warning",
                })
        
        return anomalies
