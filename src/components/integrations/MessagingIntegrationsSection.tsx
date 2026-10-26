'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { QRCodeSVG } from 'qrcode.react';

export function MessagingIntegrationsSection() {
  // WhatsApp States
  const [waLoading, setWaLoading] = useState(false);
  const [waStatus, setWaStatus] = useState<'DISCONNECTED' | 'CONNECTING' | 'QR_READY' | 'CONNECTED' | 'FAILED'>('DISCONNECTED');
  const [waAccount, setWaAccount] = useState<string | null>(null);
  const [waQrCode, setWaQrCode] = useState<string | null>(null);
  const [waError, setWaError] = useState<string | null>(null);

  // Gmail States
  const [gmailLoading, setGmailLoading] = useState(false);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailAccount, setGmailAccount] = useState<string | null>(null);
  const [gmailError, setGmailError] = useState<string | null>(null);
  const [gmailSuccess, setGmailSuccess] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  // Check initial connection statuses
  useEffect(() => {
    fetchWhatsAppStatus();
    fetchGmailStatus();

    // Check URL searchParams for OAuth callback result
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const statusParam = urlParams.get('status');
      const errorParam = urlParams.get('error');

      if (statusParam === 'gmail_connected') {
        setGmailSuccess('Gmail account connected successfully!');
        window.history.replaceState({}, '', window.location.pathname + '#integrations-section');
      } else if (errorParam) {
        setGmailError(`Gmail connection failed: ${errorParam}`);
        window.history.replaceState({}, '', window.location.pathname + '#integrations-section');
      }
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const fetchWhatsAppStatus = async () => {
    try {
      const res = await fetch('/api/integrations/whatsapp/status');
      if (res.ok) {
        const data = await res.json();
        setWaStatus(data.status || (data.isConnected ? 'CONNECTED' : 'DISCONNECTED'));
        setWaAccount(data.accountIdentifier || null);
        if (data.qrCode) setWaQrCode(data.qrCode);
      }
    } catch (e) {
      console.warn('Failed to fetch WhatsApp status:', e);
    }
  };

  const fetchGmailStatus = async () => {
    try {
      const res = await fetch('/api/integrations/gmail/status');
      if (res.ok) {
        const data = await res.json();
        setGmailConnected(data.isConnected);
        setGmailAccount(data.accountIdentifier || null);
      }
    } catch (e) {
      console.warn('Failed to fetch Gmail status:', e);
    }
  };

  const startWhatsAppSse = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const sse = new EventSource('/api/integrations/whatsapp/session-stream');
    eventSourceRef.current = sse;

    sse.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.status) {
          setWaStatus(data.status);
          if (data.qrCode) setWaQrCode(data.qrCode);
          if (data.status === 'CONNECTED') {
            setWaQrCode(null);
            fetchWhatsAppStatus();
          }
        }
      } catch (e) {
        console.warn('SSE parse error:', e);
      }
    };

    sse.onerror = () => {
      console.warn('WhatsApp SSE connection closed/errored');
    };
  };

  const handleConnectWhatsApp = async () => {
    setWaLoading(true);
    setWaError(null);
    try {
      const res = await fetch('/api/integrations/whatsapp/connect', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start WhatsApp session');
      
      setWaStatus(data.status);
      if (data.qrCode) setWaQrCode(data.qrCode);
      startWhatsAppSse();
    } catch (err: any) {
      console.error('Error starting WhatsApp:', err);
      setWaError(err.message || 'Failed to connect WhatsApp.');
    } finally {
      setWaLoading(false);
    }
  };

  const handleDisconnectWhatsApp = async () => {
    if (!confirm('Are you sure you want to disconnect your WhatsApp account?')) return;
    setWaLoading(true);
    setWaError(null);
    try {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      const res = await fetch('/api/integrations/whatsapp/disconnect', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to disconnect WhatsApp');
      setWaStatus('DISCONNECTED');
      setWaAccount(null);
      setWaQrCode(null);
    } catch (err: any) {
      console.error(err);
      setWaError(err.message || 'Failed to disconnect WhatsApp.');
    } finally {
      setWaLoading(false);
    }
  };

  const handleConnectGmail = async () => {
    setGmailLoading(true);
    setGmailError(null);
    try {
      const res = await fetch('/api/integrations/gmail/connect');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get OAuth URL');
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error(err);
      setGmailError(err.message || 'Failed to connect Gmail.');
      setGmailLoading(false);
    }
  };

  const handleDisconnectGmail = async () => {
    if (!confirm('Are you sure you want to disconnect your Gmail account?')) return;
    setGmailLoading(true);
    setGmailError(null);
    try {
      const res = await fetch('/api/integrations/gmail/disconnect', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to disconnect Gmail');
      setGmailConnected(false);
      setGmailAccount(null);
    } catch (err: any) {
      console.error(err);
      setGmailError(err.message || 'Failed to disconnect Gmail.');
    } finally {
      setGmailLoading(false);
    }
  };

  return (
    <div className="scroll-mt-36 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300" id="integrations-section">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 border-b border-surface-container-high gap-2">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface">Document Delivery Integrations</h2>
          <p className="font-body-sm text-on-surface-variant mt-1">
            Connect your personal WhatsApp and Gmail accounts to send invoices, challans, and quotations directly to customers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* WhatsApp Integration Card */}
        <div className="border border-outline-variant rounded-2xl p-5 bg-surface/50 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <MaterialIcon icon="chat" className="text-[26px]" />
              </div>
              <div>
                <h3 className="font-headline-sm text-base font-semibold text-on-surface">WhatsApp Web</h3>
                <p className="text-xs text-on-surface-variant">Send PDF documents via personal WhatsApp Web automation.</p>
              </div>
            </div>

            {/* Status Badge */}
            <div className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 border ${
              waStatus === 'CONNECTED' 
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-400/40' 
                : waStatus === 'QR_READY' || waStatus === 'CONNECTING'
                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-400/40 animate-pulse'
                : 'bg-surface-variant text-on-surface-variant border-outline-variant'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                waStatus === 'CONNECTED' ? 'bg-emerald-500' : waStatus === 'QR_READY' ? 'bg-amber-500' : 'bg-outline'
              }`} />
              <span>{waStatus === 'CONNECTED' ? 'Connected' : waStatus === 'QR_READY' ? 'Scan QR Code' : waStatus === 'CONNECTING' ? 'Connecting...' : 'Disconnected'}</span>
            </div>
          </div>

          {/* Connected Account Details */}
          {waStatus === 'CONNECTED' && waAccount && (
            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-200">
              <div className="flex items-center gap-2">
                <MaterialIcon icon="verified" className="text-[18px] text-emerald-400" />
                <span>Connected as: <strong className="font-mono">{waAccount}</strong></span>
              </div>
              <button
                type="button"
                onClick={handleDisconnectWhatsApp}
                disabled={waLoading}
                className="text-error hover:underline text-xs font-medium cursor-pointer"
              >
                Disconnect
              </button>
            </div>
          )}

          {/* QR Code Scan Area */}
          {(waStatus === 'QR_READY' || (waQrCode && waStatus !== 'CONNECTED')) && (
            <div className="flex flex-col items-center justify-center p-6 bg-surface-container-lowest rounded-xl border border-outline-variant text-center gap-4 animate-in fade-in">
              <div className="p-3 bg-white rounded-xl shadow-md border border-gray-200">
                <QRCodeSVG value={waQrCode!} size={200} level="M" />
              </div>
              <div>
                <p className="font-semibold text-sm text-on-surface">Scan this QR Code with WhatsApp</p>
                <p className="text-xs text-on-surface-variant mt-1 max-w-sm">
                  Open WhatsApp on your phone &rarr; Settings &rarr; Linked Devices &rarr; Link a Device.
                </p>
              </div>
              <button
                type="button"
                onClick={handleConnectWhatsApp}
                disabled={waLoading}
                className="text-xs text-primary font-medium hover:underline flex items-center gap-1 cursor-pointer"
              >
                <MaterialIcon icon="refresh" className="text-[14px]" />
                Regenerate QR Code
              </button>
            </div>
          )}

          {/* Connection Actions */}
          {waStatus !== 'CONNECTED' && waStatus !== 'QR_READY' && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleConnectWhatsApp}
                disabled={waLoading}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {waLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <MaterialIcon icon="qr_code_scanner" className="text-[18px]" />
                    Connect WhatsApp
                  </>
                )}
              </button>
            </div>
          )}

          {waError && (
            <div className="text-xs text-error bg-error/10 border border-error/20 p-2.5 rounded-lg flex items-center gap-2">
              <MaterialIcon icon="error" className="text-[16px] shrink-0" />
              <span>{waError}</span>
            </div>
          )}

          {/* Integration Risk Notice */}
          <div className="text-[11px] text-on-surface-variant/80 border-t border-outline-variant/50 pt-2 flex items-start gap-1.5">
            <MaterialIcon icon="info" className="text-[14px] shrink-0 mt-0.5 text-outline" />
            <span>
              <strong>Note:</strong> WhatsApp Web automation is an unofficial integration. Sessions may disconnect upon phone restarts or network shifts. Uninterrupted 24/7 availability is not guaranteed.
            </span>
          </div>
        </div>

        {/* Gmail Integration Card */}
        <div className="border border-outline-variant rounded-2xl p-5 bg-surface/50 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-500/20">
                <MaterialIcon icon="mail" className="text-[26px]" />
              </div>
              <div>
                <h3 className="font-headline-sm text-base font-semibold text-on-surface">Gmail (Official API)</h3>
                <p className="text-xs text-on-surface-variant">Send business documents from your own Google/Gmail email address.</p>
              </div>
            </div>

            {/* Status Badge */}
            <div className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 border ${
              gmailConnected 
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-400/40' 
                : 'bg-surface-variant text-on-surface-variant border-outline-variant'
            }`}>
              <span className={`w-2 h-2 rounded-full ${gmailConnected ? 'bg-emerald-500' : 'bg-outline'}`} />
              <span>{gmailConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>

          {/* Connected Details */}
          {gmailConnected && gmailAccount && (
            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-200">
              <div className="flex items-center gap-2">
                <MaterialIcon icon="verified" className="text-[18px] text-emerald-400" />
                <span>Sender Address: <strong className="font-mono">{gmailAccount}</strong></span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleConnectGmail}
                  disabled={gmailLoading}
                  className="text-primary hover:underline text-xs font-medium cursor-pointer"
                >
                  Reconnect
                </button>
                <button
                  type="button"
                  onClick={handleDisconnectGmail}
                  disabled={gmailLoading}
                  className="text-error hover:underline text-xs font-medium cursor-pointer"
                >
                  Disconnect
                </button>
              </div>
            </div>
          )}

          {/* Connect Action */}
          {!gmailConnected && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleConnectGmail}
                disabled={gmailLoading}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {gmailLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <MaterialIcon icon="login" className="text-[18px]" />
                    Connect Gmail Account
                  </>
                )}
              </button>
            </div>
          )}

          {gmailSuccess && (
            <div className="text-xs text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 p-2.5 rounded-lg flex items-center gap-2">
              <MaterialIcon icon="check_circle" className="text-[16px] shrink-0 text-emerald-400" />
              <span>{gmailSuccess}</span>
            </div>
          )}

          {gmailError && (
            <div className="text-xs text-error bg-error/10 border border-error/20 p-2.5 rounded-lg flex items-center gap-2">
              <MaterialIcon icon="error" className="text-[16px] shrink-0" />
              <span>{gmailError}</span>
            </div>
          )}

          {/* Privacy & Scope Notice */}
          <div className="text-[11px] text-on-surface-variant/80 border-t border-outline-variant/50 pt-2 flex items-start gap-1.5">
            <MaterialIcon icon="lock" className="text-[14px] shrink-0 mt-0.5 text-outline" />
            <span>
              <strong>Security:</strong> We only request the minimum sending permission (<code>https://www.googleapis.com/auth/gmail.send</code>). We never read, scan, or store your private incoming emails.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
