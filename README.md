# Assessing Spear Phishing

This repository is for an experiment that tests different large language models (LLMs) in their ability to be used as tools to generate individualized training to help people identify spear phishing.

## Overview

The project provides a framework for:
- Loading various LLMs from Hugging Face
- Testing models with standardized prompts
- Generating spear phishing training emails
- Evaluating model performance for security awareness training

## Project Structure

```
assessingSpearPhishing/
├── data/
│   └── prompts.json          # Dataset of prompts for testing models
├── test_model.py             # Main test script
├── requirements.txt          # Python dependencies
└── README.md                 # This file
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/TailiaReganMalloy/assessingSpearPhishing.git
cd assessingSpearPhishing
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Usage

### Basic Usage

Test a model with the default settings (3 prompts):

```bash
python test_model.py --model gpt2
```

### Advanced Usage

Test with more prompts and save results:

```bash
python test_model.py --model facebook/opt-350m --num-prompts 5 --output results.json
```

### Command Line Arguments

- `--model` (required): Hugging Face model name (e.g., 'gpt2', 'facebook/opt-350m')
- `--prompts`: Path to prompts JSON file (default: data/prompts.json)
- `--num-prompts`: Number of prompts to test (default: 3)
- `--output`: Optional output file to save results in JSON format
- `--device`: Device to run model on: 'cuda', 'cpu', or 'auto' (default: auto)

### Example Models to Test

Small models (good for testing):
- `gpt2` - 124M parameters
- `facebook/opt-350m` - 350M parameters
- `EleutherAI/gpt-neo-125m` - 125M parameters

Medium models:
- `gpt2-medium` - 355M parameters
- `facebook/opt-1.3b` - 1.3B parameters

Note: Larger models require more memory and may need GPU support.

## Prompt Dataset

The `data/prompts.json` file contains a curated set of prompts organized by:
- **Category**: Type of phishing attack (urgent_action, authority_impersonation, etc.)
- **Target Audience**: Intended recipient group
- **Difficulty**: Estimated difficulty level for identification

Each prompt is designed to test the model's ability to generate realistic spear phishing training scenarios.

## Output Format

When using the `--output` flag, results are saved in JSON format with the following structure:

```json
[
  {
    "prompt_id": "prompt_001",
    "prompt": "The original prompt text",
    "category": "urgent_action",
    "generated_email": "The model-generated email",
    "model": "gpt2"
  }
]
```

## Requirements

- Python 3.7+
- PyTorch 2.0+
- Transformers 4.30+
- CUDA (optional, for GPU acceleration)

## Contributing

This is a research project for assessing LLM capabilities in generating security awareness training content.

## License

See LICENSE file for details.