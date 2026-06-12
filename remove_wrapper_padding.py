import os
import re
import glob

def process_file(filepath):
    with open(filepath, 'r') as f:
        lines = f.readlines()

    modified = False
    
    for i, line in enumerate(lines):
        # We look for the main container line which contains 'print:w-[210mm]' or 'min-h-screen'
        if 'min-h-screen' in line and 'print:' in line:
            # Remove min-h-screen
            line = re.sub(r'\bmin-h-screen\b', '', line)
            # Remove py-* and px-* on this specific line
            line = re.sub(r'\bpy-[0-9]+\b', '', line)
            line = re.sub(r'\bpx-[0-9]+\b', '', line)
            # Clean up multiple spaces
            line = re.sub(r'\s+', ' ', line)
            line = line.replace('className=" ', 'className="')
            lines[i] = line
            modified = True

    if modified:
        with open(filepath, 'w') as f:
            f.writelines(lines)
        print(f"Updated {filepath}")

for file in glob.glob('/Users/eliasemon/personal-projects/invoicely/invoicely-app/src/components/templates/*.tsx'):
    process_file(file)
