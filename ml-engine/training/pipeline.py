"""
ML Training Pipeline for Kubernetes Metrics Prediction
Orchestrates data collection, preprocessing, model training, and evaluation.
"""

import argparse
import logging
import os
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional

import numpy as np
import pandas as pd
import requests
from sklearn.model_selection import train_test_split

import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from ml_models.lstm_predictor import LSTMPredictor, AnomalyDetector

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TrainingPipeline:
    """
    End-to-end ML training pipeline for Kubernetes predictive autoscaling.
    """
    
    def __init__(
        self,
        prometheus_url: str = "http://prometheus:9090",
        model_path: str = "/app/models",
        lookback_window: int = 60,
        forecast_horizon: int = 30,
    ):
        self.prometheus_url = prometheus_url
        self.model_path = model_path
        self.lookback_window = lookback_window
        self.forecast_horizon = forecast_horizon
        
        self.predictor = LSTMPredictor(
            lookback_window=lookback_window,
            forecast_horizon=forecast_horizon,
            model_path=os.path.join(model_path, "lstm_predictor"),
        )
        
        self.anomaly_detector = AnomalyDetector(
            lookback_window=lookback_window,
        )
    
    def fetch_metrics_from_prometheus(
        self,
        query: str,
        start: datetime,
        end: datetime,
        step: str = "60s"
    ) -> pd.DataFrame:
        """
        Fetch metrics from Prometheus.
        
        Args:
            query: PromQL query
            start: Start time
            end: End time
            step: Query resolution
            
        Returns:
            DataFrame with timestamp and value columns
        """
        url = f"{self.prometheus_url}/api/v1/query_range"
        params = {
            "query": query,
            "start": start.timestamp(),
            "end": end.timestamp(),
            "step": step,
        }
        
        try:
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            if data["status"] != "success":
                raise ValueError(f"Prometheus query failed: {data}")
            
            results = data["data"]["result"]
            if not results:
                logger.warning(f"No data returned for query: {query}")
                return self._generate_synthetic_data(query, start, end)
            
            # Parse results
            timestamps = []
            values = []
            for result in results[0]["values"]:
                timestamps.append(datetime.fromtimestamp(result[0]))
                values.append(float(result[1]))
            
            df = pd.DataFrame({
                "timestamp": timestamps,
                "value": values,
            })
            df.set_index("timestamp", inplace=True)
            
            return df
            
        except Exception as e:
            logger.warning(f"Failed to fetch from Prometheus: {e}. Using synthetic data.")
            return self._generate_synthetic_data(query, start, end)
    
    def _generate_synthetic_data(
        self,
        query: str,
        start: datetime,
        end: datetime
    ) -> pd.DataFrame:
        """Generate synthetic metrics data for demonstration."""
        timestamps = pd.date_range(start=start, end=end, freq="1min")
        
        # Generate realistic patterns based on metric type
        if "cpu" in query.lower():
            base = 55 + np.sin(np.linspace(0, 4 * np.pi, len(timestamps))) * 15
            noise = np.random.normal(0, 5, len(timestamps))
            values = np.clip(base + noise, 0, 100)
        elif "memory" in query.lower():
            base = 60 + np.sin(np.linspace(0, 2 * np.pi, len(timestamps))) * 10
            noise = np.random.normal(0, 3, len(timestamps))
            values = np.clip(base + noise, 0, 100)
        elif "request" in query.lower() or "rate" in query.lower():
            base = 2000 + np.sin(np.linspace(0, 4 * np.pi, len(timestamps))) * 800
            noise = np.random.normal(0, 200, len(timestamps))
            values = np.clip(base + noise, 100, 5000)
        else:
            base = 50 + np.sin(np.linspace(0, 3 * np.pi, len(timestamps))) * 20
            noise = np.random.normal(0, 5, len(timestamps))
            values = np.clip(base + noise, 0, 100)
        
        df = pd.DataFrame({
            "value": values,
        }, index=timestamps)
        
        return df
    
    def collect_training_data(
        self,
        hours: int = 168,  # 1 week
        namespace: str = "default",
    ) -> pd.DataFrame:
        """
        Collect training data from Prometheus.
        
        Args:
            hours: Number of hours of historical data
            namespace: Kubernetes namespace
            
        Returns:
            DataFrame with all features
        """
        end = datetime.utcnow()
        start = end - timedelta(hours=hours)
        
        logger.info(f"Collecting training data from {start} to {end}")
        
        # Fetch different metrics
        queries = {
            "cpu_usage": f'rate(container_cpu_usage_seconds_total{{namespace="{namespace}"}}[5m]) * 100',
            "memory_usage": f'container_memory_usage_bytes{{namespace="{namespace}"}} / container_spec_memory_limit_bytes{{namespace="{namespace}"}} * 100',
            "request_rate": f'rate(nginx_http_requests_total{{namespace="{namespace}"}}[5m]) * 60',
            "response_latency": f'histogram_quantile(0.95, rate(nginx_http_request_duration_seconds_bucket{{namespace="{namespace}"}}[5m])) * 1000',
        }
        
        dataframes = {}
        for name, query in queries.items():
            logger.info(f"Fetching {name}...")
            df = self.fetch_metrics_from_prometheus(query, start, end)
            df.rename(columns={"value": name}, inplace=True)
            dataframes[name] = df
        
        # Combine all features
        combined = pd.concat(dataframes.values(), axis=1)
        combined = combined.fillna(method='ffill').fillna(method='bfill')
        combined = combined.dropna()
        
        logger.info(f"Collected {len(combined)} data points with features: {list(combined.columns)}")
        
        return combined
    
    def train_model(
        self,
        df: pd.DataFrame,
        epochs: int = 50,
        batch_size: int = 32,
    ) -> Dict:
        """
        Train the LSTM prediction model.
        
        Args:
            df: Training data DataFrame
            epochs: Number of epochs
            batch_size: Batch size
            
        Returns:
            Training results
        """
        logger.info("Preparing data for training...")
        
        X_train, X_val, y_train, y_val = self.predictor.prepare_data(
            df,
            feature_columns=list(df.columns),
            target_column='cpu_usage',
        )
        
        logger.info(f"Training set: {X_train.shape}, Validation set: {X_val.shape}")
        
        logger.info(f"Starting training for {epochs} epochs...")
        start_time = time.time()
        
        history = self.predictor.train(
            X_train, y_train,
            X_val, y_val,
            epochs=epochs,
            batch_size=batch_size,
        )
        
        training_time = time.time() - start_time
        
        # Evaluate
        logger.info("Evaluating model...")
        evaluation = self.predictor.evaluate(X_val, y_val)
        
        # Save model
        logger.info("Saving model...")
        self.predictor.save()
        
        results = {
            "training_time_seconds": round(training_time, 2),
            "final_loss": round(history.history['loss'][-1], 4),
            "final_val_loss": round(history.history['val_loss'][-1], 4),
            "final_mae": round(history.history['mae'][-1], 4),
            "final_val_mae": round(history.history['val_mae'][-1], 4),
            "epochs_trained": len(history.history['loss']),
            "evaluation": evaluation,
            "model_version": self.predictor.model_version,
            "model_path": self.model_path,
        }
        
        logger.info(f"Training complete: {results}")
        
        return results
    
    def train_anomaly_detector(
        self,
        df: pd.DataFrame,
        epochs: int = 50,
    ) -> Dict:
        """
        Train the anomaly detection model.
        
        Args:
            df: Training data
            epochs: Number of epochs
            
        Returns:
            Training results
        """
        logger.info("Training anomaly detector...")
        
        # Prepare sequences
        data = df.values
        X = []
        for i in range(len(data) - self.lookback_window):
            X.append(data[i:i + self.lookback_window])
        X = np.array(X)
        
        start_time = time.time()
        self.anomaly_detector.fit(X, epochs=epochs)
        training_time = time.time() - start_time
        
        return {
            "training_time_seconds": round(training_time, 2),
            "threshold": round(self.anomaly_detector.threshold, 4),
            "samples": len(X),
        }
    
    def run_full_pipeline(
        self,
        hours: int = 168,
        epochs: int = 50,
        namespace: str = "default",
    ) -> Dict:
        """
        Run the complete training pipeline.
        
        Args:
            hours: Hours of data to collect
            epochs: Training epochs
            namespace: Target namespace
            
        Returns:
            Pipeline results
        """
        logger.info("=" * 60)
        logger.info("Starting ML Training Pipeline")
        logger.info("=" * 60)
        
        # Collect data
        df = self.collect_training_data(hours=hours, namespace=namespace)
        
        # Train predictor
        predictor_results = self.train_model(df, epochs=epochs)
        
        # Train anomaly detector
        anomaly_results = self.train_anomaly_detector(df, epochs=epochs)
        
        results = {
            "pipeline_completed_at": datetime.utcnow().isoformat(),
            "data_points": len(df),
            "features": list(df.columns),
            "date_range": {
                "start": df.index.min().isoformat(),
                "end": df.index.max().isoformat(),
            },
            "predictor": predictor_results,
            "anomaly_detector": anomaly_results,
        }
        
        logger.info("=" * 60)
        logger.info("Pipeline Complete")
        logger.info("=" * 60)
        
        return results


def main():
    """CLI entry point."""
    parser = argparse.ArgumentParser(description="Train KubeGenius ML Model")
    parser.add_argument("--prometheus-url", default="http://prometheus:9090", help="Prometheus URL")
    parser.add_argument("--model-path", default="/app/models", help="Model output path")
    parser.add_argument("--hours", type=int, default=168, help="Hours of data")
    parser.add_argument("--epochs", type=int, default=50, help="Training epochs")
    parser.add_argument("--batch-size", type=int, default=32, help="Batch size")
    parser.add_argument("--namespace", default="default", help="Kubernetes namespace")
    parser.add_argument("--lookback", type=int, default=60, help="Lookback window")
    parser.add_argument("--forecast", type=int, default=30, help="Forecast horizon")
    
    args = parser.parse_args()
    
    pipeline = TrainingPipeline(
        prometheus_url=args.prometheus_url,
        model_path=args.model_path,
        lookback_window=args.lookback,
        forecast_horizon=args.forecast,
    )
    
    results = pipeline.run_full_pipeline(
        hours=args.hours,
        epochs=args.epochs,
        namespace=args.namespace,
    )
    
    print("\nTraining Results:")
    print(f"  Model Version: {results['predictor']['model_version']}")
    print(f"  Data Points: {results['data_points']}")
    print(f"  Final Loss: {results['predictor']['final_loss']}")
    print(f"  Final Val Loss: {results['predictor']['final_val_loss']}")
    print(f"  Final MAE: {results['predictor']['final_mae']}")
    print(f"  RMSE: {results['predictor']['evaluation']['rmse']}")
    print(f"  Training Time: {results['predictor']['training_time_seconds']}s")


if __name__ == "__main__":
    main()
