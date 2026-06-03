const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, '../src/templates');
const outDir = path.join(__dirname, '../src/components/templates');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const content = fs.readFileSync(path.join(templatesDir, file), 'utf8');
  
  let bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let bodyContent = bodyMatch ? bodyMatch[1] : content;
  
  let jsx = bodyContent
    .replace(/class=/g, 'className=')
    .replace(/for=/g, 'htmlFor=')
    .replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}')
    .replace(/style="([^"]*)"/g, (match, p1) => {
      const styleObj = p1.split(';').filter(Boolean).map(s => {
        const [k, v] = s.split(':').map(x => x.trim());
        if(!k) return '';
        const camelK = k.replace(/-([a-z])/g, g => g[1].toUpperCase());
        return `${camelK}: '${v}'`;
      }).filter(Boolean).join(', ');
      return `style={{ ${styleObj} }}`;
    })
    .replace(/<img([^>]*?)(?<!\/)>/g, '<img$1 />')
    .replace(/<br>/g, '<br />')
    .replace(/<hr>/g, '<hr />')
    .replace(/<input([^>]*?)(?<!\/)>/g, '<input$1 />');

  const componentName = file
    .replace('.html', '')
    .split(/[-_]/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('') + 'Template';

  const reactCode = `
import React from 'react';
import { Invoice } from '@/core/ports/database.types';

interface ${componentName}Props {
  invoice: Invoice;
}

export function ${componentName}({ invoice }: ${componentName}Props) {
  return (
    <div className="invoice-template-container bg-background min-h-screen text-on-surface font-body-md py-8 px-4 md:py-16">
      ${jsx}
    </div>
  );
}
`;

  fs.writeFileSync(path.join(outDir, `${componentName}.tsx`), reactCode);
  console.log(`Converted ${file} to ${componentName}.tsx`);
});
