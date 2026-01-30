import pandas as pd
import matplotlib.pyplot as plt
import json
from pathlib import Path
import seaborn as sns
import pingouin as pg
import numpy as np
from PIL import Image

chats = pd.read_pickle("../data/chats.pkl")
prompts = pd.read_pickle("../data/prompts.pkl")
logs = pd.read_pickle("../data/logs.pkl")
metadata = pd.read_pickle("../data/metadata.pkl")
requestMessages_ = pd.read_pickle("../data/requestMessages.pkl")
responsesMessages = pd.read_pickle("../data/responsesMessages.pkl")


analyzed_models = { 
                    'amazon/nova-lite-v1': 'Nova/Lite-1', 
                    'amazon/nova-micro-v1': 'Nova/Micro-1', 
                    'amazon/nova-pro-v1': 'Nova/Pro-1', 
                    'claude-haiku-4.5': 'Claude/Haiku-4.5', 
                    'claude-opus-4-20250514': 'Claude/Opus-4',
                    'claude-opus-4.5': 'Claude/Opus-4.5', 
                    'claude-sonnet-4': 'Claude/Sonnet-4',
                    'claude-sonnet-4.5': 'Claude/Sonnet-4.5', 
                    'gemini-2.5-pro': 'Gemini/2.5-Pro', 
                    'gemini-3-flash-preview': 'Gemini/3-Flash',
                    'models/gemini-2.5-flash': 'Gemini/2.5-Flash',
                    'gemini-3-pro-preview': 'Gemini/3-Pro', 
                    'google/gemini-2.5-flash-lite': 'Gemini/2.5-Light',
                    'gpt-4o': 'GPT/4o',
                    'gpt-5': 'GPT/5', 
                    'gpt-5-codex': 'GPT/5-Codex', 
                    'gpt-5.1-codex': 'GPT/5.1-Codex', 
                    'gpt-5.2-codex': 'GPT/5.2-Codex', 
                    'meta-llama/llama-3.1-70b-instruct': 'Llama/3.1-70B', 
                    'meta-llama/llama-3.1-8b-instruct': 'Llama/3.1-8B', 
                    'meta-llama/llama-3.3-70b-instruct': 'Llama/3.3-7B', 
                    'meta-llama/llama-4-maverick': 'Llama/4-Maverick', 
                    'meta-llama/llama-4-scout': 'Llama/4-Scout', 
                    'mistralai/mistral-large-2512': 'Mistral/Large-3', 
                    'mistralai/mistral-medium-3': 'Mistral/Medium-3', 
                    'mistralai/mistral-medium-3.1': 'Mistral/Medium-3.1', 
                    'mistralai/mistral-small-3.1-24b-instruct': 'Mistral/Small-3.1', 
                    'mistralai/mistral-small-3.2-24b-instruct': 'Mistral/Small-3.2',  
                    'qwen/qwen3-coder-flash': "Qwen/Coder-Flash", 
                    'qwen/qwen3-coder-plus': "Qwen/Coder-Plus", 
                    'qwen/qwen3-coder':"Qwen/Coder-3",
                    'qwen3-coder-30b-a3b-instruct': "Qwen/Coder-30B",  
                    'qwen/qwen3-vl-30b-a3b-thinking': 'Qwen/30B-Thinking', 
                    'x-ai/grok-3':'Grok/3', 
                    'x-ai/grok-4':'Grok/4', 
                    'x-ai/grok-4-fast':'Grok/4-Fast', 
                    'x-ai/grok-4.1-fast':'Grok/4.1-Fast', 
                    'x-ai/grok-code-fast-1':'Grok/Code-Fast-1',
                    'grok-code-fast-1':'Grok/Code-Fast-1'}



model_usage_costs = {}
model_usage_total_tokens = {}
model_usage_reasoning_tokens = {}
model_metadata_durations = {}
model_metadata_tools = {}
model_max_prompts = {}
model_screenshot_similarities = {}
model_has_screenshots = {}

true_image_path = Path("./true_website.png")
true_image = None
if true_image_path.exists():
    true_image = Image.open(true_image_path).convert("RGB")
else:
    print("Warning: true_website.png not found; screenshot similarity will be skipped.")

for key, model in analyzed_models.items():
    model_usage_cost = []
    model_usage_total_token = []
    model_usage_reasoning_token = []
    model_metadata_duration = []
    model_metadata_tool = []
    model_max_prompt = []
    model_screenshot_similarity = []
    model_has_screenshot = []

    for folder in ['prompt1/', 'prompt2/', 'prompt3/', 'prompt4/', 'prompt5/']:
        path = Path("../codebases/" + model + "/" + folder + 'chat.json')
        screenshot = Path("../codebases/" + model + "/" + folder + 'screenshot.png')

        if not path.exists():
            model_has_screenshot.append(0)
            continue

        with open(path, 'r') as f:
            data = json.load(f)
            if('prompts' in data.keys()):
                prompts = data['prompts']
                prompt_cost = 0
                prompt_total_token = 0
                prompt_reasoning_token = 0
                prompt_duration = 0
                prompt_tool = 0
                prompt_max_prompt = []
                for prompt in prompts:
                    logs = prompt['logs']
                    for log in logs:
                        if('metadata' in log.keys()):
                            metadatum = log['metadata']
                            if('tools' in metadatum.keys()):
                                prompt_tool += len(metadatum['tools'])
                            if('duration' in metadatum.keys()):
                                prompt_duration += metadatum['duration']
                            if('maxPromptTokens' in metadatum.keys()):
                                prompt_max_prompt.append(metadatum['maxPromptTokens'])
                            if('usage' in metadatum.keys()):
                                usage = metadatum['usage']
                                if('cost' in metadatum['usage'].keys()):
                                    prompt_cost += usage['cost']
                                if('total_tokens' in metadatum['usage'].keys()):
                                    prompt_total_token += usage['total_tokens']
                                if('completion_tokens_details' in metadatum['usage'].keys() and 'reasoning_tokens' in  metadatum['usage']['completion_tokens_details'].keys()):
                                    prompt_reasoning_token += metadatum['usage']['completion_tokens_details']['reasoning_tokens']
                model_usage_cost.append(prompt_cost)
                model_usage_total_token.append(prompt_total_token)
                model_usage_reasoning_token.append(prompt_reasoning_token)
                model_metadata_duration.append(prompt_duration)
                model_metadata_tool.append(prompt_tool)
                model_max_prompt.append(prompt_max_prompt)

        if screenshot.exists() and true_image is not None:
            try:
                shot_img = Image.open(screenshot).convert("RGB")
                min_shape = (min(true_image.size[0], shot_img.size[0]), min(true_image.size[1], shot_img.size[1]))
                ref_resized = true_image.resize(min_shape)
                shot_resized = shot_img.resize(min_shape)
                arr_ref = np.asarray(ref_resized).astype(np.float32)
                arr_shot = np.asarray(shot_resized).astype(np.float32)
                mse = np.mean((arr_ref - arr_shot) ** 2)
                sim = 1 / (1 + mse)
                model_screenshot_similarity.append(sim)
                model_has_screenshot.append(1)
            except Exception as exc:
                print(f"Error processing screenshot {screenshot}: {exc}")
                model_has_screenshot.append(0)
        else:
            model_has_screenshot.append(0)

    model_usage_costs[model] = model_usage_cost
    model_usage_total_tokens[model] = model_usage_total_token
    model_usage_reasoning_tokens[model] = model_usage_reasoning_token
    model_metadata_durations[model] = model_metadata_duration
    model_metadata_tools[model] = model_metadata_tool
    model_max_prompts[model] = model_max_prompt
    model_screenshot_similarities[model] = model_screenshot_similarity
    model_has_screenshots[model] = model_has_screenshot

metrics = [
    [model_max_prompts, "Max Prompt Average", "Max Prompt Average by Model", 'plots/model_max_prompt.png'],
    [model_usage_costs, 'Total Cost ($)', 'Total Usage Cost by Model', 'plots/model_usage_cost.png'],
    [model_usage_total_tokens, 'Total Tokens Used', 'Total Tokens Used by Model', 'plots/model_usage_total_tokens.png'],
    [model_usage_reasoning_tokens, 'Total Reasoning Tokens Used', 'Total Reasoning Tokens Used by Model', 'plots/model_usage_reasoning_tokens.png'],
    [model_metadata_durations, 'Total Duration (s)', 'Total Duration by Model', 'plots/model_metadata_durations.png'],
    [model_metadata_tools, 'Total Number of Tools Used', 'Total Number of Tools Used by Model', 'plots/model_metadata_tools.png'],
    [model_screenshot_similarities, 'Screenshot Similarity', 'Screenshot Similarity by Model', 'plots/model_screenshot_similarity.png'],
    [model_has_screenshots, 'Screenshot Count', 'Screenshot Count by Model', 'plots/model_has_screenshot.png'],
]

for (metric, xlabel, ylabel, name) in metrics: 
    models = list(metric.keys())
    # For model_max_prompts, flatten the list of lists for each prompt, then take mean/var
    if xlabel == "Max Prompt Average":
        means = [np.mean([item for sublist in metric[m] for item in (sublist if isinstance(sublist, list) else [sublist])]) if len(metric[m]) > 0 else 0 for m in models]
        stds = [np.std([item for sublist in metric[m] for item in (sublist if isinstance(sublist, list) else [sublist])]) if len(metric[m]) > 0 else 0 for m in models]
    elif xlabel == "Screenshot Count":
        means = [np.sum(metric[m]) if len(metric[m]) > 0 else 0 for m in models]
        stds = [0 for _ in models]
    else:
        means = [np.mean(metric[m]) if len(metric[m]) > 0 else 0 for m in models]
        stds = [np.std(metric[m]) if len(metric[m]) > 0 else 0 for m in models]
    fig, ax = plt.subplots(figsize=(14, 6))
    ax.bar(models, means, yerr=stds, color='steelblue', capsize=5)
    ax.set_xlabel('Model', fontsize=12)
    ax.set_ylabel(xlabel, fontsize=12)
    ax.set_title(ylabel, fontsize=14, fontweight='bold')
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    plt.savefig(name, dpi=300, bbox_inches='tight')
    #plt.show()
    print("Chart saved as " + name)

# Create DataFrame for correlation analysis
df_corr = pd.DataFrame({
    'model': list(model_usage_total_tokens.keys()),
    'model_usage_total_tokens': [np.mean(v) if isinstance(v, list) and len(v) > 0 else 0 for v in model_usage_total_tokens.values()],
    'model_metadata_tools': [np.mean(v) if isinstance(v, list) and len(v) > 0 else 0 for v in model_metadata_tools.values()],
    'model_metadata_durations': [np.mean(v) if isinstance(v, list) and len(v) > 0 else 0 for v in model_metadata_durations.values()]
})

# Compute correlation matrix
corr_matrix = df_corr[['model_usage_total_tokens', 'model_metadata_tools', 'model_metadata_durations']].corr()

# Plot heatmap
plt.figure(figsize=(8, 6))
sns.heatmap(corr_matrix, annot=True, cmap='coolwarm', vmin=-1, vmax=1)
plt.title('Correlation Matrix of Metrics')
plt.savefig('correlation_heatmap.png', dpi=300, bbox_inches='tight')
#plt.show()
print("Correlation heatmap saved as correlation_heatmap.png")

# Use pingouin for detailed correlation
corr_results = pg.pairwise_corr(df_corr[['model_usage_total_tokens', 'model_metadata_tools', 'model_metadata_durations']], method='pearson')
print(corr_results)


tex_headder = r"""
\setlength\LTleft{0pt}
\setlength\LTright{0pt}
\begin{longtable}{@{}p{0pt}@{}|@{\extracolsep{\fill}}c|c|c|c|c|c|c|@{}}
\hline
\ & Name & Context & Cost & Time & Tokens & Success & Similarity  \\
\hline
\endfirsthead
\hline
\ & Name & Context & Cost & Time & Tokens & Success & Similarity  \\
\hline
\endhead
"""


model_families = ["Claude", "Gemini", "GPT", "Grok", "Llama", "Mistral", "Nova", "Qwen"]
models = []
for model_path in analyzed_models.values():
    # Split by '/' and get family and model name
    parts = model_path.split('/')
    if len(parts) >= 2:
        family = parts[0]
        model = parts[-1]
        models.append({"Family": family, "Model": model})

# Use metrics: metrics
tex_body = ""
metric_dicts = [metrics[0][0], metrics[1][0], metrics[2][0], metrics[3][0], metrics[4][0], metrics[5][0], metrics[6][0], metrics[7][0]]

# Precompute normalized similarity scaling across all models (based on mean similarity per model)
all_positive_sims = []
mean_similarity_by_model = {}
for model_key in metrics[6][0].keys():
    vals = metrics[6][0].get(model_key, [])
    if vals:
        mean_val = float(np.mean(vals))
    else:
        mean_val = 0.0
    mean_similarity_by_model[model_key] = mean_val
    if mean_val > 0:
        all_positive_sims.append(mean_val)

if all_positive_sims:
    min_sim = min(all_positive_sims)
    max_sim = max(all_positive_sims)
else:
    min_sim = None
    max_sim = None

# Precompute success percentage (screenshots/5 * 100) per model for styling
success_pct_by_model = {}
for model_key in metrics[7][0].keys():
    shots = metrics[7][0].get(model_key, [])
    shots_sum = float(np.sum(shots)) if len(shots) > 0 else 0.0
    success_pct_by_model[model_key] = (shots_sum / 5.0) * 100.0 if shots_sum > 0 else 0.0

global_best_success = max(success_pct_by_model.values()) if success_pct_by_model else None
global_best_similarity = max(all_positive_sims) * 100.0 if all_positive_sims else None


def two_sig(val):
    try:
        return f"{float(val):.2g}"
    except (TypeError, ValueError):
        return "N/A"


def style_value(val_str, metric_value, family_best, global_best):
    if metric_value is None:
        return val_str
    styled = val_str
    is_global = global_best is not None and np.isclose(metric_value, global_best, rtol=1e-3, atol=1e-6)
    is_family = family_best is not None and np.isclose(metric_value, family_best, rtol=1e-3, atol=1e-6)
    if is_global and is_family:
        styled = f"\\textbf{{\\textit{{{styled}}}}}"
    elif is_global:
        styled = f"\\textbf{{{styled}}}"
    elif is_family:
        styled = f"\\textit{{{styled}}}"
    return styled

def metric_value(metric_index, model_key):
    data = metric_dicts[metric_index].get(model_key, [])
    if metric_index == 0:  # max prompts -> flatten then mean
        flat = [item for sub in data for item in (sub if isinstance(sub, list) else [sub])]
        return np.mean(flat) if len(flat) > 0 else 0
    if metric_index == 7:  # screenshot count -> sum
        return float(np.sum(data)) if len(data) > 0 else 0
    if metric_index == 6:  # screenshot similarity -> mean
        return float(np.mean(data)) if len(data) > 0 else 0
    return float(np.mean(data)) if isinstance(data, list) and len(data) > 0 else 0
for model_family in model_families:
    # Get all models in this family
    family_models = [m['Model'] for m in models if m['Family'] == model_family]
    if family_models:
        family_success_best = max([success_pct_by_model.get(f"{model_family}/{m}", 0.0) for m in family_models]) if family_models else None
        family_sim_best = None
        for m in family_models:
            mk = f"{model_family}/{m}"
            mean_sim = mean_similarity_by_model.get(mk, 0.0) * 100.0
            if mean_sim > 0:
                family_sim_best = mean_sim if family_sim_best is None else max(family_sim_best, mean_sim)
        tex_body += fr"\multirow{{{len(family_models)}}}{{*}}{{\makebox[0pt][r]{{\rotatebox[origin=c]{{90}}{{\textbf{{{model_family}}}}}\hspace{{0.8em}}}}}}"
        for model_name in family_models:
            model_key = f"{model_family}/{model_name}"
            def fmt(val):
                try:
                    num = float(val)
                    if num == 0:
                        return 'N/A'
                    return f"{num:.2E}"
                except (ValueError, TypeError):
                    # Also replace string '0.00E+00' with 'N/A'
                    if str(val).strip() == '0.00E+00' or str(val).strip() == '0':
                        return 'N/A'
                    return val
            size = fmt(metric_value(0, model_key))
            usage = fmt(metric_value(1, model_key))
            total_tokens = fmt(metric_value(2, model_key))
            #reasoning_tokens = fmt(metric_value(3, model_key))
            duration = fmt(metric_value(4, model_key))
            #tools_used = fmt(metric_value(5, model_key))
            sim_raw = metric_value(6, model_key)
            norm_pct = 'N/A'
            if sim_raw and sim_raw > 0 and min_sim is not None and max_sim is not None and max_sim > min_sim:
                norm_val = (sim_raw - min_sim) / (max_sim - min_sim)
                norm_val = max(0.0, min(1.0, norm_val))
                norm_pct = f"{norm_val * 100:.0f}%"
            elif sim_raw and sim_raw > 0 and max_sim is not None and max_sim == min_sim:
                norm_pct = "100%"
            else:
                norm_pct = 'N/A'
            shots_raw = metric_value(7, model_key)
            screenshots = f"{int(round(shots_raw))}" if shots_raw is not None else '0'

            # Re-format fields with requested units/precision
            try:
                size_m = float(metric_value(0, model_key)) / 1e6
                size_fmt = two_sig(size_m) + "M"
            except Exception:
                size_fmt = 'N/A'

            try:
                usage_val = float(metric_value(1, model_key))
                # Escape the dollar sign so LaTeX treats it as text, not math mode
                usage_fmt = "\\$" + two_sig(usage_val)
            except Exception:
                usage_fmt = 'N/A'

            try:
                # Input duration is in milliseconds; convert to hours and format as X.XX h
                duration_hours = float(metric_value(4, model_key)) / (1000.0 * 60.0 * 60.0)
                duration_fmt = f"{duration_hours:.2f} h"
            except Exception:
                duration_fmt = 'N/A'

            try:
                tokens_m = float(metric_value(2, model_key)) / 1e6
                tokens_fmt = two_sig(tokens_m) + "M"
            except Exception:
                tokens_fmt = 'N/A'

            success_pct = success_pct_by_model.get(model_key, 0.0)
            success_fmt = f"{success_pct:.0f}%"

            sim_numeric = None
            if norm_pct.endswith('%') and norm_pct != 'N/A':
                try:
                    sim_numeric = float(norm_pct.strip('%'))
                except Exception:
                    sim_numeric = None

            success_fmt = style_value(success_fmt, success_pct, family_success_best, global_best_success)
            sim_fmt = style_value(norm_pct, sim_numeric, family_sim_best, global_best_similarity)

            tex_body += (
                f" & {model_name} & {size_fmt} & {usage_fmt} & {duration_fmt} & "
                f"{tokens_fmt} & {success_fmt} & {sim_fmt}  " + r"\\"
            )
            tex_body += "\n    \\hline\n"
        tex_body += "    \\hline\n"

tex_footer = r"""
	\caption*{}
	\label{tab:models}
\end{longtable}
\clearpage
\clearpage
"""

tex_output = tex_headder + tex_body + tex_footer
print(tex_output)
tex_file_path = './table.tex'
with open(tex_file_path, 'w', encoding='utf-8') as f:
    f.write(tex_output)


# Regression tests to see which model metrics associate with screenshot outcomes
def agg_metric(metric_dict, model_key, agg='mean', flat=False, nan_on_empty=True):
    data = metric_dict.get(model_key, [])
    if not data:
        return np.nan if nan_on_empty else 0.0
    if flat:
        data = [item for sub in data for item in (sub if isinstance(sub, list) else [sub])]
        if len(data) == 0:
            return np.nan if nan_on_empty else 0.0
    if agg == 'sum':
        return float(np.sum(data))
    return float(np.mean(data))


regression_rows = []
for model_key in model_usage_costs.keys():
    regression_rows.append({
        'model': model_key,
        'max_prompt': agg_metric(model_max_prompts, model_key, flat=True),
        'usage_cost': agg_metric(model_usage_costs, model_key),
        'total_tokens': agg_metric(model_usage_total_tokens, model_key),
        'reasoning_tokens': agg_metric(model_usage_reasoning_tokens, model_key),
        'duration': agg_metric(model_metadata_durations, model_key),
        'tools': agg_metric(model_metadata_tools, model_key),
        'screenshot_similarity': agg_metric(model_screenshot_similarities, model_key),
        'screenshot_count': agg_metric(model_has_screenshots, model_key, agg='sum'),
    })

df_reg = pd.DataFrame(regression_rows)
predictors = ['usage_cost', 'total_tokens', 'reasoning_tokens', 'duration', 'tools', 'max_prompt']

df_sim = df_reg.dropna(subset=['screenshot_similarity'])
if len(df_sim) > 0:
    sim_results = pg.linear_regression(df_sim[predictors], df_sim['screenshot_similarity'], add_intercept=True)
    sim_results = sim_results[1:]
    print("Regression: predictors -> screenshot_similarity")
    print(sim_results)
    plt.figure(figsize=(10, 5))
    plt.bar(sim_results['names'], sim_results['coef'], yerr=sim_results['se'], capsize=4, color='slateblue')
    plt.xticks(rotation=45, ha='right')
    plt.ylabel('Coefficient')
    plt.title('Regression coefficients: predictors → screenshot_similarity')
    plt.tight_layout()
    plt.savefig('plots/regression_screenshot_similarity.png', dpi=300, bbox_inches='tight')
    print("Chart saved as plots/regression_screenshot_similarity.png")
else:
    print("Regression skipped: no screenshot similarity data available.")

df_count = df_reg.dropna(subset=['screenshot_count'])
if len(df_count) > 0:
    count_results = pg.linear_regression(df_count[predictors], df_count['screenshot_count'], add_intercept=True)
    print("Regression: predictors -> screenshot_count")
    print(count_results)
    plt.figure(figsize=(10, 5))
    plt.bar(count_results['names'], count_results['coef'], yerr=count_results['se'], capsize=4, color='seagreen')
    plt.xticks(rotation=45, ha='right')
    plt.ylabel('Coefficient')
    plt.title('Regression coefficients: predictors → screenshot_count')
    plt.tight_layout()
    plt.savefig('plots/regression_screenshot_count.png', dpi=300, bbox_inches='tight')
    print("Chart saved as plots/regression_screenshot_count.png")
else:
    print("Regression skipped: no screenshot count data available.")


# Univariate R2 comparison for each predictor across both outcomes
r2_labels = []
r2_sim_values = []
r2_count_values = []
for pred in predictors:
    r2_labels.append(pred)
    if len(df_sim) > 0:
        sim_uni = pg.linear_regression(df_sim[[pred]], df_sim['screenshot_similarity'], add_intercept=True)
        r2_sim_values.append(float(sim_uni['r2'].iloc[-1]))
    else:
        r2_sim_values.append(np.nan)
    if len(df_count) > 0:
        count_uni = pg.linear_regression(df_count[[pred]], df_count['screenshot_count'], add_intercept=True)
        r2_count_values.append(float(count_uni['r2'].iloc[-1]))
    else:
        r2_count_values.append(np.nan)

if r2_labels:
    x = np.arange(len(r2_labels))
    width = 0.4
    fig, ax = plt.subplots(figsize=(10, 5))
    ax.bar(x - width/2, r2_sim_values, width, label='Screenshot Similarity R2', color='steelblue')
    ax.bar(x + width/2, r2_count_values, width, label='Screenshot Count R2', color='darkorange')
    ax.set_xticks(x)
    ax.set_xticklabels(r2_labels, rotation=45, ha='right')
    ax.set_ylabel('R2')
    ax.set_title('Univariate R2 by Predictor')
    ax.legend()
    plt.tight_layout()
    plt.savefig('plots/regression_r2_comparison.png', dpi=300, bbox_inches='tight')
    print("Chart saved as plots/regression_r2_comparison.png")


# LaTeX tables for regression results (two significant digits)
def fmt_sig2(val):
    try:
        return f"{float(val):.2g}"
    except (TypeError, ValueError):
        return "N/A"


def regression_latex(df, table_title):
    rows = []
    for _, row in df.iterrows():
        rows.append(
            f"{row['names']} & {fmt_sig2(row['coef'])} & {fmt_sig2(row['se'])} & {fmt_sig2(row['T'])} & {fmt_sig2(row['r2'])} \\\\"
        )
    body = "\n".join(rows)
    return (
        "\\begin{table}[h]\n"
        "\\centering\n"
        "\\begin{tabular}{lrrrr}\n"
        "\\hline\n"
        "Name & Coef & SE & T & R2 \\\\ \n"
        "\\hline\n"
        f"{body}\n"
        "\\hline\n"
        "\\end{tabular}\n"
        f"\\caption{{{table_title}}}\n"
        "\\end{table}\n"
    )


reg_tables = []
if len(df_sim) > 0:
    reg_tables.append("% Regression: predictors -> screenshot_similarity\n" + regression_latex(sim_results[['names', 'coef', 'se', 'T', 'r2']], "screenshot_similarity"))
if len(df_count) > 0:
    reg_tables.append("% Regression: predictors -> screenshot_count\n" + regression_latex(count_results[['names', 'coef', 'se', 'T', 'r2']], "screenshot_count"))

if reg_tables:
    regression_tex = "\n\n" + "\n\n".join(reg_tables)
    reg_tex_path = './regression_tables.tex'
    with open(reg_tex_path, 'w', encoding='utf-8') as f:
        f.write(regression_tex)
    print("Regression LaTeX tables written to regression_tables.tex")