// CyberSecurity Module - Blocks disposable/temporary email providers
// Only genuine email providers are allowed for signup/login

const BLOCKED_DOMAINS: string[] = [
  // Major temp-mail services
  'temp-mail.io', 'temp-mail.org', 'tempmail.com', 'tempmail.net', 'tempmail.email',
  'tempmailo.com', 'tempmailaddress.com', 'tempmail.de', 'tempmail.ninja',
  'guerrillamail.com', 'guerrillamail.de', 'guerrillamail.net', 'guerrillamail.org',
  'guerrilla.ml', 'grr.la', 'guerrillamailblock.com', 'sharklasers.com',
  'mailinator.com', 'mailinator.net', 'mailinator2.com', 'maildrop.cc',
  'yopmail.com', 'yopmail.fr', 'yopmail.net', 'yopmail.gq',
  'throwaway.email', 'throwawaymail.com',
  'dispostable.com', 'disposableemailaddresses.emailmiser.com',
  'trashmail.com', 'trashmail.me', 'trashmail.net', 'trashmail.org', 'trashemail.de',
  'fakeinbox.com', 'fakemail.net', 'fakemail.fr',
  'mailnesia.com', 'mailnator.com', 'mailtothis.com',
  'tempinbox.com', 'tempinbox.co.uk',
  'mailcatch.com', 'mailscrap.com', 'mailnull.com',
  '10minutemail.com', '10minutemail.net', '10minutemail.co.za',
  '20minutemail.com', '20minutemail.it',
  'minutemail.com', 'minuteinbox.com',
  'getairmail.com', 'getnada.com', 'nada.email',
  'mohmal.com', 'mohmal.im', 'mohmal.in',
  'burnermail.io', 'burnermailprovider.com',
  'emailondeck.com', 'emailfake.com',
  'crazymailing.com', 'crazymail.info',
  'discard.email', 'discardmail.com', 'discardmail.de',
  'mytemp.email', 'mytempmail.com',
  'harakirimail.com', 'haribu.net',
  'mailtemporaire.fr', 'mailtemporaire.com',
  'jetable.org', 'jetable.com', 'jetable.fr.nf',
  'spamgourmet.com', 'spamgourmet.net',
  'spamfree24.org', 'spamfree.de',
  'wegwerfmail.de', 'wegwerfmail.net', 'wegwerfmail.org',
  'einrot.com', 'einrot.de',
  'anonymbox.com', 'anonaddy.com',
  'mailsac.com', 'inboxbear.com',
  'tempail.com', 'tempr.email', 'tempemail.net', 'tempemail.com',
  'binkmail.com', 'bobmail.info',
  'chammy.info', 'devnullmail.com',
  'emailisvalid.com', 'emailwarden.com',
  'filzmail.com', 'fixmail.tk',
  'flurred.com', 'incognitomail.org', 'incognitomail.com',
  'instantemailaddress.com', 'mailexpire.com',
  'mailforspam.com', 'mailhazard.com', 'mailhazard.us',
  'mailhz.me', 'mailimate.com',
  'nomail.xl.cx', 'nospam.ze.tc',
  'owlpic.com', 'proxymail.eu',
  'rcpt.at', 'reallymymail.com',
  'recode.me', 'regbypass.com', 'rhyta.com',
  'safersignup.de', 'sharklasers.com',
  'shieldedmail.com', 'spamavert.com',
  'spambog.com', 'spambog.de', 'spambog.ru',
  'spamcero.com', 'spamcorptastic.com',
  'spamex.com', 'spamherelots.com',
  'spaml.com', 'spammotel.com',
  'spamspot.com', 'spamthis.co.uk',
  'speed.1s.fr', 'superrito.com',
  'suremail.info', 'teleworm.us',
  'tempymail.com', 'thankdog.com',
  'thisisnotmyrealemail.com', 'tradermail.info',
  'tmail.ws', 'tmails.net',
  'tmpmail.net', 'tmpmail.org',
  'trash-mail.at', 'trash-mail.com', 'trash-mail.de',
  'trashymail.com', 'trashymail.net',
  'turual.com', 'twinmail.de',
  'tyldd.com', 'uggsrock.com',
  'upliftnow.com', 'venompen.com',
  'veryreallyme.com', 'viditag.com',
  'viewcastmedia.com', 'vomoto.com',
  'vpn.st', 'wasdar.com',
  'wuzup.net', 'wuzupmail.net',
  'xagloo.com', 'xemaps.com',
  'xents.com', 'xjoi.com',
  'xoxy.net', 'yapped.net',
  'yeah.net', 'yolanda.dev',
  'zetmail.com', 'zippymail.info',
  'zoaxe.com', 'zoemail.org',
  // Additional well-known temp mail services
  'mailnesia.com', 'guerrillamail.info', 'grr.la',
  'guerrillamailblock.com', 'pokemail.net',
  'spam4.me', 'boun.cr', 'clrmail.com',
  'cool.fr.nf', 'courriel.fr.nf', 'courrieltemporaire.com',
  'disposable.cf', 'disposable.ga', 'disposable.ml',
  'emailigo.de', 'emailsensei.com',
  'emz.net', 'fleckens.hu',
  'get1mail.com', 'get2mail.fr',
  'girlsundertheinfluence.com', 'gishpuppy.com',
  'grandmamail.com', 'great-host.in',
  'greensloth.com', 'gsrv.co.uk',
  'haltospam.com', 'hotpop.com',
  'ichimail.com', 'imstations.com',
  'ipoo.org', 'irish2me.com',
  'iwi.net', 'jetable.de',
  'jobbikszyer.hu', 'jourrapide.com',
  'kasmail.com', 'kaspop.com',
  'keepmymail.com', 'killmail.com', 'killmail.net',
  'klzlk.com', 'koszmail.pl',
  'kurzepost.de', 'lawlita.com',
  'letthemeatspam.com', 'lhsdv.com',
  'lifebyfood.com', 'link2mail.net',
  'litedrop.com', 'lol.ovpn.to',
  'lookugly.com', 'lopl.co.cc',
  'lr78.com', 'maboard.com',
  'mail-hierarchie.de', 'mail-temporaire.fr',
  'mail.by', 'mail.mezimages.net',
  'mail2rss.org', 'mail333.com',
  'mail4trash.com', 'mailbidon.com',
  'mailblocks.com', 'mailbucket.org',
  'mailcat.biz', 'mailme.ir',
  'mailme.lv', 'mailmetrash.com',
  'mailmoat.com', 'mailms.com',
  'mailquack.com', 'mailrock.biz',
  'mailshell.com', 'mailsiphon.com',
  'mailslite.com', 'mailzilla.com',
  'makemetheking.com', 'manifestgenerator.com',
];

const ALLOWED_DOMAINS: string[] = [
  // Google
  'gmail.com', 'googlemail.com',
  // Microsoft
  'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
  'outlook.co.uk', 'hotmail.co.uk', 'live.co.uk',
  'outlook.fr', 'hotmail.fr', 'live.fr',
  'outlook.de', 'hotmail.de', 'live.de',
  'outlook.jp', 'hotmail.co.jp',
  'outlook.in', 'outlook.com.au',
  'outlook.es', 'hotmail.es',
  'outlook.it', 'hotmail.it',
  'outlook.com.br', 'hotmail.com.br',
  'outlook.sa', 'outlook.kr',
  // Yahoo
  'yahoo.com', 'yahoo.co.uk', 'yahoo.co.in', 'yahoo.ca',
  'yahoo.com.au', 'yahoo.fr', 'yahoo.de', 'yahoo.it',
  'yahoo.es', 'yahoo.co.jp', 'yahoo.com.br',
  'ymail.com', 'rocketmail.com',
  // Apple
  'icloud.com', 'me.com', 'mac.com',
  // ProtonMail
  'protonmail.com', 'proton.me', 'pm.me',
  // Other legitimate providers
  'aol.com', 'zoho.com', 'zohomail.com',
  'mail.com', 'email.com',
  'gmx.com', 'gmx.de', 'gmx.net',
  'fastmail.com', 'fastmail.fm',
  'tutanota.com', 'tutanota.de', 'tuta.io',
  'mailfence.com', 'posteo.de', 'posteo.net',
  'runbox.com', 'startmail.com',
  'hushmail.com', 'hush.com',
  'yandex.com', 'yandex.ru',
  'mail.ru', 'inbox.ru', 'list.ru', 'bk.ru',
  // ISP emails
  'comcast.net', 'verizon.net', 'att.net',
  'cox.net', 'charter.net', 'spectrum.net',
  'sbcglobal.net', 'bellsouth.net',
  'btinternet.com', 'virginmedia.com',
  'sky.com', 'talktalk.net',
  // Educational & Government (generic TLDs)
  // Custom business domains are allowed by default
];

export interface EmailValidationResult {
  valid: boolean;
  reason?: string;
}

export function validateEmail(email: string): EmailValidationResult {
  const trimmed = email.trim().toLowerCase();

  // Basic format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, reason: 'Please enter a valid email address' };
  }

  const domain = trimmed.split('@')[1];
  if (!domain) {
    return { valid: false, reason: 'Invalid email domain' };
  }

  // Check against blocked temp-mail domains
  if (BLOCKED_DOMAINS.includes(domain)) {
    return { valid: false, reason: 'Temporary/disposable email addresses are not allowed. Please use a genuine email (Gmail, Outlook, Yahoo, etc.)' };
  }

  // Check for suspicious patterns in domain
  const suspiciousPatterns = [
    /temp/i, /trash/i, /throw/i, /disposable/i, /fake/i,
    /spam/i, /junk/i, /burner/i, /guerrilla/i, /mailinator/i,
    /wegwerf/i, /nospam/i, /discard/i,
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(domain)) {
      return { valid: false, reason: 'This email provider is not allowed. Please use a genuine email address.' };
    }
  }

  // Allow known genuine domains and custom business domains
  // Custom business domains (company emails) are allowed
  const isKnownGenuine = ALLOWED_DOMAINS.includes(domain);
  const isCustomBusiness = !BLOCKED_DOMAINS.includes(domain) && domain.split('.').length >= 2;

  if (isKnownGenuine || isCustomBusiness) {
    return { valid: true };
  }

  return { valid: false, reason: 'This email provider is not recognized. Please use Gmail, Outlook, Yahoo, or your business email.' };
}

export function isGenuineEmail(email: string): boolean {
  return validateEmail(email).valid;
}
