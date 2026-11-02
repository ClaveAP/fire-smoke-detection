from app import config


def test_default_weights_prefers_trained_model_and_supports_override(monkeypatch, tmp_path):
    trained_weights = tmp_path / "best.pt"
    trained_weights.touch()
    monkeypatch.setattr(config, "SHIPPED_WEIGHTS", trained_weights)
    monkeypatch.delenv("FSD_WEIGHTS", raising=False)
    assert config.Settings().weights_path == trained_weights

    override = tmp_path / "custom.pt"
    monkeypatch.setenv("FSD_WEIGHTS", str(override))
    assert config.Settings().weights_path == override
