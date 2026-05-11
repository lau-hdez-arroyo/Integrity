const REQUIRED_KEYS = [
  'ADO_AGENT_ORG_URL',
  'ADO_AGENT_PROJECT',
  'ADO_AGENT_PAT',
];

export function getAdoAgentCredentials() {
  const organizationUrl = process.env.ADO_AGENT_ORG_URL;
  const adoProject = process.env.ADO_AGENT_PROJECT;
  const personalAccessToken = process.env.ADO_AGENT_PAT;

  if (!organizationUrl || !adoProject || !personalAccessToken) {
    return null;
  }

  return {
    organizationUrl,
    adoProject,
    personalAccessToken,
  };
}

export function getAdoAgentConfigStatus() {
  const missing = REQUIRED_KEYS.filter((key) => !process.env[key]);
  return {
    configured: missing.length === 0,
    missing,
  };
}
