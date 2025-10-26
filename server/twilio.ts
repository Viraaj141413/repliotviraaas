import twilio from 'twilio';

function getCredentials() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !phoneNumber) {
    throw new Error('Twilio credentials not configured in environment variables');
  }

  return {
    accountSid,
    authToken,
    phoneNumber
  };
}

export function getTwilioClient() {
  const { accountSid, authToken } = getCredentials();
  return twilio(accountSid, authToken);
}

export function getTwilioFromPhoneNumber() {
  const { phoneNumber } = getCredentials();
  return phoneNumber;
}

export async function sendSMS(to: string, message: string) {
  try {
    const client = getTwilioClient();
    const fromNumber = getTwilioFromPhoneNumber();

    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: to
    });

    return { success: true, sid: result.sid };
  } catch (error: any) {
    console.error('Failed to send SMS:', error);
    return { success: false, error: error.message };
  }
}

export async function makeVoiceCall(to: string, message: string) {
  try {
    const client = getTwilioClient();
    const fromNumber = getTwilioFromPhoneNumber();

    const twimlMessage = `<Response><Say voice="alice">${message}</Say></Response>`;

    const result = await client.calls.create({
      twiml: twimlMessage,
      to: to,
      from: fromNumber
    });

    return { success: true, sid: result.sid };
  } catch (error: any) {
    console.error('Failed to make voice call:', error);
    return { success: false, error: error.message };
  }
}

export async function sendWhatsApp(to: string, message: string) {
  try {
    const client = getTwilioClient();
    const fromNumber = getTwilioFromPhoneNumber();

    const whatsappFrom = fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`;
    const whatsappTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

    const result = await client.messages.create({
      body: message,
      from: whatsappFrom,
      to: whatsappTo
    });

    return { success: true, sid: result.sid };
  } catch (error: any) {
    console.error('Failed to send WhatsApp:', error);
    return { success: false, error: error.message };
  }
}
