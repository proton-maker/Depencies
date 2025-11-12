#!/usr/bin/env python3
"""
DGelectron Dependencies Checksum Generator
===========================================

Generate SHA-256 checksums and metadata for dependencies in JSON format.
This provides a secure and practical way to track file updates and verify integrity.

Usage:
    python generate_checksums.py [--directory DIR] [--output FILE] [--update]
    
Examples:
    # Generate checksums for current directory
    python generate_checksums.py
    
    # Generate checksums for specific directory
    python generate_checksums.py --directory ext/bin
    
    # Update existing checksum file
    python generate_checksums.py --update
"""

import argparse
import hashlib
import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional


class ChecksumGenerator:
    """Generate and manage file checksums with metadata."""
    
    def __init__(self, base_dir: Path, exclude_patterns: Optional[List[str]] = None):
        self.base_dir = base_dir.resolve()
        self.exclude_patterns = exclude_patterns or [
            '*.json',           # Exclude JSON files (including checksum files)
            '*.py',             # Exclude Python scripts
            '*.pyc',            # Exclude Python bytecode
            '__pycache__',      # Exclude Python cache
            '.git',             # Exclude git
            '.gitignore',
            'node_modules',
            '*.log',
            '*.tmp',
        ]
    
    def should_exclude(self, file_path: Path) -> bool:
        """Check if file should be excluded based on patterns."""
        import fnmatch
        
        rel_path = str(file_path.relative_to(self.base_dir))
        
        for pattern in self.exclude_patterns:
            if fnmatch.fnmatch(rel_path, pattern) or fnmatch.fnmatch(file_path.name, pattern):
                return True
            # Check if any parent directory matches
            for parent in file_path.parents:
                if fnmatch.fnmatch(parent.name, pattern):
                    return True
        
        return False
    
    def compute_sha256(self, file_path: Path) -> str:
        """Compute SHA-256 hash of a file."""
        sha256_hash = hashlib.sha256()
        
        try:
            with open(file_path, "rb") as f:
                # Read file in chunks to handle large files efficiently
                for chunk in iter(lambda: f.read(4096), b""):
                    sha256_hash.update(chunk)
            return sha256_hash.hexdigest()
        except Exception as e:
            print(f"Error computing hash for {file_path}: {e}", file=sys.stderr)
            return ""
    
    def get_file_metadata(self, file_path: Path) -> Dict:
        """Get file metadata including size and modification time."""
        try:
            stat = file_path.stat()
            return {
                "size": stat.st_size,
                "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                "size_human": self._format_size(stat.st_size),
            }
        except Exception as e:
            print(f"Error getting metadata for {file_path}: {e}", file=sys.stderr)
            return {}
    
    def _format_size(self, size_bytes: int) -> str:
        """Format file size in human-readable format."""
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if size_bytes < 1024.0:
                return f"{size_bytes:.2f} {unit}"
            size_bytes /= 1024.0
        return f"{size_bytes:.2f} PB"
    
    def scan_files(self) -> List[Path]:
        """Scan directory for files to process."""
        files = []
        
        for file_path in self.base_dir.rglob('*'):
            if file_path.is_file() and not self.should_exclude(file_path):
                files.append(file_path)
        
        return sorted(files)
    
    def generate_checksums(self) -> Dict:
        """Generate checksums and metadata for all files."""
        files = self.scan_files()
        
        print(f"Scanning directory: {self.base_dir}")
        print(f"Found {len(files)} files to process")
        print()
        
        checksums = {
            "metadata": {
                "generated": datetime.now().isoformat(),
                "base_directory": str(self.base_dir),
                "total_files": len(files),
                "generator": "DGelectron Checksum Generator v1.0",
            },
            "files": {}
        }
        
        for idx, file_path in enumerate(files, 1):
            rel_path = str(file_path.relative_to(self.base_dir))
            
            print(f"[{idx}/{len(files)}] Processing: {rel_path}")
            
            sha256 = self.compute_sha256(file_path)
            metadata = self.get_file_metadata(file_path)
            
            if sha256:
                checksums["files"][rel_path] = {
                    "sha256": sha256,
                    **metadata
                }
        
        print()
        print(f"✓ Successfully processed {len(checksums['files'])} files")
        
        return checksums
    
    def save_checksums(self, checksums: Dict, output_file: Path):
        """Save checksums to JSON file."""
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(checksums, f, indent=2, ensure_ascii=False)
            
            print(f"✓ Checksums saved to: {output_file}")
            
            # Print summary
            total_size = sum(
                file_info.get('size', 0) 
                for file_info in checksums['files'].values()
            )
            print(f"\nSummary:")
            print(f"  Total files: {checksums['metadata']['total_files']}")
            print(f"  Total size: {self._format_size(total_size)}")
            print(f"  Output file: {output_file}")
            
        except Exception as e:
            print(f"Error saving checksums: {e}", file=sys.stderr)
            sys.exit(1)
    
    def load_checksums(self, input_file: Path) -> Optional[Dict]:
        """Load existing checksums from JSON file."""
        try:
            with open(input_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Checksum file not found: {input_file}", file=sys.stderr)
            return None
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON: {e}", file=sys.stderr)
            return None
    
    def compare_checksums(self, old_checksums: Dict, new_checksums: Dict) -> Dict:
        """Compare two checksum sets and report differences."""
        old_files = set(old_checksums.get('files', {}).keys())
        new_files = set(new_checksums.get('files', {}).keys())
        
        added = new_files - old_files
        removed = old_files - new_files
        common = old_files & new_files
        
        modified = []
        for file_path in common:
            old_hash = old_checksums['files'][file_path]['sha256']
            new_hash = new_checksums['files'][file_path]['sha256']
            if old_hash != new_hash:
                modified.append(file_path)
        
        return {
            "added": sorted(added),
            "removed": sorted(removed),
            "modified": sorted(modified),
            "unchanged": len(common) - len(modified)
        }
    
    def verify_checksums(self, checksums_file: Path) -> bool:
        """Verify files against stored checksums."""
        checksums = self.load_checksums(checksums_file)
        if not checksums:
            return False
        
        files_data = checksums.get('files', {})
        total = len(files_data)
        verified = 0
        failed = []
        missing = []
        
        print(f"Verifying {total} files...")
        print()
        
        for idx, (rel_path, file_info) in enumerate(files_data.items(), 1):
            file_path = self.base_dir / rel_path
            expected_hash = file_info.get('sha256')
            
            print(f"[{idx}/{total}] Verifying: {rel_path}")
            
            if not file_path.exists():
                print(f"  ✗ Missing")
                missing.append(rel_path)
                continue
            
            actual_hash = self.compute_sha256(file_path)
            
            if actual_hash == expected_hash:
                print(f"  ✓ OK")
                verified += 1
            else:
                print(f"  ✗ MISMATCH")
                print(f"    Expected: {expected_hash}")
                print(f"    Actual:   {actual_hash}")
                failed.append(rel_path)
        
        print()
        print("=" * 60)
        print(f"Verification Results:")
        print(f"  Total files:    {total}")
        print(f"  Verified:       {verified}")
        print(f"  Failed:         {len(failed)}")
        print(f"  Missing:        {len(missing)}")
        print("=" * 60)
        
        if failed:
            print("\nFailed files:")
            for file_path in failed:
                print(f"  - {file_path}")
        
        if missing:
            print("\nMissing files:")
            for file_path in missing:
                print(f"  - {file_path}")
        
        return len(failed) == 0 and len(missing) == 0


def main():
    parser = argparse.ArgumentParser(
        description='Generate SHA-256 checksums for dependencies',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  Generate checksums for current directory:
    python generate_checksums.py
  
  Generate for specific directory:
    python generate_checksums.py --directory ext/bin
  
  Update existing checksums:
    python generate_checksums.py --update
  
  Verify files against checksums:
    python generate_checksums.py --verify
  
  Compare old and new checksums:
    python generate_checksums.py --compare old.json new.json
        """
    )
    
    parser.add_argument(
        '--directory', '-d',
        type=str,
        default='.',
        help='Directory to scan (default: current directory)'
    )
    
    parser.add_argument(
        '--output', '-o',
        type=str,
        default='checksums.json',
        help='Output JSON file (default: checksums.json)'
    )
    
    parser.add_argument(
        '--update', '-u',
        action='store_true',
        help='Update existing checksums file and show differences'
    )
    
    parser.add_argument(
        '--verify', '-v',
        action='store_true',
        help='Verify files against existing checksums'
    )
    
    parser.add_argument(
        '--compare', '-c',
        nargs=2,
        metavar=('OLD', 'NEW'),
        help='Compare two checksum files'
    )
    
    parser.add_argument(
        '--exclude', '-e',
        nargs='+',
        help='Additional patterns to exclude'
    )
    
    args = parser.parse_args()
    
    base_dir = Path(args.directory).resolve()
    output_file = Path(args.output).resolve()
    
    if not base_dir.exists():
        print(f"Error: Directory not found: {base_dir}", file=sys.stderr)
        sys.exit(1)
    
    # Initialize generator
    exclude_patterns = None
    if args.exclude:
        exclude_patterns = args.exclude
    
    generator = ChecksumGenerator(base_dir, exclude_patterns)
    
    # Handle verify mode
    if args.verify:
        if not output_file.exists():
            print(f"Error: Checksum file not found: {output_file}", file=sys.stderr)
            sys.exit(1)
        
        success = generator.verify_checksums(output_file)
        sys.exit(0 if success else 1)
    
    # Handle compare mode
    if args.compare:
        old_file = Path(args.compare[0])
        new_file = Path(args.compare[1])
        
        if not old_file.exists() or not new_file.exists():
            print("Error: One or both comparison files not found", file=sys.stderr)
            sys.exit(1)
        
        old_checksums = generator.load_checksums(old_file)
        new_checksums = generator.load_checksums(new_file)
        
        if not old_checksums or not new_checksums:
            sys.exit(1)
        
        diff = generator.compare_checksums(old_checksums, new_checksums)
        
        print("\nComparison Results:")
        print("=" * 60)
        print(f"Added files:      {len(diff['added'])}")
        print(f"Removed files:    {len(diff['removed'])}")
        print(f"Modified files:   {len(diff['modified'])}")
        print(f"Unchanged files:  {diff['unchanged']}")
        print("=" * 60)
        
        if diff['added']:
            print("\nAdded:")
            for f in diff['added']:
                print(f"  + {f}")
        
        if diff['removed']:
            print("\nRemoved:")
            for f in diff['removed']:
                print(f"  - {f}")
        
        if diff['modified']:
            print("\nModified:")
            for f in diff['modified']:
                print(f"  M {f}")
        
        sys.exit(0)
    
    # Handle update mode
    if args.update and output_file.exists():
        print("Update mode: Comparing with existing checksums...")
        print()
        
        old_checksums = generator.load_checksums(output_file)
        if old_checksums:
            new_checksums = generator.generate_checksums()
            diff = generator.compare_checksums(old_checksums, new_checksums)
            
            print("\nChanges detected:")
            print("=" * 60)
            print(f"Added files:      {len(diff['added'])}")
            print(f"Removed files:    {len(diff['removed'])}")
            print(f"Modified files:   {len(diff['modified'])}")
            print(f"Unchanged files:  {diff['unchanged']}")
            print("=" * 60)
            
            if diff['added']:
                print("\nAdded:")
                for f in diff['added']:
                    print(f"  + {f}")
            
            if diff['removed']:
                print("\nRemoved:")
                for f in diff['removed']:
                    print(f"  - {f}")
            
            if diff['modified']:
                print("\nModified:")
                for f in diff['modified']:
                    print(f"  M {f}")
            
            print()
            generator.save_checksums(new_checksums, output_file)
            sys.exit(0)
    
    # Default: Generate new checksums
    checksums = generator.generate_checksums()
    generator.save_checksums(checksums, output_file)


if __name__ == '__main__':
    main()
