# Prompt Dataset

This directory contains datasets of prompts used to test language models for generating spear phishing training emails.

## Files

### prompts.json

A curated collection of prompts designed to test LLM capabilities in generating realistic spear phishing scenarios for security awareness training.

#### Structure

Each prompt in the dataset contains:

- `id`: Unique identifier for the prompt
- `category`: Type of phishing attack being simulated
- `prompt`: The actual prompt text to send to the model
- `target_audience`: Intended recipient group
- `difficulty`: Estimated difficulty level (easy, medium, hard)

#### Categories

The dataset includes various phishing attack categories:

- **urgent_action**: Tactics that create artificial urgency
- **authority_impersonation**: Impersonating executives or authority figures
- **social_engineering**: Exploiting social relationships and trust
- **fake_invoice**: Fraudulent payment or invoice requests
- **security_alert**: Fake security warnings or alerts
- **document_sharing**: Malicious file sharing attempts
- **hr_communication**: Impersonating HR communications
- **package_delivery**: Fake delivery notifications
- **meeting_invitation**: Malicious meeting invitations
- **job_opportunity**: Fraudulent recruitment lures

#### Usage

The prompts are loaded by `test_model.py` and used to test language models:

```python
import json

with open('data/prompts.json', 'r') as f:
    prompts = json.load(f)

for prompt in prompts:
    print(f"Testing: {prompt['category']}")
    # Use prompt['prompt'] to test your model
```

#### Extending the Dataset

To add new prompts, follow the existing JSON structure:

```json
{
  "id": "prompt_XXX",
  "category": "category_name",
  "prompt": "Your prompt text here...",
  "target_audience": "target_group",
  "difficulty": "easy|medium|hard"
}
```

Ensure the JSON remains valid after modifications.
