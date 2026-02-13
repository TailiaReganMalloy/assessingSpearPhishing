# Assessing Spear Phishing

This repository contains an experiment that evaluates how different large language models (LLMs) can be used to generate individualized training for identifying spear phishing. The primary analysis entry point is [analysis/analysis.py](analysis/analysis.py), which aggregates run metadata, builds visualizations, and exports LaTeX tables for reporting.

## What analysis.py does

### Model families analyzed
The analysis covers eight model families, each with multiple model variants:
- Claude
- Gemini
- GPT
- Grok
- Llama
- Mistral
- Nova
- Qwen

These families are used to group models in the generated tables and to highlight best-in-family and global-best results for key performance measures.

### Model metrics collected (six usage/behavior metrics)
For each model (aggregated across prompts), the script computes:
1. `model_usage_costs`: total usage cost per model.
2. `model_usage_total_tokens`: total tokens consumed per model.
3. `model_usage_reasoning_tokens`: reasoning tokens per model (when available).
4. `model_metadata_durations`: total duration per model (input durations are in milliseconds; the table formats these as hours).
5. `model_metadata_tools`: count of tool invocations per model.
6. `model_max_prompts`: max prompt token limits observed per model.

These metrics are plotted as bar charts in [analysis/plots](analysis/plots) and are used as predictors in regression analyses.

### Model performance measures (two outcome metrics)
The script uses two outcome measures to compare models:
1. `model_screenshot_similarities`: screenshot similarity to a reference image. This is computed by resizing each model’s screenshot to the reference size, computing mean squared error (MSE), then converting to a similarity score via $1 / (1 + \text{MSE})$. The script normalizes mean similarity per model to a 0–100% scale for the LaTeX table.
2. `model_has_screenshots`: screenshot availability (count of prompts with a screenshot). This is summarized as a total count and also converted into a success percentage (out of 5 prompts) for the table.

### Statistical analysis and outputs
The analysis includes:
- **Correlation analysis** across selected metrics with a heatmap and Pearson correlation table.
- **Regression models** predicting (a) screenshot similarity and (b) screenshot count from the six usage/behavior metrics. Coefficient plots are saved for each regression.
- **Univariate $R^2$ comparison** for each predictor across both outcomes, visualized in a grouped bar chart.

### Exported artifacts
The script writes:
- [analysis/table.tex](analysis/table.tex): a LaTeX longtable summarizing models, grouped by family, with formatted units and highlighted best values.
- [analysis/regression_tables.tex](analysis/regression_tables.tex): LaTeX tables of regression coefficients.
- Plots in [analysis/plots](analysis/plots), including metric bars, regression coefficients, correlation heatmap, and univariate $R^2$ comparison.

## Data and codebases

### data/
The [data](data) folder contains the prompt set and supporting resources used to run the model experiments:
- [data/prompt.txt](data/prompt.txt): the raw prompt text used for experiments.
- [data/prompt.py](data/prompt.py): helper script for loading/formatting prompts.
- [data/README.md](data/README.md): prompt schema, categories, and usage details.
- [data/requirements.txt](data/requirements.txt): Python dependencies for data tooling.

The prompt schema described in [data/README.md](data/README.md) includes categories (e.g., urgent action, authority impersonation, security alerts, etc.), target audiences, and difficulty labels. These prompts drive the experiment runs that the analysis aggregates.

### codebases/
The [codebases](codebases) folder holds the generated website outputs for each model and prompt. It is organized by model family and model name, with each model containing prompt subfolders (prompt1–prompt5). Each prompt folder typically includes:
- a chat transcript (chat.json)
- a generated site (HTML/CSS/JS assets)
- a screenshot (screenshot.png)

The analysis script reads these folders to compute usage metrics, determine screenshot availability, and measure screenshot similarity against the reference image.
