import json
import os
from pathlib import Path
from collections import defaultdict
import pandas as pd


prompt_columns = ["prompt", "hasSeen", "logCount", "log_ids"]
log_columns = ['requestMessages', 'kind', 'type', 'name', 'metadata', 'id', 'response']

files = [str(p) for p in Path("/Users/tailia.malloy/Documents/Code/assessingSpearPhishing/data").rglob("*.json")]

prompts = pd.DataFrame([], columns=prompt_columns)

log_keys_set = set()
for filepath in files:
    print(filepath)
    with open(filepath, 'r', encoding='utf-8') as file:
        data = json.load(file)
        datum_keys = [key for key in data.keys()]
        if('logs' in datum_keys):
            logs = data['logs']
            log_keys = [log_keys_set.add(key) for key in logs[0].keys()]
                

print(log_keys_set)