import assert from 'node:assert/strict';
import { normalizePhoneNumber, validateEmail, isValidEmail, sanitizeEmail, sanitizePhone } from '../src/lib/phone';
import { encrypt, decrypt } from '../src/lib/crypto';
import {
  generateWhatsAppMessage,
  generateEmailContent,
  buildWhatsAppUrl,
  buildMailtoUrl,
  getPublicDocumentUrl,
} from '../src/lib/documentSharing';
import path from 'path';

let passed = 0;
let failed = 0;

function runTest(name: string, fn: () => void | Promise<void>) {
  try {
    const result = fn();
    if (result instanceof Promise) {
      return result
        .then(() => {
          console.log(`  ✓ ${name}`);
          passed++;
        })
        .catch((err) => {
          console.error(`  ✗ ${name}`);
          console.error(`    `, err);
          failed++;
        });
    } else {
      console.log(`  ✓ ${name}`);
      passed++;
    }
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    `, err);
    failed++;
  }
}

async function main() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING DOCUMENT SHARING & SANITIZATION TEST SUITE');
  console.log('======================================================\n');

  // ========================================================
  // 1. Customer Creation & Email Sanitization
  // ========================================================
  console.log('1. Customer Information & Email Validation/Sanitization:');

  runTest('Email is optional: undefined or empty email passes validation', () => {
    assert.equal(validateEmail(undefined).isValid, true);
    assert.equal(validateEmail(null).isValid, true);
    assert.equal(validateEmail('').isValid, true);
    assert.equal(validateEmail('   ').isValid, true);
    assert.equal(isValidEmail(''), false);
    assert.equal(isValidEmail(undefined), false);
  });

  runTest('Email format validation when provided: accepts valid and rejects malformed', () => {
    assert.equal(validateEmail('customer@example.com').isValid, true);
    assert.equal(validateEmail('john.doe+invoices@sub.domain.co').isValid, true);
    assert.equal(isValidEmail('customer@example.com'), true);

    // Invalid emails
    assert.equal(validateEmail('invalid-email').isValid, false);
    assert.equal(validateEmail('customer@').isValid, false);
    assert.equal(validateEmail('@domain.com').isValid, false);
    assert.equal(validateEmail('customer@domain').isValid, false);
    assert.equal(isValidEmail('invalid-email'), false);
  });

  runTest('sanitizeEmail: trims, lowercases, and maps empty/invalid to null', () => {
    assert.equal(sanitizeEmail('  Customer@Example.COM  '), 'customer@example.com');
    assert.equal(sanitizeEmail(''), null);
    assert.equal(sanitizeEmail('   '), null);
    assert.equal(sanitizeEmail(undefined), null);
    assert.equal(sanitizeEmail(null), null);
    assert.equal(sanitizeEmail('invalid-email'), null);
  });

  // ========================================================
  // 2. Phone Number Normalization & Sanitization
  // ========================================================
  console.log('\n2. Phone Number Normalization & Sanitization:');

  runTest('Normalizes and sanitizes Bangladesh local number (01712345678)', () => {
    const res = normalizePhoneNumber('01712345678');
    assert.equal(res.isValid, true);
    assert.equal(res.e164, '+8801712345678');
    assert.equal(res.country, 'BD');
    assert.equal(res.whatsappJid, '8801712345678@c.us');
    assert.equal(sanitizePhone('01712345678'), '+8801712345678');
  });

  runTest('Normalizes Bangladesh number already starting with +880', () => {
    const res = normalizePhoneNumber('+880 1812-345678');
    assert.equal(res.isValid, true);
    assert.equal(res.e164, '+8801812345678');
    assert.equal(res.country, 'BD');
    assert.equal(sanitizePhone('+880 1812-345678'), '+8801812345678');
  });

  runTest('Normalizes Bangladesh number with 880 prefix but without +', () => {
    const res = normalizePhoneNumber('8801912345678');
    assert.equal(res.isValid, true);
    assert.equal(res.e164, '+8801912345678');
    assert.equal(res.country, 'BD');
    assert.equal(sanitizePhone('8801912345678'), '+8801912345678');
  });

  runTest('Normalizes non-Bangladesh international numbers without blindly prepending 880', () => {
    const usRes = normalizePhoneNumber('+1 202-456-1111');
    assert.equal(usRes.isValid, true);
    assert.equal(usRes.e164, '+12024561111');
    assert.equal(usRes.country, 'US');

    const ukRes = normalizePhoneNumber('+44 20 7946 0958');
    assert.equal(ukRes.isValid, true);
    assert.equal(ukRes.e164, '+442079460958');
    assert.equal(ukRes.country, 'GB');
  });

  runTest('sanitizePhone: maps empty strings to null and trims cleanly', () => {
    assert.equal(sanitizePhone(''), null);
    assert.equal(sanitizePhone('   '), null);
    assert.equal(sanitizePhone(undefined), null);
    assert.equal(sanitizePhone(null), null);
    assert.equal(sanitizePhone('  +8801712345678  '), '+8801712345678');
  });

  // ========================================================
  // 3. Document URLs & Mode Resolution
  // ========================================================
  console.log('\n3. Public View Document URLs:');

  runTest('Resolves public URLs for Invoice, Challan, and Quotation modes', () => {
    const docId = 'inv-uuid-12345';
    const baseUrl = 'https://invoicely.app';

    assert.equal(
      getPublicDocumentUrl(docId, 'invoice', baseUrl),
      'https://invoicely.app/public/invoice/inv-uuid-12345'
    );
    assert.equal(
      getPublicDocumentUrl(docId, 'challan', baseUrl),
      'https://invoicely.app/public/invoice/inv-uuid-12345?type=challan'
    );
    assert.equal(
      getPublicDocumentUrl(docId, 'quotation', baseUrl, true),
      'https://invoicely.app/public/invoice/inv-uuid-12345?type=quotation&pricing=with_money'
    );
    assert.equal(
      getPublicDocumentUrl(docId, 'quotation', baseUrl, false),
      'https://invoicely.app/public/invoice/inv-uuid-12345?type=quotation&pricing=without_money'
    );
  });

  // ========================================================
  // 4. WhatsApp Click-to-Chat Rich Message Generation
  // ========================================================
  console.log('\n4. WhatsApp Rich Formatting & Financial Breakdown:');

  runTest('Generates invoice message with greetings, bold text, emojis, financial breakdown, and public link', () => {
    const msg = generateWhatsAppMessage({
      documentId: 'inv-uuid-12345',
      documentType: 'invoice',
      invoiceNumber: 'INV-2026-001',
      customerName: 'Acme Corp',
      companyName: 'Apex Enterprise',
      subtotal: 1200,
      discountAmount: 100,
      shippingCost: 50,
      totalAmount: 1150,
      amountPaid: 350,
      remainingAmount: 800,
      currency: 'USD',
      currencySymbol: '$',
      status: 'PARTIAL',
      issueDate: 'Oct 26, 2026',
      dueDate: 'Nov 25, 2026',
      baseUrl: 'https://invoicely.app',
    });

    assert.equal(msg.includes('Hello *Acme Corp* 👋'), true);
    assert.equal(msg.includes('*Commercial Invoice #INV-2026-001*'), true);
    assert.equal(msg.includes('*Subtotal:* $1,200.00'), true);
    assert.equal(msg.includes('*Discount:* -$100.00'), true);
    assert.equal(msg.includes('*Shipping:* +$50.00'), true);
    assert.equal(msg.includes('*Total Amount:* $1,150.00'), true);
    assert.equal(msg.includes('*Paid to Date:* $350.00'), true);
    assert.equal(msg.includes('*Balance Due:* $800.00'), true);
    assert.equal(msg.includes('https://invoicely.app/public/invoice/inv-uuid-12345'), true);
    assert.equal(msg.includes('Best regards,\n*Apex Enterprise*'), true);
  });

  runTest('Generates delivery challan message with items reference and public link', () => {
    const msg = generateWhatsAppMessage({
      documentId: 'inv-uuid-12345',
      documentType: 'challan',
      invoiceNumber: 'CH-2026-001',
      customerName: 'Acme Corp',
      companyName: 'Apex Enterprise',
      baseUrl: 'https://invoicely.app',
      issueDate: 'Oct 26, 2026',
    });

    assert.equal(msg.includes('Hello *Acme Corp* 👋'), true);
    assert.equal(msg.includes('Delivery Challan #CH-2026-001'), true);
    assert.equal(msg.includes('https://invoicely.app/public/invoice/inv-uuid-12345?type=challan'), true);
  });

  runTest('Generates quotation message with pricing toggles and public link', () => {
    const msgWithPricing = generateWhatsAppMessage({
      documentId: 'inv-uuid-12345',
      documentType: 'quotation',
      invoiceNumber: 'QT-2026-001',
      customerName: 'Acme Corp',
      companyName: 'Apex Enterprise',
      subtotal: 5000,
      totalAmount: 5000,
      quotationWithPricing: true,
      baseUrl: 'https://invoicely.app',
    });
    assert.equal(msgWithPricing.includes('*Subtotal:* $5,000.00'), true);
    assert.equal(msgWithPricing.includes('pricing=with_money'), true);

    const msgNoPricing = generateWhatsAppMessage({
      documentId: 'inv-uuid-12345',
      documentType: 'quotation',
      invoiceNumber: 'QT-2026-001',
      customerName: 'Acme Corp',
      companyName: 'Apex Enterprise',
      quotationWithPricing: false,
      baseUrl: 'https://invoicely.app',
    });
    assert.equal(msgNoPricing.includes('*Subtotal:*'), false);
    assert.equal(msgNoPricing.includes('pricing=without_money'), true);
  });

  // ========================================================
  // 5. Direct Email (mailto) Content Generation
  // ========================================================
  console.log('\n5. Email Content & Mailto URL Generation:');

  runTest('Generates email subject and body with financial breakdown and public link', () => {
    const emailData = generateEmailContent({
      documentId: 'inv-uuid-12345',
      documentType: 'invoice',
      invoiceNumber: 'INV-2026-001',
      customerName: 'Acme Corp',
      companyName: 'Apex Enterprise',
      subtotal: 1000,
      totalAmount: 1000,
      amountPaid: 1000,
      remainingAmount: 0,
      status: 'PAID',
      baseUrl: 'https://invoicely.app',
    });

    assert.equal(emailData.subject, 'Invoice #INV-2026-001 from Apex Enterprise');
    assert.equal(emailData.body.includes('Dear Acme Corp,'), true);
    assert.equal(emailData.body.includes('Payment Status: PAID'), true);
    assert.equal(emailData.body.includes('Subtotal: $1,000.00'), true);
    assert.equal(emailData.body.includes('https://invoicely.app/public/invoice/inv-uuid-12345'), true);
  });

  // ========================================================
  // 6. WhatsApp Click-to-Chat & Mailto URL Builders
  // ========================================================
  console.log('\n6. URL Scheme Builders:');

  runTest('buildWhatsAppUrl: generates clean wa.me / api.whatsapp.com link with encoded text and normalized digits', () => {
    const waUrl = buildWhatsAppUrl('01712345678', 'Hello World!');
    assert.equal(waUrl, 'https://api.whatsapp.com/send?phone=8801712345678&text=Hello%20World!');

    // Without phone: allows choosing contact inside WhatsApp
    const waNoPhone = buildWhatsAppUrl('', 'Hello World!');
    assert.equal(waNoPhone, 'https://api.whatsapp.com/send?text=Hello%20World!');
  });

  runTest('buildMailtoUrl: generates valid mailto URI with subject and body parameters', () => {
    const mailto = buildMailtoUrl('billing@acme.com', 'Invoice #101', 'Please find invoice attached.');
    assert.equal(
      mailto,
      'mailto:billing@acme.com?subject=Invoice%20%23101&body=Please%20find%20invoice%20attached.'
    );
  });

  console.log('\n------------------------------------------------------');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('------------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
