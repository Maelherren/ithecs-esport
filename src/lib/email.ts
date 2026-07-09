import 'server-only';
import { Resend } from 'resend';

// Adresse destinataire des alertes (surchargée via ALERT_EMAIL si besoin).
const DEFAULT_TO = 'mael.herren@icloud.com';

// Expéditeur : domaine vérifié sur Resend, sinon l'adresse de test onboarding@resend.dev
// (qui ne peut écrire qu'au propriétaire du compte Resend).
const DEFAULT_FROM = 'ITHECS <onboarding@resend.dev>';

export async function sendEmail({
  subject,
  html,
  to,
}: {
  subject: string;
  html: string;
  to?: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY manquant dans l’environnement.');
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM || DEFAULT_FROM,
    to: to || process.env.ALERT_EMAIL || DEFAULT_TO,
    subject,
    html,
  });

  if (error) {
    throw new Error(`Resend: ${error.message ?? String(error)}`);
  }
}
