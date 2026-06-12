import os
import re
import glob

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content

    # Specific common pairs where mobile overrides
    pairs = [
        (r'\bflex-col\s+(?:sm|md|lg):flex-row\b', 'flex-row'),
        (r'\bw-full\s+(?:sm|md|lg):w-([a-zA-Z0-9_/-]+)\b', r'w-\1'),
        (r'\btext-left\s+(?:sm|md|lg):text-right\b', 'text-right'),
        (r'\btext-center\s+(?:sm|md|lg):text-right\b', 'text-right'),
        (r'\bjustify-start\s+(?:sm|md|lg):justify-end\b', 'justify-end'),
        (r'\bitems-start\s+(?:sm|md|lg):items-center\b', 'items-center'),
        (r'\bitems-start\s+(?:sm|md|lg):items-end\b', 'items-end'),
        (r'\bhidden\s+(?:sm|md|lg):block\b', 'block'),
        (r'\bhidden\s+(?:sm|md|lg):flex\b', 'flex'),
        (r'\bgrid-cols-1\s+(?:sm|md|lg):grid-cols-([0-9]+)\b', r'grid-cols-\1'),
        (r'\bp-4\s+(?:sm|md|lg):p-6\b', 'p-6'),
        (r'\bp-6\s+(?:sm|md|lg):p-8\b', 'p-8'),
        (r'\bmb-2\s+(?:sm|md|lg):mb-0\b', 'mb-0'),
        (r'\bmb-4\s+(?:sm|md|lg):mb-0\b', 'mb-0'),
        (r'\bpb-20\s+(?:sm|md|lg):pb-0\b', 'pb-0'),
        (r'\bmt-4\s+(?:sm|md|lg):mt-0\b', 'mt-0'),
        (r'\btext-sm\s+(?:sm|md|lg):text-base\b', 'text-base'),
        (r'\btext-2xl\s+(?:sm|md|lg):text-\[32px\]\b', 'text-[32px]'),
        (r'\btext-3xl\s+(?:sm|md|lg):text-\[40px\]\b', 'text-[40px]'),
        (r'\bh-full\s+(?:sm|md|lg):h-\[90vh\]\b', 'h-[90vh]'),
        (r'\bmax-w-full\s+(?:sm|md|lg):max-w-5xl\b', 'max-w-5xl'),
        # specific 3-chain
        (r'\bw-1/2\s+(?:sm|md|lg):w-1/3\b', 'w-1/3'),
        (r'\bgap-2\s+(?:sm|md|lg):gap-3\b', 'gap-3'),
        (r'\bgap-0\s+(?:sm|md|lg):gap-4\b', 'gap-4'),
        (r'\bp-6\s+(?:sm|md|lg):p-12\b', 'p-12'),
        (r'\bright-6\s+(?:sm|md|lg):right-12\b', 'right-12'),
    ]

    for pattern, repl in pairs:
        content = re.sub(pattern, repl, content)

    # Any remaining standalone responsive classes (just remove the prefix)
    content = re.sub(r'\b(?:sm|md|lg):([a-zA-Z0-9_/-]+)', r'\1', content)

    if original != content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

for file in glob.glob('/Users/eliasemon/personal-projects/invoicely/invoicely-app/src/components/templates/*.tsx'):
    process_file(file)
