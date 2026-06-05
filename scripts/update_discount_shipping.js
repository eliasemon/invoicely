const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, '../src/components/templates');

function processTemplate(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');

    // 1. Update imports
    if (!content.includes('getDiscountAmount')) {
        content = content.replace(
            /(import \{.*getSubtotal)(.*\} from '\.\/templateUtils';)/,
            '$1, getDiscountAmount, getShippingCost, getTotal$2'
        );
    }

    // 2. Add variable declarations
    if (!content.includes('const discountAmount')) {
        content = content.replace(
            /const subtotal = getSubtotal\(invoice\);/,
            "const subtotal = getSubtotal(invoice);\n  const discountAmount = getDiscountAmount(invoice, subtotal);\n  const shippingCost = getShippingCost(invoice);\n  const total = getTotal(invoice);"
        );
    }
    
    // 3. Update balanceDue calculation
    content = content.replace(
        /const balanceDue = Math.max\(0, subtotal - amountPaid\);/,
        "const balanceDue = Math.max(0, total - amountPaid);"
    );

    // 4. Update the "Total Due" or equivalent amount from subtotal to total
    // This is tricky because `formatMoney(subtotal, sym)` might be used for the Subtotal line AND the Total line.
    // Let's replace the one that corresponds to "Total Due" or "Total" or "Balance Due"
    // Actually, balanceDue is used for the due part. The main total is usually `formatMoney(subtotal, sym)`.
    // Let's manually replace the second occurrence if there are two, or just use regex to find the one after "Total Due" or "Total" or "TOTAL"
    
    // We will do this carefully:
    content = content.replace(/(>Total[^<]*<[\s\S]*?\{formatMoney\()subtotal(, sym\)\})/, '$1total$2');
    content = content.replace(/(>TOTAL[^<]*<[\s\S]*?\{formatMoney\()subtotal(, sym\)\})/, '$1total$2');

    // 5. Inject Discount and Shipping lines around the Tax line.
    // Find the wrapper element for Tax.
    // Example: <div className="flex justify-between py-2 border-b border-[#dce9ff]">\n<span className="text-[#565e74]">Tax (0%)</span>\n<span className="text-sm" style={{ fontFamily: 'Geist, monospace' }}>{formatMoney(0, sym)}</span>\n</div>
    
    const taxRegex = /(<div[^>]*>[\s]*<span[^>]*>Tax(?:[^<]*)<\/span>[\s]*<span[^>]*>\{formatMoney\(0,\s*sym\)\}<\/span>[\s]*<\/div>)/i;
    // Alternative for different structures:
    const taxRegex2 = /(<div[^>]*>[\s]*<p[^>]*>Tax(?:[^<]*)<\/p>[\s]*<p[^>]*>\{formatMoney\(0,\s*sym\)\}<\/p>[\s]*<\/div>)/i;
    const taxRegex3 = /(<div[^>]*><span[^>]*>Tax(?:[^<]*)<\/span><span[^>]*>\{formatMoney\(0,\s*sym\)\}<\/span><\/div>)/i;

    let taxMatch = content.match(taxRegex) || content.match(taxRegex2) || content.match(taxRegex3);

    if (taxMatch) {
        const fullTaxLine = taxMatch[1];
        
        // Extract the classes and styles to replicate them
        const isDiv = fullTaxLine.startsWith('<div');
        if (isDiv && !content.includes('discountAmount > 0')) {
            const replacerLine = fullTaxLine.replace('Tax (0%)', 'Tax');
            const discountLine = fullTaxLine
                .replace(/Tax(?: \([^)]+\))?/, 'Discount {invoice.discount_type === \\\'percentage\\\' ? `(${invoice.discount_value}%)` : \'\'}')
                .replace(/\{formatMoney\(0,\s*sym\)\}/, '-{formatMoney(discountAmount, sym)}');
            const shippingLine = fullTaxLine
                .replace(/Tax(?: \([^)]+\))?/, 'Shipping')
                .replace(/\{formatMoney\(0,\s*sym\)\}/, '+{formatMoney(shippingCost, sym)}');

            const replacement = `
              {discountAmount > 0 && (
                ${discountLine}
              )}
              ${fullTaxLine}
              {shippingCost > 0 && (
                ${shippingLine}
              )}
            `;
            content = content.replace(fullTaxLine, replacement);
        }
    } else {
      // Fallback for tricky templates like CorporateTemplate
      const fallbackTaxRegex = /([ \t]*<span[^>]*>Tax(?: \([^)]+\))?<\/span>\s*<span[^>]*>\{formatMoney\(0,\s*sym\)\}<\/span>)/i;
      const fallbackMatch = content.match(fallbackTaxRegex);
      if (fallbackMatch && !content.includes('discountAmount > 0')) {
          const fullTaxLine = fallbackMatch[1];
          const discountLine = fullTaxLine
              .replace(/Tax(?: \([^)]+\))?/, 'Discount {invoice.discount_type === \\\'percentage\\\' ? `(${invoice.discount_value}%)` : \'\'}')
              .replace(/\{formatMoney\(0,\s*sym\)\}/, '-{formatMoney(discountAmount, sym)}');
          const shippingLine = fullTaxLine
              .replace(/Tax(?: \([^)]+\))?/, 'Shipping')
              .replace(/\{formatMoney\(0,\s*sym\)\}/, '+{formatMoney(shippingCost, sym)}');

          const replacement = `
            {discountAmount > 0 && (
              <>
                ${discountLine}
              </>
            )}
            ${fullTaxLine}
            {shippingCost > 0 && (
              <>
                ${shippingLine}
              </>
            )}
          `;
          content = content.replace(fullTaxLine, replacement);
      }
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${path.basename(filePath)}`);
}

const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('Template.tsx') && f !== 'InvoiceTemplateRenderer.tsx');

files.forEach(file => {
    processTemplate(path.join(templatesDir, file));
});

console.log('Done!');
