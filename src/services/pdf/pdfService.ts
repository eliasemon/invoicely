import { chromium, Browser } from 'playwright';
import fs from 'fs';
import { DocumentType } from '@/services/delivery/types';

function getExecutablePath(): string | undefined {
  if (process.env.CHROME_BIN && fs.existsSync(process.env.CHROME_BIN)) {
    return process.env.CHROME_BIN;
  }
  if (process.env.PUPPETEER_EXECUTABLE_PATH && fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  const macChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  if (fs.existsSync(macChrome)) {
    return macChrome;
  }
  const linuxChrome = '/usr/bin/google-chrome';
  if (fs.existsSync(linuxChrome)) {
    return linuxChrome;
  }
  const linuxChromium = '/usr/bin/chromium-browser';
  if (fs.existsSync(linuxChromium)) {
    return linuxChromium;
  }
  return undefined;
}

export interface GeneratePdfOptions {
  documentId: string;
  documentType: DocumentType;
  quotationWithPricing?: boolean;
  filename?: string;
}

export interface GeneratedPdf {
  buffer: Buffer;
  filename: string;
}

/**
 * Generates an A4 PDF Buffer for an Invoice, Challan, or Quotation by rendering the application's
 * public document view with Playwright / Chromium in print media mode.
 */
export async function generateDocumentPdf(options: GeneratePdfOptions): Promise<GeneratedPdf> {
  const { documentId, documentType, quotationWithPricing = true } = options;

  const baseUrl = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const pricingParam = quotationWithPricing ? 'with_money' : 'without_money';
  const targetUrl = `${baseUrl}/public/invoice/${documentId}?type=${documentType}&pricing=${pricingParam}`;

  const executablePath = getExecutablePath();
  const launchOptions: any = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  };
  if (executablePath) {
    launchOptions.executablePath = executablePath;
  }

  let browser: Browser | null = null;
  try {
    browser = await chromium.launch(launchOptions);
    const page = await browser.newPage();
    
    // Set viewport to standard desktop resolution before print
    await page.setViewportSize({ width: 1280, height: 1024 });

    // Navigate to the public document URL
    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });

    // Emulate print CSS styles
    await page.emulateMedia({ media: 'print' });

    // Generate A4 PDF buffer
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm',
      },
    });

    const prefix = documentType === 'challan' ? 'Challan' : documentType === 'quotation' ? 'Quotation' : 'Invoice';
    const filename = options.filename || `${prefix}-${documentId.slice(0, 8)}.pdf`;

    return {
      buffer: Buffer.from(pdfBuffer),
      filename,
    };
  } catch (error: any) {
    console.error('PDF Generation failed:', error);
    throw new Error(`Failed to generate document PDF: ${error.message || 'Unknown error'}`);
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}
