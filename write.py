import os

# Root directory path
path = "/Users/davisdeaton/Desktop/StyleScout/"

# All paths
all_files = []
for root, dirs, files in os.walk(path):
    for file in files:
        all_files.append(os.path.join(root, file))

# Read .gitignore file
with open(os.path.join(path, ".gitignore"), "r") as f:
    gitignore = f.read().splitlines()

# Filter out ignored files
files = [f for f in all_files if not any(ignored in os.path.relpath(f, path) for ignored in gitignore)]

# Write contents to StyleScout.txt
with open(os.path.join(path, "StyleScout.txt"), "w") as f:
    for file in files:
        with open(file, "r") as file_content:
            # Write relative path instead of absolute path
            relative_path = os.path.relpath(file, path)
            f.write(f"File Path: {relative_path}\n")
            f.write(f"Content:\n{file_content.read()}\n\n")
