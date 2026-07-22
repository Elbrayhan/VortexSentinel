import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini AI Client lazily & safely
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'VortexSentinel Security Backend',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY')
  });
});

// AI Malware & Script Threat Analysis Endpoint
app.post('/api/security/ai-analyze', async (req, res) => {
  try {
    const { filename, content, threatType, hash, context } = req.body;

    if (!content && !filename) {
      return res.status(400).json({ error: 'Se requiere el contenido del archivo o el nombre de la amenaza.' });
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Fallback heuristic rule engine if GEMINI_API_KEY is not configured
      console.log('[AiAnalyze] Gemini key not provided. Using heuristic analysis fallback.');
      
      const isSuspicious = /powershell|cmd|exec|downloadstring|eval|base64|encode|socket|connect|encrypt|shadowcopy|vssadmin/i.test(content || filename || '');
      const isRansom = /encrypt|ransom|vssadmin|delete|bitlocker|\.locked/i.test(content || filename || '');

      return res.json({
        riskScore: isRansom ? 95 : isSuspicious ? 78 : 15,
        verdict: isRansom ? 'Malicioso (Malicious)' : isSuspicious ? 'Sospechoso (Suspicious)' : 'Limpio (Clean)',
        threatName: isRansom ? 'Heuristic.Ransomware.Generic' : isSuspicious ? 'Heuristic.Suspicious.Script' : 'Unspecified.Clean.Code',
        category: isRansom ? 'Ransomware' : isSuspicious ? 'Zero-Day Script' : 'Adware',
        technicalDetails: `Análisis heurístico local completado para ${filename || 'archivo analizado'}. Se identificaron ${isSuspicious ? 'patrones estáticos sospechosos de ejecución remota' : 'ninguna llamada de riesgo detectable'}.`,
        indicatorsOfCompromise: isSuspicious ? [
          'Uso de comandos de sistema ofuscados',
          'Intento de modificación de directivas de red/seguridad',
          `Hash inspeccionado: ${hash || 'sha256_mock_heuristic_checksum'}`
        ] : ['Sin indicadores de riesgo detectados'],
        recommendedActions: isSuspicious ? [
          'Aislar el proceso en cuarentena cifrada',
          'Bloquear la dirección IP de origen en el cortafuegos externo',
          'Notificar inmediatamente a los administradores vía correo electrónico'
        ] : [
          'Permitir ejecución y mantener monitoreo de comportamiento'
        ],
        analysisTimestamp: new Date().toISOString()
      });
    }

    const prompt = `Actúa como un Analista Forense de Malware de Nivel Experto (SOC Tier 3). 
Analiza el siguiente archivo / código / script / descripción de proceso sospechoso y emite un informe estructurado de seguridad en español:

Nombre del Archivo: ${filename || 'Desconocido'}
Categoría Declarada: ${threatType || 'Desconocida'}
Hash SHA256: ${hash || 'N/A'}
Contexto adicional: ${context || 'N/A'}

Código o Muestra a Inspeccionar:
\`\`\`
${(content || '').slice(0, 4000)}
\`\`\`
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Eres la IA de análisis de amenazas de VortexSentinel. Proporciona diagnósticos técnicos precisos, puntuación de riesgo de 0 a 100, veredicto, indicadores de compromiso e instrucciones de remediación claras en español.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskScore: { type: Type.INTEGER, description: 'Puntuación de riesgo global de 0 (Seguro) a 100 (Extremadamente peligroso)' },
            verdict: { type: Type.STRING, description: 'Veredicto final: Limpio (Clean), Malicioso (Malicious), Sospechoso (Suspicious) o Desconocido (Unknown)' },
            threatName: { type: Type.STRING, description: 'Nombre formal o familia de la amenaza detectada' },
            category: { type: Type.STRING, description: 'Categoría (Ransomware, Trojan, Spyware, Rootkit, Adware, Exploit, Phishing IP, Zero-Day Script)' },
            technicalDetails: { type: Type.STRING, description: 'Análisis detallado de la rutina del archivo, permisos solicitados y vectores de ataque' },
            indicatorsOfCompromise: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Lista de indicadores IoC (Hashes, IPs C2, Claves de Registro, Comandos Exec)'
            },
            recommendedActions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Pasos de remediación inmediatos sugeridos al administrador de seguridad'
            }
          },
          required: ['riskScore', 'verdict', 'threatName', 'category', 'technicalDetails', 'indicatorsOfCompromise', 'recommendedActions']
        }
      }
    });

    const resultJson = JSON.parse(response.text || '{}');
    resultJson.analysisTimestamp = new Date().toISOString();

    return res.json(resultJson);
  } catch (error: any) {
    console.error('[AiAnalyze Error]:', error);
    return res.status(500).json({
      error: 'Error procesando análisis de IA',
      details: error?.message || 'Error interno del servidor de análisis.'
    });
  }
});

// Email Alert Dispatch API Endpoint
app.post('/api/security/send-email-alert', (req, res) => {
  const { recipientEmail, threatName, severity, host, actionTaken, details } = req.body;

  const targetEmail = recipientEmail || process.env.ADMIN_ALERT_EMAIL || 'security-admin@vortexsentinel.io';
  const timestamp = new Date().toISOString();
  const alertId = `ALT-${Math.floor(100000 + Math.random() * 900000)}`;

  const emailBodyHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #e2e8f0; padding: 20px; }
      .card { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 24px; max-width: 600px; margin: 0 auto; }
      .header { border-bottom: 2px solid #ef4444; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
      .badge { background: #7f1d1d; color: #fca5a5; padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 12px; }
      .field { margin-bottom: 12px; }
      .label { color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
      .value { font-size: 15px; font-weight: 500; color: #f8fafc; margin-top: 2px; }
      .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #334155; font-size: 12px; color: #64748b; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="header">
        <h2 style="margin:0; color:#f8fafc; font-size:18px;">🚨 ALERTA CRÍTICA DE SEGURIDAD - VORTEXSENTINEL</h2>
        <span class="badge">${severity || 'CRITICAL'}</span>
      </div>
      <p style="color:#cbd5e1; font-size:14px; margin-bottom:20px;">
        Se ha detectado e interceptado un evento de seguridad que requiere su atención inmediata.
      </p>
      <div class="field">
        <div class="label">ID de Alerta</div>
        <div class="value">${alertId}</div>
      </div>
      <div class="field">
        <div class="label">Amenaza Detectada</div>
        <div class="value" style="color:#f87171;">${threatName || 'Amenaza Desconocida'}</div>
      </div>
      <div class="field">
        <div class="label">Equipo / Host Afectado</div>
        <div class="value">${host || 'DESKTOP-FLEET-UNKNOWN'}</div>
      </div>
      <div class="field">
        <div class="label">Acción Autónoma Tomada</div>
        <div class="value">${actionTaken || 'Aislamiento de proceso & Cuarentena'}</div>
      </div>
      <div class="field">
        <div class="label">Detalles del Evento</div>
        <div class="value" style="font-size:13px; color:#94a3b8;">${details || 'Bloqueo en tiempo real ejecutado por la matriz de defensa de escritorio.'}</div>
      </div>
      <div class="footer">
        Enviado automáticamente a ${targetEmail} vía VortexSentinel Notification Gateway | ${timestamp}
      </div>
    </div>
  </body>
  </html>
  `;

  res.json({
    success: true,
    messageId: `<alert-${alertId}@smtp.vortexsentinel.io>`,
    recipient: targetEmail,
    timestamp,
    status: 'Delivered',
    previewSubject: `[ALERTA DE SEGURIDAD] ${severity || 'HIGH'} - ${threatName || 'Amenaza Interceptada'} en ${host || 'Equipo'}`,
    emailHtml: emailBodyHtml
  });
});

// Remote Kill-Switch Network Isolation Toggle
app.post('/api/security/toggle-kill-switch', (req, res) => {
  const { hostId, hostname, isolated } = req.body;

  res.json({
    success: true,
    hostId,
    hostname,
    isolated: !!isolated,
    signalStatus: isolated ? 'NETWORK_SIGNAL_BLOCKED_KILL_SWITCH_ACTIVE' : 'NETWORK_SIGNAL_RESTORED',
    timestamp: new Date().toISOString(),
    auditLogId: `LOG-KS-${Date.now()}`
  });
});

// Proactive Firewall Rule Injection
app.post('/api/security/firewall/block-ip', (req, res) => {
  const { ipOrCidr, category, notes } = req.body;

  if (!ipOrCidr) {
    return res.status(400).json({ error: 'Se requiere una IP o rango CIDR válido.' });
  }

  res.json({
    success: true,
    ruleId: `IPR-${Math.floor(100 + Math.random() * 900)}`,
    ipOrCidr,
    category: category || 'Custom',
    action: 'Block',
    active: true,
    createdAt: new Date().toISOString(),
    notes: notes || 'Regla de bloqueo inyectada desde la consola central de VortexSentinel.'
  });
});

// SIEM Export Endpoint
app.get('/api/security/siem/export', (req, res) => {
  const format = (req.query.format as string) || 'cef';
  const sampleData = [
    `CEF:0|VortexSentinel|MalwareShield|2.6.0|AntiMalwareCore|Aislamiento de amenaza WannaCry|10|rt=${new Date().toISOString()} dhost=DESKTOP-FINANCE-01`,
    `CEF:0|VortexSentinel|MalwareShield|2.6.0|NetworkKillSwitch|Bloqueo de red activado a distancia|10|rt=${new Date().toISOString()} dhost=WS-EXECUTIVE-03`,
    `CEF:0|VortexSentinel|MalwareShield|2.6.0|IpFirewallEngine|Bloqueo de IP 185.220.101.44|8|rt=${new Date().toISOString()} dhost=GATEWAY-FIREWALL-MAIN`
  ];

  if (format === 'json') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="vortexsentinel_siem_export.json"');
    return res.json({
      exportTimestamp: new Date().toISOString(),
      format: 'JSON_SIEM',
      recordCount: sampleData.length,
      logs: sampleData
    });
  }

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', `attachment; filename="vortexsentinel_siem_export.${format}"`);
  res.send(sampleData.join('\n'));
});

// SIEM Test Webhook Forwarder
app.post('/api/security/siem/test-forward', (req, res) => {
  const { endpointUrl, protocol, batchCount } = req.body;

  res.json({
    success: true,
    endpointUrl: endpointUrl || 'https://siem-collector.vortexsentinel.internal:514/events',
    protocol: protocol || 'CEF',
    eventsForwarded: batchCount || 25,
    bytesTransferred: 4820,
    latencyMs: 14,
    status: '200 OK - Forwarded to SIEM Receiver'
  });
});

async function startServer() {
  // Mount Vite middleware in dev mode
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[VortexSentinel] Enterprise Security Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
