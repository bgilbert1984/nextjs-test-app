# python-backend/fmri_processing.py
import asyncio
import json
import os
import numpy as np
import nibabel as nib
import websockets
from sklearn.cluster import KMeans, SpectralClustering, AgglomerativeClustering
from nilearn.image import smooth_img
from skimage.segmentation import quickshift
from skimage.util import img_as_float
from skimage.filters import sobel
from skimage.measure import shannon_entropy
from nipype.interfaces.spm import Realign, Normalize12, Smooth
import torch
import torch.nn as nn
import torch.optim as optim

try:
    import cupy as cp  # GPU acceleration
    GPU_ENABLED = True
except ImportError:
    cp = np  # If CuPy is not available, fall back to NumPy
    GPU_ENABLED = False

SPM12_PATH = os.getenv("SPM12_PATH", "/path/to/spm12") # Set SPM12 path, or use environment var

# --- Data Loading and Preprocessing ---

def load_fmri_data(nifti_file):
    """Loads and preprocesses fMRI data."""
    try:
        img = nib.load(nifti_file)
        data = img.get_fdata()
        affine = img.affine
        header = img.header
        # Apply smoothing
        data = smooth_img(img, fwhm=6).get_fdata()
        return data, affine, header
    except FileNotFoundError:
        print(f"Error: File not found: {nifti_file}")
        return None, None, None
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None, None, None


def preprocess_fmri(data):
    """Placeholder for SPM preprocessing (motion correction, normalization, smoothing)."""
    # TODO: Implement SPM preprocessing steps using Nipype here.
    # For this example, we'll just return the data as-is.
    return data

# --- Model Definition (for Adversarial Training) ---
class GradientModel(nn.Module):
    """Simple linear model for demonstration."""
    def __init__(self, input_dim):
        super(GradientModel, self).__init__()
        self.linear = nn.Linear(input_dim, 1, bias=False)  # No bias

    def forward(self, x):
        return self.linear(x)

# --- Adversarial Training ---
def adversarial_training(model, data, num_epochs=5, lr=0.01, norm_type='l1'):
    """Simplified adversarial training with gradient regularization."""
    optimizer = optim.Adam(model.parameters(), lr=lr)
    data.requires_grad_(True) #Enable grad

    for epoch in range(num_epochs):
        optimizer.zero_grad()
        output = model(data)

        # Calculate the loss and add regularization term
        loss = output.sum()  # Simple loss function
        loss.backward()  # Calculate gradients

        # Apply norm regularization to the *input gradients*
        if norm_type == 'l1':
            reg_loss = torch.norm(data.grad, p=1)  # type: ignore
        elif norm_type == 'l2':
            reg_loss = torch.norm(data.grad, p=2)  # type: ignore
        else:
            raise ValueError("Invalid norm_type.  Must be 'l1' or 'l2'.")

        total_loss = loss + 0.01 * reg_loss
        total_loss.backward() # Backpropagate total loss
        optimizer.step()

        # Create adversarial example (simplified)
        epsilon = 0.01  # Small perturbation
        data = data + epsilon * data.grad.sign() # type: ignore
        data = torch.clamp(data, 0, 1)  # Keep data within valid range
        data.grad = None # Reset
        data.requires_grad_(True)

    return data.detach()

# --- Super-Voxel Clustering ---

def supervoxel_segmentation(fmri_data, n_segments=200, compactness=10.0, sigma=1):
    """Applies super-voxel clustering using SLIC."""
    first_slice = img_as_float(fmri_data[..., 0])
    segments = slic(first_slice, n_segments=n_segments, compactness=compactness, sigma=sigma, start_label=1)
    return segments


def apply_graph_cut(fmri_slice, segments):
    """Apply Graph Cuts segmentation using Region Adjacency Graph (RAG)."""
    from skimage.future import graph  # Import here to avoid issues if not installed
    g = graph.rag_mean_color(fmri_slice, segments)
    cut_segments = graph.cut_normalized(segments, g)
    return cut_segments



def cluster_fmri_data(fmri_slice, method="kmeans", n_clusters=10):
    """Cluster fMRI slices using K-Means, Spectral, or Hierarchical clustering."""

    # Flatten for clustering.  Make sure to handle potential NaNs/Infs
    flattened_slice = fmri_slice.reshape(-1, 1)
    flattened_slice = np.nan_to_num(flattened_slice, nan=0.0, posinf=1e9, neginf=-1e9) # Replace nan, inf

    if method == "kmeans":
        clustered = KMeans(n_clusters=n_clusters, random_state=42, n_init=10).fit_predict(flattened_slice)
    elif method == "spectral":
        clustered = SpectralClustering(n_clusters=n_clusters, affinity="nearest_neighbors", random_state=42).fit_predict(flattened_slice)
    elif method == "hierarchical":
        clustered = AgglomerativeClustering(n_clusters=n_clusters, linkage="ward").fit_predict(flattened_slice)
    else:
        raise ValueError("Invalid clustering method")

    return clustered.reshape(fmri_slice.shape)  # Reshape back

def determine_optimal_method(fmri_slice):
    """Analyze region properties to select best clustering method."""
    variance = np.var(fmri_slice)
    edge_complexity = np.mean(canny(fmri_slice))  # Detects edges
    entropy_value = shannon_entropy(fmri_slice)

    if variance < 0.02:
        return "hierarchical"  # Low variance
    elif edge_complexity > 0.1:
        return "spectral"  # High edge complexity
    elif entropy_value > 3.0:
      return "kmeans"
    return "kmeans"  # Default fallback

def adaptive_cluster_fmri(fmri_slice, n_clusters=10):
  return cluster_fmri_data(fmri_slice, determine_optimal_method(fmri_slice), n_clusters) #Use the optimal method

async def stream_fmri_data(websocket, path):
    """WebSocket server for streaming segmented fMRI data."""
    fmri_data, _, _ = load_fmri_data("example_fmri.nii.gz") # Put your filename
    if fmri_data is None:
        print("Failed to load FMRI Data")
        return;
    num_timepoints = fmri_data.shape[-1]

    for t in range(num_timepoints):
        #clustered_slice = cluster_fmri_data(fmri_data[..., t], method="kmeans", n_clusters=10)
        clustered_slice = adaptive_cluster_fmri(fmri_data[..., t], n_clusters=10) #Use the adaptive method

        voxel_data = [
            {"x": int(x), "y": int(y), "z": int(z), "intensity": int(clustered_slice[x, y, z])}
            for x in range(clustered_slice.shape[0])
            for y in range(clustered_slice.shape[1])
            for z in range(clustered_slice.shape[2])
        ]

        await websocket.send(json.dumps(voxel_data))
        await asyncio.sleep(0.1)  # Control frame rate.  Adjust as needed.


async def main():
    async with websockets.serve(stream_fmri_data, "0.0.0.0", 8765):
        print(f"WebSocket Server started on ws://0.0.0.0:8765") #Corrected
        await asyncio.Future()  # Run forever


if __name__ == "__main__":
    asyncio.run(main())