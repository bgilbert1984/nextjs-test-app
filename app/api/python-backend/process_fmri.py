# python-backend/process_fmri.py
import numpy as np
import nibabel as nib
from skimage.segmentation import slic
from skimage.util import img_as_float
from sklearn.cluster import KMeans

def load_fmri_data(nifti_file):
    """Loads fMRI data from a NIfTI file."""
    try:
        img = nib.load(nifti_file)
        data = img.get_fdata()
        return data, img.affine, img.header
    except FileNotFoundError:
        print(f"Error: File not found: {nifti_file}")
        return None, None, None
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None, None, None

def supervoxel_segmentation(fmri_data, n_segments=200, compactness=10.0):
    """Applies super-voxel clustering using SLIC."""
    first_slice = img_as_float(fmri_data[..., 0])  # Process only the first timepoint
    segments = slic(first_slice, n_segments=n_segments, compactness=compactness, sigma=1, start_label=1)
    return segments

def cluster_fmri_data(fmri_slice, method="kmeans", n_clusters=10):
    """Cluster fMRI slices using K-Means (simplified for demonstration)."""
    flattened_slice = fmri_slice.reshape(-1, 1)

    if method == "kmeans":
        clustered = KMeans(n_clusters=n_clusters, random_state=42, n_init=10).fit_predict(flattened_slice)
    # elif method == "spectral":  # Removed for initial simplicity
    #     clustered = SpectralClustering(n_clusters=n_clusters, affinity="nearest_neighbors", random_state=42).fit_predict(flattened_slice)
    # elif method == "hierarchical": # Removed for simplicity
    #     clustered = AgglomerativeClustering(n_clusters=n_clusters, linkage="ward").fit_predict(flattened_slice)
    else:
        raise ValueError("Invalid clustering method")

    return clustered.reshape(fmri_slice.shape)


def process_fmri(filename):
    """Loads, preprocesses, and segments fMRI data."""
    fmri_data, affine, header = load_fmri_data(filename)
    if fmri_data is None:
        return None

    # For initial testing, we'll just work with the first time point.
    fmri_slice = fmri_data[..., 0]

    # Apply supervoxel segmentation
    segments = supervoxel_segmentation(fmri_slice)
     # Apply k-means
    clustered_slice = cluster_fmri_data(segments)

    # Calculate cluster centers (centroids)
    cluster_centers = []
    for i in np.unique(clustered_slice):
        cluster_points = np.array(np.where(clustered_slice == i)).T
        centroid = cluster_points.mean(axis=0)
        cluster_centers.append(centroid.tolist())  # Convert to list for JSON

    return {"voxels": cluster_centers}

# Example usage (for testing within this script):
if __name__ == '__main__':
    # Create a dummy NIfTI file (replace with your actual data)
    dummy_data = np.random.rand(64, 64, 64)  # 3D data
    affine = np.eye(4)  # Identity matrix
    header = nib.Nifti1Header()
    dummy_img = nib.Nifti1Image(dummy_data, affine, header)
    nib.save(dummy_img, 'dummy_fmri.nii.gz')


    processed_data = process_fmri('dummy_fmri.nii.gz')

    if processed_data:
        print("Processed data:", processed_data)
    else:
        print("Failed to process fMRI data.")