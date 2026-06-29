# Python executable
PYTHON = python

# Script
SCRIPT = scripts/process_facilities.py

# Default target
all: extract

# Extract B5 facilities
extract:
	$(PYTHON) $(SCRIPT)

# Remove processed files
clean:
	rm -f data/processed/*.csv

# Re-run everything
rebuild: clean extract

.PHONY: all extract clean rebuild