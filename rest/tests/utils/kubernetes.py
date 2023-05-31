import subprocess
import time


def wait_kubernetes_migration_job():
    get_success_pods_command = "kubectl get pods --field-selector=status.phase=Succeeded"
    process_output = subprocess.check_output(get_success_pods_command, shell=True)
    process_output = process_output.decode("utf-8")

    while not process_output or "no resources found in default namespace" in process_output.lower():
        print('Waiting for migration job to finish...')
        process_output = subprocess.check_output(get_success_pods_command, shell=True)
        process_output = process_output.decode("utf-8")
        time.sleep(5)

    print('Migration job finished successfully!')


if __name__ == "__main__":
    wait_kubernetes_migration_job()
