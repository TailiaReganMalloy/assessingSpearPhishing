#!/usr/bin/env python3
"""
Example usage demonstration script.

This script shows how to load prompts and demonstrates the expected
workflow without requiring heavy ML dependencies.
"""

import json


def load_and_display_prompts(prompts_file="data/prompts.json"):
    """Load and display prompts from the dataset."""
    print("Loading prompts from dataset...")
    
    with open(prompts_file, 'r') as f:
        prompts = json.load(f)
    
    print(f"\nFound {len(prompts)} prompts in dataset\n")
    print("=" * 70)
    
    for i, prompt in enumerate(prompts, 1):
        print(f"\nPrompt {i}:")
        print(f"  ID: {prompt['id']}")
        print(f"  Category: {prompt['category']}")
        print(f"  Target Audience: {prompt['target_audience']}")
        print(f"  Difficulty: {prompt['difficulty']}")
        print(f"  Prompt Text: {prompt['prompt']}")
        print("-" * 70)
    
    return prompts


def demonstrate_expected_workflow():
    """Demonstrate the expected workflow for testing models."""
    print("\n" + "=" * 70)
    print("EXPECTED WORKFLOW")
    print("=" * 70)
    print("""
1. Install dependencies:
   pip install -r requirements.txt

2. Run the test script with a model:
   python test_model.py --model gpt2 --num-prompts 3

3. The script will:
   - Load the specified Hugging Face model
   - Read prompts from data/prompts.json
   - Generate email responses for each prompt
   - Display results on screen
   
4. Optionally save results:
   python test_model.py --model gpt2 --num-prompts 5 --output results.json

5. Test different models to compare performance:
   python test_model.py --model facebook/opt-350m --num-prompts 3
   python test_model.py --model gpt2-medium --num-prompts 3
""")


if __name__ == "__main__":
    print("Spear Phishing Assessment - Example Usage")
    print("=" * 70)
    
    # Load and display prompts
    prompts = load_and_display_prompts()
    
    # Show expected workflow
    demonstrate_expected_workflow()
    
    print("\n" + "=" * 70)
    print("Example completed!")
    print("Run 'python test_model.py --help' for full usage options")
    print("(requires dependencies from requirements.txt to be installed)")
    print("=" * 70)
