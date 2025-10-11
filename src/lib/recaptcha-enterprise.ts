import { RecaptchaEnterpriseServiceClient } from '@google-cloud/recaptcha-enterprise'
import {
  RECAPTCHA_ENTERPRISE_PROJECT_ID,
  RECAPTCHA_ENTERPRISE_SITE_KEY,
} from '@/lib/env'

export type RecaptchaEnterpriseAssessment = {
  success: boolean
  score?: number
  action?: string
  reasons?: string[]
  error?: string
}

/**
 * Verify a reCAPTCHA token using Google reCAPTCHA Enterprise.
 * Requires the following to be configured in the environment:
 * - Google Cloud credentials (via GOOGLE_APPLICATION_CREDENTIALS or equivalent)
 * - RECAPTCHA_ENTERPRISE_PROJECT_ID
 * - RECAPTCHA_ENTERPRISE_SITE_KEY
 *
 * The 'action' should correspond to the action used on the client side if you are setting one.
 */
export async function verifyReCaptchaEnterprise(
  token: string | undefined | null,
  action?: string
): Promise<RecaptchaEnterpriseAssessment> {
  if (!token) {
    return { success: false, error: 'missing-input-response' }
  }
  if (!RECAPTCHA_ENTERPRISE_PROJECT_ID || !RECAPTCHA_ENTERPRISE_SITE_KEY) {
    return { success: false, error: 'missing-enterprise-config' }
  }

  // Instantiate client (re-use per invocation; in serverless this is acceptable)
  const client = new RecaptchaEnterpriseServiceClient()

  const projectPath = client.projectPath(RECAPTCHA_ENTERPRISE_PROJECT_ID)
  const request = {
    assessment: {
      event: {
        token,
        siteKey: RECAPTCHA_ENTERPRISE_SITE_KEY,
      },
    },
    parent: projectPath,
  } as const

  try {
    const [response] = await client.createAssessment(request)
    const tokenProps = response?.tokenProperties
    if (!tokenProps?.valid) {
      return {
        success: false,
        error: tokenProps?.invalidReason != null ? String(tokenProps.invalidReason) : 'invalid-token',
        action: tokenProps?.action ?? undefined,
      }
    }

    if (action && tokenProps.action && tokenProps.action !== action) {
      return {
        success: false,
        error: 'action-mismatch',
        action: tokenProps.action,
      }
    }

    const score = response?.riskAnalysis?.score ?? undefined
    const reasons = response?.riskAnalysis?.reasons?.map(String) ?? []
    return {
      success: true,
      score,
      reasons,
      action: tokenProps?.action ?? undefined,
    }
  } catch (e: any) {
    return {
      success: false,
      error: e?.message || 'enterprise-network-error',
    }
  } finally {
    // Do not close the client here to allow connection reuse in subsequent invocations.
  }
}

/**
 * Helper to decide if Enterprise verification is usable based on env configuration.
 */
export function isEnterpriseConfigured(): boolean {
  return Boolean(RECAPTCHA_ENTERPRISE_PROJECT_ID && RECAPTCHA_ENTERPRISE_SITE_KEY)
}
