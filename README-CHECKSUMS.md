# DGelectron Dependencies Checksum Generator

Python script untuk generate dan manage file checksums menggunakan JSON format. Ini menyediakan cara praktis dan aman untuk tracking file updates dan verifikasi integritas.

## Features

- ✓ Generate SHA-256 checksums untuk semua file di directory
- ✓ Menyimpan metadata (size, modified time) dalam JSON
- ✓ Compare checksums antara versi lama dan baru
- ✓ Verify file integrity
- ✓ Update mode dengan detection perubahan
- ✓ Human-readable output dengan progress indicator
- ✓ Exclude patterns untuk filter file yang tidak perlu

## Instalasi

Script ini menggunakan Python standard library saja, tidak perlu dependencies tambahan.

Requirements:
- Python 3.6+

## Usage

### 1. Generate Checksums (Basic)

Generate checksums untuk current directory:

```bash
python generate_checksums.py
```

Output: `checksums.json`

### 2. Generate untuk Directory Tertentu

```bash
python generate_checksums.py --directory ext/bin
```

atau

```bash
python generate_checksums.py -d ext/bin
```

### 3. Custom Output File

```bash
python generate_checksums.py --output my-checksums.json
```

atau

```bash
python generate_checksums.py -o my-checksums.json
```

### 4. Update Existing Checksums

Update checksums dan lihat perubahan:

```bash
python generate_checksums.py --update
```

atau

```bash
python generate_checksums.py -u
```

Output akan menampilkan:
- File yang ditambahkan (added)
- File yang dihapus (removed)
- File yang dimodifikasi (modified)
- File yang tidak berubah (unchanged)

### 5. Verify File Integrity

Verify semua file terhadap checksums yang tersimpan:

```bash
python generate_checksums.py --verify
```

atau

```bash
python generate_checksums.py -v
```

Script akan:
- Check setiap file apakah masih ada
- Compute hash dan compare dengan yang tersimpan
- Report file yang missing atau mismatch

### 6. Compare Two Checksum Files

Compare dua file checksums (misalnya versi lama vs baru):

```bash
python generate_checksums.py --compare old-checksums.json new-checksums.json
```

atau

```bash
python generate_checksums.py -c old-checksums.json new-checksums.json
```

### 7. Exclude Patterns

Tambahkan pattern untuk exclude file tertentu:

```bash
python generate_checksums.py --exclude "*.bak" "*.tmp" "test_*"
```

atau

```bash
python generate_checksums.py -e "*.bak" "*.tmp"
```

Default exclusions (sudah built-in):
- `*.json` - JSON files
- `*.py` - Python scripts
- `*.pyc` - Python bytecode
- `__pycache__` - Python cache
- `.git` - Git directory
- `.gitignore`
- `node_modules`
- `*.log`
- `*.tmp`

## Output Format (JSON)

```json
{
  "metadata": {
    "generated": "2025-11-12T10:30:00.123456",
    "base_directory": "C:\\Users\\..\\Project\\Dependencies",
    "total_files": 42,
    "generator": "DGelectron Checksum Generator v1.0"
  },
  "files": {
    "ext/bin/tool.exe": {
      "sha256": "a1b2c3d4e5f6...",
      "size": 1048576,
      "modified": "2025-11-10T15:30:00",
      "size_human": "1.00 MB"
    },
    "ext/data/config.dat": {
      "sha256": "f6e5d4c3b2a1...",
      "size": 2048,
      "modified": "2025-11-11T09:15:00",
      "size_human": "2.00 KB"
    }
  }
}
```

## Use Cases

### 1. Track Dependencies Updates

Generate checksums setiap kali update dependencies:

```bash
# First time
python generate_checksums.py -d ext -o ext-checksums.json

# After update
python generate_checksums.py -d ext -o ext-checksums-new.json

# Compare
python generate_checksums.py --compare ext-checksums.json ext-checksums-new.json
```

### 2. Verify Installation Integrity

Setelah deploy/install, verify bahwa semua file intact:

```bash
python generate_checksums.py --verify
```

### 3. CI/CD Integration

Dalam pipeline CI/CD:

```bash
# Generate checksums setelah build
python generate_checksums.py -d build/output -o build-checksums.json

# Verify sebelum deploy
python generate_checksums.py -d build/output -o build-checksums.json --verify
```

### 4. Monitor File Changes

Track perubahan file secara berkala:

```bash
# Update dan lihat apa yang berubah
python generate_checksums.py --update
```

## Integration dengan DGelectron

Script ini bisa diintegrasikan dengan `steam-helper.ts` untuk:

1. **Generate checksums untuk resources**:
   ```bash
   python generate_checksums.py -d ../resources -o resources-checksums.json
   ```

2. **Verify hid.dll integrity** (alternative untuk hardcoded hash):
   ```json
   {
     "files": {
       "hid.dll": {
         "sha256": "abc123...",
         "size": 12345
       }
     }
   }
   ```

3. **Track dependencies updates**:
   ```bash
   python generate_checksums.py -d . -o dependencies-checksums.json --update
   ```

## Advanced Examples

### Generate checksums untuk multiple directories

```bash
# Directory ext/bin
python generate_checksums.py -d ext/bin -o checksums-bin.json

# Directory ext/data
python generate_checksums.py -d ext/data -o checksums-data.json
```

### Automated verification script

Create `verify-all.bat` (Windows):
```batch
@echo off
python generate_checksums.py -d ext/bin -o checksums-bin.json --verify
if %ERRORLEVEL% NEQ 0 (
    echo Verification failed for ext/bin
    exit /b 1
)

python generate_checksums.py -d ext/data -o checksums-data.json --verify
if %ERRORLEVEL% NEQ 0 (
    echo Verification failed for ext/data
    exit /b 1
)

echo All verifications passed!
```

### Pre-commit hook untuk track changes

Create `.git/hooks/pre-commit`:
```bash
#!/bin/bash
python generate_checksums.py --update
git add checksums.json
```

## Error Handling

Script akan:
- Return exit code 0 jika sukses
- Return exit code 1 jika ada error atau verification failed
- Print error messages ke stderr
- Continue processing meskipun ada file yang gagal di-hash

## Performance

- Efficient untuk large files (reads in 4KB chunks)
- Fast untuk banyak files (async-friendly design)
- Memory efficient (tidak load entire file ke memory)

## Security Notes

- SHA-256 adalah cryptographically secure hash function
- Cocok untuk integrity verification
- Tidak untuk password hashing (use bcrypt/argon2 instead)
- JSON format mudah di-parse tapi tetap human-readable

## Troubleshooting

### "Permission denied" error

Run dengan elevated permissions atau pastikan file readable:
```bash
# Windows
python generate_checksums.py --exclude "*.sys" "*.dll"
```

### Large number of files

Gunakan exclude patterns untuk filter:
```bash
python generate_checksums.py --exclude "node_modules" "*.log" "__pycache__"
```

### JSON too large

Split ke multiple files per directory:
```bash
python generate_checksums.py -d ext/bin -o checksums-bin.json
python generate_checksums.py -d ext/data -o checksums-data.json
```

## License

Part of DGelectron project.
