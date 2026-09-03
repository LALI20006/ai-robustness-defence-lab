import os
import numpy as np
import pandas as pd

def generate_sample_datasets():
    os.makedirs("data/sample", exist_ok=True)
    os.makedirs("data/uploads", exist_ok=True)
    os.makedirs("data/processed", exist_ok=True)
    os.makedirs("models/saved_models", exist_ok=True)
    os.makedirs("reports", exist_ok=True)
    os.makedirs("logs", exist_ok=True)

    np.random.seed(42)
    n_samples = 1500

    # 1. NSL-KDD Network Intrusion Sample
    # Half normal, half attack
    labels = np.random.choice(["normal", "anomaly"], size=n_samples, p=[0.55, 0.45])
    is_attack = (labels == "anomaly").astype(int)

    protocols = ["tcp", "udp", "icmp"]
    services = ["http", "smtp", "ftp_data", "eco_i", "other", "private", "domain_u"]
    flags = ["SF", "S0", "REJ", "RSTO", "SH"]

    proto_col = []
    srv_col = []
    flag_col = []

    for att in is_attack:
        if att == 0:
            proto_col.append(np.random.choice(protocols, p=[0.8, 0.15, 0.05]))
            srv_col.append(np.random.choice(services, p=[0.6, 0.15, 0.1, 0.05, 0.04, 0.03, 0.03]))
            flag_col.append(np.random.choice(flags, p=[0.85, 0.05, 0.05, 0.03, 0.02]))
        else:
            proto_col.append(np.random.choice(protocols, p=[0.4, 0.3, 0.3]))
            srv_col.append(np.random.choice(services, p=[0.1, 0.05, 0.05, 0.25, 0.25, 0.2, 0.1]))
            flag_col.append(np.random.choice(flags, p=[0.25, 0.45, 0.15, 0.1, 0.05]))

    # Numeric features
    duration = np.where(is_attack == 1, np.random.exponential(scale=12.0, size=n_samples), np.random.exponential(scale=1.5, size=n_samples))
    src_bytes = np.where(is_attack == 1, np.random.lognormal(mean=7.5, sigma=2.0, size=n_samples), np.random.lognormal(mean=5.5, sigma=1.2, size=n_samples))
    dst_bytes = np.where(is_attack == 1, np.random.lognormal(mean=4.0, sigma=2.5, size=n_samples), np.random.lognormal(mean=6.5, sigma=1.5, size=n_samples))
    wrong_fragment = np.where(is_attack == 1, np.random.choice([0, 1, 3], size=n_samples, p=[0.85, 0.1, 0.05]), np.zeros(n_samples))
    urgent = np.where(is_attack == 1, np.random.choice([0, 1], size=n_samples, p=[0.95, 0.05]), np.zeros(n_samples))
    hot = np.where(is_attack == 1, np.random.poisson(lam=1.8, size=n_samples), np.random.poisson(lam=0.2, size=n_samples))
    count = np.where(is_attack == 1, np.random.randint(15, 250, size=n_samples), np.random.randint(1, 40, size=n_samples))
    srv_count = np.where(is_attack == 1, np.random.randint(5, 180, size=n_samples), np.random.randint(1, 35, size=n_samples))
    serror_rate = np.clip(np.where(is_attack == 1, np.random.beta(a=3, b=1, size=n_samples), np.random.beta(a=0.5, b=5, size=n_samples)), 0.0, 1.0)
    rerror_rate = np.clip(np.where(is_attack == 1, np.random.beta(a=2, b=2, size=n_samples), np.random.beta(a=0.2, b=8, size=n_samples)), 0.0, 1.0)
    same_srv_rate = np.clip(np.where(is_attack == 1, np.random.beta(a=1, b=3, size=n_samples), np.random.beta(a=8, b=1, size=n_samples)), 0.0, 1.0)
    diff_srv_rate = np.clip(1.0 - same_srv_rate + np.random.normal(0, 0.05, size=n_samples), 0.0, 1.0)
    dst_host_count = np.random.randint(1, 255, size=n_samples)
    dst_host_srv_count = np.where(is_attack == 1, np.random.randint(1, 60, size=n_samples), np.random.randint(100, 255, size=n_samples))

    kdd_df = pd.DataFrame({
        "duration": np.round(duration, 2),
        "protocol_type": proto_col,
        "service": srv_col,
        "flag": flag_col,
        "src_bytes": np.round(src_bytes).astype(int),
        "dst_bytes": np.round(dst_bytes).astype(int),
        "wrong_fragment": wrong_fragment.astype(int),
        "urgent": urgent.astype(int),
        "hot": hot.astype(int),
        "count": count.astype(int),
        "srv_count": srv_count.astype(int),
        "serror_rate": np.round(serror_rate, 4),
        "rerror_rate": np.round(rerror_rate, 4),
        "same_srv_rate": np.round(same_srv_rate, 4),
        "diff_srv_rate": np.round(diff_srv_rate, 4),
        "dst_host_count": dst_host_count.astype(int),
        "dst_host_srv_count": dst_host_srv_count.astype(int),
        "label": labels
    })

    kdd_path = os.path.join("data", "sample", "nsl_kdd_intrusion_sample.csv")
    kdd_df.to_csv(kdd_path, index=False)
    print(f"Generated {kdd_path} with {len(kdd_df)} rows and {kdd_df.shape[1]} columns.")

    # 2. Malware Static PE Extracted Features Sample
    mal_labels = np.random.choice(["benign", "malware"], size=n_samples, p=[0.52, 0.48])
    is_malware = (mal_labels == "malware").astype(int)

    entropy = np.clip(np.where(is_malware == 1, np.random.normal(6.9, 0.8, n_samples), np.random.normal(4.8, 0.9, n_samples)), 1.0, 8.0)
    virtual_size = np.where(is_malware == 1, np.random.lognormal(14.0, 1.2, n_samples), np.random.lognormal(12.5, 1.0, n_samples))
    num_sections = np.where(is_malware == 1, np.random.choice([3, 4, 5, 7, 8, 11], size=n_samples, p=[0.1, 0.2, 0.3, 0.2, 0.1, 0.1]), np.random.choice([3, 4, 5, 6], size=n_samples, p=[0.3, 0.4, 0.25, 0.05]))
    num_imports = np.where(is_malware == 1, np.random.randint(15, 150, n_samples), np.random.randint(50, 400, n_samples))
    num_exports = np.where(is_malware == 1, np.random.choice([0, 1, 2, 5], size=n_samples, p=[0.7, 0.15, 0.1, 0.05]), np.random.choice([0, 5, 15, 40], size=n_samples, p=[0.4, 0.3, 0.2, 0.1]))
    suspicious_api_calls = np.where(is_malware == 1, np.random.poisson(6.5, n_samples), np.random.poisson(0.8, n_samples))
    has_signature = np.where(is_malware == 1, np.random.choice([0, 1], size=n_samples, p=[0.82, 0.18]), np.random.choice([0, 1], size=n_samples, p=[0.12, 0.88]))
    has_debug_info = np.where(is_malware == 1, np.random.choice([0, 1], size=n_samples, p=[0.75, 0.25]), np.random.choice([0, 1], size=n_samples, p=[0.2, 0.8]))
    has_tls = np.where(is_malware == 1, np.random.choice([0, 1], size=n_samples, p=[0.4, 0.6]), np.random.choice([0, 1], size=n_samples, p=[0.85, 0.15]))
    resource_entropy = np.clip(np.where(is_malware == 1, np.random.normal(6.2, 1.1, n_samples), np.random.normal(3.8, 1.0, n_samples)), 0.0, 8.0)
    section_max_entropy = np.clip(np.where(is_malware == 1, np.random.normal(7.4, 0.5, n_samples), np.random.normal(5.5, 0.7, n_samples)), 2.0, 8.0)
    packer_detected = np.where(is_malware == 1, np.random.choice([0, 1], size=n_samples, p=[0.35, 0.65]), np.random.choice([0, 1], size=n_samples, p=[0.95, 0.05]))

    mal_df = pd.DataFrame({
        "file_entropy": np.round(entropy, 3),
        "virtual_size": np.round(virtual_size).astype(int),
        "num_sections": num_sections.astype(int),
        "num_imports": num_imports.astype(int),
        "num_exports": num_exports.astype(int),
        "suspicious_api_calls": suspicious_api_calls.astype(int),
        "has_digital_signature": has_signature.astype(int),
        "has_debug_info": has_debug_info.astype(int),
        "has_tls": has_tls.astype(int),
        "resource_entropy": np.round(resource_entropy, 3),
        "section_max_entropy": np.round(section_max_entropy, 3),
        "packer_detected": packer_detected.astype(int),
        "label": mal_labels
    })

    mal_path = os.path.join("data", "sample", "malware_pe_features_sample.csv")
    mal_df.to_csv(mal_path, index=False)
    print(f"Generated {mal_path} with {len(mal_df)} rows and {mal_df.shape[1]} columns.")

if __name__ == "__main__":
    generate_sample_datasets()
