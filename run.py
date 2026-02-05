import os
import subprocess
import re

CODEBASES_DIR = 'codebases'
LOG_FILE = 'npm_audit_log.txt'


def run_npm_commands():
    with open(LOG_FILE, 'w') as log:
        for model_type in os.listdir(CODEBASES_DIR):
            type_path = os.path.join(CODEBASES_DIR, model_type)
            if not os.path.isdir(type_path):
                continue
            for model_name in os.listdir(type_path):
                name_path = os.path.join(type_path, model_name)
                if not os.path.isdir(name_path):
                    continue
                for prompt_number in os.listdir(name_path):
                    prompt_path = os.path.join(name_path, prompt_number)
                    if not os.path.isdir(prompt_path):
                        continue
                    log.write(f'Checking: {prompt_path}\n')
                    print(f'Checking: {prompt_path}')
                    # Run npm install
                    try:
                        install_proc = subprocess.run(['npm', 'install'], cwd=prompt_path, capture_output=True, text=True, timeout=300)
                        install_out = install_proc.stdout + install_proc.stderr
                    except Exception as e:
                        log.write(f'  npm install failed: {e}\n')
                        continue
                    # Run npm audit --json
                    try:
                        audit_proc = subprocess.run(['npm', 'audit', '--json'], cwd=prompt_path, capture_output=True, text=True, timeout=120)
                        audit_json = audit_proc.stdout
                        # Parse vulnerabilities
                        match = re.search(r'"vulnerabilities":\s*\{(.+?)\}', audit_json, re.DOTALL)
                        if match:
                            vuln_counts = {'low': 0, 'moderate': 0, 'high': 0, 'critical': 0}
                            for sev in vuln_counts:
                                sev_match = re.findall(rf'"severity":\s*"{sev}"', match.group(1))
                                vuln_counts[sev] = len(sev_match)
                            total = sum(vuln_counts.values())
                            vuln_str = f"{total} vulnerabilities (" + ', '.join(f"{v} {k}" for k, v in vuln_counts.items() if v > 0) + ")"
                        else:
                            vuln_str = "No vulnerabilities found"
                    except Exception as e:
                        vuln_str = f'npm audit failed: {e}'
                    log.write(f'  npm audit: {vuln_str}\n')
                    print(f'  npm audit: {vuln_str}')

if __name__ == '__main__':
    run_npm_commands()
