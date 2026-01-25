import pandas as pd
import matplotlib.pyplot as plt

chats = pd.read_pickle("../data/chats.pkl")
prompts = pd.read_pickle("../data/prompts.pkl")
logs = pd.read_pickle("../data/logs.pkl")
metadata = pd.read_pickle("../data/metadata.pkl")
requestMessages_ = pd.read_pickle("../data/requestMessages.pkl")
responsesMessages = pd.read_pickle("../data/responsesMessages.pkl")

# Combine Claude Opus models
print(metadata['model'].unique())

# Calculate total cost per model
model_costs = {}

print(metadata[metadata['model'] == 'claude-haiku-4.5']['path'].unique())

assert(False)

analyzed_models = ['models/gemini-2.5-flash', 'google/gemini-2.5-flash-lite',
 'claude-haiku-4.5', 'gemini-3-pro-preview', 
 'gemini-3-flash-preview', 'gemini-2.5-pro', 'gpt-5.2-codex',
 'gpt-5-codex', 'gpt-5.1-codex', 'gpt-4o', 'gpt-5',
 'claude-sonnet-4', 'claude-opus-4-5',
 'claude-sonnet-4.5', 'amazon/nova-micro-v1', 'amazon/nova-pro-v1',
 'qwen/qwen3-vl-235b-a22b-thinking', 'qwen/qwen3-vl-235b-a22b-instruct',
 'qwen/qwen3-coder-flash', 'qwen/qwen3-vl-30b-a3b-thinking',
 'qwen/qwen3-vl-30b-a3b-instruct', 'qwen/qwen3-vl-8b-instruct',
 'qwen/qwen3-coder-plus', 'x-ai/grok-4-fast', 'x-ai/grok-4.1-fast',
 'grok-code-fast-1', 'x-ai/grok-code-fast-1', 'x-ai/grok-4', 'x-ai/grok-3',
 'mistralai/mistral-large-2512', 'mistralai/mistral-small-3.2-24b-instruct',
 'mistralai/mistral-medium-3.1', 'mistralai/mistral-small-3.1-24b-instruct',
 'mistralai/ministral-14b-2512', 'mistralai/mistral-medium-3',
 'meta-llama/llama-3.3-70b-instruct', 'meta-llama/llama-3.1-70b-instruct',
 'meta-llama/llama-3.1-8b-instruct', 'meta-llama/llama-4-scout',
 'meta-llama/llama-4-maverick']

print(metadata['model'].unique())

# Filter to only analyzed models
analyzed_metadata = metadata[metadata['model'].isin(analyzed_models)]

# Count unique folders per model
folder_counts = analyzed_metadata.groupby('model')['path'].nunique()

# Create bar chart
fig, ax = plt.subplots(figsize=(14, 6))
folder_counts.plot(kind='bar', ax=ax, color='steelblue')
ax.set_xlabel('Model', fontsize=12)
ax.set_ylabel('Number of Folders', fontsize=12)
ax.set_title('Unique Folders per Analyzed Model', fontsize=14, fontweight='bold')
plt.xticks(rotation=45, ha='right')
plt.tight_layout()
plt.savefig('model_folders.png', dpi=300, bbox_inches='tight')
plt.show()

print(f"Total analyzed models: {len(analyzed_metadata)}")
print(f"Unique models with data: {len(folder_counts)}")

assert(False)

for model in metadata['model'].unique():
    modelMetadata = metadata[metadata['model'] == model]
    total_cost = 0
    
    for metadatum in modelMetadata['usage']:
        if isinstance(metadatum, dict) and 'cost' in metadatum:
            total_cost += metadatum['cost']
    
    model_costs[model] = total_cost

# Create bar chart
fig, ax = plt.subplots(figsize=(12, 6))
models = list(model_costs.keys())
costs = list(model_costs.values())

ax.bar(models, costs, color='steelblue')
ax.set_xlabel('Model', fontsize=12)
ax.set_ylabel('Total Cost ($)', fontsize=12)
ax.set_title('Total Usage Cost by Model', fontsize=14, fontweight='bold')

# Slant x-axis labels
plt.xticks(rotation=45, ha='right')

# Adjust layout to prevent label cutoff
plt.tight_layout()

# Save and show
plt.savefig('model_costs.png', dpi=300, bbox_inches='tight')
plt.show()

print("Chart saved as model_costs.png")