import os
import re
import glob

def process_file(filepath):
    with open(filepath, 'r') as f:
        lines = f.readlines()

    modified = False
    
    for i, line in enumerate(lines):
        # We look for the main container line which contains 'print:w-[210mm]'
        if 'print:w-[210mm]' in line and 'className=' in line and 'min-h-screen' not in line:
            # Add min-h-screen and py-8
            line = line.replace('className="', 'className="min-h-screen py-8 ')
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
