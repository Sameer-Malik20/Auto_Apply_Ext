import { callGemini, parseJsonResponse } from '../../../lib/gemini.js';

const DEFAULT_GEMINI_KEY = '';
const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

export async function handleResolveDynamicFields({ fields, jd } = {}) {
  if (!Array.isArray(fields) || fields.length === 0) {
    return { success: true, answers: {} };
  }

  const data = await chrome.storage.local.get(['resume', 'settings', 'learnedDefaults']);
  const settings = data.settings || {};
  const resume = data.resume?.structured || {};

  const apiKey = settings.gemini_api_key || DEFAULT_GEMINI_KEY;
  if (!apiKey) {
    return { success: true, answers: {} };
  }

  const profileSummary = {
    name: resume.name || '',
    email: resume.email || '',
    phone: resume.phone || '',
    location: resume.location || '',
    linkedin: resume.linkedin || '',
    github: resume.github || '',
    portfolio: resume.portfolio || '',
    work_authorization: settings.work_authorization || 'Authorized to work',
    requires_sponsorship: settings.requires_sponsorship || 'No',
    availability: settings.availability || resume.availability || 'Immediately',
    years_of_experience: resume.years_of_experience ? String(resume.years_of_experience) : '5',
    salary_expectation: settings.preferred_salary_min ? String(settings.preferred_salary_min) : '',
    preferred_remote: settings.preferred_remote !== false,
    skills: Array.isArray(resume.skills) ? resume.skills.slice(0, 15) : [],
    summary: resume.summary || '',
  };

  const prompt = `You are an expert autonomous job application filler.
Match the candidate's profile and the job description to the given form fields extracted from the webpage.

CANDIDATE PROFILE:
${JSON.stringify(profileSummary, null, 2)}

JOB DETAILS:
${String(jd || '').slice(0, 2000)}

FORM FIELDS TO FILL:
${JSON.stringify(fields, null, 2)}

CRITICAL INSTRUCTIONS:
1. Return ONLY valid JSON mapping string "id" to the appropriate string answer to fill into that field. Example: {"0": "Jane", "1": "Yes"}
2. For fields with an "options" array (select or radio), you MUST select the EXACT string from the provided options array that best fits the candidate.
3. For text or essay questions (why company, cover letter, experience details), generate a concise, professional 2-3 sentence answer tailored to the job and candidate.
4. If a field asks for something not applicable or cannot be answered, omit it from the JSON.
5. DO NOT wrap with markdown fences or add explanatory prose. Return only raw JSON.`;

  try {
    const raw = await callGemini(apiKey, prompt, {
      model: settings.gemini_model || DEFAULT_GEMINI_MODEL,
      baseUrl: settings.gemini_base_url,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });
    const answers = parseJsonResponse(raw);
    return { success: true, answers: answers && typeof answers === 'object' ? answers : {} };
  } catch (err) {
    console.warn('[apply-bot] Dynamic field resolution error:', err);
    return { success: false, error: err.message, answers: {} };
  }
}
