"""Train HIRAYA heat-risk models from the bundled dataset."""

from pathlib import Path

from app.ml.trainer import train_all_models


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    csv_path = root / "data" / "heatstroke_training_data.csv"
    output_dir = root / "models"

    if not csv_path.exists():
        raise SystemExit(
            f"Training dataset not found at {csv_path}. "
            "Download it before running this script."
        )

    manifest = train_all_models(str(csv_path), output_dir)
    print("Training complete.")
    print(f"Champion model: {manifest['champion']}")
    print(f"Model version: {manifest['modelVersion']}")
    print("Metrics:")
    for name, metrics in manifest["metrics"].items():
        print(f"  {name}: ROC-AUC={metrics['roc_auc']:.4f}, F1={metrics['f1']:.4f}")


if __name__ == "__main__":
    main()
