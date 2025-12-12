#!/usr/bin/env python3
"""
Test script for loading language models from Hugging Face and generating
spear phishing training emails based on prompts.

This script allows testing different LLMs for their ability to generate
individualized training content to help people identify spear phishing.
"""

import json
import os
import argparse
from typing import List, Dict
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer


def load_prompts(prompts_file: str = "data/prompts.json") -> List[Dict]:
    """
    Load prompts from JSON file.
    
    Args:
        prompts_file: Path to the prompts JSON file
        
    Returns:
        List of prompt dictionaries
    """
    with open(prompts_file, 'r') as f:
        prompts = json.load(f)
    return prompts


def load_model(model_name: str, device: str = None):
    """
    Load a language model and tokenizer from Hugging Face.
    
    Args:
        model_name: Name of the Hugging Face model to load
        device: Device to load model on ('cuda', 'cpu', or None for auto-detect)
        
    Returns:
        Tuple of (model, tokenizer)
    """
    print(f"Loading model: {model_name}")
    
    # Auto-detect device if not specified
    if device is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"
    
    print(f"Using device: {device}")
    
    # Load tokenizer
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    
    # Load model with appropriate settings
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype=torch.float16 if device == "cuda" else torch.float32,
        device_map="auto" if device == "cuda" else None,
        low_cpu_mem_usage=True
    )
    
    if device == "cpu":
        model = model.to(device)
    
    print(f"Model loaded successfully on {device}")
    return model, tokenizer


def generate_email(model, tokenizer, prompt: str, max_length: int = 512, 
                   temperature: float = 0.7, top_p: float = 0.9) -> str:
    """
    Generate an email response using the loaded model.
    
    Args:
        model: The loaded language model
        tokenizer: The model's tokenizer
        prompt: The input prompt
        max_length: Maximum length of generated text
        temperature: Sampling temperature (higher = more random)
        top_p: Nucleus sampling parameter
        
    Returns:
        Generated email text
    """
    # Encode the input prompt
    inputs = tokenizer(prompt, return_tensors="pt", padding=True)
    
    # Move inputs to the same device as model
    device = next(model.parameters()).device
    inputs = {k: v.to(device) for k, v in inputs.items()}
    
    # Generate response
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_length=max_length,
            temperature=temperature,
            top_p=top_p,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id
        )
    
    # Decode and return the generated text
    generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return generated_text


def test_model_with_prompts(model_name: str, num_prompts: int = 3, 
                           prompts_file: str = "data/prompts.json",
                           output_file: str = None):
    """
    Test a model with multiple prompts and optionally save results.
    
    Args:
        model_name: Name of the Hugging Face model to test
        num_prompts: Number of prompts to test (default: 3)
        prompts_file: Path to the prompts file
        output_file: Optional path to save results (JSON format)
    """
    # Load prompts
    prompts = load_prompts(prompts_file)
    print(f"Loaded {len(prompts)} prompts from {prompts_file}")
    
    # Limit number of prompts to test
    prompts_to_test = prompts[:num_prompts]
    
    # Load model
    model, tokenizer = load_model(model_name)
    
    # Test each prompt
    results = []
    for i, prompt_data in enumerate(prompts_to_test, 1):
        print(f"\n{'='*60}")
        print(f"Testing prompt {i}/{len(prompts_to_test)}")
        print(f"ID: {prompt_data['id']}")
        print(f"Category: {prompt_data['category']}")
        print(f"{'='*60}")
        print(f"Prompt: {prompt_data['prompt']}")
        print(f"\nGenerating email...")
        
        # Generate email
        generated_email = generate_email(model, tokenizer, prompt_data['prompt'])
        
        print(f"\nGenerated Email:")
        print("-" * 60)
        print(generated_email)
        print("-" * 60)
        
        # Store result
        result = {
            "prompt_id": prompt_data['id'],
            "prompt": prompt_data['prompt'],
            "category": prompt_data['category'],
            "generated_email": generated_email,
            "model": model_name
        }
        results.append(result)
    
    # Save results if output file specified
    if output_file:
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2)
        print(f"\nResults saved to {output_file}")
    
    return results


def main():
    """Main function to run the test script."""
    parser = argparse.ArgumentParser(
        description="Test language models for generating spear phishing training emails"
    )
    parser.add_argument(
        "--model",
        type=str,
        required=True,
        help="Hugging Face model name (e.g., 'gpt2', 'facebook/opt-350m')"
    )
    parser.add_argument(
        "--prompts",
        type=str,
        default="data/prompts.json",
        help="Path to prompts JSON file (default: data/prompts.json)"
    )
    parser.add_argument(
        "--num-prompts",
        type=int,
        default=3,
        help="Number of prompts to test (default: 3)"
    )
    parser.add_argument(
        "--output",
        type=str,
        help="Optional output file to save results (JSON format)"
    )
    parser.add_argument(
        "--device",
        type=str,
        choices=["cuda", "cpu", "auto"],
        default="auto",
        help="Device to run model on (default: auto)"
    )
    
    args = parser.parse_args()
    
    # Convert 'auto' to None for auto-detection
    device = None if args.device == "auto" else args.device
    
    # Run tests
    test_model_with_prompts(
        model_name=args.model,
        num_prompts=args.num_prompts,
        prompts_file=args.prompts,
        output_file=args.output
    )


if __name__ == "__main__":
    main()
