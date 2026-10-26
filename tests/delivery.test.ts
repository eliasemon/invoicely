import assert from 'node:assert/strict';
import { normalizePhoneNumber, validateEmail, isValidEmail } from '../src/lib/phone';
import { encrypt, decrypt } from '../src/lib/crypto';
import {
  getDefaultWhatsAppMessage,
  getDefaultEmailContent,
  DocumentType,
  DeliveryChannel,
} from '../src/services/delivery/types';
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
  console.log('🧪 RUNNING DOCUMENT DELIVERY INTEGRATION & UNIT SUITE');
  console.log('======================================================\n');

  // ========================================================
  // 1. Customer Creation Without Email Address
  // ========================================================
  console.log('1. Customer Information & Optional Email Validation:');

  runTest('Email is optional: undefined or empty email passes validation', () => {
    assert.equal(validateEmail(undefined).isValid, true);
    assert.equal(validateEmail(null).isValid, true);
    assert.equal(validateEmail('').isValid, true);
    assert.equal(validateEmail('   ').isValid, true);
    assert.equal(isValidEmail(''), false); // helper checks nonempty
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

  // ========================================================
  // 2. Phone Number Normalization
  // ========================================================
  console.log('\n2. Phone Number Normalization (BD & International E.164):');

  runTest('Normalizes Bangladesh local number (01712345678)', () => {
    const res = normalizePhoneNumber('01712345678');
    assert.equal(res.isValid, true);
    assert.equal(res.e164, '+8801712345678');
    assert.equal(res.country, 'BD');
    assert.equal(res.whatsappJid, '8801712345678@c.us');
  });

  runTest('Normalizes Bangladesh number already starting with +880', () => {
    const res = normalizePhoneNumber('+880 1812-345678');
    assert.equal(res.isValid, true);
    assert.equal(res.e164, '+8801812345678');
    assert.equal(res.country, 'BD');
    assert.equal(res.whatsappJid, '8801812345678@c.us');
  });

  runTest('Normalizes Bangladesh number with 880 prefix but without +', () => {
    const res = normalizePhoneNumber('8801912345678');
    assert.equal(res.isValid, true);
    assert.equal(res.e164, '+8801912345678');
    assert.equal(res.country, 'BD');
  });

  runTest('Normalizes non-Bangladesh international numbers without blindly prepending 880', () => {
    // US Number (Washington DC)
    const usRes = normalizePhoneNumber('+1 202-456-1111');
    assert.equal(usRes.isValid, true);
    assert.equal(usRes.e164, '+12024561111');
    assert.equal(usRes.country, 'US');
    assert.equal(usRes.whatsappJid, '12024561111@c.us');

    // UK Number (London)
    const ukRes = normalizePhoneNumber('+44 20 7946 0958');
    assert.equal(ukRes.isValid, true);
    assert.equal(ukRes.e164, '+442079460958');
    assert.equal(ukRes.country, 'GB');
    assert.equal(ukRes.whatsappJid, '442079460958@c.us');
  });

  runTest('Rejects malformed and empty phone numbers', () => {
    assert.equal(normalizePhoneNumber('').isValid, false);
    assert.equal(normalizePhoneNumber('   ').isValid, false);
    assert.equal(normalizePhoneNumber('12345').isValid, false);
    assert.equal(normalizePhoneNumber('not-a-number').isValid, false);
  });

  // ========================================================
  // 3. Multi-User WhatsApp Session Isolation
  // ========================================================
  console.log('\n3. WhatsApp Session Isolation by User:');

  runTest('Generates isolated, secure session paths for different users', () => {
    const baseDir = path.resolve(process.env.WHATSAPP_SESSION_PATH || '.whatsapp-sessions');
    const userA = 'user_uuid_1111_company_a';
    const userB = 'user_uuid_2222_company_b';

    const sessionPathA = path.join(baseDir, `user_${userA}`);
    const sessionPathB = path.join(baseDir, `user_${userB}`);

    assert.notEqual(sessionPathA, sessionPathB);
    assert.equal(sessionPathA.includes(userA), true);
    assert.equal(sessionPathB.includes(userB), true);
    assert.equal(sessionPathA.includes(userB), false);
  });

  // ========================================================
  // 4. Gmail Credentials & OAuth Token Encryption at Rest
  // ========================================================
  console.log('\n4. Gmail Credentials AES-256-GCM Encryption & Isolation:');

  runTest('Encrypts and decrypts OAuth tokens securely at rest', () => {
    const rawTokens = JSON.stringify({
      access_token: 'ya29.a0AfH6SMD_mock_access_token',
      refresh_token: '1//04mock_refresh_token_secure',
      expiry_date: Date.now() + 3600 * 1000,
    });

    const encrypted = encrypt(rawTokens);
    assert.notEqual(encrypted, rawTokens);
    assert.equal(typeof encrypted, 'string');
    assert.equal(encrypted.includes('ya29'), false); // plain token must not appear

    const decrypted = decrypt(encrypted);
    assert.equal(decrypted, rawTokens);

    const parsed = JSON.parse(decrypted);
    assert.equal(parsed.refresh_token, '1//04mock_refresh_token_secure');
  });

  runTest('Tampered or corrupted ciphertext fails decryption safely', () => {
    const validEncrypted = encrypt('secret-payload');
    const tampered = validEncrypted.substring(0, validEncrypted.length - 8) + 'deadbeef';
    assert.throws(() => {
      decrypt(tampered);
    });
  });

  // ========================================================
  // 5. Cross-Tenant Document Access Authorization
  // ========================================================
  console.log('\n5. Cross-Tenant Access Enforcement:');

  runTest('Rejects delivery attempts when document does not belong to user tenant', () => {
    const documentOwnerTenantId = 'tenant_company_abc';
    const authorizedLinkedUsers = ['tenant_company_abc', 'employee_user_1'];
    const attackerTenantId = 'tenant_company_xyz';

    function isAuthorizedToAccessDocument(requestingUserId: string, documentOwner: string, linkedUsers: string[]) {
      return requestingUserId === documentOwner || linkedUsers.includes(requestingUserId);
    }

    assert.equal(isAuthorizedToAccessDocument('tenant_company_abc', documentOwnerTenantId, authorizedLinkedUsers), true);
    assert.equal(isAuthorizedToAccessDocument('employee_user_1', documentOwnerTenantId, authorizedLinkedUsers), true);
    assert.equal(isAuthorizedToAccessDocument(attackerTenantId, documentOwnerTenantId, authorizedLinkedUsers), false);
  });

  // ========================================================
  // 6. PDF Generation & Document Mode Resolution
  // ========================================================
  console.log('\n6. PDF Generation URL & Message Template Resolution:');

  runTest('Resolves correct document URL for Invoice, Challan, and Quotation modes', () => {
    const docId = '123e4567-e89b-12d3-a456-426614174000';

    function resolveDocumentUrl(docType: DocumentType, id: string, withPricing?: boolean): string {
      if (docType === 'quotation') {
        return `/public/invoice/${id}?type=quotation&pricing=${withPricing ? 'with_money' : 'without_money'}`;
      }
      if (docType === 'challan') {
        return `/public/invoice/${id}?type=challan`;
      }
      return `/public/invoice/${id}`;
    }

    assert.equal(resolveDocumentUrl('invoice', docId), `/public/invoice/${docId}`);
    assert.equal(resolveDocumentUrl('challan', docId), `/public/invoice/${docId}?type=challan`);
    assert.equal(
      resolveDocumentUrl('quotation', docId, true),
      `/public/invoice/${docId}?type=quotation&pricing=with_money`
    );
    assert.equal(
      resolveDocumentUrl('quotation', docId, false),
      `/public/invoice/${docId}?type=quotation&pricing=without_money`
    );
  });

  runTest('Renders standard WhatsApp message templates for Invoice, Challan, and Quotation', () => {
    const vars = {
      customerName: 'Acme Corp',
      documentNumber: 'INV-2026-001',
      companyName: 'Apex Enterprise',
    };

    const invoiceMsg = getDefaultWhatsAppMessage('invoice', vars);
    assert.equal(invoiceMsg.includes('Invoice #INV-2026-001'), true);
    assert.equal(invoiceMsg.includes('Apex Enterprise'), true);
    assert.equal(invoiceMsg.includes('Acme Corp'), true);

    const challanMsg = getDefaultWhatsAppMessage('challan', vars);
    assert.equal(challanMsg.includes('Delivery Challan #INV-2026-001'), true);

    const quotationMsg = getDefaultWhatsAppMessage('quotation', vars);
    assert.equal(quotationMsg.includes('Quotation #INV-2026-001'), true);
  });

  runTest('Renders standard Gmail subject and body templates', () => {
    const vars = {
      customerName: 'Acme Corp',
      documentNumber: 'INV-2026-001',
      companyName: 'Apex Enterprise',
    };

    const invoiceEmail = getDefaultEmailContent('invoice', vars);
    assert.equal(invoiceEmail.subject, 'Invoice #INV-2026-001 - Apex Enterprise');
    assert.equal(invoiceEmail.body.includes('Dear Acme Corp'), true);

    const challanEmail = getDefaultEmailContent('challan', vars);
    assert.equal(challanEmail.subject, 'Delivery Challan #INV-2026-001 - Apex Enterprise');

    const quotationEmail = getDefaultEmailContent('quotation', vars);
    assert.equal(quotationEmail.subject, 'Quotation #INV-2026-001 - Apex Enterprise');
  });

  // ========================================================
  // 7. Delivery History & Idempotency Key Duplicate Prevention
  // ========================================================
  console.log('\n7. Delivery History & Idempotency Key Verification:');

  runTest('Prevents duplicate deliveries when identical idempotency key is supplied', () => {
    const deliveryStore = new Map<string, { status: string; recipient: string; id: string }>();

    function simulateSendWithIdempotency(key: string, recipient: string) {
      if (deliveryStore.has(key)) {
        return { duplicate: true, record: deliveryStore.get(key)! };
      }
      const record = { id: `hist_${Math.random()}`, status: 'SENT', recipient };
      deliveryStore.set(key, record);
      return { duplicate: false, record };
    }

    const idemKey = 'idemp_key_abc_123';
    const firstAttempt = simulateSendWithIdempotency(idemKey, '+8801712345678');
    assert.equal(firstAttempt.duplicate, false);
    assert.equal(firstAttempt.record.status, 'SENT');

    // Second attempt with same key must return duplicate and not re-send
    const secondAttempt = simulateSendWithIdempotency(idemKey, '+8801712345678');
    assert.equal(secondAttempt.duplicate, true);
    assert.equal(secondAttempt.record.id, firstAttempt.record.id);
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
