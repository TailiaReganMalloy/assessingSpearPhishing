import os
import json
import subprocess
from pathlib import Path
from typing import Dict, List, Tuple
import pandas as pd
from datetime import datetime
import signal


def kill_port_3000():
    """
    Kills any process running on port 3000.
    """
    try:
        # Use lsof to find process on port 3000
        result = subprocess.run(
            ["lsof", "-i", ":3000"],
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0 and result.stdout.strip():
            # Extract PID from lsof output (second column, skip header)
            lines = result.stdout.strip().split('\n')
            if len(lines) > 1:
                pid = lines[1].split()[1]
                try:
                    os.kill(int(pid), signal.SIGKILL)
                    print(f"  Killed process {pid} on port 3000")
                except (ValueError, ProcessLookupError):
                    pass
    except Exception as e:
        # Silently fail if lsof is not available or other error occurs
        pass


def test_run(codebases_dir: str = "../codebases", install_dependencies: int = 0) -> Dict[str, Dict[str, Tuple[bool, str]]]:
    """
    Iterates through all folders in the codebases folder to find package.json files,
    extracts npm scripts, and tests whether those scripts run without error.
    
    Args:
        codebases_dir: Path to the codebases directory (default: "../codebases")
        install_dependencies: Whether to run npm install first (default: 0/False)
    
    Returns:
        Dictionary mapping package.json paths to their script results.
        Format: {
            "path/to/package.json": {
                "script_name": (success: bool, output: str),
                ...
            }
        }
    """
    # Get absolute path to codebases directory
    script_dir = Path(__file__).parent
    codebases_path = (script_dir / codebases_dir).resolve()
    
    if not codebases_path.exists():
        raise FileNotFoundError(f"Codebases directory not found: {codebases_path}")
    
    # Kill any process on port 3000 before starting tests
    print("Clearing port 3000...")
    kill_port_3000()
    
    results = {}
    
    # Only look two layers deep: codebases/*/*/package.json
    # Iterate through provider folders (e.g., Claude, Gemini)
    for provider_dir in codebases_path.iterdir():
        if not provider_dir.is_dir():
            continue
        
        # Iterate through model folders (e.g., Haiku-4.5, 2.5-Flash)
        for model_dir in provider_dir.iterdir():
            if not model_dir.is_dir():
                continue
            
            package_json_path = model_dir / "package.json"
            
            # Check if package.json exists in this model directory
            if not package_json_path.exists():
                continue
            
            try:
                # Read and parse package.json
                with open(package_json_path, 'r', encoding='utf-8') as f:
                    package_data = json.load(f)
                
                # Get scripts section
                scripts = package_data.get("scripts", {})
                
                if not scripts:
                    print(f"No scripts found in {package_json_path.relative_to(codebases_path)}")
                    continue
                
                print(f"\nTesting scripts in {package_json_path.relative_to(codebases_path)}")
                
                # Run npm install first if requested
                if install_dependencies:
                    print(f"  Installing dependencies...")
                    try:
                        install_result = subprocess.run(
                            ["npm", "install"],
                            cwd=model_dir,
                            capture_output=True,
                            text=True,
                            timeout=120  # 2 minute timeout for npm install
                        )
                        
                        if install_result.returncode != 0:
                            print(f"    ✗ npm install failed")
                            results[str(package_json_path.relative_to(codebases_path))] = {
                                "npm_install": (False, install_result.stdout + install_result.stderr)
                            }
                            continue
                        else:
                            print(f"    ✓ Dependencies installed")
                            
                    except subprocess.TimeoutExpired:
                        print(f"    ✗ npm install timed out")
                        results[str(package_json_path.relative_to(codebases_path))] = {
                            "npm_install": (False, "npm install timed out after 120 seconds")
                        }
                        continue
                        
                    except Exception as e:
                        print(f"    ✗ npm install error: {e}")
                        results[str(package_json_path.relative_to(codebases_path))] = {
                            "npm_install": (False, f"Error: {str(e)}")
                        }
                        continue
                
                script_results = {}
                
                # Test each script
                for script_name, script_command in scripts.items():
                    print(f"  Running: npm run {script_name}")
                    
                    try:
                        # Run the npm script
                        result = subprocess.run(
                            ["npm", "run", script_name],
                            cwd=model_dir,
                            capture_output=True,
                            text=True,
                            timeout=30  # 30 second timeout
                        )
                        
                        success = result.returncode == 0
                        output = result.stdout + result.stderr
                        
                        script_results[script_name] = (success, output)
                        
                        if success:
                            print(f"    ✓ Success")
                        else:
                            print(f"    ✗ Failed (exit code: {result.returncode})")
                            
                    except subprocess.TimeoutExpired:
                        script_results[script_name] = (False, "Script timed out after 30 seconds")
                        print(f"    ✗ Timeout")
                        
                    except Exception as e:
                        script_results[script_name] = (False, f"Error: {str(e)}")
                        print(f"    ✗ Error: {e}")
                    
                    # Kill any processes on port 3000 after each script
                    kill_port_3000()
                
                results[str(package_json_path.relative_to(codebases_path))] = script_results
                
            except json.JSONDecodeError as e:
                print(f"Error parsing {package_json_path}: {e}")
                results[str(package_json_path.relative_to(codebases_path))] = {
                    "error": (False, f"JSON decode error: {str(e)}")
                }
                
            except Exception as e:
                print(f"Error processing {package_json_path}: {e}")
                results[str(package_json_path.relative_to(codebases_path))] = {
                    "error": (False, f"Processing error: {str(e)}")
                }
    
    # Final cleanup: kill any remaining processes on port 3000
    print("\nCleaning up port 3000...")
    kill_port_3000()
    
    return results


def results_to_dataframe(results: Dict[str, Dict[str, Tuple[bool, str]]]) -> pd.DataFrame:
    """
    Converts test results to a pandas DataFrame.
    
    Args:
        results: Dictionary of test results from test_run()
    
    Returns:
        DataFrame with columns: provider, model, script_name, success, error_message
    """
    rows = []
    
    for package_path, scripts in results.items():
        # Parse path like "Claude/Haiku-4.5/package.json"
        parts = package_path.replace("/package.json", "").split("/")
        provider = parts[0] if len(parts) > 0 else "unknown"
        model = parts[1] if len(parts) > 1 else "unknown"
        
        for script_name, (success, output) in scripts.items():
            # Extract error message (first few lines if failed)
            error_message = ""
            if not success:
                error_lines = output.split('\n')[:3]
                error_message = " ".join([line.strip() for line in error_lines if line.strip()])
            
            rows.append({
                "provider": provider,
                "model": model,
                "script_name": script_name,
                "success": success,
                "error_message": error_message
            })
    
    return pd.DataFrame(rows)


def save_results(results: Dict[str, Dict[str, Tuple[bool, str]]], output_dir: str = None) -> str:
    """
    Saves test results to a CSV file in the analysis folder.
    
    Args:
        results: Dictionary of test results from test_run()
        output_dir: Directory to save results (default: same directory as script)
    
    Returns:
        Path to the saved CSV file
    """
    df = results_to_dataframe(results)
    
    if output_dir is None:
        output_dir = Path(__file__).parent
    else:
        output_dir = Path(output_dir)
    
    # Create filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = output_dir / f"npm_test_results_{timestamp}.csv"
    
    df.to_csv(output_file, index=False)
    print(f"\nResults saved to: {output_file}")
    
    return str(output_file)


def print_summary(results: Dict[str, Dict[str, Tuple[bool, str]]]) -> None:
    """
    Prints a summary of the test results.
    
    Args:
        results: Dictionary of test results from test_run()
    """
    total_packages = len(results)
    total_scripts = sum(len(scripts) for scripts in results.values())
    successful_scripts = sum(
        sum(1 for success, _ in scripts.values() if success)
        for scripts in results.values()
    )
    
    print("\n" + "="*80)
    print("SUMMARY")
    print("="*80)
    print(f"Total package.json files: {total_packages}")
    print(f"Total scripts tested: {total_scripts}")
    print(f"Successful: {successful_scripts}")
    print(f"Failed: {total_scripts - successful_scripts}")
    print("="*80)
    
    # Print failed scripts
    failed_scripts = []
    for package_path, scripts in results.items():
        for script_name, (success, output) in scripts.items():
            if not success:
                failed_scripts.append((package_path, script_name, output))
    
    if failed_scripts:
        print("\nFailed Scripts:")
        for package_path, script_name, output in failed_scripts:
            print(f"\n  {package_path} - {script_name}")
            # Print first few lines of error output
            error_lines = output.split('\n')[:5]
            for line in error_lines:
                if line.strip():
                    print(f"    {line}")


if __name__ == "__main__":
    print("Starting npm script tests...")
    results = test_run()
    print_summary(results)
    save_results(results)
