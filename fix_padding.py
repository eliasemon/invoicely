import os
import glob
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Remove all occurrences of "min-h-screen py-8 " (with and without trailing space)
    content = content.replace('min-h-screen py-8 ', '')
    content = content.replace('min-h-screen py-8', '')
    
    # We want to add it back ONLY to the very first element after "return ("
    # Let's find "return ("
    match = re.search(r'return\s*\(\s*<[a-zA-Z]+ className="([^"]+)"', content)
    if match:
        old_class = match.group(1)
        new_class = 'min-h-screen py-8 ' + old_class
        content = content[:match.start(1)] + new_class + content[match.end(1):]
    else:
        # Maybe it doesn't have a className immediately, e.g. <React.Fragment> or similar
        # Let's try finding the first <div className="
        match = re.search(r'return\s*\(\s*<div className="([^"]+)"', content)
        if match:
            old_class = match.group(1)
            new_class = 'min-h-screen py-8 ' + old_class
            content = content[:match.start(1)] + new_class + content[match.end(1):]
        else:
            print(f"Could not find outer div for {filepath}")

    with open(filepath, 'w') as f:
        f.write(content)
    print(f"Fixed {filepath}")

for file in glob.glob('/Users/eliasemon/personal-projects/invoicely/invoicely-app/src/components/templates/*Template.tsx'):
    process_file(file)

# For InvoiceTemplateRenderer, we just remove it completely.
renderer_path = '/Users/eliasemon/personal-projects/invoicely/invoicely-app/src/components/templates/InvoiceTemplateRenderer.tsx'
with open(renderer_path, 'r') as f:
    content = f.read()
content = content.replace('min-h-screen py-8 ', '')
content = content.replace('min-h-screen py-8', '')
with open(renderer_path, 'w') as f:
    f.write(content)
print("Fixed InvoiceTemplateRenderer.tsx")
