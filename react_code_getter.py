import os
from datetime import datetime

def create_react_master_file(root_dir, output_file="react_master_code_file.txt"):
    """
    Recursively reads all files in a React.js project directory and creates a master file
    containing all code with file paths.
    
    Args:
        root_dir (str): Root directory of the project
        output_file (str): Name of the output master file
    """
    # List of file extensions to include
    code_extensions = {
        '.js',     # JavaScript files
        '.jsx',    # React JSX files
        '.ts',     # TypeScript files
        '.tsx',    # TypeScript React files
        '.css',    # CSS files
        '.scss',   # SCSS files
        '.less',   # Less files
        '.json',   # JSON files
        '.html',   # HTML files
        '.md',     # Markdown files
        '.env',    # Environment files
    }
    
    # List of directories and files to exclude
    exclude_dirs = {
        'node_modules',
        'build',
        'dist',
        '.git',
        '.idea',
        '.vscode',
        'coverage',
        '.next',
        'out',
        '.cache',
    }

    exclude_files = {
        'package-lock.json',
        '.DS_Store',
        '.env.local',
        '.env.development.local',
        '.env.test.local',
        '.env.production.local'
    }
    
    with open(output_file, 'w', encoding='utf-8') as master_file:
        # Write header with timestamp
        master_file.write(f"React.js Project Code Archive\n")
        master_file.write(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        master_file.write("="*50 + "\n\n")
        
        # Track all files first to organize them by type
        all_files = []
        
        # Walk through directory tree
        for root, dirs, files in os.walk(root_dir):
            # Remove excluded directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                if file in exclude_files:
                    continue
                    
                file_path = os.path.join(root, file)
                _, ext = os.path.splitext(file)
                
                # Skip files that don't have the extensions we're looking for
                if ext not in code_extensions:
                    continue
                
                all_files.append((file_path, ext))
        
        # Sort files by type and write them in organized sections
        file_type_order = [
            ('.jsx', 'React Components'),
            ('.tsx', 'TypeScript React Components'),
            ('.js', 'JavaScript Files'),
            ('.ts', 'TypeScript Files'),
            ('.css', 'CSS Files'),
            ('.scss', 'SCSS Files'),
            ('.less', 'Less Files'),
            ('.json', 'Configuration Files'),
            ('.html', 'HTML Files'),
            ('.md', 'Documentation'),
            ('.env', 'Environment Files')
        ]
        
        for ext, section_name in file_type_order:
            # Filter files for this extension
            section_files = [f for f in all_files if f[1] == ext]
            
            if section_files:
                # Write section header
                master_file.write(f"\n{section_name}\n")
                master_file.write("="*50 + "\n\n")
                
                # Sort files by path
                section_files.sort(key=lambda x: x[0])
                
                # Write each file in the section
                for file_path, _ in section_files:
                    try:
                        with open(file_path, 'r', encoding='utf-8') as code_file:
                            # Write file path header
                            master_file.write(f"FILE: {file_path}\n")
                            master_file.write("-"*50 + "\n\n")
                            
                            # Write file contents
                            master_file.write(code_file.read())
                            master_file.write("\n\n")
                            master_file.write("="*50 + "\n\n")
                    except Exception as e:
                        master_file.write(f"Error reading {file_path}: {str(e)}\n\n")

def get_project_root():
    """
    Find the React project root by looking for package.json
    """
    current_dir = os.getcwd()
    while current_dir != os.path.dirname(current_dir):  # Stop at root directory
        if os.path.exists(os.path.join(current_dir, 'package.json')):
            return current_dir
        current_dir = os.path.dirname(current_dir)
    return os.getcwd()  # Return current directory if package.json not found

if __name__ == "__main__":
    # Get the React project root
    project_root = get_project_root()
    
    try:
        create_react_master_file(project_root)
        print(f"Master code file has been created successfully!")
        print(f"Project root used: {project_root}")
    except Exception as e:
        print(f"An error occurred: {str(e)}")
