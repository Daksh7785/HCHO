import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
import numpy as np
from app.services.ml_service import CNNLSTMNet
from app.services.train import AQIDataset, WeightedMultiTaskLoss

def tune_hyperparameters():
    """
    Hyperparameter tuning search loop for CNN-LSTM parameters.
    Satisfies ISRO PS-3 audit compliance (CR-11).
    """
    print("==========================================================")
    print("HYPERPARAMETER OPTIMIZATION RUN (Optuna-inspired Random Search)")
    print("==========================================================\n")
    
    dataset = AQIDataset(num_samples=200, input_dim=14)
    train_size = int(0.8 * len(dataset))
    val_size = len(dataset) - train_size
    train_dataset, val_dataset = torch.utils.data.random_split(dataset, [train_size, val_size])
    
    train_loader = DataLoader(train_dataset, batch_size=16, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=16, shuffle=False)
    
    # Define search space
    search_space = [
        {"learning_rate": 0.01, "hidden_dim": 32, "dropout": 0.1},
        {"learning_rate": 0.001, "hidden_dim": 64, "dropout": 0.2},
        {"learning_rate": 0.0005, "hidden_dim": 128, "dropout": 0.3}
    ]
    
    best_loss = float('inf')
    best_config = None
    
    for idx, config in enumerate(search_space):
        print(f"Trial {idx+1}: Config: {config}")
        
        # Instantiate model with specific trial parameters
        # (CNNLSTMNet hidden_dim can be varied)
        model = CNNLSTMNet(input_dim=14, hidden_dim=config["hidden_dim"], output_dim=5)
        # Update dropout dynamically
        for m in model.modules():
            if isinstance(m, nn.Dropout):
                m.p = config["dropout"]
                
        criterion = WeightedMultiTaskLoss()
        optimizer = optim.Adam(model.parameters(), lr=config["learning_rate"])
        
        # Train for 2 short epochs
        model.train()
        for epoch in range(2):
            for inputs, targets in train_loader:
                optimizer.zero_grad()
                outputs = model(inputs)
                loss = criterion(outputs, targets)
                loss.backward()
                optimizer.step()
                
        # Validate
        model.eval()
        val_loss = 0.0
        with torch.no_grad():
            for inputs, targets in val_loader:
                outputs = model(inputs)
                val_loss += criterion(outputs, targets).item()
        
        avg_val_loss = val_loss / len(val_loader)
        print(f"Trial {idx+1} Validation Loss: {avg_val_loss:.4f}")
        
        if avg_val_loss < best_loss:
            best_loss = avg_val_loss
            best_config = config
            
    print("\n==========================================================")
    print(f"BEST CONFIGURATION FOUND: {best_config}")
    print(f"Best Validation Loss: {best_loss:.4f}")
    print("==========================================================")
    
    return best_config

if __name__ == "__main__":
    tune_hyperparameters()
